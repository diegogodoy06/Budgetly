"""
Services for the automation rules engine
"""
from django.db import transaction as db_transaction
from django.utils import timezone
from apps.transactions.models import Transaction
from .models import AutomationRule, RuleApplicationLog, AutomationSettings, RuleStage, ConditionType, ActionType, RuleCondition, RuleAction
import logging

logger = logging.getLogger(__name__)


class RuleEngineService:
    """Service class for applying automation rules to transactions"""
    
    def __init__(self, workspace):
        self.workspace = workspace
    
    def apply_rules_to_transaction(self, transaction, rule_ids=None):
        """Apply all applicable rules to a single transaction in staged order"""
        # Process rules by stage: pre -> default -> post
        all_applied_rules = []
        
        for stage in [RuleStage.PRE, RuleStage.DEFAULT, RuleStage.POST]:
            stage_rules = self.get_active_rules_by_stage(stage, rule_ids)
            applied_rules = self._apply_rules_to_transaction_stage(transaction, stage_rules, stage)
            all_applied_rules.extend(applied_rules)
        
        return all_applied_rules
    
    def _apply_rules_to_transaction_stage(self, transaction, rules, stage):
        """Apply rules for a specific stage"""
        applied_rules = []
        
        for rule in rules:
            if rule.matches_transaction(transaction):
                try:
                    with db_transaction.atomic():
                        actions_applied = []
                        for action in rule.actions.all():
                            if action.apply_to_transaction(transaction):
                                actions_applied.append({
                                    'action_type': action.action_type,
                                    'action_value': action.get_action_value()
                                })
                        
                        if actions_applied:
                            # Log the application
                            RuleApplicationLog.objects.create(
                                rule=rule,
                                transaction=transaction,
                                actions_applied=actions_applied
                            )
                            
                            # Update rule statistics
                            rule.times_applied += 1
                            rule.last_applied_at = timezone.now()
                            rule.save(update_fields=['times_applied', 'last_applied_at'])
                            
                            applied_rules.append({
                                'rule_id': rule.id,
                                'rule_name': rule.name,
                                'stage': stage,
                                'actions_applied': actions_applied
                            })
                            
                except Exception as e:
                    logger.error(f"Error applying rule {rule.id} to transaction {transaction.id}: {e}")
                    continue
        
        return applied_rules
    
    def apply_rules_to_transactions(self, transaction_ids=None, rule_ids=None):
        """Apply rules to multiple transactions with staged processing"""
        transactions = self.get_transactions(transaction_ids)
        results = []
        
        for transaction in transactions:
            applied_rules = self.apply_rules_to_transaction(transaction, rule_ids)
            if applied_rules:
                results.append({
                    'transaction_id': transaction.id,
                    'transaction_description': transaction.descricao,
                    'applied_rules': applied_rules
                })
        
        return results
    
    def test_rules(self, rule_ids=None, transaction_ids=None, apply_rules=False):
        """Test rules against transactions without applying them (unless apply_rules=True)"""
        transactions = self.get_transactions(transaction_ids)
        results = []
        
        # Test rules by stage
        for transaction in transactions:
            transaction_result = {
                'transaction_id': transaction.id,
                'transaction_description': transaction.descricao,
                'transaction_amount': str(transaction.valor),
                'stages': {}
            }
            
            for stage in [RuleStage.PRE, RuleStage.DEFAULT, RuleStage.POST]:
                stage_rules = self.get_active_rules_by_stage(stage, rule_ids)
                stage_result = self._test_rules_for_stage(transaction, stage_rules, stage, apply_rules)
                if stage_result['matched_rules']:
                    transaction_result['stages'][stage] = stage_result
            
            if transaction_result['stages']:
                results.append(transaction_result)
        
        return results
    
    def _test_rules_for_stage(self, transaction, rules, stage, apply_rules=False):
        """Test rules for a specific stage"""
        matched_rules = []
        would_apply_actions = []
        applied_actions = []
        
        for rule in rules:
            if rule.matches_transaction(transaction):
                matched_rules.append({
                    'rule_id': rule.id,
                    'rule_name': rule.name,
                    'rule_type': rule.rule_type,
                    'stage': stage
                })
                
                # Check what actions would be applied
                for action in rule.actions.all():
                    action_info = {
                        'action_type': action.action_type,
                        'action_value': action.get_action_value(),
                        'would_apply': self._would_action_apply(action, transaction)
                    }
                    would_apply_actions.append(action_info)
                    
                    # If apply_rules is True, actually apply the action
                    if apply_rules and action_info['would_apply']:
                        try:
                            if action.apply_to_transaction(transaction):
                                applied_actions.append(action_info)
                        except Exception as e:
                            logger.error(f"Error applying action {action.id}: {e}")
        
        return {
            'matched_rules': matched_rules,
            'would_apply_actions': would_apply_actions,
            'applied_actions': applied_actions if apply_rules else []
        }
    
    def get_active_rules_by_stage(self, stage, rule_ids=None):
        """Get active rules for a specific stage"""
        queryset = AutomationRule.objects.filter(
            workspace=self.workspace,
            is_active=True,
            stage=stage
        ).prefetch_related('conditions', 'actions').order_by('priority', 'name')
        
        if rule_ids:
            queryset = queryset.filter(id__in=rule_ids)
        
        return queryset
    
    def get_active_rules(self, rule_ids=None):
        """Get all active rules for the workspace (backward compatibility)"""
        queryset = AutomationRule.objects.filter(
            workspace=self.workspace,
            is_active=True
        ).prefetch_related('conditions', 'actions').order_by('stage', 'priority', 'name')
        
        if rule_ids:
            queryset = queryset.filter(id__in=rule_ids)
        
        return queryset
    
    def get_transactions(self, transaction_ids=None):
        """Get transactions for the workspace"""
        queryset = Transaction.objects.filter(
            workspace=self.workspace
        ).select_related('category', 'beneficiario', 'account', 'credit_card')
        
        if transaction_ids:
            queryset = queryset.filter(id__in=transaction_ids)
        
        return queryset
    
    def _would_action_apply(self, action, transaction):
        """Check if an action would apply to a transaction without actually applying it"""
        try:
            if action.action_type == 'set_category':
                return action.category and (not transaction.category or action.overwrite_existing)
                
            elif action.action_type == 'set_beneficiary':
                return action.beneficiary and (not transaction.beneficiario or action.overwrite_existing)
                
            elif action.action_type == 'set_account':
                return action.account and (not transaction.account or action.overwrite_existing)
                
            elif action.action_type == 'add_tag':
                if action.tag:
                    return not transaction.tags.filter(id=action.tag.id).exists()
                    
            elif action.action_type == 'set_description':
                return action.text_value and (not transaction.descricao or action.overwrite_existing)
                
            elif action.action_type == 'set_amount':
                return action.numeric_value is not None and (action.overwrite_existing or transaction.valor == 0)
                
            elif action.action_type == 'set_date':
                return action.date_value and (action.overwrite_existing or not transaction.data)
                
            elif action.action_type in ['set_notes', 'append_notes', 'prepend_notes']:
                return action.text_value and hasattr(transaction, 'notes')
                
            elif action.action_type == 'mark_cleared':
                return hasattr(transaction, 'cleared') or hasattr(transaction, 'status')
                
        except Exception as e:
            logger.error(f"Error checking if action {action.id} would apply: {e}")
            
        return False


class AutoLearningService:
    """Service for automatic rule learning from user behavior"""
    
    def __init__(self, workspace):
        self.workspace = workspace
        self.settings = self._get_or_create_settings()
    
    def _get_or_create_settings(self):
        """Get or create automation settings for workspace"""
        settings, created = AutomationSettings.objects.get_or_create(
            workspace=self.workspace,
            defaults={
                'auto_learning_enabled': True,
                'auto_create_category_rules': True,
                'auto_create_beneficiary_rules': True
            }
        )
        return settings
    
    def suggest_rule_from_categorization(self, transaction, old_category, new_category, user):
        """Suggest or create a rule when user manually changes category"""
        if not self.settings.auto_learning_enabled or not self.settings.auto_create_category_rules:
            return None
            
        if not new_category or not transaction.descricao:
            return None
        
        # Create a categorization rule based on description
        rule_name = f"Auto: {transaction.descricao[:30]}... → {new_category.nome}"
        
        # Check if similar rule already exists
        existing_rule = AutomationRule.objects.filter(
            workspace=self.workspace,
            name=rule_name,
            stage=RuleStage.DEFAULT,
            rule_type='categorization'
        ).first()
        
        if existing_rule:
            return existing_rule
        
        # Create new rule
        rule = AutomationRule.objects.create(
            workspace=self.workspace,
            user=user,
            name=rule_name,
            description=f"Regra criada automaticamente baseada na categorização manual",
            rule_type='categorization',
            stage=RuleStage.DEFAULT,
            is_auto_generated=True,
            priority=500  # Medium priority for auto-generated rules
        )
        
        # Add condition: description contains key words
        key_words = self._extract_key_words(transaction.descricao)
        if key_words:
            condition = RuleCondition.objects.create(
                rule=rule,
                condition_type=ConditionType.DESCRIPTION_CONTAINS,
                text_value=key_words[0],  # Use most significant word
                case_sensitive=False
            )
        
        # Add action: set category
        action = RuleAction.objects.create(
            rule=rule,
            action_type=ActionType.SET_CATEGORY,
            category=new_category,
            overwrite_existing=False
        )
        
        return rule
    
    def suggest_rule_from_beneficiary_change(self, transaction, old_beneficiary, new_beneficiary, user):
        """Suggest or create a rule when user manually changes beneficiary"""
        if not self.settings.auto_learning_enabled or not self.settings.auto_create_beneficiary_rules:
            return None
            
        if not new_beneficiary or not transaction.descricao:
            return None
        
        # Check if beneficiary learning is disabled for this beneficiary
        if new_beneficiary in self.settings.disabled_beneficiaries.all():
            return None
        
        # Create a beneficiary rule based on description
        rule_name = f"Auto: {transaction.descricao[:30]}... → {new_beneficiary.nome}"
        
        # Check if similar rule already exists
        existing_rule = AutomationRule.objects.filter(
            workspace=self.workspace,
            name=rule_name,
            stage=RuleStage.PRE,  # Beneficiary rules go to PRE stage
            rule_type='beneficiary'
        ).first()
        
        if existing_rule:
            return existing_rule
        
        # Create new rule
        rule = AutomationRule.objects.create(
            workspace=self.workspace,
            user=user,
            name=rule_name,
            description=f"Regra criada automaticamente baseada na mudança de beneficiário",
            rule_type='beneficiary',
            stage=RuleStage.PRE,
            is_auto_generated=True,
            priority=300  # Higher priority for beneficiary rules
        )
        
        # Add condition: description contains key words
        key_words = self._extract_key_words(transaction.descricao)
        if key_words:
            condition = RuleCondition.objects.create(
                rule=rule,
                condition_type=ConditionType.DESCRIPTION_CONTAINS,
                text_value=key_words[0],
                case_sensitive=False
            )
        
        # Add action: set beneficiary
        action = RuleAction.objects.create(
            rule=rule,
            action_type=ActionType.SET_BENEFICIARY,
            beneficiary=new_beneficiary,
            overwrite_existing=False
        )
        
        return rule
    
    def _extract_key_words(self, description):
        """Extract key words from transaction description for rule creation"""
        if not description:
            return []
        
        # Simple keyword extraction - remove common words and get significant ones
        common_words = {'de', 'da', 'do', 'em', 'na', 'no', 'com', 'para', 'por', 'a', 'o', 'e', 'que'}
        words = description.lower().split()
        key_words = [word for word in words if len(word) > 3 and word not in common_words]
        
        # Return up to 3 most significant words
        return key_words[:3]
    
    def disable_learning_for_beneficiary(self, beneficiary):
        """Disable auto-learning for a specific beneficiary"""
        self.settings.disabled_beneficiaries.add(beneficiary)
    
    def enable_learning_for_beneficiary(self, beneficiary):
        """Enable auto-learning for a specific beneficiary"""
        self.settings.disabled_beneficiaries.remove(beneficiary)


def apply_automation_rules_to_transaction(transaction, workspace=None):
    """
    Convenience function to apply automation rules to a single transaction
    Can be called from transaction creation/import workflows
    """
    if not workspace:
        workspace = transaction.workspace
    
    service = RuleEngineService(workspace)
    return service.apply_rules_to_transaction(transaction)


def apply_automation_rules_to_csv_import(transactions, workspace):
    """
    Convenience function to apply automation rules to CSV imported transactions
    """
    service = RuleEngineService(workspace)
    results = []
    
    for transaction in transactions:
        applied_rules = service.apply_rules_to_transaction(transaction)
        if applied_rules:
            results.append({
                'transaction': transaction,
                'applied_rules': applied_rules
            })
    
    return results


def suggest_rule_from_manual_changes(transaction, field_name, old_value, new_value, user):
    """
    Convenience function to suggest rules based on manual transaction changes
    """
    auto_learning = AutoLearningService(transaction.workspace)
    
    if field_name == 'category':
        return auto_learning.suggest_rule_from_categorization(transaction, old_value, new_value, user)
    elif field_name == 'beneficiario':
        return auto_learning.suggest_rule_from_beneficiary_change(transaction, old_value, new_value, user)
    
    return None