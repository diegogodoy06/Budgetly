import os
import django
from datetime import date, timedelta
from decimal import Decimal

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import Account, AccountType
from apps.categories.models import Category, Tag
from apps.transactions.models import Transaction, TransactionType

User = get_user_model()

def create_sample_data():
    # Get or create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@budgetly.com',
            'first_name': 'Admin',
            'last_name': 'User'
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print('Admin user created!')
    else:
        print('Admin user already exists!')
    
    # Create sample accounts
    conta_corrente, _ = Account.objects.get_or_create(
        user=admin_user,
        name='Conta Corrente Principal',
        defaults={
            'account_type': AccountType.CHECKING,
            'initial_balance': Decimal('5000.00'),
            'current_balance': Decimal('5000.00')
        }
    )
    
    poupanca, _ = Account.objects.get_or_create(
        user=admin_user,
        name='Poupança',
        defaults={
            'account_type': AccountType.SAVINGS,
            'initial_balance': Decimal('10000.00'),
            'current_balance': Decimal('10000.00')
        }
    )
    
    cartao_credito, _ = Account.objects.get_or_create(
        user=admin_user,
        name='Cartão de Crédito',
        defaults={
            'account_type': AccountType.CREDIT_CARD,
            'initial_balance': Decimal('0.00'),
            'current_balance': Decimal('0.00'),
            'credit_limit': Decimal('2000.00'),
            'closing_day': 5,
            'due_day': 15
        }
    )
    
    print('Sample accounts created!')
    
    # Create sample categories
    categories_data = [
        ('Alimentação', '#ef4444', 'Gastos com comida e restaurantes'),
        ('Transporte', '#3b82f6', 'Gastos com transporte público, combustível, etc.'),
        ('Moradia', '#8b5cf6', 'Aluguel, contas de casa, manutenção'),
        ('Saúde', '#10b981', 'Plano de saúde, medicamentos, consultas'),
        ('Lazer', '#f59e0b', 'Entretenimento, cinema, viagens'),
        ('Salário', '#22c55e', 'Salário e rendimentos'),
        ('Investimentos', '#06b6d4', 'Aplicações e investimentos'),
    ]
    
    categories = []
    for name, color, description in categories_data:
        category, _ = Category.objects.get_or_create(
            user=admin_user,
            name=name,
            defaults={
                'color': color,
                'description': description
            }
        )
        categories.append(category)
    
    print('Sample categories created!')
    
    # Create sample tags
    tags_data = ['urgente', 'parcelado', 'promocao', 'recorrente', 'investimento']
    tags = []
    for tag_name in tags_data:
        tag, _ = Tag.objects.get_or_create(
            user=admin_user,
            name=tag_name
        )
        tags.append(tag)
    
    print('Sample tags created!')
    
    # Create sample transactions
    today = date.today()
    
    # Salário
    Transaction.objects.get_or_create(
        user=admin_user,
        account=conta_corrente,
        transaction_type=TransactionType.INCOME,
        amount=Decimal('5000.00'),
        description='Salário Mensal',
        date=today.replace(day=1),
        defaults={
            'category': categories[5],  # Salário
        }
    )
    
    # Gastos diversos
    transactions_data = [
        (TransactionType.EXPENSE, conta_corrente, Decimal('150.00'), 'Supermercado', categories[0]),  # Alimentação
        (TransactionType.EXPENSE, conta_corrente, Decimal('80.00'), 'Combustível', categories[1]),   # Transporte
        (TransactionType.EXPENSE, conta_corrente, Decimal('1200.00'), 'Aluguel', categories[2]),     # Moradia
        (TransactionType.EXPENSE, conta_corrente, Decimal('250.00'), 'Plano de Saúde', categories[3]), # Saúde
        (TransactionType.EXPENSE, cartao_credito, Decimal('120.00'), 'Cinema', categories[4]),       # Lazer
        (TransactionType.TRANSFER, conta_corrente, Decimal('1000.00'), 'Transferência para Poupança', None),
    ]
    
    for i, (trans_type, account, amount, desc, category) in enumerate(transactions_data):
        to_account = poupanca if trans_type == TransactionType.TRANSFER else None
        
        Transaction.objects.get_or_create(
            user=admin_user,
            account=account,
            transaction_type=trans_type,
            amount=amount,
            description=desc,
            date=today - timedelta(days=i),
            defaults={
                'category': category,
                'to_account': to_account,
            }
        )
    
    print('Sample transactions created!')
    print('\n=== Setup Complete! ===')
    print('Admin User:')
    print('  Username: admin')
    print('  Email: admin@budgetly.com')
    print('  Password: admin123')
    print('\nAccess the application at: http://localhost:8000')
    print('Admin panel: http://localhost:8000/admin')
    print('API Documentation: http://localhost:8000/api/docs/')

if __name__ == '__main__':
    create_sample_data()
