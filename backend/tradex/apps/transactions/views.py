from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from apps.purchases.models import Purchase
from apps.withdrawals.models import Withdrawal
from apps.sponsor.models import SponsorEarning


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_transactions(request):
    user = request.user
    tx_type = request.query_params.get('type')

    transactions = []

    if not tx_type or tx_type == 'purchase':
        for p in Purchase.objects.filter(user=user):
            transactions.append({
                'id': p.id,
                'type': 'purchase',
                'amount': float(p.amount),
                'status': p.status,
                'description': f'Token purchase - {p.transaction_id}',
                'created_at': p.created_at.isoformat(),
            })

    if not tx_type or tx_type == 'withdrawal':
        for w in Withdrawal.objects.filter(user=user):
            transactions.append({
                'id': w.id,
                'type': 'withdrawal',
                'amount': float(w.amount),
                'status': w.status,
                'description': f'Token withdrawal to {w.wallet_address[:12]}...',
                'created_at': w.created_at.isoformat(),
            })

    if not tx_type or tx_type == 'sponsor_earning':
        for e in SponsorEarning.objects.filter(sponsor=user):
            transactions.append({
                'id': e.id,
                'type': 'sponsor_earning',
                'amount': float(e.amount),
                'status': 'approved',
                'description': f'Sponsor earning from {e.sponsored_user.username}',
                'created_at': e.created_at.isoformat(),
            })

    transactions.sort(key=lambda x: x['created_at'], reverse=True)

    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(transactions, request)
    return paginator.get_paginated_response(page)
