from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Account, CreditCard


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Extras', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('nome', 'user', 'tipo', 'banco', 'saldo_atual', 'is_active')
    list_filter = ('tipo', 'is_active', 'banco')
    search_fields = ('nome', 'user__email', 'banco')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'nome', 'tipo', 'eh_conta')
        }),
        ('Informações Bancárias', {
            'fields': ('banco', 'codigo_banco'),
            'classes': ('collapse',)
        }),
        ('Saldos', {
            'fields': ('saldo_inicial', 'saldo_atual')
        }),
        ('Personalização', {
            'fields': ('cor', 'icone')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CreditCard)
class CreditCardAdmin(admin.ModelAdmin):
    list_display = ('nome', 'user', 'bandeira', 'ultimos_4_digitos', 'limite', 'saldo_atual', 'is_active')
    list_filter = ('bandeira', 'is_active', 'user')
    search_fields = ('nome', 'user__email', 'bandeira', 'ultimos_4_digitos')
    readonly_fields = ('created_at', 'updated_at', 'disponivel', 'percentual_usado')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'nome', 'bandeira', 'ultimos_4_digitos')
        }),
        ('Configurações da Fatura', {
            'fields': ('dia_vencimento', 'dia_fechamento')
        }),
        ('Limites e Saldos', {
            'fields': ('limite', 'saldo_atual', 'disponivel', 'percentual_usado')
        }),
        ('Personalização', {
            'fields': ('cor',)
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
