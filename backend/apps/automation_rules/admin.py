"""
Admin interface for automation rules
"""
from django.contrib import admin
from .models import AutomationRule, RuleCondition, RuleAction, RuleApplicationLog, AutomationSettings


class RuleConditionInline(admin.TabularInline):
    model = RuleCondition
    extra = 1
    fields = ['condition_type', 'text_value', 'text_values', 'numeric_value', 'numeric_value_max', 
              'date_value', 'date_value_max', 'boolean_value', 'case_sensitive']


class RuleActionInline(admin.TabularInline):
    model = RuleAction
    extra = 1
    fields = ['action_type', 'category', 'beneficiary', 'account', 'tag', 'text_value', 
              'numeric_value', 'date_value', 'boolean_value', 'overwrite_existing']


@admin.register(AutomationRule)
class AutomationRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'rule_type', 'stage', 'is_active', 'is_auto_generated', 'priority', 'times_applied', 'workspace']
    list_filter = ['rule_type', 'stage', 'is_active', 'is_auto_generated', 'workspace']
    search_fields = ['name', 'description']
    ordering = ['stage', 'priority', 'name']
    inlines = [RuleConditionInline, RuleActionInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'description', 'rule_type', 'stage')
        }),
        ('Configurações', {
            'fields': ('is_active', 'priority', 'is_auto_generated')
        }),
        ('Estatísticas', {
            'fields': ('times_applied', 'last_applied_at'),
            'classes': ('collapse',)
        }),
        ('Sistema', {
            'fields': ('workspace', 'user'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['times_applied', 'last_applied_at']


@admin.register(RuleCondition)
class RuleConditionAdmin(admin.ModelAdmin):
    list_display = ['rule', 'condition_type', 'get_condition_value']
    list_filter = ['condition_type', 'case_sensitive']
    search_fields = ['rule__name', 'text_value']
    filter_horizontal = ['category_refs', 'beneficiary_refs', 'account_refs']


@admin.register(RuleAction)
class RuleActionAdmin(admin.ModelAdmin):
    list_display = ['rule', 'action_type', 'get_action_value', 'overwrite_existing']
    list_filter = ['action_type', 'overwrite_existing']
    search_fields = ['rule__name', 'text_value']


@admin.register(AutomationSettings)
class AutomationSettingsAdmin(admin.ModelAdmin):
    list_display = ['workspace', 'auto_learning_enabled', 'auto_create_category_rules', 'auto_create_beneficiary_rules']
    list_filter = ['auto_learning_enabled', 'auto_create_category_rules', 'auto_create_beneficiary_rules']
    filter_horizontal = ['disabled_beneficiaries']
    
    fieldsets = (
        ('Configurações Gerais', {
            'fields': ('workspace', 'auto_learning_enabled')
        }),
        ('Criação Automática de Regras', {
            'fields': ('auto_create_category_rules', 'auto_create_beneficiary_rules')
        }),
        ('Exceções', {
            'fields': ('disabled_beneficiaries',),
            'classes': ('collapse',)
        })
    )


@admin.register(RuleApplicationLog)
class RuleApplicationLogAdmin(admin.ModelAdmin):
    list_display = ['rule', 'transaction', 'applied_at']
    list_filter = ['applied_at', 'rule__rule_type', 'rule__stage']
    search_fields = ['rule__name', 'transaction__descricao']
    readonly_fields = ['rule', 'transaction', 'applied_at', 'actions_applied']
    
    def has_add_permission(self, request):
        return False  # Logs are created automatically
