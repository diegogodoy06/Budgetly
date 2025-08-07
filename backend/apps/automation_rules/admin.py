"""
Admin interface for automation rules
"""
from django.contrib import admin
from .models import AutomationRule, RuleCondition, RuleAction, RuleApplicationLog


class RuleConditionInline(admin.TabularInline):
    model = RuleCondition
    extra = 1
    fields = ['condition_type', 'text_value', 'numeric_value', 'numeric_value_max', 'case_sensitive']


class RuleActionInline(admin.TabularInline):
    model = RuleAction
    extra = 1
    fields = ['action_type', 'category', 'beneficiary', 'tag', 'text_value', 'overwrite_existing']


@admin.register(AutomationRule)
class AutomationRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'rule_type', 'is_active', 'priority', 'times_applied', 'workspace']
    list_filter = ['rule_type', 'is_active', 'workspace']
    search_fields = ['name', 'description']
    ordering = ['priority', 'name']
    inlines = [RuleConditionInline, RuleActionInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'description', 'rule_type')
        }),
        ('Configurações', {
            'fields': ('is_active', 'priority')
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


@admin.register(RuleAction)
class RuleActionAdmin(admin.ModelAdmin):
    list_display = ['rule', 'action_type', 'get_action_value', 'overwrite_existing']
    list_filter = ['action_type', 'overwrite_existing']
    search_fields = ['rule__name', 'text_value']


@admin.register(RuleApplicationLog)
class RuleApplicationLogAdmin(admin.ModelAdmin):
    list_display = ['rule', 'transaction', 'applied_at']
    list_filter = ['applied_at', 'rule__rule_type']
    search_fields = ['rule__name', 'transaction__descricao']
    readonly_fields = ['rule', 'transaction', 'applied_at', 'actions_applied']
    
    def has_add_permission(self, request):
        return False  # Logs are created automatically
