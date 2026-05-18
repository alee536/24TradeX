from rest_framework import serializers
from .models import Withdrawal
from apps.settings_app.models import SystemSettings


class WithdrawalSerializer(serializers.ModelSerializer):
    paid_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    next_payout_stage = serializers.SerializerMethodField()
    stage_amounts = serializers.SerializerMethodField()
    usdt_equivalent = serializers.SerializerMethodField()

    class Meta:
        model = Withdrawal
        fields = [
            'id', 'amount', 'wallet_address', 'status',
            'manual_tx_hash', 'rejection_reason', 'created_at',
            'approved_at', 'payment_stage', 'stage1_paid_at',
            'stage2_paid_at', 'stage3_paid_at', 'completed_at',
            'paid_amount', 'remaining_amount', 'next_payout_stage',
            'stage_amounts', 'usdt_equivalent',
        ]

    def get_paid_amount(self, obj):
        return float(obj.paid_amount)

    def get_remaining_amount(self, obj):
        return float(obj.remaining_amount)

    def get_next_payout_stage(self, obj):
        return obj.next_payout_stage

    def get_stage_amounts(self, obj):
        stage1, stage2, stage3 = obj.stage_amounts
        return {
            'stage1': float(stage1),
            'stage2': float(stage2),
            'stage3': float(stage3),
        }

    def get_usdt_equivalent(self, obj):
        settings_obj = SystemSettings.get_settings()
        return float(obj.amount * settings_obj.coin_rate)


class WithdrawalInputSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=20, decimal_places=8)
    wallet_address = serializers.CharField(max_length=255)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be positive')
        return value
