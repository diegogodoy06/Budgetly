import os
import django
from datetime import date, timedelta
from decimal import Decimal

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import Account, CreditCard
from apps.categories.models import Category, CostCenter, Tag
from apps.transactions.models import Transaction
from apps.budgets.models import Budget, BudgetCategory

User = get_user_model()

def create_sample_data():
    print("=== Criando dados de exemplo para Budgetly ===")
    
    # Get or create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@budgetly.com',
            'first_name': 'Admin',
            'last_name': 'Budgetly',
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print('✅ Usuário admin criado!')
    else:
        print('✅ Usuário admin já existe!')
    
    # Create sample accounts
    conta_corrente, _ = Account.objects.get_or_create(
        user=admin_user,
        nome='Conta Corrente Principal',
        defaults={
            'tipo': 'conta-bancaria',
            'saldo_inicial': Decimal('5000.00'),
            'saldo_atual': Decimal('5000.00'),
            'is_active': True
        }
    )
    
    poupanca, _ = Account.objects.get_or_create(
        user=admin_user,
        nome='Poupança Caixa',
        defaults={
            'tipo': 'conta-bancaria',
            'saldo_inicial': Decimal('10000.00'),
            'saldo_atual': Decimal('10000.00'),
            'is_active': True
        }
    )
    
    carteira, _ = Account.objects.get_or_create(
        user=admin_user,
        nome='Carteira',
        defaults={
            'tipo': 'cofre',
            'saldo_inicial': Decimal('200.00'),
            'saldo_atual': Decimal('200.00'),
            'is_active': True
        }
    )
    
    print('✅ Contas criadas!')
    
    # Create credit card
    cartao_credito, _ = CreditCard.objects.get_or_create(
        user=admin_user,
        nome='Cartão Nubank',
        defaults={
            'bandeira': 'Mastercard',
            'ultimos_4_digitos': '1234',
            'limite': Decimal('3000.00'),
            'dia_fechamento': 5,
            'dia_vencimento': 15,
            'is_active': True
        }
    )
    
    print('✅ Cartão de crédito criado!')
    
    # Create cost centers
    centros_custo = [
        ('Pessoal', 'Gastos pessoais e família'),
        ('Casa', 'Gastos relacionados à moradia'),
        ('Trabalho', 'Gastos relacionados ao trabalho'),
        ('Investimentos', 'Aplicações e investimentos'),
    ]
    
    cost_centers = []
    for nome, desc in centros_custo:
        centro, _ = CostCenter.objects.get_or_create(
            user=admin_user,
            nome=nome,
            defaults={
                'descricao': desc,
                'is_active': True
            }
        )
        cost_centers.append(centro)
    
    print('✅ Centros de custo criados!')
    
    # Create sample categories
    categories_data = [
        ('Alimentação', 'Gastos com comida e restaurantes', 'essencial'),
        ('Transporte', 'Combustível, transporte público', 'necessario'),
        ('Moradia', 'Aluguel, contas de casa, manutenção', 'essencial'),
        ('Saúde', 'Plano de saúde, medicamentos, consultas', 'essencial'),
        ('Lazer', 'Entretenimento, cinema, viagens', 'superfluo'),
        ('Salário', 'Salário e rendimentos', 'essencial'),
        ('Educação', 'Cursos, livros, materiais', 'necessario'),
        ('Roupas', 'Vestuário e calçados', 'necessario'),
    ]
    
    categories = []
    for nome, desc, importancia in categories_data:
        category, _ = Category.objects.get_or_create(
            user=admin_user,
            nome=nome,
            defaults={
                'descricao': desc,
                'nivel_importancia': importancia,
                'considerar_dashboard': True,
                'is_active': True
            }
        )
        categories.append(category)
    
    print('✅ Categorias criadas!')
    
    # Create sample tags
    tags_data = ['urgente', 'parcelado', 'promocao', 'recorrente', 'investimento', 'trabalho']
    tags = []
    for tag_name in tags_data:
        tag, _ = Tag.objects.get_or_create(
            user=admin_user,
            nome=tag_name
        )
        tags.append(tag)
    
    print('✅ Tags criadas!')
    
    # Create sample transactions
    today = date.today()
    
    # Salário (Receita)
    Transaction.objects.get_or_create(
        user=admin_user,
        account=conta_corrente,
        tipo='entrada',
        valor=Decimal('5000.00'),
        descricao='Salário Mensal',
        data=today.replace(day=1),
        defaults={
            'category': categories[5],  # Salário
            'cost_center': cost_centers[2],  # Trabalho
            'confirmada': True
        }
    )
    
    # Gastos diversos
    transactions_data = [
        ('saida', conta_corrente, Decimal('150.00'), 'Supermercado Extra', categories[0], cost_centers[0]),  # Alimentação
        ('saida', conta_corrente, Decimal('80.00'), 'Combustível Shell', categories[1], cost_centers[0]),   # Transporte
        ('saida', conta_corrente, Decimal('1200.00'), 'Aluguel', categories[2], cost_centers[1]),          # Moradia
        ('saida', conta_corrente, Decimal('250.00'), 'Plano de Saúde', categories[3], cost_centers[0]),    # Saúde
        ('saida', carteira, Decimal('45.00'), 'Lanche', categories[0], cost_centers[0]),                    # Alimentação
        ('transferencia', conta_corrente, Decimal('1000.00'), 'Transferência para Poupança', None, cost_centers[3]),
    ]
    
    for i, (tipo, conta, valor, desc, categoria, centro_custo) in enumerate(transactions_data):
        conta_destino = poupanca if tipo == 'transferencia' else None
        
        Transaction.objects.get_or_create(
            user=admin_user,
            account=conta,
            tipo=tipo,
            valor=valor,
            descricao=desc,
            data=today - timedelta(days=i),
            defaults={
                'category': categoria,
                'cost_center': centro_custo,
                'to_account': conta_destino,
                'confirmada': True
            }
        )
    
    print('✅ Transações criadas!')
    
    # Create sample budget
    budget, _ = Budget.objects.get_or_create(
        user=admin_user,
        nome=f'Orçamento {today.month:02d}/{today.year}',
        mes=today.month,
        ano=today.year,
        defaults={
            'descricao': 'Orçamento mensal automático',
            'tipo': 'mensal',
            'valor_planejado': Decimal('2500.00'),
            'is_active': True
        }
    )
    
    # Create budget categories
    budget_categories_data = [
        (categories[0], Decimal('500.00')),   # Alimentação
        (categories[1], Decimal('300.00')),   # Transporte
        (categories[2], Decimal('1200.00')),  # Moradia
        (categories[3], Decimal('300.00')),   # Saúde
        (categories[4], Decimal('200.00')),   # Lazer
    ]
    
    for categoria, valor_planejado in budget_categories_data:
        BudgetCategory.objects.get_or_create(
            budget=budget,
            category=categoria,
            defaults={
                'valor_planejado': valor_planejado
            }
        )
    
    print('✅ Orçamento criado!')
    
    print('\n🎉 Dados de exemplo criados com sucesso!')
    print('\n=== Informações de Acesso ===')
    print('Admin User:')
    print('  Username: admin')
    print('  Email: admin@budgetly.com')
    print('  Password: admin123')
    print('\n=== URLs da Aplicação ===')
    print('Frontend: http://localhost:3000')
    print('Backend API: http://localhost:8000/api/')
    print('Admin Django: http://localhost:8000/admin/')
    print('Documentação API: http://localhost:8000/api/docs/')

if __name__ == '__main__':
    create_sample_data()
