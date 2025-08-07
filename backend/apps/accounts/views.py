from rest_framework import generics, status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db import models
from .models import User, Account, CreditCard
from .serializers import (
    UserRegistrationSerializer, UserSerializer,
    AccountSerializer, AccountBalanceSerializer,
    CreditCardSerializer, CreditCardBalanceSerializer,
    ChangePasswordSerializer
)
from .mixins import WorkspaceViewMixin


class CustomJWTLoginView(TokenObtainPairView):
    """Login view que retorna JWT no formato esperado pelo frontend"""
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'message': 'Email e senha são obrigatórios'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar usuário pelo email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'message': 'Credenciais inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Verificar senha
        if not user.check_password(password):
            return Response({
                'message': 'Credenciais inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Verificar se usuário está ativo
        if not user.is_active:
            return Response({
                'message': 'Usuário inativo'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Gerar tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'user': UserSerializer(user).data,
            'token': str(access_token),
            'refresh': str(refresh),
            'message': 'Login realizado com sucesso!'
        })


class RegisterView(generics.CreateAPIView):
    """Registro de novos usuários"""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Usuário criado com sucesso!'
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Perfil do usuário logado"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AccountViewSet(WorkspaceViewMixin, viewsets.ModelViewSet):
    """ViewSet para gerenciar contas financeiras"""
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Retorna contas filtradas por workspace com otimização para cálculo de saldo"""
        queryset = Account.objects.prefetch_related(
            'transactions_from',  # Para entradas, saídas e transferências enviadas
            'transactions_to'     # Para transferências recebidas
        )
        return self.get_workspace_queryset(queryset)
    
    def perform_create(self, serializer):
        """Salva a conta com workspace e user"""
        workspace = self.get_user_workspace()
        serializer.save(
            workspace=workspace,
            user=self.request.user
        )

    @action(detail=True, methods=['post'])
    def update_balance(self, request, pk=None):
        """Atualiza o saldo da conta"""
        account = self.get_object()
        serializer = AccountBalanceSerializer(data=request.data)
        
        if serializer.is_valid():
            new_balance = serializer.validated_data['saldo_atual']
            account.update_balance(new_balance)
            
            return Response({
                'message': 'Saldo atualizado com sucesso',
                'saldo_atual': account.saldo_atual
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def recalculate_balance(self, request, pk=None):
        """Recalcula o saldo da conta baseado nas transações"""
        from apps.transactions.models import Transaction
        from django.db.models import Sum
        from decimal import Decimal
        
        account = self.get_object()
        
        # Calcular saldo baseado nas transações confirmadas
        entradas = Transaction.objects.filter(
            account=account, 
            tipo='entrada', 
            confirmada=True
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
        
        saidas = Transaction.objects.filter(
            account=account, 
            tipo='saida', 
            confirmada=True
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
        
        # Transferências recebidas (TO account)
        transferencias_entrada = Transaction.objects.filter(
            to_account=account, 
            tipo='transferencia', 
            confirmada=True
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
        
        # Transferências enviadas (FROM account)
        transferencias_saida = Transaction.objects.filter(
            account=account, 
            tipo='transferencia', 
            confirmada=True
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
        
        # Calcular saldo real
        saldo_calculado = (
            account.saldo_inicial + 
            entradas - 
            saidas + 
            transferencias_entrada - 
            transferencias_saida
        )
        
        saldo_anterior = account.saldo_atual
        account.saldo_atual = saldo_calculado
        account.save()
        
        return Response({
            'message': 'Saldo recalculado com sucesso',
            'saldo_anterior': saldo_anterior,
            'saldo_atual': account.saldo_atual,
            'diferenca': saldo_calculado - saldo_anterior,
            'detalhes': {
                'saldo_inicial': account.saldo_inicial,
                'entradas': entradas,
                'saidas': saidas,
                'transferencias_entrada': transferencias_entrada,
                'transferencias_saida': transferencias_saida
            }
        })

    @action(detail=False, methods=['post'])
    def recalculate_all_balances(self, request):
        """Recalcula os saldos de todas as contas do workspace"""
        from apps.transactions.models import Transaction
        from django.db.models import Sum
        from decimal import Decimal
        
        accounts = self.get_queryset()
        resultados = []
        
        for account in accounts:
            # Calcular saldo baseado nas transações confirmadas
            entradas = Transaction.objects.filter(
                account=account, 
                tipo='entrada', 
                confirmada=True
            ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
            
            saidas = Transaction.objects.filter(
                account=account, 
                tipo='saida', 
                confirmada=True
            ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
            
            # Transferências recebidas (TO account)
            transferencias_entrada = Transaction.objects.filter(
                to_account=account, 
                tipo='transferencia', 
                confirmada=True
            ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
            
            # Transferências enviadas (FROM account)
            transferencias_saida = Transaction.objects.filter(
                account=account, 
                tipo='transferencia', 
                confirmada=True
            ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
            
            # Calcular saldo real
            saldo_calculado = (
                account.saldo_inicial + 
                entradas - 
                saidas + 
                transferencias_entrada - 
                transferencias_saida
            )
            
            saldo_anterior = account.saldo_atual
            diferenca = saldo_calculado - saldo_anterior
            
            # Só atualizar se houver diferença significativa
            if abs(diferenca) > 0.01:
                account.saldo_atual = saldo_calculado
                account.save()
                
                resultados.append({
                    'conta': account.nome,
                    'saldo_anterior': saldo_anterior,
                    'saldo_atual': account.saldo_atual,
                    'diferenca': diferenca,
                    'atualizada': True
                })
            else:
                resultados.append({
                    'conta': account.nome,
                    'saldo_atual': account.saldo_atual,
                    'atualizada': False,
                    'message': 'Saldo já estava correto'
                })
        
        contas_atualizadas = len([r for r in resultados if r.get('atualizada')])
        
        return Response({
            'message': f'{contas_atualizadas} conta(s) atualizada(s) de {len(resultados)} total',
            'contas_atualizadas': contas_atualizadas,
            'total_contas': len(resultados),
            'resultados': resultados
        })

    @action(detail=False, methods=['post'])
    def reset_initial_balances(self, request):
        """Zera os saldos iniciais de todas as contas que não têm transações"""
        from apps.transactions.models import Transaction
        
        accounts = self.get_queryset()
        resultados = []
        contas_zeradas = 0
        
        for account in accounts:
            # Verificar se a conta tem transações
            tem_transacoes = Transaction.objects.filter(account=account).exists()
            
            if not tem_transacoes and account.saldo_inicial != 0:
                saldo_anterior = account.saldo_inicial
                account.saldo_inicial = 0
                account.saldo_atual = 0
                account.save()
                contas_zeradas += 1
                
                resultados.append({
                    'conta': account.nome,
                    'saldo_inicial_anterior': saldo_anterior,
                    'saldo_inicial_atual': 0,
                    'saldo_atual': 0,
                    'zerada': True
                })
            else:
                resultados.append({
                    'conta': account.nome,
                    'saldo_inicial': account.saldo_inicial,
                    'saldo_atual': account.saldo_atual,
                    'zerada': False,
                    'motivo': 'Conta com transações' if tem_transacoes else 'Saldo já era zero'
                })
        
        return Response({
            'message': f'{contas_zeradas} conta(s) com saldo inicial zerado',
            'contas_zeradas': contas_zeradas,
            'total_contas': len(resultados),
            'resultados': resultados
        })


class CreditCardViewSet(WorkspaceViewMixin, viewsets.ModelViewSet):
    """ViewSet para gerenciar cartões de crédito"""
    serializer_class = CreditCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Retorna cartões filtrados por workspace com otimização para cálculo de saldo"""
        queryset = CreditCard.objects.prefetch_related('transactions')
        return self.get_workspace_queryset(queryset)
    
    def perform_create(self, serializer):
        """Salva o cartão com workspace e user"""
        workspace = self.get_user_workspace()
        serializer.save(
            workspace=workspace,
            user=self.request.user
        )

    @action(detail=True, methods=['post'])
    def update_balance(self, request, pk=None):
        """Atualiza o saldo utilizado do cartão"""
        card = self.get_object()
        serializer = CreditCardBalanceSerializer(data=request.data)
        
        if serializer.is_valid():
            new_balance = serializer.validated_data['saldo_atual']
            card.update_balance(new_balance)
            
            return Response({
                'message': 'Saldo do cartão atualizado com sucesso',
                'saldo_atual': card.saldo_atual,
                'disponivel': card.disponivel,
                'percentual_usado': card.percentual_usado
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def invoice_preview(self, request, pk=None):
        """Preview da próxima fatura do cartão"""
        card = self.get_object()
        
        from datetime import date, timedelta
        from apps.transactions.models import CreditCardInvoice, Transaction
        
        today = date.today()
        current_month = today.month
        current_year = today.year
        
        # Buscar fatura atual
        try:
            current_invoice = CreditCardInvoice.objects.get(
                credit_card=card,
                mes=current_month,
                ano=current_year
            )
        except CreditCardInvoice.DoesNotExist:
            # Criar fatura atual se não existir
            current_invoice = CreditCardInvoice.objects.create(
                credit_card=card,
                mes=current_month,
                ano=current_year,
                data_fechamento=date(current_year, current_month, card.dia_fechamento),
                data_vencimento=date(current_year, current_month, card.dia_vencimento)
            )
        
        # Calcular valor atual da fatura (transações até hoje)
        valor_atual = Transaction.objects.filter(
            credit_card=card,
            tipo='saida',
            data__month=current_month,
            data__year=current_year,
            confirmada=True
        ).aggregate(total=models.Sum('valor'))['total'] or 0
        
        # Calcular dias para fechamento
        close_date = date(current_year, current_month, card.dia_fechamento)
        if close_date < today:
            # Fechamento já passou, calcular para próximo mês
            next_month = current_month + 1 if current_month < 12 else 1
            next_year = current_year if current_month < 12 else current_year + 1
            close_date = date(next_year, next_month, card.dia_fechamento)
        
        days_to_close = (close_date - today).days
        
        return Response({
            'card': card.nome,
            'limite': card.limite,
            'usado': card.saldo_atual,
            'disponivel': card.disponivel,
            'percentual_usado': card.percentual_usado,
            'fatura_atual': {
                'mes': current_month,
                'ano': current_year,
                'valor_atual': str(valor_atual),
                'status': current_invoice.status,
                'data_fechamento': current_invoice.data_fechamento,
                'data_vencimento': current_invoice.data_vencimento,
                'dias_para_fechamento': max(0, days_to_close)
            }
        })

    @action(detail=True, methods=['get'])
    def invoices(self, request, pk=None):
        """Lista faturas do cartão"""
        card = self.get_object()
        
        from apps.transactions.models import CreditCardInvoice
        from apps.transactions.serializers import CreditCardInvoiceSerializer
        
        invoices = CreditCardInvoice.objects.filter(credit_card=card).order_by('-ano', '-mes')
        serializer = CreditCardInvoiceSerializer(invoices, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def validate_date(self, request, pk=None):
        """Valida se uma data pode ser usada para transação"""
        card = self.get_object()
        transaction_date = request.data.get('date')
        
        if not transaction_date:
            return Response(
                {'error': 'Data é obrigatória'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from datetime import datetime
        from apps.transactions.models import CreditCardInvoice
        
        try:
            if isinstance(transaction_date, str):
                transaction_date = datetime.strptime(transaction_date, '%Y-%m-%d').date()
            
            # Calcular qual fatura seria afetada
            transaction_day = transaction_date.day
            transaction_month = transaction_date.month
            transaction_year = transaction_date.year
            
            invoice_month = transaction_month
            invoice_year = transaction_year
            
            # Se a compra é após o fechamento, vai para a fatura do próximo mês
            if transaction_day > card.dia_fechamento:
                if transaction_month == 12:
                    invoice_month = 1
                    invoice_year += 1
                else:
                    invoice_month += 1
            
            # Verificar se existe fatura fechada
            try:
                invoice = CreditCardInvoice.objects.get(
                    credit_card=card,
                    mes=invoice_month,
                    ano=invoice_year
                )
                
                if invoice.status == 'fechada':
                    return Response({
                        'valid': False,
                        'message': 'Esta data corresponde a uma fatura fechada',
                        'invoice_status': invoice.status
                    })
                    
            except CreditCardInvoice.DoesNotExist:
                pass  # Fatura não existe, pode criar transação
            
            return Response({
                'valid': True,
                'message': 'Data válida para transação',
                'invoice_month': f"{invoice_month:02d}/{invoice_year}"
            })
            
        except Exception as e:
            return Response(
                {'error': f'Erro na validação: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChangePasswordView(generics.GenericAPIView):
    """View para alterar senha do usuário"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        if not user.check_password(old_password):
            return Response({
                'error': 'Senha atual incorreta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Senha alterada com sucesso'
        })
