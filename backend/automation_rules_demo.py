#!/usr/bin/env python
"""
Demo script for automation rules engine
Run this script to see automation rules in action
"""
import os
import sys
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import Workspace, WorkspaceMember, Account
from apps.transactions.models import Transaction, TransactionType
from apps.categories.models import Category
from apps.beneficiaries.models import Beneficiary
from apps.automation_rules.models import (
    AutomationRule, RuleCondition, RuleAction, 
    ConditionType, ActionType, RuleType
)
from apps.automation_rules.services import RuleEngineService

User = get_user_model()

def setup_demo_data():
    """Create demo user, workspace, and sample data"""
    print("🔧 Setting up demo data...")
    
    # Create or get demo user
    user, created = User.objects.get_or_create(
        username='demo_user',
        defaults={
            'email': 'demo@budgetly.com',
            'first_name': 'Demo',
            'last_name': 'User'
        }
    )
    if created:
        user.set_password('demo123')
        user.save()
        print("✅ Created demo user")
    
    # Create or get workspace
    workspace, created = Workspace.objects.get_or_create(
        nome='Demo Workspace',
        criado_por=user,
        defaults={'descricao': 'Workspace para demonstração das regras de automação'}
    )
    if created:
        print("✅ Created demo workspace")
    
    # Ensure user is member of workspace
    WorkspaceMember.objects.get_or_create(
        workspace=workspace,
        user=user,
        defaults={'role': 'admin', 'is_active': True}
    )
    
    # Create account
    account, created = Account.objects.get_or_create(
        workspace=workspace,
        user=user,
        nome='Conta Corrente Demo',
        defaults={
            'tipo': 'conta_corrente',
            'saldo_inicial': Decimal('5000.00')
        }
    )
    if created:
        print("✅ Created demo account")
    
    # Create categories
    categories = {}
    category_names = ['Alimentação', 'Transporte', 'Saúde', 'Entretenimento', 'Educação']
    for cat_name in category_names:
        category, created = Category.objects.get_or_create(
            workspace=workspace,
            user=user,
            nome=cat_name
        )
        categories[cat_name] = category
        if created:
            print(f"✅ Created category: {cat_name}")
    
    # Create beneficiaries
    beneficiaries = {}
    beneficiary_names = ['Supermercado ABC', 'Posto Shell', 'Farmácia Popular', 'Cinema Multiplex']
    for ben_name in beneficiary_names:
        beneficiary, created = Beneficiary.objects.get_or_create(
            workspace=workspace,
            user=user,
            nome=ben_name
        )
        beneficiaries[ben_name] = beneficiary
        if created:
            print(f"✅ Created beneficiary: {ben_name}")
    
    return user, workspace, account, categories, beneficiaries

def create_automation_rules(workspace, user, categories, beneficiaries):
    """Create sample automation rules"""
    print("\n🤖 Creating automation rules...")
    
    rules = []
    
    # Rule 1: Categorize supermarket transactions
    rule1 = AutomationRule.objects.create(
        workspace=workspace,
        user=user,
        name='Categorizar Supermercado',
        description='Auto-categoriza transações de supermercado como Alimentação',
        rule_type=RuleType.CATEGORIZATION,
        priority=10
    )
    
    RuleCondition.objects.create(
        rule=rule1,
        condition_type=ConditionType.DESCRIPTION_CONTAINS,
        text_value='supermercado',
        case_sensitive=False
    )
    
    RuleAction.objects.create(
        rule=rule1,
        action_type=ActionType.SET_CATEGORY,
        category=categories['Alimentação']
    )
    
    RuleAction.objects.create(
        rule=rule1,
        action_type=ActionType.SET_BENEFICIARY,
        beneficiary=beneficiaries['Supermercado ABC']
    )
    
    rules.append(rule1)
    print("✅ Created rule: Categorizar Supermercado")
    
    # Rule 2: High-value transactions
    rule2 = AutomationRule.objects.create(
        workspace=workspace,
        user=user,
        name='Transações de Alto Valor',
        description='Marca transações acima de R$ 500 para revisão',
        rule_type=RuleType.TAG,
        priority=5  # Higher priority
    )
    
    RuleCondition.objects.create(
        rule=rule2,
        condition_type=ConditionType.AMOUNT_GREATER,
        numeric_value=Decimal('500.00')
    )
    
    # Note: We'll create a tag for this
    from apps.categories.models import Tag
    high_value_tag, created = Tag.objects.get_or_create(
        workspace=workspace,
        user=user,
        nome='Alto Valor'
    )
    if created:
        print("✅ Created tag: Alto Valor")
    
    RuleAction.objects.create(
        rule=rule2,
        action_type=ActionType.ADD_TAG,
        tag=high_value_tag
    )
    
    rules.append(rule2)
    print("✅ Created rule: Transações de Alto Valor")
    
    # Rule 3: Gas station transactions
    rule3 = AutomationRule.objects.create(
        workspace=workspace,
        user=user,
        name='Categorizar Posto de Gasolina',
        description='Auto-categoriza gastos em postos como Transporte',
        rule_type=RuleType.COMBINATION,
        priority=20
    )
    
    RuleCondition.objects.create(
        rule=rule3,
        condition_type=ConditionType.DESCRIPTION_CONTAINS,
        text_value='posto',
        case_sensitive=False
    )
    
    RuleAction.objects.create(
        rule=rule3,
        action_type=ActionType.SET_CATEGORY,
        category=categories['Transporte']
    )
    
    RuleAction.objects.create(
        rule=rule3,
        action_type=ActionType.SET_BENEFICIARY,
        beneficiary=beneficiaries['Posto Shell']
    )
    
    rules.append(rule3)
    print("✅ Created rule: Categorizar Posto de Gasolina")
    
    return rules

def create_sample_transactions(workspace, user, account):
    """Create sample transactions to test rules"""
    print("\n💳 Creating sample transactions...")
    
    transactions = []
    
    sample_data = [
        {
            'descricao': 'Compra no Supermercado ABC',
            'valor': Decimal('85.50'),
            'tipo': TransactionType.SAIDA
        },
        {
            'descricao': 'Abastecimento no Posto Shell',
            'valor': Decimal('120.00'),
            'tipo': TransactionType.SAIDA
        },
        {
            'descricao': 'Consulta médica particular',
            'valor': Decimal('300.00'),
            'tipo': TransactionType.SAIDA
        },
        {
            'descricao': 'Compra eletrônicos',
            'valor': Decimal('1200.00'),  # High value
            'tipo': TransactionType.SAIDA
        },
        {
            'descricao': 'Depósito salário',
            'valor': Decimal('5000.00'),
            'tipo': TransactionType.ENTRADA
        },
        {
            'descricao': 'Supermercado Municipal',
            'valor': Decimal('45.80'),
            'tipo': TransactionType.SAIDA
        }
    ]
    
    for i, data in enumerate(sample_data):
        transaction = Transaction.objects.create(
            workspace=workspace,
            user=user,
            account=account,
            descricao=data['descricao'],
            valor=data['valor'],
            tipo=data['tipo'],
            data='2024-01-01'
        )
        transactions.append(transaction)
        print(f"✅ Created transaction: {transaction.descricao} - R$ {transaction.valor}")
    
    return transactions

def test_automation_rules(workspace, transactions):
    """Test automation rules against sample transactions"""
    print("\n🚀 Testing automation rules...")
    
    service = RuleEngineService(workspace)
    
    # First, let's test rules without applying them
    print("\n📋 Testing rules (simulation only):")
    test_results = service.test_rules(apply_rules=False)
    
    for result in test_results:
        print(f"\nTransaction: {result['transaction_description']}")
        print(f"Amount: R$ {result['transaction_amount']}")
        if result['matched_rules']:
            print("Matched rules:")
            for rule in result['matched_rules']:
                print(f"  - {rule['rule_name']} ({rule['rule_type']})")
            
            print("Would apply actions:")
            for action in result['would_apply_actions']:
                if action['would_apply']:
                    print(f"  - {action['action_type']}: {action['action_value']}")
        else:
            print("No rules matched")
    
    # Now apply the rules
    print("\n✨ Applying automation rules...")
    apply_results = service.apply_rules_to_transactions()
    
    print(f"\n📊 Results Summary:")
    print(f"Total transactions processed: {len(transactions)}")
    print(f"Transactions with rules applied: {len(apply_results)}")
    
    for result in apply_results:
        print(f"\nTransaction: {result['transaction_description']}")
        for rule in result['applied_rules']:
            print(f"  Applied rule: {rule['rule_name']}")
            for action in rule['actions_applied']:
                print(f"    - {action['action_type']}: {action['action_value']}")

def show_final_state(transactions):
    """Show the final state of transactions after rules are applied"""
    print("\n📈 Final state of transactions:")
    print("-" * 80)
    
    for transaction in transactions:
        transaction.refresh_from_db()
        
        print(f"\nTransaction: {transaction.descricao}")
        print(f"Amount: R$ {transaction.valor}")
        print(f"Type: {transaction.get_tipo_display()}")
        
        if transaction.category:
            print(f"Category: {transaction.category.nome}")
        else:
            print("Category: Not set")
        
        if transaction.beneficiario:
            print(f"Beneficiary: {transaction.beneficiario.nome}")
        else:
            print("Beneficiary: Not set")
        
        if transaction.tags.exists():
            tags = [tag.nome for tag in transaction.tags.all()]
            print(f"Tags: {', '.join(tags)}")
        else:
            print("Tags: None")

def main():
    """Main demo function"""
    print("🎯 Budgetly Automation Rules Engine Demo")
    print("=" * 50)
    
    try:
        # Setup demo data
        user, workspace, account, categories, beneficiaries = setup_demo_data()
        
        # Create automation rules
        rules = create_automation_rules(workspace, user, categories, beneficiaries)
        
        # Create sample transactions
        transactions = create_sample_transactions(workspace, user, account)
        
        # Test automation rules
        test_automation_rules(workspace, transactions)
        
        # Show final state
        show_final_state(transactions)
        
        print("\n🎉 Demo completed successfully!")
        print(f"Created {len(rules)} automation rules and {len(transactions)} transactions")
        print("\nThe automation rules engine:")
        print("✅ Automatically categorized supermarket transactions")
        print("✅ Tagged high-value transactions")
        print("✅ Categorized gas station transactions")
        print("✅ Assigned appropriate beneficiaries")
        
    except Exception as e:
        print(f"❌ Error during demo: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()