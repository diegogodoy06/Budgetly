from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Transaction, CreditCardInvoice, TransactionType
from .serializers import (
    TransactionSerializer, CreditCardInvoiceSerializer, PayInvoiceSerializer,
    CreateInvoiceSerializer, TransactionFilterSerializer
)


class TransactionListCreateView(generics.ListCreateAPIView):
    """Lista e cria transações"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    ordering = ['-data', '-created_at']

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalhes, atualização e exclusão de transação"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class CreditCardInvoiceListView(generics.ListAPIView):
    """Lista faturas de cartão de crédito"""
    serializer_class = CreditCardInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CreditCardInvoice.objects.filter(credit_card__user=self.request.user)


class CreditCardInvoiceDetailView(generics.RetrieveAPIView):
    """Detalhes da fatura de cartão de crédito"""
    serializer_class = CreditCardInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CreditCardInvoice.objects.filter(credit_card__user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def pay_invoice(request, invoice_id):
    """Paga uma fatura de cartão de crédito"""
    try:
        invoice = CreditCardInvoice.objects.get(id=invoice_id, credit_card__user=request.user)
    except CreditCardInvoice.DoesNotExist:
        return Response({'error': 'Fatura não encontrada'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PayInvoiceSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        valor = serializer.validated_data['valor']
        conta_origem_id = serializer.validated_data['conta_origem']
        
        # Busca a conta de origem
        from apps.accounts.models import Account
        try:
            conta_origem = Account.objects.get(id=conta_origem_id, user=request.user)
        except Account.DoesNotExist:
            return Response({'error': 'Conta de origem não encontrada'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Executa o pagamento
        invoice.pagar_fatura(valor, conta_origem)
        
        return Response({
            'message': 'Pagamento registrado com sucesso',
            'invoice': CreditCardInvoiceSerializer(invoice).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def close_invoice(request, invoice_id):
    """Fecha uma fatura de cartão de crédito"""
    try:
        invoice = CreditCardInvoice.objects.get(id=invoice_id, credit_card__user=request.user)
    except CreditCardInvoice.DoesNotExist:
        return Response({'error': 'Fatura não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    if invoice.status != 'aberta':
        return Response({'error': 'Apenas faturas abertas podem ser fechadas'}, status=status.HTTP_400_BAD_REQUEST)
    
    invoice.fechar_fatura()
    
    return Response({
        'message': 'Fatura fechada com sucesso',
        'invoice': CreditCardInvoiceSerializer(invoice).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def transaction_summary(request):
    """Retorna resumo das transações do usuário"""
    from datetime import date, timedelta
    from django.db.models import Sum
    
    # Data de 30 dias atrás
    data_inicio = date.today() - timedelta(days=30)
    
    transacoes = Transaction.objects.filter(
        user=request.user,
        data__gte=data_inicio,
        confirmada=True
    )
    
    entradas = transacoes.filter(tipo=TransactionType.ENTRADA).aggregate(
        total=Sum('valor')
    )['total'] or 0
    
    saidas = transacoes.filter(tipo=TransactionType.SAIDA).aggregate(
        total=Sum('valor')
    )['total'] or 0
    
    return Response({
        'periodo': f"{data_inicio} a {date.today()}",
        'total_entradas': float(entradas),
        'total_saidas': float(saidas),
        'saldo_periodo': float(entradas - saidas),
        'total_transacoes': transacoes.count()
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def transactions_by_category(request):
    """Retorna transações agrupadas por categoria"""
    from apps.categories.models import Category
    
    categorias = Category.objects.filter(user=request.user, is_active=True)
    resultado = []
    
    for categoria in categorias:
        transacoes = Transaction.objects.filter(
            user=request.user,
            category=categoria,
            confirmada=True
        )
        
        total = transacoes.aggregate(total=Sum('valor'))['total'] or 0
        
        if total > 0:
            resultado.append({
                'categoria': categoria.nome,
                'total': float(total),
                'quantidade': transacoes.count(),
                'cor': categoria.cor
            })
    
    return Response(resultado)
