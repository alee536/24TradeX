from rest_framework import serializers
from .models import Purchase


class PurchaseSerializer(serializers.ModelSerializer):
    unlocked_amount = serializers.ReadOnlyField()

    class Meta:
        model = Purchase
        fields = [
            'id', 'transaction_id', 'amount', 'txid', 'wallet_address',
            'status', 'rejection_reason', 'created_at', 'approved_at',
            'unlock_stage', 'unlocked_amount',
        ]


class PurchaseInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = ['amount', 'txid', 'wallet_address']

    def validate_amount(self, value):
        from apps.settings_app.models import SystemSettings
        s = SystemSettings.get_settings()
        if value < s.min_purchase:
            raise serializers.ValidationError(f'Minimum purchase is {s.min_purchase}')
        if value > s.max_purchase:
            raise serializers.ValidationError(f'Maximum purchase is {s.max_purchase}')
        return value
