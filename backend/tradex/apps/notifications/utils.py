def create_notification(user, notification_type, message):
    from .models import Notification
    return Notification.objects.create(
        user=user,
        type=notification_type,
        message=message,
    )
