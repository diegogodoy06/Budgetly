from django.contrib import admin
from .models import Beneficiary


@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = ['nome', 'workspace', 'user', 'is_system', 'is_active', 'created_at']
    list_filter = ['is_system', 'is_active', 'workspace', 'created_at']
    search_fields = ['nome', 'user__email', 'workspace__nome']
    ordering = ['nome']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'workspace', 'user')
        }),
        ('Configurações', {
            'fields': ('is_system', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
