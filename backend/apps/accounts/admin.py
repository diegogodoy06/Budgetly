from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Account


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informações Adicionais', {'fields': ('created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'account_type', 'current_balance', 'is_active', 'created_at')
    list_filter = ('account_type', 'is_active', 'created_at')
    search_fields = ('name', 'user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'name', 'account_type', 'initial_balance', 'current_balance', 'is_active')
        }),
        ('Cartão de Crédito', {
            'fields': ('credit_limit', 'closing_day', 'due_day'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
