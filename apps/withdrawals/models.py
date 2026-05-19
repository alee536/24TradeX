from django.db import models
from django.conf import settings
from decimal import Decimal


class Withdrawal(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='withdrawals'
    )
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    wallet_address = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    manual_tx_hash = models.CharField(max_length=255, blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    payment_stage = models.IntegerField(default=0)
    stage1_paid_at = models.DateTimeField(null=True, blank=True)
    stage2_paid_at = models.DateTimeField(null=True, blank=True)
    stage3_paid_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    @staticmethod
    def _normalized_stage_percentages():
        # Use current admin-configured percentages and normalize to 100 if needed.
        from apps.settings_app.models import SystemSettings

        settings_obj = SystemSettings.get_settings()
        stage1_percent = Decimal(str(settings_obj.stage1_percent or 0))
        stage2_percent = Decimal(str(settings_obj.stage2_percent or 0))
        stage3_percent = Decimal(str(settings_obj.stage3_percent or 0))

        total_percent = stage1_percent + stage2_percent + stage3_percent
        if total_percent <= 0:
            return Decimal('50'), Decimal('25'), Decimal('25')

        if total_percent != Decimal('100'):
            scale = Decimal('100') / total_percent
            stage1_percent = (stage1_percent * scale).quantize(Decimal('0.01'))
            stage2_percent = (stage2_percent * scale).quantize(Decimal('0.01'))
            stage3_percent = Decimal('100') - stage1_percent - stage2_percent

        return stage1_percent, stage2_percent, stage3_percent

    @property
    def stage_percentages(self):
        return self._normalized_stage_percentages()

    @property
    def stage_amounts(self):
        amount = Decimal(str(self.amount or 0))
        stage1_percent, stage2_percent, _stage3_percent = self.stage_percentages

        stage1 = (amount * stage1_percent / Decimal('100')).quantize(Decimal('0.00000001'))
        stage2 = (amount * stage2_percent / Decimal('100')).quantize(Decimal('0.00000001'))
        stage3 = (amount - stage1 - stage2).quantize(Decimal('0.00000001'))
        return stage1, stage2, stage3

    @property
    def paid_amount(self):
        stage1, stage2, stage3 = self.stage_amounts
        total = Decimal('0')
        if self.stage1_paid_at:
            total += stage1
        if self.stage2_paid_at:
            total += stage2
        if self.stage3_paid_at:
            total += stage3
        return total

    @property
    def remaining_amount(self):
        remaining = Decimal(str(self.amount or 0)) - self.paid_amount
        return remaining if remaining > 0 else Decimal('0')

    @property
    def next_payout_stage(self):
        if self.status == 'completed':
            return None
        if not self.stage1_paid_at:
            return 1
        if not self.stage2_paid_at:
            return 2
        if not self.stage3_paid_at:
            return 3
        return None

    def __str__(self):
        return f"Withdrawal {self.id} - {self.user.username} - {self.amount}"
