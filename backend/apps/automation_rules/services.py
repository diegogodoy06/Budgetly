"""
Services for the automation rules engine
"""
from django.db import transaction as db_transaction
from django.utils import timezone
from apps.transactions.models import Transaction
from .models import AutomationRule, RuleApplicationLog


class RuleEngineService:
    """Service class for applying automation rules to transactions"""
    
    def __init__(self, workspace):
        self.workspace = workspace
    
    def apply_rules_to_transaction(self, transaction, rule_ids=None):
        """Apply all applicable rules to a single transaction"""
        rules = self.get_active_rules(rule_ids)
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
                                'actions_applied': actions_applied
                            })
                            
                except Exception as e:
                    print(f"Error applying rule {rule.id} to transaction {transaction.id}: {e}")
                    continue
        
        return applied_rules
    
    def apply_rules_to_transactions(self, transaction_ids=None, rule_ids=None):
        """Apply rules to multiple transactions"""
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
        rules = self.get_active_rules(rule_ids)
        transactions = self.get_transactions(transaction_ids)
        results = []
        
        for transaction in transactions:
            matched_rules = []
            would_apply_actions = []
            applied_actions = []
            
            for rule in rules:
                if rule.matches_transaction(transaction):
                    matched_rules.append({
                        'rule_id': rule.id,
                        'rule_name': rule.name,
                        'rule_type': rule.rule_type
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
                                print(f"Error applying action {action.id}: {e}")
            
            if matched_rules:
                results.append({
                    'transaction_id': transaction.id,
                    'transaction_description': transaction.descricao,
                    'transaction_amount': str(transaction.valor),
                    'matched_rules': matched_rules,
                    'would_apply_actions': would_apply_actions,
                    'applied_actions': applied_actions if apply_rules else []
                })
        
        return results
    
    def get_active_rules(self, rule_ids=None):
        """Get active rules for the workspace"""
        queryset = AutomationRule.objects.filter(
            workspace=self.workspace,
            is_active=True
        ).prefetch_related('conditions', 'actions').order_by('priority', 'name')
        
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
                
            elif action.action_type == 'add_tag':
                if action.tag:
                    return not transaction.tags.filter(id=action.tag.id).exists()
                    
            elif action.action_type == 'set_description':
                return action.text_value and (not transaction.descricao or action.overwrite_existing)
                
        except Exception as e:
            print(f"Error checking if action {action.id} would apply: {e}")
            
        return False


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