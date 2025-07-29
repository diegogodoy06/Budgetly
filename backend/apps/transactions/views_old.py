from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Transaction, CreditCardBill, TransactionType
from .serializers import (
    TransactionSerializer, CreditCardBillSerializer, PayBillSerializer,
    TransactionSummarySerializer, TransactionCreateSerializer
)
from .filters import TransactionFilter


class TransactionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = TransactionFilter
    ordering = ['-date', '-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TransactionCreateSerializer
        return TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def transaction_summary(request):
    """Retorna resumo das transações"""
    user = request.user
    
    # Filtros opcionais
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    account_id = request.GET.get('account')
    
    queryset = Transaction.objects.filter(user=user, is_processed=True)
    
    if start_date:
        queryset = queryset.filter(date__gte=start_date)
    if end_date:
        queryset = queryset.filter(date__lte=end_date)
    if account_id:
        queryset = queryset.filter(account_id=account_id)
    
    # Calcular totais
    income = queryset.filter(transaction_type=TransactionType.INCOME).aggregate(
        total=Sum('amount'))['total'] or 0
    
    expense = queryset.filter(transaction_type=TransactionType.EXPENSE).aggregate(
        total=Sum('amount'))['total'] or 0
    
    data = {
        'total_income': income,
        'total_expense': expense,
        'net_amount': income - expense,
        'transaction_count': queryset.count()
    }
    
    serializer = TransactionSummarySerializer(data)
    return Response(serializer.data)


class CreditCardBillListView(generics.ListAPIView):
    serializer_class = CreditCardBillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CreditCardBill.objects.filter(account__user=self.request.user)


class CreditCardBillDetailView(generics.RetrieveAPIView):
    serializer_class = CreditCardBillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CreditCardBill.objects.filter(account__user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def pay_bill(request, bill_id):
    """Pagar fatura do cartão de crédito"""
    try:
        bill = CreditCardBill.objects.get(id=bill_id, account__user=request.user)
    except CreditCardBill.DoesNotExist:
        return Response({'error': 'Fatura não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = PayBillSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        amount = serializer.validated_data['amount']
        from_account = serializer.validated_data['from_account']
        
        bill.pay_bill(amount, from_account)
        
        return Response({
            'message': 'Pagamento realizado com sucesso',
            'bill': CreditCardBillSerializer(bill).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def close_bill(request, bill_id):
    """Fechar fatura do cartão de crédito"""
    try:
        bill = CreditCardBill.objects.get(id=bill_id, account__user=request.user)
    except CreditCardBill.DoesNotExist:
        return Response({'error': 'Fatura não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    bill.close_bill()
    
    return Response({
        'message': 'Fatura fechada com sucesso',
        'bill': CreditCardBillSerializer(bill).data
    })
