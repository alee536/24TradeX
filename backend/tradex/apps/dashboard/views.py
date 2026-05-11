from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.purchases.models import Purchase
from apps.withdrawals.models import Withdrawal
from apps.notifications.models import Notification


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    user = request.user

    approved_purchases = Purchase.objects.filter(user=user, status='approved')
    total_purchased = sum(p.amount for p in approved_purchases)

    total_unlocked = sum(p.unlocked_amount for p in approved_purchases)
    total_withdrawn_approved = sum(
        w.amount for w in Withdrawal.objects.filter(user=user, status='approved')
    )
    pending_withdrawals = sum(
        w.amount for w in Withdrawal.objects.filter(user=user, status='pending')
    )

    available_withdrawal = max(0, float(total_unlocked) - float(total_withdrawn_approved) - float(pending_withdrawals))

    unread_notifications = Notification.objects.filter(user=user, is_read=False).count()

    return Response({
        'total_purchased': float(total_purchased),
        'total_sold': 0,
        'available_withdrawal': available_withdrawal,
        'pending_withdrawal': float(pending_withdrawals),
        'sponsor_earnings': float(user.sponsor_earnings),
        'unread_notifications': unread_notifications,
    })
