#!/usr/bin/env python
"""
Enhanced demo script for the new automation rules engine
Demonstrates staged processing, comprehensive operators, and auto-learning features
"""
import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import Workspace, WorkspaceMember, Account
from apps.transactions.models import Transaction, TransactionType
from apps.categories.models import Category
from apps.beneficiaries.models import Beneficiary
from apps.automation_rules.models import (
    AutomationRule, RuleCondition, RuleAction, AutomationSettings,
    ConditionType, ActionType, RuleType, RuleStage
)
from apps.automation_rules.services import RuleEngineService, AutoLearningService

User = get_user_model()

def setup_demo_data():
    """Create demo user, workspace, and sample data"""
    print("🔧 Setting up enhanced demo data...")
    
    # Create or get demo user
    user, created = User.objects.get_or_create(
        username='enhanced_demo_user',
        defaults={
            'email': 'enhanced.demo@budgetly.com',
            'first_name': 'Enhanced',
            'last_name': 'Demo'
        }
    )
    if created:
        user.set_password('demo123')
        user.save()
        print("✅ Created enhanced demo user")
    
    # Create or get workspace
    workspace, created = Workspace.objects.get_or_create(
        nome='Enhanced Demo Workspace',
        criado_por=user,
        defaults={'descricao': 'Workspace for enhanced automation rules demonstration'}
    )
    if created:
        print("✅ Created enhanced demo workspace")
        
        # Create workspace membership
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=user,
            role='admin'
        )
    
    # Create account
    account, created = Account.objects.get_or_create(
        workspace=workspace,
        nome='Conta Corrente Demo',
        defaults={
            'tipo': 'conta_corrente',
            'saldo': Decimal('5000.00'),
            'user': user
        }
    )
    if created:
        print("✅ Created demo account")
    
    # Create categories with hierarchy
    categories = {}
    category_data = [
        ('Alimentação', None),
        ('Supermercado', 'Alimentação'),
        ('Restaurante', 'Alimentação'),
        ('Transporte', None),
        ('Combustível', 'Transporte'),
        ('Estacionamento', 'Transporte'),
        ('Saúde', None),
        ('Farmácia', 'Saúde'),
        ('Médico', 'Saúde'),
        ('Entretenimento', None),
        ('Cinema', 'Entretenimento'),
        ('Streaming', 'Entretenimento'),
    ]
    
    for cat_name, parent_name in category_data:
        parent = categories.get(parent_name) if parent_name else None
        category, created = Category.objects.get_or_create(
            workspace=workspace,
            nome=cat_name,
            parent=parent,
            defaults={'user': user}
        )
        categories[cat_name] = category
        if created:
            print(f"✅ Created category: {cat_name}")
    
    # Create beneficiaries
    beneficiaries = {}
    beneficiary_data = [
        'Supermercado ABC',
        'Posto Shell',
        'Netflix',
        'Restaurante Dom João',
        'Farmácia Popular',
        'Shopping Center',
        'Uber',
        'iFood',
        'Amazon',
        'Mercado Livre'
    ]
    
    for ben_name in beneficiary_data:
        beneficiary, created = Beneficiary.objects.get_or_create(
            workspace=workspace,
            nome=ben_name,
            defaults={'user': user}
        )
        beneficiaries[ben_name] = beneficiary
        if created:
            print(f"✅ Created beneficiary: {ben_name}")
    
    return user, workspace, account, categories, beneficiaries

def create_enhanced_automation_rules(workspace, user, categories, beneficiaries):
    """Create comprehensive automation rules demonstrating all stages and operators"""
    print("\n🤖 Creating enhanced automation rules...")
    
    # Clear existing rules
    AutomationRule.objects.filter(workspace=workspace).delete()
    
    rules = []
    
    # ===== PRE STAGE RULES (Beneficiary assignment) =====
    print("\n📋 Creating PRE stage rules (beneficiary assignment)...")
    
    # Rule 1: Netflix payments
    rule1 = AutomationRule.objects.create(
        workspace=workspace,
        user=user,
        name='Netflix - Identificar Beneficiário',
        description='Identifica pagamentos do Netflix baseado na descrição',
        rule_type=RuleType.BENEFICIARY,
        stage=RuleStage.PRE,
        priority=10
    )
    
    RuleCondition.objects.create(
        rule=rule1,
        condition_type=ConditionType.DESCRIPTION_CONTAINS,
        text_value='netflix',
        case_sensitive=False
    )
    
    RuleAction.objects.create(
        rule=rule1,
        action_type=ActionType.SET_BENEFICIARY,
        beneficiary=beneficiaries['Netflix']
    )
    rules.append(rule1)
    print("✅ Created Netflix beneficiary rule")
    
    # Rule 2: Uber rides (regex pattern)
    rule2 = AutomationRule.objects.create(
        workspace=workspace,
        user=user,
        name='Uber - Identificar por Regex',
        description='Identifica corridas do Uber usando regex',
        rule_type=RuleType.BENEFICIARY,
        stage=RuleStage.PRE,
        priority=20
    )
    
    RuleCondition.objects.create(
        rule=rule2,
        condition_type=ConditionType.DESCRIPTION_MATCHES,
        text_value=r'uber.*trip|trip.*uber',
        case_sensitive=False
    )
    
    RuleAction.objects.create(
        rule=rule2,
        action_type=ActionType.SET_BENEFICIARY,
        beneficiary=beneficiaries['Uber']
    )
    rules.append(rule2)
    print("✅ Created Uber regex beneficiary rule")
    
    # ===== DEFAULT STAGE RULES (Main categorization) =====
    print("\n📂 Creating DEFAULT stage rules (categorization)...")
    
    # Rule 3: Food delivery categorization
    rule3 = AutomationRule.objects.create(
        workspace=workspace,
        user=user,
        name='Delivery - Categorizar Alimentação',
        description='Categoriza pedidos de delivery como alimentação',
        rule_type=RuleType.CATEGORIZATION,
        stage=RuleStage.DEFAULT,
        priority=30
    )
    
    # Condition: description contains any of these words
    condition3 = RuleCondition.objects.create(
        rule=rule3,
        condition_type=ConditionType.DESCRIPTION_ONE_OF,
        text_values=['ifood', 'delivery', 'restaurant', 'restaurante'],
        case_sensitive=False
    )
    
    RuleAction.objects.create(
        rule=rule3,
        action_type=ActionType.SET_CATEGORY,
        category=categories['Alimentação']
    )
    rules.append(rule3)
    print("✅ Created food delivery categorization rule")
    
    # Rule 4: Gas station categorization with amount condition
    rule4 = AutomationRule.objects.create(
        workspace=workspace,
        user=user,
        name='Posto - Combustível Alto Valor',
        description='Categoriza abastecimentos acima de R$ 100 como combustível',
        rule_type=RuleType.COMBINATION,
        stage=RuleStage.DEFAULT,
        priority=40
    )
    
    RuleCondition.objects.create(
        rule=rule4,
        condition_type=ConditionType.DESCRIPTION_CONTAINS,
        text_value='posto',
        case_sensitive=False
    )
    
    RuleCondition.objects.create(
        rule=rule4,
        condition_type=ConditionType.AMOUNT_GREATER,
        numeric_value=Decimal('100.00')
    )
    
    RuleAction.objects.create(
        rule=rule4,
        action_type=ActionType.SET_CATEGORY,
        category=categories['Combustível']
    )
    
    RuleAction.objects.create(
        rule=rule4,
        action_type=ActionType.SET_BENEFICIARY,
        beneficiary=beneficiaries['Posto Shell']
    )
    rules.append(rule4)
    print("✅ Created gas station high-value rule")
    
    # Rule 5: Pharmacy categorization (case insensitive)
    rule5 = AutomationRule.objects.create(
        workspace=workspace,
        user=user,
        name='Farmácia - Categorizar Saúde',
        description='Categoriza compras em farmácia como saúde',
        rule_type=RuleType.CATEGORIZATION,
        stage=RuleStage.DEFAULT,
        priority=50
    )
    
    RuleCondition.objects.create(
        rule=rule5,
        condition_type=ConditionType.DESCRIPTION_CONTAINS,
        text_value='farmacia',
        case_sensitive=False
    )
    
    RuleAction.objects.create(
        rule=rule5,
        action_type=ActionType.SET_CATEGORY,
        category=categories['Farmácia']
    )
    rules.append(rule5)
    print("✅ Created pharmacy categorization rule")
    
    # ===== POST STAGE RULES (Final adjustments) =====
    print("\n🎯 Creating POST stage rules (final adjustments)...")
    
    # Rule 6: High value transactions marking
    rule6 = AutomationRule.objects.create(
        workspace=workspace,
        user=user,
        name='Alto Valor - Marcar para Revisão',
        description='Marca transações acima de R$ 500 como compensadas para revisão',
        rule_type=RuleType.COMBINATION,
        stage=RuleStage.POST,
        priority=60
    )
    
    RuleCondition.objects.create(
        rule=rule6,
        condition_type=ConditionType.AMOUNT_GREATER,
        numeric_value=Decimal('500.00')
    )
    
    RuleAction.objects.create(
        rule=rule6,
        action_type=ActionType.MARK_CLEARED,
        boolean_value=True
    )
    rules.append(rule6)
    print("✅ Created high-value marking rule")
    
    # Rule 7: Weekend transactions note
    rule7 = AutomationRule.objects.create(
        workspace=workspace,
        user=user,
        name='Final de Semana - Adicionar Nota',
        description='Adiciona nota em transações de entretenimento',
        rule_type=RuleType.COMBINATION,
        stage=RuleStage.POST,
        priority=70
    )
    
    condition7 = RuleCondition.objects.create(
        rule=rule7,
        condition_type=ConditionType.CATEGORY_IS,
        text_value='Entretenimento'
    )
    
    RuleAction.objects.create(
        rule=rule7,
        action_type=ActionType.APPEND_NOTES,
        text_value='⚠️ Verificar se foi gasto de lazer'
    )
    rules.append(rule7)
    print("✅ Created weekend entertainment note rule")
    
    print(f"\n✅ Created {len(rules)} enhanced automation rules across all stages!")
    return rules

def create_sample_transactions(workspace, user, account, categories, beneficiaries):
    """Create diverse sample transactions to test the enhanced rules"""
    print("\n💰 Creating diverse sample transactions...")
    
    # Clear existing transactions
    Transaction.objects.filter(workspace=workspace).delete()
    
    transactions = []
    today = date.today()
    
    transaction_data = [
        {
            'descricao': 'NETFLIX.COM MONTHLY SUBSCRIPTION',
            'valor': Decimal('39.90'),
            'data': today - timedelta(days=1),
            'tipo': TransactionType.EXPENSE
        },
        {
            'descricao': 'UBER TRIP #12345 - Centro para Casa',
            'valor': Decimal('25.50'),
            'data': today - timedelta(days=2),
            'tipo': TransactionType.EXPENSE
        },
        {
            'descricao': 'iFood - Restaurante Dom João',
            'valor': Decimal('85.40'),
            'data': today - timedelta(days=1),
            'tipo': TransactionType.EXPENSE
        },
        {
            'descricao': 'POSTO SHELL - Abastecimento',
            'valor': Decimal('120.00'),
            'data': today - timedelta(days=3),
            'tipo': TransactionType.EXPENSE
        },
        {
            'descricao': 'Farmacia Popular - Medicamentos',
            'valor': Decimal('45.80'),
            'data': today - timedelta(days=2),
            'tipo': TransactionType.EXPENSE
        },
        {
            'descricao': 'Shopping Center - Compras',
            'valor': Decimal('750.00'),  # High value transaction
            'data': today - timedelta(days=1),
            'tipo': TransactionType.EXPENSE
        },
        {
            'descricao': 'Cinema Multiplex - Filme',
            'valor': Decimal('35.00'),
            'data': today,
            'tipo': TransactionType.EXPENSE
        },
        {
            'descricao': 'Amazon Prime - Assinatura',
            'valor': Decimal('14.90'),
            'data': today - timedelta(days=4),
            'tipo': TransactionType.EXPENSE
        },
        {
            'descricao': 'DELIVERY EXPRESS - Lanche',
            'valor': Decimal('28.50'),
            'data': today,
            'tipo': TransactionType.EXPENSE
        },
        {
            'descricao': 'Transferência PIX Recebida',
            'valor': Decimal('1200.00'),
            'data': today - timedelta(days=1),
            'tipo': TransactionType.INCOME
        }
    ]
    
    for i, data in enumerate(transaction_data):
        transaction = Transaction.objects.create(
            workspace=workspace,
            user=user,
            account=account,
            **data
        )
        transactions.append(transaction)
        print(f"✅ Created transaction {i+1}: {data['descricao'][:40]}...")
    
    print(f"\n✅ Created {len(transactions)} diverse sample transactions!")
    return transactions

def test_enhanced_automation_rules(workspace, transactions):
    """Test the enhanced automation rules with staged processing"""
    print("\n🧪 Testing enhanced automation rules with staged processing...")
    
    service = RuleEngineService(workspace)
    
    print("\n📊 Processing transactions through all stages...")
    print("=" * 80)
    
    total_applied_rules = 0
    
    for i, transaction in enumerate(transactions):
        print(f"\n🔄 Processing Transaction {i+1}: {transaction.descricao}")
        print(f"   💰 Amount: R$ {transaction.valor}")
        print(f"   📅 Date: {transaction.data}")
        
        # Apply rules with staged processing
        applied_rules = service.apply_rules_to_transaction(transaction)
        
        if applied_rules:
            print(f"   ✅ Applied {len(applied_rules)} rules:")
            for rule_result in applied_rules:
                stage = rule_result.get('stage', 'unknown')
                print(f"      📋 [{stage.upper()}] {rule_result['rule_name']}")
                for action in rule_result['actions_applied']:
                    print(f"         ⚡ {action['action_type']}: {action['action_value']}")
            total_applied_rules += len(applied_rules)
        else:
            print("   ⚠️ No rules applied")
        
        # Show final transaction state
        transaction.refresh_from_db()
        print(f"   📂 Final Category: {transaction.category.nome if transaction.category else 'None'}")
        print(f"   👤 Final Beneficiary: {transaction.beneficiario.nome if transaction.beneficiario else 'None'}")
        if hasattr(transaction, 'cleared') and transaction.cleared:
            print(f"   ✅ Marked as cleared")
        
        print("-" * 40)
    
    print(f"\n🎉 Enhanced automation complete!")
    print(f"📈 Total rules applied: {total_applied_rules}")
    print(f"📊 Transactions processed: {len(transactions)}")
    print(f"⚡ Average rules per transaction: {total_applied_rules/len(transactions):.1f}")

def demonstrate_auto_learning(workspace, user, categories, beneficiaries):
    """Demonstrate the auto-learning functionality"""
    print("\n🧠 Demonstrating Auto-Learning Features...")
    
    # Setup automation settings
    settings, created = AutomationSettings.objects.get_or_create(
        workspace=workspace,
        defaults={
            'auto_learning_enabled': True,
            'auto_create_category_rules': True,
            'auto_create_beneficiary_rules': True
        }
    )
    print("✅ Auto-learning enabled for workspace")
    
    # Create a new transaction for learning demonstration
    from apps.accounts.models import Account
    account = Account.objects.filter(workspace=workspace).first()
    
    learning_transaction = Transaction.objects.create(
        workspace=workspace,
        user=user,
        account=account,
        descricao='McDONALDS - LANCHONETE CENTRO',
        valor=Decimal('32.50'),
        data=date.today(),
        tipo=TransactionType.EXPENSE
    )
    
    print(f"📝 Created learning transaction: {learning_transaction.descricao}")
    
    # Simulate manual categorization
    auto_learning = AutoLearningService(workspace)
    
    # User manually categorizes as "Restaurante"
    old_category = learning_transaction.category
    new_category = categories['Restaurante']
    
    suggested_rule = auto_learning.suggest_rule_from_categorization(
        learning_transaction, old_category, new_category, user
    )
    
    if suggested_rule:
        print(f"✅ Auto-generated rule: {suggested_rule.name}")
        print(f"   📋 Stage: {suggested_rule.get_stage_display()}")
        print(f"   🎯 Type: {suggested_rule.get_rule_type_display()}")
        print(f"   ⚙️ Auto-generated: {suggested_rule.is_auto_generated}")
        
        # Show the rule conditions and actions
        for condition in suggested_rule.conditions.all():
            print(f"   📝 Condition: {condition.get_condition_type_display()} = '{condition.text_value}'")
        
        for action in suggested_rule.actions.all():
            print(f"   ⚡ Action: {action.get_action_type_display()} = '{action.get_action_value()}'")
    
    print("\n🎓 Auto-learning demonstration complete!")

def print_enhanced_summary(workspace):
    """Print enhanced summary of the automation system"""
    print("\n" + "="*80)
    print("📊 ENHANCED AUTOMATION RULES ENGINE SUMMARY")
    print("="*80)
    
    # Rules by stage
    from apps.automation_rules.models import RuleStage
    for stage_choice in RuleStage.choices:
        stage_code = stage_choice[0]
        stage_name = stage_choice[1]
        rules = AutomationRule.objects.filter(workspace=workspace, stage=stage_code)
        print(f"\n📋 {stage_name.upper()} STAGE: {rules.count()} rules")
        for rule in rules:
            print(f"   • {rule.name} (Priority: {rule.priority})")
    
    # Statistics
    total_rules = AutomationRule.objects.filter(workspace=workspace).count()
    active_rules = AutomationRule.objects.filter(workspace=workspace, is_active=True).count()
    auto_generated = AutomationRule.objects.filter(workspace=workspace, is_auto_generated=True).count()
    
    print(f"\n📈 STATISTICS:")
    print(f"   📊 Total Rules: {total_rules}")
    print(f"   ✅ Active Rules: {active_rules}")
    print(f"   🤖 Auto-generated Rules: {auto_generated}")
    
    # Recent applications
    from apps.automation_rules.models import RuleApplicationLog
    recent_logs = RuleApplicationLog.objects.filter(
        rule__workspace=workspace
    ).order_by('-applied_at')[:5]
    
    print(f"\n📜 RECENT RULE APPLICATIONS:")
    for log in recent_logs:
        print(f"   • {log.rule.name} → {log.transaction.descricao[:30]}...")
    
    print("\n🎉 Enhanced automation rules engine demo completed successfully!")
    print("=" * 80)

def main():
    """Main demo function"""
    print("🚀 Starting Enhanced Automation Rules Engine Demo")
    print("=" * 80)
    
    try:
        # Setup demo data
        user, workspace, account, categories, beneficiaries = setup_demo_data()
        
        # Create enhanced automation rules
        rules = create_enhanced_automation_rules(workspace, user, categories, beneficiaries)
        
        # Create sample transactions
        transactions = create_sample_transactions(workspace, user, account, categories, beneficiaries)
        
        # Test automation rules
        test_enhanced_automation_rules(workspace, transactions)
        
        # Demonstrate auto-learning
        demonstrate_auto_learning(workspace, user, categories, beneficiaries)
        
        # Print summary
        print_enhanced_summary(workspace)
        
    except Exception as e:
        print(f"❌ Error during demo: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())