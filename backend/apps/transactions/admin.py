from django.contrib import admin
from .models import Transaction, CreditCardBill


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('description', 'user', 'account', 'transaction_type', 'amount', 'date', 'is_processed')
    list_filter = ('transaction_type', 'is_processed', 'date', 'account__account_type')
    search_fields = ('description', 'user__email', 'account__name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'account', 'to_account', 'transaction_type', 'amount', 'description', 'notes', 'date')
        }),
        ('Categorização', {
            'fields': ('category', 'tags')
        }),
        ('Parcelamento', {
            'fields': ('installments', 'installment_number', 'parent_transaction'),
            'classes': ('collapse',)
        }),
        ('Recorrência', {
            'fields': ('recurrence_type', 'recurrence_end_date'),
            'classes': ('collapse',)
        }),
        ('Controle', {
            'fields': ('is_processed', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(CreditCardBill)
class CreditCardBillAdmin(admin.ModelAdmin):
    list_display = ('account', 'month', 'year', 'total_amount', 'paid_amount', 'status', 'due_date')
    list_filter = ('status', 'year', 'month')
    search_fields = ('account__name', 'account__user__email')
    readonly_fields = ('created_at', 'updated_at', 'remaining_amount')
