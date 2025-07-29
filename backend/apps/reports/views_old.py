from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta
import pandas as pd
from .models import ImportHistory, ReportTemplate
from .serializers import (
    ImportHistorySerializer, FileUploadSerializer, ReportTemplateSerializer,
    DashboardDataSerializer, AccountBalanceChartSerializer,
    CategoryExpenseChartSerializer, MonthlyTrendSerializer
)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_data(request):
    """Retorna dados para o dashboard"""
    user = request.user
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    from apps.accounts.models import Account
    from apps.transactions.models import Transaction, TransactionType, CreditCardBill
    from apps.budgets.models import Budget
    
    # Contas ativas
    accounts = Account.objects.filter(user=user, is_active=True)
    total_accounts = accounts.count()
    total_balance = sum(acc.current_balance for acc in accounts)
    
    # Transações do mês atual
    monthly_transactions = Transaction.objects.filter(
        user=user,
        date__month=current_month,
        date__year=current_year,
        is_processed=True
    )
    
    monthly_income = monthly_transactions.filter(
        transaction_type=TransactionType.INCOME
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    monthly_expense = monthly_transactions.filter(
        transaction_type=TransactionType.EXPENSE
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Faturas pendentes
    pending_bills = CreditCardBill.objects.filter(
        account__user=user,
        status__in=['open', 'closed']
    ).count()
    
    # Orçamentos ativos
    active_budgets = Budget.objects.filter(
        user=user,
        is_active=True,
        month=current_month,
        year=current_year
    ).count()
    
    data = {
        'total_accounts': total_accounts,
        'total_balance': total_balance,
        'monthly_income': monthly_income,
        'monthly_expense': monthly_expense,
        'pending_bills': pending_bills,
        'active_budgets': active_budgets
    }
    
    serializer = DashboardDataSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def account_balance_chart(request):
    """Retorna dados para gráfico de saldos das contas"""
    user = request.user
    
    from apps.accounts.models import Account
    
    accounts = Account.objects.filter(user=user, is_active=True)
    
    data = []
    for account in accounts:
        data.append({
            'account_name': account.name,
            'balance': account.current_balance,
            'account_type': account.get_account_type_display()
        })
    
    serializer = AccountBalanceChartSerializer(data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def category_expense_chart(request):
    """Retorna dados para gráfico de gastos por categoria"""
    user = request.user
    
    # Filtros opcionais
    month = request.GET.get('month', datetime.now().month)
    year = request.GET.get('year', datetime.now().year)
    
    from apps.transactions.models import Transaction, TransactionType
    from apps.categories.models import Category
    
    # Buscar gastos por categoria
    expenses = Transaction.objects.filter(
        user=user,
        transaction_type=TransactionType.EXPENSE,
        date__month=month,
        date__year=year,
        is_processed=True,
        category__isnull=False
    ).values('category__name').annotate(
        total_amount=Sum('amount')
    ).order_by('-total_amount')
    
    # Calcular total geral para percentuais
    total_expenses = sum(item['total_amount'] for item in expenses)
    
    data = []
    for expense in expenses:
        percentage = (expense['total_amount'] / total_expenses * 100) if total_expenses > 0 else 0
        data.append({
            'category_name': expense['category__name'],
            'total_amount': expense['total_amount'],
            'percentage': round(percentage, 2)
        })
    
    serializer = CategoryExpenseChartSerializer(data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def monthly_trend(request):
    """Retorna tendência mensal dos últimos 12 meses"""
    user = request.user
    
    from apps.transactions.models import Transaction, TransactionType
    
    # Últimos 12 meses
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    data = []
    current_date = start_date.replace(day=1)
    
    while current_date <= end_date:
        month_transactions = Transaction.objects.filter(
            user=user,
            date__month=current_date.month,
            date__year=current_date.year,
            is_processed=True
        )
        
        income = month_transactions.filter(
            transaction_type=TransactionType.INCOME
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        expense = month_transactions.filter(
            transaction_type=TransactionType.EXPENSE
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        data.append({
            'month': current_date.strftime('%m/%Y'),
            'income': income,
            'expense': expense,
            'net': income - expense
        })
        
        # Próximo mês
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)
    
    serializer = MonthlyTrendSerializer(data, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_file(request):
    """Upload de arquivo para importação"""
    serializer = FileUploadSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        file = serializer.validated_data['file']
        account = serializer.validated_data['account']
        
        # Criar registro de importação
        import_history = ImportHistory.objects.create(
            user=request.user,
            filename=file.name,
            file_path=file,
            account=account,
            status='pending'
        )
        
        # Aqui você implementaria a lógica de processamento do arquivo
        # Por agora, vamos apenas retornar o registro criado
        
        return Response({
            'message': 'Arquivo enviado com sucesso',
            'import_id': import_history.id
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ImportHistoryListView(generics.ListAPIView):
    serializer_class = ImportHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ImportHistory.objects.filter(user=self.request.user).order_by('-created_at')


class ReportTemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = ReportTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReportTemplate.objects.filter(user=self.request.user, is_active=True)


class ReportTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReportTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReportTemplate.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save()
