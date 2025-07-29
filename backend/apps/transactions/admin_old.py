from django.contrib import admin
from .models import Transaction, CreditCardInvoice, ImportData


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('descricao', 'user', 'account', 'tipo', 'valor', 'data', 'confirmada')
    list_filter = ('tipo', 'confirmada', 'data', 'account__tipo')
    search_fields = ('descricao', 'user__email', 'account__nome')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'account', 'to_account', 'credit_card', 'tipo', 'valor', 'descricao', 'observacoes', 'data')
        }),
        ('Categorização', {
            'fields': ('category', 'cost_center', 'tags')
        }),
        ('Parcelamento', {
            'fields': ('total_parcelas', 'numero_parcela', 'transacao_pai'),
            'classes': ('collapse',)
        }),
        ('Recorrência', {
            'fields': ('tipo_recorrencia', 'data_fim_recorrencia'),
            'classes': ('collapse',)
        }),
        ('Metadados', {
            'fields': ('confirmada', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    filter_horizontal = ('tags',)


@admin.register(CreditCardInvoice)
class CreditCardInvoiceAdmin(admin.ModelAdmin):
    list_display = ('credit_card', 'mes', 'ano', 'valor_total', 'valor_pago', 'status', 'data_vencimento')
    list_filter = ('status', 'ano', 'mes', 'credit_card__user')
    search_fields = ('credit_card__nome', 'credit_card__user__email')
    readonly_fields = ('created_at', 'updated_at', 'valor_total_formatado')
    
    fieldsets = (
        ('Informações da Fatura', {
            'fields': ('credit_card', 'mes', 'ano', 'data_fechamento', 'data_vencimento')
        }),
        ('Valores', {
            'fields': ('valor_total', 'valor_pago', 'status')
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ImportData)
class ImportDataAdmin(admin.ModelAdmin):
    list_display = ('arquivo_nome', 'user', 'account', 'total_registros', 'registros_processados', 'status', 'data_importacao')
    list_filter = ('status', 'data_importacao', 'account__tipo')
    search_fields = ('arquivo_nome', 'user__email', 'account__nome')
    readonly_fields = ('data_importacao', 'total_registros', 'registros_processados', 'registros_erro')
    
    fieldsets = (
        ('Informações da Importação', {
            'fields': ('user', 'account', 'arquivo_nome', 'data_importacao')
        }),
        ('Resultados', {
            'fields': ('total_registros', 'registros_processados', 'registros_erro', 'status', 'observacoes')
        }),
    )
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
