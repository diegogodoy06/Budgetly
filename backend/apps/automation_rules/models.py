"""
Models for the automation rules engine
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import re

User = get_user_model()


class RuleStage(models.TextChoices):
    """Stages for rule execution"""
    PRE = 'pre', 'Pré-processamento'
    DEFAULT = 'default', 'Principal'
    POST = 'post', 'Pós-processamento'


class RuleType(models.TextChoices):
    """Types of automation rules"""
    CATEGORIZATION = 'categorization', 'Categorização'
    BENEFICIARY = 'beneficiary', 'Beneficiário'
    TAG = 'tag', 'Tag'
    COMBINATION = 'combination', 'Combinação'


class ConditionType(models.TextChoices):
    """Types of rule conditions"""
    # Description conditions
    DESCRIPTION_IS = 'description_is', 'Descrição é'
    DESCRIPTION_IS_NOT = 'description_is_not', 'Descrição não é'
    DESCRIPTION_CONTAINS = 'description_contains', 'Descrição contém'
    DESCRIPTION_NOT_CONTAINS = 'description_not_contains', 'Descrição não contém'
    DESCRIPTION_MATCHES = 'description_matches', 'Descrição regex'
    DESCRIPTION_ONE_OF = 'description_one_of', 'Descrição é uma de'
    DESCRIPTION_NOT_ONE_OF = 'description_not_one_of', 'Descrição não é uma de'
    
    # Amount conditions  
    AMOUNT_IS = 'amount_is', 'Valor é'
    AMOUNT_IS_NOT = 'amount_is_not', 'Valor não é'
    AMOUNT_GREATER = 'amount_greater', 'Valor maior que'
    AMOUNT_LESS = 'amount_less', 'Valor menor que'
    AMOUNT_RANGE = 'amount_range', 'Valor entre'
    
    # Category conditions
    CATEGORY_IS = 'category_is', 'Categoria é'
    CATEGORY_IS_NOT = 'category_is_not', 'Categoria não é'
    CATEGORY_ONE_OF = 'category_one_of', 'Categoria é uma de'
    CATEGORY_NOT_ONE_OF = 'category_not_one_of', 'Categoria não é uma de'
    
    # Beneficiary conditions
    BENEFICIARY_IS = 'beneficiary_is', 'Beneficiário é'
    BENEFICIARY_IS_NOT = 'beneficiary_is_not', 'Beneficiário não é'
    BENEFICIARY_CONTAINS = 'beneficiary_contains', 'Beneficiário contém'
    BENEFICIARY_NOT_CONTAINS = 'beneficiary_not_contains', 'Beneficiário não contém'
    BENEFICIARY_ONE_OF = 'beneficiary_one_of', 'Beneficiário é um de'
    BENEFICIARY_NOT_ONE_OF = 'beneficiary_not_one_of', 'Beneficiário não é um de'
    
    # Account conditions
    ACCOUNT_IS = 'account_is', 'Conta é'
    ACCOUNT_IS_NOT = 'account_is_not', 'Conta não é'
    ACCOUNT_ONE_OF = 'account_one_of', 'Conta é uma de'
    ACCOUNT_NOT_ONE_OF = 'account_not_one_of', 'Conta não é uma de'
    
    # Date conditions
    DATE_IS = 'date_is', 'Data é'
    DATE_IS_NOT = 'date_is_not', 'Data não é'
    DATE_AFTER = 'date_after', 'Data após'
    DATE_BEFORE = 'date_before', 'Data antes'
    DATE_RANGE = 'date_range', 'Data entre'
    
    # Transaction type
    TRANSACTION_TYPE = 'transaction_type', 'Tipo de transação'


class ActionType(models.TextChoices):
    """Types of rule actions"""
    SET_CATEGORY = 'set_category', 'Definir categoria'
    SET_BENEFICIARY = 'set_beneficiary', 'Definir beneficiário'
    SET_ACCOUNT = 'set_account', 'Definir conta'
    SET_DESCRIPTION = 'set_description', 'Definir descrição'
    SET_AMOUNT = 'set_amount', 'Definir valor'
    SET_DATE = 'set_date', 'Definir data'
    SET_NOTES = 'set_notes', 'Definir notas'
    APPEND_NOTES = 'append_notes', 'Adicionar às notas'
    PREPEND_NOTES = 'prepend_notes', 'Adicionar no início das notas'
    ADD_TAG = 'add_tag', 'Adicionar tag'
    MARK_CLEARED = 'mark_cleared', 'Marcar como compensado'


class AutomationRule(models.Model):
    """Main automation rule model"""
    workspace = models.ForeignKey('accounts.Workspace', on_delete=models.CASCADE, related_name='automation_rules')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='automation_rules')
    
    name = models.CharField(max_length=100, verbose_name="Nome da regra")
    description = models.TextField(blank=True, verbose_name="Descrição")
    rule_type = models.CharField(max_length=20, choices=RuleType.choices, default=RuleType.CATEGORIZATION)
    stage = models.CharField(max_length=10, choices=RuleStage.choices, default=RuleStage.DEFAULT, verbose_name="Estágio")
    
    # Rule settings
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    priority = models.IntegerField(default=100, validators=[MinValueValidator(1), MaxValueValidator(1000)],
                                 help_text="Prioridade (1-1000, menor número = maior prioridade)")
    
    # Auto-learning settings
    is_auto_generated = models.BooleanField(default=False, verbose_name="Gerada automaticamente")
    
    # Statistics
    times_applied = models.IntegerField(default=0, verbose_name="Vezes aplicada")
    last_applied_at = models.DateTimeField(null=True, blank=True, verbose_name="Última aplicação")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['stage', 'priority', 'name']
        verbose_name = 'Regra de Automação'
        verbose_name_plural = 'Regras de Automação'

    def __str__(self):
        return f"[{self.get_stage_display()}] {self.name} ({self.get_rule_type_display()})"
    
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
    text_values = models.JSONField(default=list, blank=True, verbose_name="Múltiplos valores texto")
    numeric_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Valor numérico")
    numeric_value_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Valor máximo")
    date_value = models.DateField(null=True, blank=True, verbose_name="Valor data")
    date_value_max = models.DateField(null=True, blank=True, verbose_name="Data máxima")
    boolean_value = models.BooleanField(default=False, verbose_name="Valor booleano")
    
    # Foreign key references for complex conditions
    category_refs = models.ManyToManyField('categories.Category', blank=True, verbose_name="Categorias referenciadas")
    beneficiary_refs = models.ManyToManyField('beneficiaries.Beneficiary', blank=True, verbose_name="Beneficiários referenciados")
    account_refs = models.ManyToManyField('accounts.Account', blank=True, verbose_name="Contas referenciadas")
    
    # Case sensitivity for text matching (defaults to False for case-insensitive)
    case_sensitive = models.BooleanField(default=False, verbose_name="Sensível a maiúsculas")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Condição da Regra'
        verbose_name_plural = 'Condições da Regra'

    def __str__(self):
        return f"{self.get_condition_type_display()}: {self.get_condition_value()}"
    
    def get_condition_value(self):
        """Get the appropriate value for this condition type"""
        if 'description' in self.condition_type:
            if 'one_of' in self.condition_type:
                return ', '.join(self.text_values) if self.text_values else ''
            return self.text_value
        elif 'amount' in self.condition_type:
            if self.condition_type == 'amount_range':
                return f"{self.numeric_value} - {self.numeric_value_max}"
            return str(self.numeric_value) if self.numeric_value else ''
        elif 'category' in self.condition_type:
            if 'one_of' in self.condition_type:
                return ', '.join([cat.nome for cat in self.category_refs.all()])
            return self.text_value
        elif 'beneficiary' in self.condition_type:
            if 'one_of' in self.condition_type:
                return ', '.join([ben.nome for ben in self.beneficiary_refs.all()])
            return self.text_value
        elif 'account' in self.condition_type:
            if 'one_of' in self.condition_type:
                return ', '.join([acc.nome for acc in self.account_refs.all()])
            return self.text_value
        elif 'date' in self.condition_type:
            if self.condition_type == 'date_range':
                return f"{self.date_value} - {self.date_value_max}"
            return str(self.date_value) if self.date_value else ''
        return ''
    
    def matches_transaction(self, transaction):
        """Check if this condition matches the given transaction"""
        try:
            # Description conditions
            if self.condition_type.startswith('description_'):
                return self._match_description_condition(transaction)
            
            # Amount conditions
            elif self.condition_type.startswith('amount_'):
                return self._match_amount_condition(transaction)
            
            # Category conditions
            elif self.condition_type.startswith('category_'):
                return self._match_category_condition(transaction)
                
            # Beneficiary conditions
            elif self.condition_type.startswith('beneficiary_'):
                return self._match_beneficiary_condition(transaction)
                
            # Account conditions
            elif self.condition_type.startswith('account_'):
                return self._match_account_condition(transaction)
                
            # Date conditions
            elif self.condition_type.startswith('date_'):
                return self._match_date_condition(transaction)
                
            # Transaction type
            elif self.condition_type == 'transaction_type':
                return transaction.tipo == self.text_value
                
        except Exception as e:
            print(f"Error matching condition {self.id}: {e}")
            return False
            
        return False
    
    def _prepare_text_for_comparison(self, text):
        """Prepare text for comparison based on case sensitivity setting"""
        if text is None:
            return ""
        return text if self.case_sensitive else text.lower()
    
    def _match_description_condition(self, transaction):
        """Match description-based conditions"""
        description = self._prepare_text_for_comparison(transaction.descricao)
        
        if self.condition_type == 'description_is':
            value = self._prepare_text_for_comparison(self.text_value)
            return description == value
            
        elif self.condition_type == 'description_is_not':
            value = self._prepare_text_for_comparison(self.text_value)
            return description != value
            
        elif self.condition_type == 'description_contains':
            value = self._prepare_text_for_comparison(self.text_value)
            return value in description
            
        elif self.condition_type == 'description_not_contains':
            value = self._prepare_text_for_comparison(self.text_value)
            return value not in description
            
        elif self.condition_type == 'description_matches':
            pattern = self.text_value
            flags = 0 if self.case_sensitive else re.IGNORECASE
            return bool(re.search(pattern, transaction.descricao, flags))
            
        elif self.condition_type == 'description_one_of':
            values = [self._prepare_text_for_comparison(v) for v in self.text_values]
            return description in values
            
        elif self.condition_type == 'description_not_one_of':
            values = [self._prepare_text_for_comparison(v) for v in self.text_values]
            return description not in values
            
        return False
    
    def _match_amount_condition(self, transaction):
        """Match amount-based conditions"""
        amount = transaction.valor
        
        if self.condition_type == 'amount_is':
            return amount == self.numeric_value
            
        elif self.condition_type == 'amount_is_not':
            return amount != self.numeric_value
            
        elif self.condition_type == 'amount_greater':
            return amount > self.numeric_value
            
        elif self.condition_type == 'amount_less':
            return amount < self.numeric_value
            
        elif self.condition_type == 'amount_range':
            return self.numeric_value <= amount <= self.numeric_value_max
            
        return False
    
    def _match_category_condition(self, transaction):
        """Match category-based conditions"""
        if self.condition_type == 'category_is':
            if not transaction.category:
                return False
            category_name = self._prepare_text_for_comparison(transaction.category.nome)
            value = self._prepare_text_for_comparison(self.text_value)
            return category_name == value
            
        elif self.condition_type == 'category_is_not':
            if not transaction.category:
                return True  # No category is "not" any specific category
            category_name = self._prepare_text_for_comparison(transaction.category.nome)
            value = self._prepare_text_for_comparison(self.text_value)
            return category_name != value
            
        elif self.condition_type == 'category_one_of':
            if not transaction.category:
                return False
            return transaction.category in self.category_refs.all()
            
        elif self.condition_type == 'category_not_one_of':
            if not transaction.category:
                return True
            return transaction.category not in self.category_refs.all()
            
        return False
    
    def _match_beneficiary_condition(self, transaction):
        """Match beneficiary-based conditions"""
        if self.condition_type == 'beneficiary_is':
            if not transaction.beneficiario:
                return False
            beneficiary_name = self._prepare_text_for_comparison(transaction.beneficiario.nome)
            value = self._prepare_text_for_comparison(self.text_value)
            return beneficiary_name == value
            
        elif self.condition_type == 'beneficiary_is_not':
            if not transaction.beneficiario:
                return True
            beneficiary_name = self._prepare_text_for_comparison(transaction.beneficiario.nome)
            value = self._prepare_text_for_comparison(self.text_value)
            return beneficiary_name != value
            
        elif self.condition_type == 'beneficiary_contains':
            if not transaction.beneficiario:
                return False
            beneficiary_name = self._prepare_text_for_comparison(transaction.beneficiario.nome)
            value = self._prepare_text_for_comparison(self.text_value)
            return value in beneficiary_name
            
        elif self.condition_type == 'beneficiary_not_contains':
            if not transaction.beneficiario:
                return True
            beneficiary_name = self._prepare_text_for_comparison(transaction.beneficiario.nome)
            value = self._prepare_text_for_comparison(self.text_value)
            return value not in beneficiary_name
            
        elif self.condition_type == 'beneficiary_one_of':
            if not transaction.beneficiario:
                return False
            return transaction.beneficiario in self.beneficiary_refs.all()
            
        elif self.condition_type == 'beneficiary_not_one_of':
            if not transaction.beneficiario:
                return True
            return transaction.beneficiario not in self.beneficiary_refs.all()
            
        return False
    
    def _match_account_condition(self, transaction):
        """Match account-based conditions"""
        if self.condition_type == 'account_is':
            if not transaction.account:
                return False
            return str(transaction.account.id) == self.text_value
            
        elif self.condition_type == 'account_is_not':
            if not transaction.account:
                return True
            return str(transaction.account.id) != self.text_value
            
        elif self.condition_type == 'account_one_of':
            if not transaction.account:
                return False
            return transaction.account in self.account_refs.all()
            
        elif self.condition_type == 'account_not_one_of':
            if not transaction.account:
                return True
            return transaction.account not in self.account_refs.all()
            
        return False
    
    def _match_date_condition(self, transaction):
        """Match date-based conditions"""
        transaction_date = transaction.data
        
        if self.condition_type == 'date_is':
            return transaction_date == self.date_value
            
        elif self.condition_type == 'date_is_not':
            return transaction_date != self.date_value
            
        elif self.condition_type == 'date_after':
            return transaction_date > self.date_value
            
        elif self.condition_type == 'date_before':
            return transaction_date < self.date_value
            
        elif self.condition_type == 'date_range':
            return self.date_value <= transaction_date <= self.date_value_max
            
        return False


class RuleAction(models.Model):
    """Actions to be performed when a rule matches"""
    rule = models.ForeignKey(AutomationRule, on_delete=models.CASCADE, related_name='actions')
    action_type = models.CharField(max_length=20, choices=ActionType.choices)
    
    # Action values
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE, null=True, blank=True)
    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE, null=True, blank=True)
    account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, null=True, blank=True)
    tag = models.ForeignKey('categories.Tag', on_delete=models.CASCADE, null=True, blank=True)
    text_value = models.CharField(max_length=255, blank=True, verbose_name="Valor texto")
    numeric_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Valor numérico")
    date_value = models.DateField(null=True, blank=True, verbose_name="Valor data")
    boolean_value = models.BooleanField(default=False, verbose_name="Valor booleano")
    
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
        elif self.action_type == 'set_account':
            return self.account.nome if self.account else ''
        elif self.action_type == 'add_tag':
            return self.tag.nome if self.tag else ''
        elif self.action_type in ['set_description', 'set_notes', 'append_notes', 'prepend_notes']:
            return self.text_value
        elif self.action_type == 'set_amount':
            return str(self.numeric_value) if self.numeric_value else ''
        elif self.action_type == 'set_date':
            return str(self.date_value) if self.date_value else ''
        elif self.action_type == 'mark_cleared':
            return 'Sim' if self.boolean_value else 'Não'
        return ''
    
    def apply_to_transaction(self, transaction):
        """Apply this action to the given transaction"""
        try:
            updated_fields = []
            
            if self.action_type == 'set_category':
                if self.category and (not transaction.category or self.overwrite_existing):
                    transaction.category = self.category
                    updated_fields.append('category')
                    
            elif self.action_type == 'set_beneficiary':
                if self.beneficiary and (not transaction.beneficiario or self.overwrite_existing):
                    transaction.beneficiario = self.beneficiary
                    updated_fields.append('beneficiario')
                    
            elif self.action_type == 'set_account':
                if self.account and (not transaction.account or self.overwrite_existing):
                    transaction.account = self.account
                    updated_fields.append('account')
                    
            elif self.action_type == 'set_description':
                if self.text_value and (not transaction.descricao or self.overwrite_existing):
                    transaction.descricao = self.text_value
                    updated_fields.append('descricao')
                    
            elif self.action_type == 'set_amount':
                if self.numeric_value is not None and (self.overwrite_existing or transaction.valor == 0):
                    transaction.valor = self.numeric_value
                    updated_fields.append('valor')
                    
            elif self.action_type == 'set_date':
                if self.date_value and (self.overwrite_existing or not transaction.data):
                    transaction.data = self.date_value
                    updated_fields.append('data')
                    
            elif self.action_type == 'set_notes':
                if self.text_value and (not hasattr(transaction, 'notes') or not transaction.notes or self.overwrite_existing):
                    # Assuming there's a notes field or we create one
                    if hasattr(transaction, 'notes'):
                        transaction.notes = self.text_value
                        updated_fields.append('notes')
                        
            elif self.action_type == 'append_notes':
                if self.text_value:
                    if hasattr(transaction, 'notes'):
                        current_notes = transaction.notes or ""
                        transaction.notes = f"{current_notes}\n{self.text_value}".strip()
                        updated_fields.append('notes')
                        
            elif self.action_type == 'prepend_notes':
                if self.text_value:
                    if hasattr(transaction, 'notes'):
                        current_notes = transaction.notes or ""
                        transaction.notes = f"{self.text_value}\n{current_notes}".strip()
                        updated_fields.append('notes')
                        
            elif self.action_type == 'mark_cleared':
                if hasattr(transaction, 'cleared'):
                    transaction.cleared = self.boolean_value
                    updated_fields.append('cleared')
                elif hasattr(transaction, 'status'):
                    # If no 'cleared' field, use status field
                    transaction.status = 'cleared' if self.boolean_value else 'pending'
                    updated_fields.append('status')
                    
            elif self.action_type == 'add_tag':
                if self.tag:
                    # Check if tag is already added
                    if not transaction.tags.filter(id=self.tag.id).exists():
                        transaction.tags.add(self.tag)
                        return True  # Tags are handled separately, no need to save transaction
            
            # Save the transaction if any fields were updated
            if updated_fields:
                transaction.save(update_fields=updated_fields)
                return True
                        
        except Exception as e:
            print(f"Error applying action {self.id}: {e}")
            
        return False


class AutomationSettings(models.Model):
    """Settings for automation features per workspace"""
    workspace = models.OneToOneField('accounts.Workspace', on_delete=models.CASCADE, related_name='automation_settings')
    
    # Auto-learning settings
    auto_learning_enabled = models.BooleanField(default=True, verbose_name="Aprendizado automático habilitado")
    auto_create_category_rules = models.BooleanField(default=True, verbose_name="Criar regras de categoria automaticamente")
    auto_create_beneficiary_rules = models.BooleanField(default=True, verbose_name="Criar regras de beneficiário automaticamente")
    
    # Disabled beneficiaries for auto-learning
    disabled_beneficiaries = models.ManyToManyField('beneficiaries.Beneficiary', blank=True, 
                                                   verbose_name="Beneficiários com aprendizado desabilitado")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Configurações de Automação'
        verbose_name_plural = 'Configurações de Automação'
    
    def __str__(self):
        return f"Configurações de {self.workspace.nome}"


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
