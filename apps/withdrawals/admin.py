from django.contrib import admin
from django.utils.html import format_html
from .models import Withdrawal


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'amount_display', 'status_badge', 'wallet_short', 'created_at')
    list_filter = ('status', 'created_at', 'approved_at')
    search_fields = ('user__username', 'user__email', 'wallet_address', 'manual_tx_hash')
    readonly_fields = ('created_at', 'approved_at')
    
    fieldsets = (
        ('Withdrawal Info', {
            'fields': ('user', 'amount', 'status', 'created_at', 'approved_at')
        }),
        ('Wallet Details', {
            'fields': ('wallet_address', 'manual_tx_hash')
        }),
        ('Admin Notes', {
            'fields': ('rejection_reason',)
        }),
    )
    
    def amount_display(self, obj):
        return f"{obj.amount} tokens"
    amount_display.short_description = "Amount"
    
    def wallet_short(self, obj):
        return f"{obj.wallet_address[:15]}..." if obj.wallet_address else "N/A"
    wallet_short.short_description = "Wallet Address"
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'approved': '#00AA00',
            'rejected': '#FF0000'
        }
        color = colors.get(obj.status, '#999999')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"
    
    actions = ['mark_as_pending']
    
    def mark_as_pending(self, request, queryset):
        count = queryset.update(status='pending')
        self.message_user(request, f'{count} withdrawals marked as pending.')
    mark_as_pending.short_description = "Mark as pending"
