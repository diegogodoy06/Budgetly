"""
Tests for automation rules engine
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from apps.accounts.models import Workspace, WorkspaceMember, Account
from apps.transactions.models import Transaction, TransactionType
from apps.categories.models import Category
from apps.beneficiaries.models import Beneficiary
from .models import AutomationRule, RuleCondition, RuleAction, ConditionType, ActionType
from .services import RuleEngineService

User = get_user_model()


class AutomationRulesTestCase(TestCase):
    """Test case for automation rules functionality"""
    
    def setUp(self):
        """Set up test data"""
        # Create user and workspace
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.workspace = Workspace.objects.create(
            nome='Test Workspace',
            descricao='Test workspace for automation rules',
            criado_por=self.user
        )
        
        WorkspaceMember.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='admin',
            is_active=True
        )
        
        # Create account
        self.account = Account.objects.create(
            workspace=self.workspace,
            user=self.user,
            nome='Test Account',
            tipo='conta_corrente',
            saldo_inicial=Decimal('1000.00')
        )
        
        # Create category
        self.category = Category.objects.create(
            workspace=self.workspace,
            user=self.user,
            nome='Alimentação'
        )
        
        # Create beneficiary
        self.beneficiary = Beneficiary.objects.create(
            workspace=self.workspace,
            user=self.user,
            nome='Supermercado XYZ'
        )
    
    def test_create_automation_rule(self):
        """Test creating an automation rule"""
        rule = AutomationRule.objects.create(
            workspace=self.workspace,
            user=self.user,
            name='Categorize Supermarket',
            description='Auto-categorize supermarket transactions',
            rule_type='categorization'
        )
        
        self.assertEqual(rule.name, 'Categorize Supermarket')
        self.assertTrue(rule.is_active)
        self.assertEqual(rule.priority, 100)
    
    def test_rule_condition_description_contains(self):
        """Test rule condition matching description"""
        rule = AutomationRule.objects.create(
            workspace=self.workspace,
            user=self.user,
            name='Test Rule',
            rule_type='categorization'
        )
        
        condition = RuleCondition.objects.create(
            rule=rule,
            condition_type=ConditionType.DESCRIPTION_CONTAINS,
            text_value='supermercado',
            case_sensitive=False
        )
        
        # Create test transaction
        transaction = Transaction.objects.create(
            workspace=self.workspace,
            user=self.user,
            account=self.account,
            tipo=TransactionType.SAIDA,
            valor=Decimal('50.00'),
            descricao='Compra no Supermercado ABC',
            data='2024-01-01'
        )
        
        # Test condition matching
        self.assertTrue(condition.matches_transaction(transaction))
        
        # Test with non-matching transaction
        transaction2 = Transaction.objects.create(
            workspace=self.workspace,
            user=self.user,
            account=self.account,
            tipo=TransactionType.SAIDA,
            valor=Decimal('30.00'),
            descricao='Pagamento de conta de luz',
            data='2024-01-01'
        )
        
        self.assertFalse(condition.matches_transaction(transaction2))
    
    def test_rule_action_set_category(self):
        """Test rule action setting category"""
        rule = AutomationRule.objects.create(
            workspace=self.workspace,
            user=self.user,
            name='Test Rule',
            rule_type='categorization'
        )
        
        action = RuleAction.objects.create(
            rule=rule,
            action_type=ActionType.SET_CATEGORY,
            category=self.category
        )
        
        # Create test transaction
        transaction = Transaction.objects.create(
            workspace=self.workspace,
            user=self.user,
            account=self.account,
            tipo=TransactionType.SAIDA,
            valor=Decimal('50.00'),
            descricao='Test transaction',
            data='2024-01-01'
        )
        
        # Apply action
        self.assertTrue(action.apply_to_transaction(transaction))
        
        # Verify category was set
        transaction.refresh_from_db()
        self.assertEqual(transaction.category, self.category)
    
    def test_complete_rule_matching_and_application(self):
        """Test complete rule with condition and action"""
        # Create rule
        rule = AutomationRule.objects.create(
            workspace=self.workspace,
            user=self.user,
            name='Supermarket Rule',
            rule_type='categorization'
        )
        
        # Add condition
        RuleCondition.objects.create(
            rule=rule,
            condition_type=ConditionType.DESCRIPTION_CONTAINS,
            text_value='super',
            case_sensitive=False
        )
        
        # Add action
        RuleAction.objects.create(
            rule=rule,
            action_type=ActionType.SET_CATEGORY,
            category=self.category
        )
        
        # Create transaction
        transaction = Transaction.objects.create(
            workspace=self.workspace,
            user=self.user,
            account=self.account,
            tipo=TransactionType.SAIDA,
            valor=Decimal('75.00'),
            descricao='Compra no SuperMarket',
            data='2024-01-01'
        )
        
        # Test rule matching
        self.assertTrue(rule.matches_transaction(transaction))
        
        # Apply rule
        self.assertTrue(rule.apply_to_transaction(transaction))
        
        # Verify results
        transaction.refresh_from_db()
        self.assertEqual(transaction.category, self.category)
        
        # Verify statistics updated
        rule.refresh_from_db()
        self.assertEqual(rule.times_applied, 1)
        self.assertIsNotNone(rule.last_applied_at)
    
    def test_rule_engine_service(self):
        """Test the rule engine service"""
        # Create rule
        rule = AutomationRule.objects.create(
            workspace=self.workspace,
            user=self.user,
            name='Amount Rule',
            rule_type='categorization'
        )
        
        # Add condition for amount greater than 100
        RuleCondition.objects.create(
            rule=rule,
            condition_type=ConditionType.AMOUNT_GREATER,
            numeric_value=Decimal('100.00')
        )
        
        # Add action to set beneficiary
        RuleAction.objects.create(
            rule=rule,
            action_type=ActionType.SET_BENEFICIARY,
            beneficiary=self.beneficiary
        )
        
        # Create transactions
        transaction1 = Transaction.objects.create(
            workspace=self.workspace,
            user=self.user,
            account=self.account,
            tipo=TransactionType.SAIDA,
            valor=Decimal('150.00'),  # Should match rule
            descricao='Large purchase',
            data='2024-01-01'
        )
        
        transaction2 = Transaction.objects.create(
            workspace=self.workspace,
            user=self.user,
            account=self.account,
            tipo=TransactionType.SAIDA,
            valor=Decimal('50.00'),  # Should not match rule
            descricao='Small purchase',
            data='2024-01-01'
        )
        
        # Use service to apply rules
        service = RuleEngineService(self.workspace)
        results = service.apply_rules_to_transactions()
        
        # Verify results
        self.assertEqual(len(results), 1)  # Only one transaction should have rules applied
        
        transaction1.refresh_from_db()
        self.assertEqual(transaction1.beneficiario, self.beneficiary)
        
        transaction2.refresh_from_db()
        self.assertIsNone(transaction2.beneficiario)
    
    def test_multiple_conditions_all_must_match(self):
        """Test that all conditions must match for a rule to apply"""
        # Create rule
        rule = AutomationRule.objects.create(
            workspace=self.workspace,
            user=self.user,
            name='Multiple Conditions Rule',
            rule_type='categorization'
        )
        
        # Add multiple conditions
        RuleCondition.objects.create(
            rule=rule,
            condition_type=ConditionType.DESCRIPTION_CONTAINS,
            text_value='super',
            case_sensitive=False
        )
        
        RuleCondition.objects.create(
            rule=rule,
            condition_type=ConditionType.AMOUNT_GREATER,
            numeric_value=Decimal('50.00')
        )
        
        # Add action
        RuleAction.objects.create(
            rule=rule,
            action_type=ActionType.SET_CATEGORY,
            category=self.category
        )
        
        # Transaction that matches both conditions
        transaction1 = Transaction.objects.create(
            workspace=self.workspace,
            user=self.user,
            account=self.account,
            tipo=TransactionType.SAIDA,
            valor=Decimal('100.00'),
            descricao='Compra no supermercado',
            data='2024-01-01'
        )
        
        # Transaction that matches only one condition
        transaction2 = Transaction.objects.create(
            workspace=self.workspace,
            user=self.user,
            account=self.account,
            tipo=TransactionType.SAIDA,
            valor=Decimal('30.00'),  # Doesn't match amount condition
            descricao='Compra no supermercado',
            data='2024-01-01'
        )
        
        # Test matching
        self.assertTrue(rule.matches_transaction(transaction1))
        self.assertFalse(rule.matches_transaction(transaction2))
