from django.db import models


class SystemSettings(models.Model):
    stage1_hours = models.IntegerField(default=72)
    stage1_percent = models.DecimalField(max_digits=5, decimal_places=2, default=50)
    stage2_hours = models.IntegerField(default=24)
    stage2_percent = models.DecimalField(max_digits=5, decimal_places=2, default=25)
    stage3_hours = models.IntegerField(default=24)
    stage3_percent = models.DecimalField(max_digits=5, decimal_places=2, default=25)
    min_purchase = models.DecimalField(max_digits=20, decimal_places=8, default=10)
    max_purchase = models.DecimalField(max_digits=20, decimal_places=8, default=100000)
    usdt_wallet_address = models.CharField(max_length=255, default='0x0000000000000000000000000000000000000000')
    sponsor_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5)

    class Meta:
        verbose_name = 'System Settings'
        verbose_name_plural = 'System Settings'

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return 'System Settings'
