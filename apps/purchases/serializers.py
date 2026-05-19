from rest_framework import serializers
from .models import Purchase


class PurchaseSerializer(serializers.ModelSerializer):
    unlocked_amount = serializers.ReadOnlyField()
    calculated_coins = serializers.ReadOnlyField()
    assigned_coins = serializers.SerializerMethodField()
    usdt_equivalent = serializers.SerializerMethodField()

    def get_assigned_coins(self, obj):
        # Only expose assigned coin amount when coins are actually assigned
        if getattr(obj, 'is_coins_assigned', False):
            return str(obj.approved_coin_amount) if obj.approved_coin_amount is not None else None
        return None

    def get_usdt_equivalent(self, obj):
        from apps.settings_app.models import SystemSettings
        settings_obj = SystemSettings.get_settings()
        coin_amount = obj.approved_coin_amount if obj.approved_coin_amount is not None else obj.calculated_coins
        return float(coin_amount * settings_obj.coin_rate)

    class Meta:
        model = Purchase
        fields = [
            'id', 'transaction_id', 'amount', 'txid', 'wallet_address', 'screenshot',
            'status', 'rejection_reason', 'created_at', 'approved_at',
            'coin_rate_at_approval', 'approved_coin_amount', 'calculated_coins',
            'is_coins_assigned', 'coins_assigned_at', 'assigned_coins',
            'unlock_stage', 'unlocked_amount', 'usdt_equivalent',
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
