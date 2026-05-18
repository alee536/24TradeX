from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Trading Info', {'fields': ('sponsor_code', 'sponsored_by', 'sponsor_earnings', 'wallet_address')}),
        ('Account Status', {'fields': ('is_banned',)}),
    )
    readonly_fields = ('sponsor_code', 'sponsor_earnings')
    list_display = ('username', 'email', 'full_name', 'is_active', 'is_banned', 'sponsor_earnings', 'date_joined')
    list_filter = ('is_active', 'is_banned', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'full_name', 'sponsor_code')
    ordering = ('-date_joined',)
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('sponsored_by')
