from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from apps.accounts.models import User
from apps.purchases.models import Purchase
from apps.withdrawals.models import Withdrawal


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sponsor_stats(request):
    user = request.user
    sponsored_users = User.objects.filter(sponsored_by=user)
    active_sponsored = sponsored_users.filter(is_active=True, is_banned=False)

    sponsored_purchases = Purchase.objects.filter(
        user__in=sponsored_users, status='approved'
    )
    sponsored_withdrawals = Withdrawal.objects.filter(
        user__in=sponsored_users, status='approved'
    )

    total_sponsored_purchase_amount = sum(p.amount for p in sponsored_purchases)
    total_sponsored_withdrawal_amount = sum(w.amount for w in sponsored_withdrawals)

    return Response({
        'sponsor_code': user.sponsor_code,
        'sponsor_link': user.sponsor_link,
        'total_sponsored': sponsored_users.count(),
        'active_sponsored': active_sponsored.count(),
        'sponsor_earnings': float(user.sponsor_earnings),
        'sponsored_purchases': float(total_sponsored_purchase_amount),
        'sponsored_withdrawals': float(total_sponsored_withdrawal_amount),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sponsored_users(request):
    user = request.user
    qs = User.objects.filter(sponsored_by=user)

    search = request.query_params.get('search')
    if search:
        qs = qs.filter(username__icontains=search) | qs.filter(full_name__icontains=search)

    status_filter = request.query_params.get('status')
    if status_filter == 'active':
        qs = qs.filter(is_active=True, is_banned=False)
    elif status_filter == 'inactive':
        qs = qs.filter(is_active=False)

    results = []
    for su in qs:
        purchases = Purchase.objects.filter(user=su, status='approved')
        withdrawals = Withdrawal.objects.filter(user=su, status='approved')
        purchase_amount = sum(p.amount for p in purchases)
        withdrawal_amount = sum(w.amount for w in withdrawals)

        status_str = 'banned' if su.is_banned else ('active' if su.is_active else 'inactive')
        results.append({
            'id': su.id,
            'username': su.username,
            'full_name': su.full_name,
            'purchase_amount': float(purchase_amount),
            'sale_amount': 0,
            'withdrawal_amount': float(withdrawal_amount),
            'status': status_str,
            'date_joined': su.date_joined.isoformat(),
        })

    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(results, request)
    return paginator.get_paginated_response(page)
