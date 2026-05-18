from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone

from apps.accounts.models import User
from apps.purchases.models import Purchase
from apps.withdrawals.models import Withdrawal
from apps.notifications.utils import create_notification
from apps.settings_app.models import SystemSettings
from apps.settings_app.serializers import SystemSettingsSerializer
from .permissions import IsAdminUser


class AdminPaginator(PageNumberPagination):
    page_size = 20


# ---- Users ----

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_list_users(request):
    qs = User.objects.all().order_by('-date_joined')
    search = request.query_params.get('search')
    if search:
        qs = qs.filter(username__icontains=search) | qs.filter(email__icontains=search)

    results = []
    for u in qs:
        total_purchased = sum(p.amount for p in Purchase.objects.filter(user=u, status='approved'))
        total_withdrawn = sum(w.amount for w in Withdrawal.objects.filter(user=u, status='approved'))
        results.append({
            'id': u.id,
            'username': u.username,
            'full_name': u.full_name,
            'email': u.email,
            'is_active': u.is_active,
            'is_banned': u.is_banned,
            'sponsor_code': u.sponsor_code,
            'total_purchased': float(total_purchased),
            'total_withdrawn': float(total_withdrawn),
            'date_joined': u.date_joined.isoformat(),
        })

    paginator = AdminPaginator()
    page = paginator.paginate_queryset(results, request)
    return paginator.get_paginated_response(page)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_update_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if 'is_active' in request.data:
        user.is_active = request.data['is_active']
    if 'is_banned' in request.data:
        user.is_banned = request.data['is_banned']
    user.save()
    return Response({'message': 'User updated'})


# ---- Purchases ----

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_list_purchases(request):
    qs = Purchase.objects.all().select_related('user').order_by('-created_at')
    status_filter = request.query_params.get('status')
    if status_filter:
        qs = qs.filter(status=status_filter)

    from apps.purchases.serializers import PurchaseSerializer

    results = []
    for p in qs:
        data = PurchaseSerializer(p).data
        data['username'] = p.user.username
        results.append(data)

    paginator = AdminPaginator()
    page = paginator.paginate_queryset(results, request)
    return paginator.get_paginated_response(page)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_approve_purchase(request, pk):
    try:
        purchase = Purchase.objects.get(pk=pk)
    except Purchase.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if purchase.status != 'pending':
        return Response({'error': 'Purchase is not pending'}, status=400)

    purchase.status = 'approved'
    purchase.approved_at = timezone.now()
    purchase.save()

    # Calculate sponsor earnings
    if purchase.user.sponsored_by:
        settings_obj = SystemSettings.get_settings()
        earning = float(purchase.amount) * float(settings_obj.sponsor_percentage) / 100
        sponsor = purchase.user.sponsored_by
        sponsor.sponsor_earnings = float(sponsor.sponsor_earnings) + earning
        sponsor.save()
        create_notification(sponsor, 'sponsor_earning', f'You earned {earning:.2f} tokens from {purchase.user.username}\'s token purchase.')

    create_notification(purchase.user, 'purchase_approved', f'Your token purchase of {purchase.amount} USDT (ID: {purchase.transaction_id}) has been approved!')
    return Response({'message': 'Purchase approved'})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_reject_purchase(request, pk):
    try:
        purchase = Purchase.objects.get(pk=pk)
    except Purchase.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    reason = request.data.get('reason', '')
    purchase.status = 'rejected'
    purchase.rejection_reason = reason
    purchase.save()

    create_notification(purchase.user, 'purchase_rejected', f'Your token purchase of {purchase.amount} USDT has been rejected. Reason: {reason}')
    return Response({'message': 'Purchase rejected'})


# ---- Withdrawals ----

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_list_withdrawals(request):
    qs = Withdrawal.objects.all().select_related('user').order_by('-created_at')
    status_filter = request.query_params.get('status')
    if status_filter:
        qs = qs.filter(status=status_filter)

    from apps.withdrawals.serializers import WithdrawalSerializer
    results = []
    for w in qs:
        data = WithdrawalSerializer(w).data
        data['username'] = w.user.username
        results.append(data)

    paginator = AdminPaginator()
    page = paginator.paginate_queryset(results, request)
    return paginator.get_paginated_response(page)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_approve_withdrawal(request, pk):
    try:
        withdrawal = Withdrawal.objects.get(pk=pk)
    except Withdrawal.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if withdrawal.status != 'pending':
        return Response({'error': 'Withdrawal is not pending'}, status=400)

    manual_tx_hash = request.data.get('manual_tx_hash', '')
    if not manual_tx_hash:
        return Response({'error': 'manual_tx_hash is required'}, status=400)

    withdrawal.status = 'approved'
    withdrawal.manual_tx_hash = manual_tx_hash
    withdrawal.approved_at = timezone.now()
    withdrawal.save()

    create_notification(withdrawal.user, 'withdrawal_approved', f'Your withdrawal of {withdrawal.amount} tokens has been approved! TX Hash: {manual_tx_hash}')
    return Response({'message': 'Withdrawal approved'})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_reject_withdrawal(request, pk):
    try:
        withdrawal = Withdrawal.objects.get(pk=pk)
    except Withdrawal.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    reason = request.data.get('reason', '')
    withdrawal.status = 'rejected'
    withdrawal.rejection_reason = reason
    withdrawal.save()

    create_notification(withdrawal.user, 'withdrawal_rejected', f'Your withdrawal of {withdrawal.amount} tokens has been rejected. Reason: {reason}')
    return Response({'message': 'Withdrawal rejected'})


# ---- Settings ----

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_settings(request):
    settings_obj = SystemSettings.get_settings()
    if request.method == 'GET':
        return Response(SystemSettingsSerializer(settings_obj).data)
    serializer = SystemSettingsSerializer(settings_obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# ---- Sponsor ----

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_sponsor_list(request):
    qs = User.objects.filter(sponsored_by__isnull=False).select_related('sponsored_by')
    search = request.query_params.get('search')
    if search:
        qs = qs.filter(username__icontains=search) | qs.filter(sponsored_by__username__icontains=search)

    results = []
    for u in qs:
        purchases = Purchase.objects.filter(user=u, status='approved')
        withdrawals = Withdrawal.objects.filter(user=u, status='approved')
        from apps.settings_app.models import SystemSettings
        settings_obj = SystemSettings.get_settings()
        purchase_amount = sum(p.amount for p in purchases)
        withdrawal_amount = sum(w.amount for w in withdrawals)
        earnings = float(purchase_amount) * float(settings_obj.sponsor_percentage) / 100

        results.append({
            'sponsor_username': u.sponsored_by.username,
            'sponsored_username': u.username,
            'sponsored_full_name': u.full_name,
            'purchase_amount': float(purchase_amount),
            'withdrawal_amount': float(withdrawal_amount),
            'earnings': earnings,
            'date_joined': u.date_joined.isoformat(),
        })

    paginator = AdminPaginator()
    page = paginator.paginate_queryset(results, request)
    return paginator.get_paginated_response(page)


# ---- Stats ----

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_stats(request):
    total_users = User.objects.filter(is_staff=False).count()
    approved_purchases = Purchase.objects.filter(status='approved')
    total_purchases = float(sum(p.amount for p in approved_purchases))
    approved_withdrawals = Withdrawal.objects.filter(status='approved')
    total_withdrawals = float(sum(w.amount for w in approved_withdrawals))
    pending_purchases = Purchase.objects.filter(status='pending').count()
    pending_withdrawals_count = Withdrawal.objects.filter(status='pending').count()

    return Response({
        'total_users': total_users,
        'total_purchases': total_purchases,
        'total_withdrawals': total_withdrawals,
        'total_volume': total_purchases,
        'pending_purchases': pending_purchases,
        'pending_withdrawals': pending_withdrawals_count,
    })


# ---- User Details with Sponsor Hierarchy ----

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_user_detail(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    # Get child users (sponsored by this user)
    child_users = User.objects.filter(sponsored_by=user)
    children_data = []
    for child in child_users:
        child_purchases = Purchase.objects.filter(user=child, status='approved')
        child_withdrawals = Withdrawal.objects.filter(user=child, status='approved')
        children_data.append({
            'id': child.id,
            'username': child.username,
            'full_name': child.full_name,
            'email': child.email,
            'total_purchased': float(sum(p.amount for p in child_purchases)),
            'total_withdrawn': float(sum(w.amount for w in child_withdrawals)),
            'is_active': child.is_active,
            'date_joined': child.date_joined.isoformat(),
        })

    # Get user's purchases
    purchases = []
    for p in Purchase.objects.filter(user=user).order_by('-created_at'):
        purchases.append({
            'id': p.id,
            'transaction_id': p.transaction_id,
            'amount': float(p.amount),
            'status': p.status,
            'created_at': p.created_at.isoformat(),
            'approved_at': p.approved_at.isoformat() if p.approved_at else None,
            'unlocked_amount': float(p.unlocked_amount),
        })

    # Get user's withdrawals
    withdrawals = []
    for w in Withdrawal.objects.filter(user=user).order_by('-created_at'):
        withdrawals.append({
            'id': w.id,
            'amount': float(w.amount),
            'status': w.status,
            'wallet_address': w.wallet_address,
            'created_at': w.created_at.isoformat(),
            'approved_at': w.approved_at.isoformat() if w.approved_at else None,
        })

    # Get sponsor earnings
    from apps.sponsor.models import SponsorEarning
    sponsor_earnings = []
    for e in SponsorEarning.objects.filter(sponsor=user).order_by('-created_at'):
        sponsor_earnings.append({
            'id': e.id,
            'sponsored_user': e.sponsored_user.username,
            'amount': float(e.amount),
            'created_at': e.created_at.isoformat(),
        })

    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'full_name': user.full_name,
            'email': user.email,
            'is_active': user.is_active,
            'is_banned': user.is_banned,
            'sponsor_code': user.sponsor_code,
            'sponsored_by': user.sponsored_by.username if user.sponsored_by else None,
            'sponsor_earnings': float(user.sponsor_earnings),
            'date_joined': user.date_joined.isoformat(),
        },
        'statistics': {
            'total_purchased': float(sum(p['amount'] for p in purchases if p['status'] == 'approved')),
            'total_withdrawn': float(sum(w['amount'] for w in withdrawals if w['status'] == 'approved')),
            'total_sponsor_earnings': float(sum(e['amount'] for e in sponsor_earnings)),
            'child_users_count': len(children_data),
            'pending_purchases': len([p for p in purchases if p['status'] == 'pending']),
            'pending_withdrawals': len([w for w in withdrawals if w['status'] == 'pending']),
        },
        'child_users': children_data,
        'purchases': purchases,
        'withdrawals': withdrawals,
        'sponsor_earnings': sponsor_earnings,
    })
