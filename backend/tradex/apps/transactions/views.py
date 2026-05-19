from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from datetime import timedelta
from apps.purchases.models import Purchase
from apps.withdrawals.models import Withdrawal
from apps.withdrawals.views import sync_user_withdrawals
from apps.sponsor.models import SponsorEarning
from apps.settings_app.models import SystemSettings


def _build_withdrawal_progress(withdrawal, settings_obj):
    total_amount = float(withdrawal.amount or 0)
    paid_amount = float(withdrawal.paid_amount)
    remaining_amount = float(withdrawal.remaining_amount)

    paid_percent = 0.0
    if total_amount > 0:
        paid_percent = round((paid_amount / total_amount) * 100, 2)
    remaining_percent = round(max(0.0, 100.0 - paid_percent), 2)

    next_payout_at = None
    if withdrawal.status == 'approved' and withdrawal.approved_at:
        stage1_due = withdrawal.approved_at + timedelta(hours=settings_obj.stage1_hours)
        stage2_due = stage1_due + timedelta(hours=settings_obj.stage2_hours)
        stage3_due = stage2_due + timedelta(hours=settings_obj.stage3_hours)

        if not withdrawal.stage1_paid_at:
            next_payout_at = stage1_due
        elif not withdrawal.stage2_paid_at:
            next_payout_at = stage2_due
        elif not withdrawal.stage3_paid_at:
            next_payout_at = stage3_due

    stage1_amount, stage2_amount, stage3_amount = withdrawal.stage_amounts
    return {
        'paid_amount': paid_amount,
        'remaining_amount': remaining_amount,
        'paid_percent': paid_percent,
        'remaining_percent': remaining_percent,
        'payment_stage': withdrawal.payment_stage,
        'next_payout_stage': withdrawal.next_payout_stage,
        'next_payout_at': next_payout_at.isoformat() if next_payout_at else None,
        'requested_amount': total_amount,
        'stage_amounts': [float(stage1_amount), float(stage2_amount), float(stage3_amount)],
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_transactions(request):
    user = request.user
    tx_type = request.query_params.get('type')
    settings_obj = SystemSettings.get_settings()

    # Keep withdrawal progress up to date before sending transaction history.
    sync_user_withdrawals(user)

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
            progress = _build_withdrawal_progress(w, settings_obj)
            paid_pct = progress['paid_percent']
            remaining_pct = progress['remaining_percent']

            description = f'Token withdrawal to {w.wallet_address[:12]}...'
            if w.status in {'approved', 'completed'}:
                description = (
                    f'Withdrawal paid {paid_pct:.2f}% and remaining {remaining_pct:.2f}% '
                    f'to {w.wallet_address[:12]}...'
                )

            transactions.append({
                'id': w.id,
                'type': 'withdrawal',
                'amount': float(w.amount),
                'status': w.status,
                'description': description,
                'created_at': w.created_at.isoformat(),
                **progress,
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
