from rest_framework import serializers
from .models import SystemSettings


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = [
            'stage1_hours', 'stage1_percent',
            'stage2_hours', 'stage2_percent',
            'stage3_hours', 'stage3_percent',
            'min_purchase', 'max_purchase',
            'usdt_wallet_address', 'sponsor_percentage',
        ]
