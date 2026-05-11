from rest_framework import serializers
from .models import Withdrawal


class WithdrawalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Withdrawal
        fields = [
            'id', 'amount', 'wallet_address', 'status',
            'manual_tx_hash', 'rejection_reason', 'created_at',
        ]


class WithdrawalInputSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=20, decimal_places=8)
    wallet_address = serializers.CharField(max_length=255)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be positive')
        return value
