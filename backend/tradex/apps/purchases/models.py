from django.db import models
from django.conf import settings
import uuid


def generate_transaction_id():
    import random
    num = random.randint(100000, 999999)
    return f"TX24X{num}"


class Purchase(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='purchases'
    )
    transaction_id = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    txid = models.CharField(max_length=255, blank=True, null=True)
    wallet_address = models.CharField(max_length=255, blank=True, null=True)
    screenshot = models.ImageField(upload_to='screenshots/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    unlock_stage = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            tid = generate_transaction_id()
            while Purchase.objects.filter(transaction_id=tid).exists():
                tid = generate_transaction_id()
            self.transaction_id = tid
        super().save(*args, **kwargs)

    @property
    def unlocked_amount(self):
        from apps.settings_app.models import SystemSettings
        import datetime
        from django.utils import timezone

        if self.status != 'approved' or not self.approved_at:
            return 0

        settings_obj = SystemSettings.get_settings()
        amount = float(self.amount)
        now = timezone.now()
        elapsed = now - self.approved_at
        elapsed_hours = elapsed.total_seconds() / 3600

        stage1_h = settings_obj.stage1_hours
        stage2_h = stage1_h + settings_obj.stage2_hours
        stage3_h = stage2_h + settings_obj.stage3_hours

        unlocked = 0
        if elapsed_hours >= stage3_h:
            unlocked = amount
        elif elapsed_hours >= stage2_h:
            unlocked = amount * (float(settings_obj.stage1_percent) + float(settings_obj.stage2_percent)) / 100
        elif elapsed_hours >= stage1_h:
            unlocked = amount * float(settings_obj.stage1_percent) / 100

        return round(unlocked, 8)

    def __str__(self):
        return f"{self.transaction_id} - {self.user.username}"
