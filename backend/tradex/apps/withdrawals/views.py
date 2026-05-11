from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from .models import Withdrawal
from .serializers import WithdrawalSerializer, WithdrawalInputSerializer
from apps.notifications.utils import create_notification


def get_available_balance(user):
    from apps.purchases.models import Purchase
    from apps.settings_app.models import SystemSettings

    approved_purchases = Purchase.objects.filter(user=user, status='approved')
    total_unlocked = sum(p.unlocked_amount for p in approved_purchases)

    total_withdrawn = sum(
        w.amount for w in Withdrawal.objects.filter(user=user, status__in=['approved', 'pending'])
    )
    return float(total_unlocked) - float(total_withdrawn), float(total_unlocked)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def withdrawals_list(request):
    if request.method == 'GET':
        qs = Withdrawal.objects.filter(user=request.user).order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = WithdrawalSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    serializer = WithdrawalInputSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    amount = serializer.validated_data['amount']
    available, _ = get_available_balance(request.user)

    if float(amount) > available:
        return Response({'error': f'Insufficient balance. Available: {available}'}, status=400)

    withdrawal = Withdrawal.objects.create(
        user=request.user,
        amount=amount,
        wallet_address=serializer.validated_data['wallet_address'],
    )
    create_notification(request.user, 'withdrawal_submitted', f'Your withdrawal request of {amount} tokens has been submitted.')
    return Response(WithdrawalSerializer(withdrawal).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unlocked_amount(request):
    from apps.purchases.models import Purchase
    from apps.settings_app.models import SystemSettings

    approved_purchases = Purchase.objects.filter(user=request.user, status='approved')
    total_unlocked = sum(p.unlocked_amount for p in approved_purchases)
    total_withdrawn = sum(
        w.amount for w in Withdrawal.objects.filter(user=request.user, status__in=['approved', 'pending'])
    )
    available = float(total_unlocked) - float(total_withdrawn)

    breakdown = []
    settings_obj = SystemSettings.get_settings()
    from django.utils import timezone

    for p in approved_purchases:
        if not p.approved_at:
            continue
        now = timezone.now()
        elapsed = now - p.approved_at
        elapsed_hours = elapsed.total_seconds() / 3600

        stage1_h = settings_obj.stage1_hours
        stage2_h = stage1_h + settings_obj.stage2_hours
        stage3_h = stage2_h + settings_obj.stage3_hours

        current_stage = 0
        next_unlock_at = None
        if elapsed_hours < stage1_h:
            current_stage = 0
            hours_left = stage1_h - elapsed_hours
            next_unlock_at = (now + timezone.timedelta(hours=hours_left)).isoformat()
        elif elapsed_hours < stage2_h:
            current_stage = 1
            hours_left = stage2_h - elapsed_hours
            next_unlock_at = (now + timezone.timedelta(hours=hours_left)).isoformat()
        elif elapsed_hours < stage3_h:
            current_stage = 2
            hours_left = stage3_h - elapsed_hours
            next_unlock_at = (now + timezone.timedelta(hours=hours_left)).isoformat()
        else:
            current_stage = 3

        breakdown.append({
            'purchase_id': p.id,
            'transaction_id': p.transaction_id,
            'amount': float(p.amount),
            'unlocked': p.unlocked_amount,
            'stage': current_stage,
            'next_unlock_at': next_unlock_at,
        })

    return Response({
        'total_unlocked': float(total_unlocked),
        'total_withdrawn': float(total_withdrawn),
        'available': max(0, available),
        'breakdown': breakdown,
    })
