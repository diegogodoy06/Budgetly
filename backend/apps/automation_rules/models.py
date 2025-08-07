"""
Models for the automation rules engine
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import re

User = get_user_model()


class RuleType(models.TextChoices):
    """Types of automation rules"""
    CATEGORIZATION = 'categorization', 'Categorização'
    BENEFICIARY = 'beneficiary', 'Beneficiário'
    TAG = 'tag', 'Tag'
    COMBINATION = 'combination', 'Combinação'


class ConditionType(models.TextChoices):
    """Types of rule conditions"""
    DESCRIPTION_CONTAINS = 'description_contains', 'Descrição contém'
    DESCRIPTION_REGEX = 'description_regex', 'Descrição regex'
    AMOUNT_EQUALS = 'amount_equals', 'Valor igual'
    AMOUNT_GREATER = 'amount_greater', 'Valor maior que'
    AMOUNT_LESS = 'amount_less', 'Valor menor que'
    AMOUNT_RANGE = 'amount_range', 'Valor entre'
    BENEFICIARY_EQUALS = 'beneficiary_equals', 'Beneficiário igual'
    BENEFICIARY_CONTAINS = 'beneficiary_contains', 'Beneficiário contém'
    TRANSACTION_TYPE = 'transaction_type', 'Tipo de transação'
    ACCOUNT_EQUALS = 'account_equals', 'Conta igual'


class ActionType(models.TextChoices):
    """Types of rule actions"""
    SET_CATEGORY = 'set_category', 'Definir categoria'
    SET_BENEFICIARY = 'set_beneficiary', 'Definir beneficiário'
    ADD_TAG = 'add_tag', 'Adicionar tag'
    SET_DESCRIPTION = 'set_description', 'Definir descrição'


class AutomationRule(models.Model):
    """Main automation rule model"""
    workspace = models.ForeignKey('accounts.Workspace', on_delete=models.CASCADE, related_name='automation_rules')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='automation_rules')
    
    name = models.CharField(max_length=100, verbose_name="Nome da regra")
    description = models.TextField(blank=True, verbose_name="Descrição")
    rule_type = models.CharField(max_length=20, choices=RuleType.choices, default=RuleType.CATEGORIZATION)
    
    # Rule settings
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    priority = models.IntegerField(default=100, validators=[MinValueValidator(1), MaxValueValidator(1000)],
                                 help_text="Prioridade (1-1000, menor número = maior prioridade)")
    
    # Statistics
    times_applied = models.IntegerField(default=0, verbose_name="Vezes aplicada")
    last_applied_at = models.DateTimeField(null=True, blank=True, verbose_name="Última aplicação")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', 'name']
        verbose_name = 'Regra de Automação'
        verbose_name_plural = 'Regras de Automação'

    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"
    
    def matches_transaction(self, transaction):
        """Check if this rule matches a given transaction"""
        if not self.is_active:
            return False
            
        # All conditions must be true for the rule to match
        for condition in self.conditions.all():
            if not condition.matches_transaction(transaction):
                return False
        
        return True
    
    def apply_to_transaction(self, transaction):
        """Apply this rule's actions to a transaction"""
        if not self.matches_transaction(transaction):
            return False
            
        applied_actions = []
        for action in self.actions.all():
            if action.apply_to_transaction(transaction):
                applied_actions.append(action)
        
        if applied_actions:
            # Update statistics
            self.times_applied += 1
            from django.utils import timezone
            self.last_applied_at = timezone.now()
            self.save(update_fields=['times_applied', 'last_applied_at'])
            
        return len(applied_actions) > 0


class RuleCondition(models.Model):
    """Conditions that must be met for a rule to apply"""
    rule = models.ForeignKey(AutomationRule, on_delete=models.CASCADE, related_name='conditions')
    condition_type = models.CharField(max_length=30, choices=ConditionType.choices)
    
    # Condition values (use appropriate field based on condition_type)
    text_value = models.CharField(max_length=255, blank=True, verbose_name="Valor texto")
    numeric_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Valor numérico")
    numeric_value_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Valor máximo")
    boolean_value = models.BooleanField(default=False, verbose_name="Valor booleano")
    
    # Case sensitivity for text matching
    case_sensitive = models.BooleanField(default=False, verbose_name="Sensível a maiúsculas")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Condição da Regra'
        verbose_name_plural = 'Condições da Regra'

    def __str__(self):
        return f"{self.get_condition_type_display()}: {self.get_condition_value()}"
    
    def get_condition_value(self):
        """Get the appropriate value for this condition type"""
        if self.condition_type in ['description_contains', 'description_regex', 'beneficiary_contains']:
            return self.text_value
        elif self.condition_type in ['amount_equals', 'amount_greater', 'amount_less']:
            return str(self.numeric_value) if self.numeric_value else ''
        elif self.condition_type == 'amount_range':
            return f"{self.numeric_value} - {self.numeric_value_max}"
        elif self.condition_type in ['beneficiary_equals', 'transaction_type', 'account_equals']:
            return self.text_value
        return ''
    
    def matches_transaction(self, transaction):
        """Check if this condition matches the given transaction"""
        try:
            if self.condition_type == 'description_contains':
                description = transaction.descricao
                value = self.text_value
                if not self.case_sensitive:
                    description = description.lower()
                    value = value.lower()
                return value in description
                
            elif self.condition_type == 'description_regex':
                pattern = self.text_value
                flags = 0 if self.case_sensitive else re.IGNORECASE
                return bool(re.search(pattern, transaction.descricao, flags))
                
            elif self.condition_type == 'amount_equals':
                return transaction.valor == self.numeric_value
                
            elif self.condition_type == 'amount_greater':
                return transaction.valor > self.numeric_value
                
            elif self.condition_type == 'amount_less':
                return transaction.valor < self.numeric_value
                
            elif self.condition_type == 'amount_range':
                return (self.numeric_value <= transaction.valor <= self.numeric_value_max)
                
            elif self.condition_type == 'beneficiary_equals':
                if not transaction.beneficiario:
                    return False
                beneficiary_name = transaction.beneficiario.nome
                value = self.text_value
                if not self.case_sensitive:
                    beneficiary_name = beneficiary_name.lower()
                    value = value.lower()
                return beneficiary_name == value
                
            elif self.condition_type == 'beneficiary_contains':
                if not transaction.beneficiario:
                    return False
                beneficiary_name = transaction.beneficiario.nome
                value = self.text_value
                if not self.case_sensitive:
                    beneficiary_name = beneficiary_name.lower()
                    value = value.lower()
                return value in beneficiary_name
                
            elif self.condition_type == 'transaction_type':
                return transaction.tipo == self.text_value
                
            elif self.condition_type == 'account_equals':
                if not transaction.account:
                    return False
                return str(transaction.account.id) == self.text_value
                
        except Exception as e:
            print(f"Error matching condition {self.id}: {e}")
            return False
            
        return False


class RuleAction(models.Model):
    """Actions to be performed when a rule matches"""
    rule = models.ForeignKey(AutomationRule, on_delete=models.CASCADE, related_name='actions')
    action_type = models.CharField(max_length=20, choices=ActionType.choices)
    
    # Action values
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE, null=True, blank=True)
    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE, null=True, blank=True)
    tag = models.ForeignKey('categories.Tag', on_delete=models.CASCADE, null=True, blank=True)
    text_value = models.CharField(max_length=255, blank=True, verbose_name="Valor texto")
    
    # Options
    overwrite_existing = models.BooleanField(default=False, verbose_name="Sobrescrever existente")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Ação da Regra'
        verbose_name_plural = 'Ações da Regra'

    def __str__(self):
        return f"{self.get_action_type_display()}: {self.get_action_value()}"
    
    def get_action_value(self):
        """Get the appropriate value for this action type"""
        if self.action_type == 'set_category':
            return self.category.nome if self.category else ''
        elif self.action_type == 'set_beneficiary':
            return self.beneficiary.nome if self.beneficiary else ''
        elif self.action_type == 'add_tag':
            return self.tag.nome if self.tag else ''
        elif self.action_type == 'set_description':
            return self.text_value
        return ''
    
    def apply_to_transaction(self, transaction):
        """Apply this action to the given transaction"""
        try:
            if self.action_type == 'set_category':
                if self.category and (not transaction.category or self.overwrite_existing):
                    transaction.category = self.category
                    transaction.save(update_fields=['category'])
                    return True
                    
            elif self.action_type == 'set_beneficiary':
                if self.beneficiary and (not transaction.beneficiario or self.overwrite_existing):
                    transaction.beneficiario = self.beneficiary
                    transaction.save(update_fields=['beneficiario'])
                    return True
                    
            elif self.action_type == 'add_tag':
                if self.tag:
                    # Check if tag is already added
                    if not transaction.tags.filter(id=self.tag.id).exists():
                        transaction.tags.add(self.tag)
                        return True
                        
            elif self.action_type == 'set_description':
                if self.text_value and (not transaction.descricao or self.overwrite_existing):
                    transaction.descricao = self.text_value
                    transaction.save(update_fields=['descricao'])
                    return True
                    
        except Exception as e:
            print(f"Error applying action {self.id}: {e}")
            
        return False


class RuleApplicationLog(models.Model):
    """Log of rule applications for debugging and auditing"""
    rule = models.ForeignKey(AutomationRule, on_delete=models.CASCADE, related_name='application_logs')
    transaction = models.ForeignKey('transactions.Transaction', on_delete=models.CASCADE, related_name='rule_applications')
    
    applied_at = models.DateTimeField(auto_now_add=True)
    actions_applied = models.JSONField(default=list, verbose_name="Ações aplicadas")
    
    class Meta:
        ordering = ['-applied_at']
        verbose_name = 'Log de Aplicação'
        verbose_name_plural = 'Logs de Aplicação'

    def __str__(self):
        return f"Regra '{self.rule.name}' aplicada à transação {self.transaction.id}"
