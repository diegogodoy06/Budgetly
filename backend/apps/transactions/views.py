from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Q
from datetime import datetime, date
from .models import Transaction, CreditCardInvoice
from .serializers import TransactionSerializer, CreditCardInvoiceSerializer
from apps.accounts.workspace_mixins import WorkspaceRequiredMixin
from apps.beneficiaries.models import Beneficiary


class TransactionViewSet(WorkspaceRequiredMixin, viewsets.ModelViewSet):
    """ViewSet para gerenciar transações"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Usar o método do workspace mixin
        queryset = Transaction.objects.select_related(
            'account', 'to_account', 'credit_card', 'category', 'beneficiario'
        )
        queryset = self.get_workspace_queryset(queryset)
        
        # Filtros opcionais
        account_id = self.request.query_params.get('account')
        if account_id:
            queryset = queryset.filter(
                Q(account_id=account_id) | Q(to_account_id=account_id)
            )
            
        credit_card_id = self.request.query_params.get('credit_card')
        if credit_card_id:
            queryset = queryset.filter(credit_card_id=credit_card_id)
            
        tipo = self.request.query_params.get('tipo')
        if tipo:
            queryset = queryset.filter(tipo=tipo)
            
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month and year:
            queryset = queryset.filter(
                data__month=month,
                data__year=year
            )
        
        # Filtros por período usando start_date e end_date
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(data__gte=start_date)
        if end_date:
            queryset = queryset.filter(data__lte=end_date)
            
        return queryset.order_by('-data', '-created_at')
    
    def perform_create(self, serializer):
        """Salva a transação com workspace e user, aplicando regras de negócio"""
        # Validar se é transação de cartão em fatura fechada
        credit_card = serializer.validated_data.get('credit_card')
        if credit_card:
            transaction_date = serializer.validated_data.get('data')
            if self._is_invoice_closed(credit_card, transaction_date):
                from rest_framework.exceptions import ValidationError
                raise ValidationError(
                    "Não é possível lançar transações em faturas fechadas. "
                    "Escolha uma data futura ou use uma conta bancária."
                )
        
        # Verificar se é transferência para criar movimentações duplas
        if serializer.validated_data.get('tipo') == 'transferencia':
            self._create_transfer_transactions(serializer)
        else:
            # Transação normal (entrada ou saída)
            transaction = serializer.save(
                workspace=self.request.workspace,
                user=self.request.user
            )
            
            # Auto-criar beneficiário baseado na conta/cartão
            self._auto_create_beneficiary_for_transaction(transaction)
            
            # Se for parcelado, criar as demais parcelas
            if transaction.total_parcelas > 1:
                print(f"🔄 Criando parcelas para transação {transaction.id}: {transaction.total_parcelas} parcelas")
                self._create_installments(transaction)
                print(f"✅ Parcelas criadas para transação {transaction.id}")

    def perform_update(self, serializer):
        """Atualiza a transação com validações especiais para cartão de crédito"""
        instance = self.get_object()
        
        # Permitir alteração de status para transações de cartão de crédito
        # (representando pagamento da fatura)
        
        # Salvar a transação normalmente
        serializer.save()
        print(f"📝 Transação {instance.id} atualizada")
                
    def _is_invoice_closed(self, credit_card, transaction_date):
        """Verifica se a fatura para esta data está fechada"""
        try:
            from datetime import datetime
            
            if isinstance(transaction_date, str):
                transaction_date = datetime.strptime(transaction_date, '%Y-%m-%d').date()
            
            # Calcular qual fatura seria afetada
            transaction_day = transaction_date.day
            transaction_month = transaction_date.month
            transaction_year = transaction_date.year
            
            invoice_month = transaction_month
            invoice_year = transaction_year
            
            # Se a compra é após o fechamento, vai para a fatura do próximo mês
            if transaction_day > credit_card.dia_fechamento:
                if transaction_month == 12:
                    invoice_month = 1
                    invoice_year += 1
                else:
                    invoice_month += 1
            
            # Verificar se existe fatura fechada
            invoice = CreditCardInvoice.objects.get(
                credit_card=credit_card,
                mes=invoice_month,
                ano=invoice_year
            )
            
            return invoice.status == 'fechada'
            
        except CreditCardInvoice.DoesNotExist:
            # Se a fatura não existe, não está fechada
            return False
        except Exception as e:
            print(f"Erro ao verificar fatura: {e}")
            return False


    def _create_transfer_transactions(self, serializer):
        """Cria duas transações para transferência: saída da origem e entrada no destino"""
        data = serializer.validated_data
        account_origem = data['account']
        account_destino = data['to_account']
        valor = data['valor']
        descricao = data['descricao']
        observacoes = data.get('observacoes', '')
        data_transacao = data['data']
        category = data.get('category')
        
        # Criar beneficiário para conta de origem (quem enviou)
        beneficiario_origem, _ = Beneficiary.objects.get_or_create(
            workspace=self.request.workspace,
            nome=f"Conta {account_origem.nome}",
            defaults={
                'user': self.request.user,
                'tipo': 'CONTA_BANCARIA',
                'descricao': f'Auto-criado para conta {account_origem.nome}'
            }
        )
        
        # Criar beneficiário para conta de destino (quem recebeu)
        beneficiario_destino, _ = Beneficiary.objects.get_or_create(
            workspace=self.request.workspace,
            nome=f"Conta {account_destino.nome}",
            defaults={
                'user': self.request.user,
                'tipo': 'CONTA_BANCARIA',
                'descricao': f'Auto-criado para conta {account_destino.nome}'
            }
        )
        
        # 1. Criar transação de SAÍDA da conta origem
        transacao_saida = Transaction.objects.create(
            workspace=self.request.workspace,
            user=self.request.user,
            account=account_origem,
            tipo='saida',
            valor=valor,
            descricao=f"Transferência para {account_destino.nome} - {descricao}",
            observacoes=observacoes,
            data=data_transacao,
            category=category,
            beneficiario=beneficiario_destino,  # Quem recebeu
            confirmada=True
        )
        
        # 2. Criar transação de ENTRADA na conta destino
        transacao_entrada = Transaction.objects.create(
            workspace=self.request.workspace,
            user=self.request.user,
            account=account_destino,
            tipo='entrada',
            valor=valor,
            descricao=f"Transferência de {account_origem.nome} - {descricao}",
            observacoes=observacoes,
            data=data_transacao,
            category=category,
            beneficiario=beneficiario_origem,  # Quem enviou
            confirmada=True
        )
        
        # Marcar as transações como relacionadas (opcional para futuro)
        transacao_saida.observacoes += f" [ID Entrada: {transacao_entrada.id}]"
        transacao_entrada.observacoes += f" [ID Saída: {transacao_saida.id}]"
        transacao_saida.save(update_fields=['observacoes'])
        transacao_entrada.save(update_fields=['observacoes'])
        
        # Retornar a transação de saída como referência principal
        return transacao_saida

    def _auto_create_beneficiary_for_transaction(self, transaction):
        """Auto-cria beneficiário baseado na conta ou cartão usado (para entrada/saída)"""
        beneficiary_name = None
        beneficiary_type = None
        
        if transaction.tipo == 'entrada':
            # Para entrada, o beneficiário é sempre a própria conta que recebeu
            if transaction.account:
                beneficiary_name = f"Conta {transaction.account.nome}"
                beneficiary_type = 'CONTA_BANCARIA'
        elif transaction.tipo == 'saida':
            # Para saída, o beneficiário é a conta ou cartão usado
            if transaction.credit_card:
                beneficiary_name = f"Cartão {transaction.credit_card.nome}"
                beneficiary_type = 'CARTAO_CREDITO'
            elif transaction.account:
                beneficiary_name = f"Conta {transaction.account.nome}"
                beneficiary_type = 'CONTA_BANCARIA'
        
        if beneficiary_name:
            # Verificar se já existe
            beneficiary, created = Beneficiary.objects.get_or_create(
                workspace=self.request.workspace,
                nome=beneficiary_name,
                defaults={
                    'user': self.request.user,
                    'tipo': beneficiary_type,
                    'descricao': f'Auto-criado para {beneficiary_name}'
                }
            )
            
            # Associar à transação
            transaction.beneficiario = beneficiary
            transaction.save(update_fields=['beneficiario'])

    def _create_installments(self, transaction):
        """Cria as parcelas restantes para transações parceladas"""
        if transaction.total_parcelas > 1:
            from dateutil.relativedelta import relativedelta
            
            print(f"🔄 Criando {transaction.total_parcelas - 1} parcelas adicionais")
            
            for parcela in range(2, transaction.total_parcelas + 1):
                # Calcular data da próxima parcela (mês seguinte)
                data_parcela = transaction.data + relativedelta(months=parcela-1)
                
                print(f"📅 Criando parcela {parcela}/{transaction.total_parcelas} para {data_parcela}")
                
                Transaction.objects.create(
                    workspace=transaction.workspace,
                    user=transaction.user,
                    account=transaction.account,
                    credit_card=transaction.credit_card,
                    tipo=transaction.tipo,
                    valor=transaction.valor,
                    descricao=f"{transaction.descricao} ({parcela}/{transaction.total_parcelas})",
                    data=data_parcela,
                    category=transaction.category,
                    beneficiario=transaction.beneficiario,
                    total_parcelas=transaction.total_parcelas,
                    numero_parcela=parcela,
                    transacao_pai=transaction,
                    confirmada=transaction.confirmada
                )
                
            print(f"✅ Todas as parcelas foram criadas")

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Resumo de transações por período"""
        month = request.query_params.get('month', datetime.now().month)
        year = request.query_params.get('year', datetime.now().year)
        
        transactions = self.get_queryset().filter(
            data__month=month,
            data__year=year,
            confirmada=True
        )
        
        entradas = transactions.filter(tipo='entrada').aggregate(
            total=Sum('valor'))['total'] or 0
        
        saidas = transactions.filter(tipo='saida').aggregate(
            total=Sum('valor'))['total'] or 0
            
        return Response({
            'periodo': f"{month}/{year}",
            'entradas': entradas,
            'saidas': saidas,
            'saldo': entradas - saidas,
            'total_transacoes': transactions.count()
        })

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Gastos agrupados por categoria"""
        # Buscar parâmetros de filtro
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        account_ids = request.query_params.get('account__in')
        credit_card_isnull = request.query_params.get('credit_card__isnull')
        account_isnull = request.query_params.get('account__isnull')
        
        # Filtros base
        queryset = self.get_queryset().filter(confirmada=True, tipo='saida')
        
        # Filtro por período
        if start_date:
            queryset = queryset.filter(data__gte=start_date)
        if end_date:
            queryset = queryset.filter(data__lte=end_date)
            
        # Filtro por contas
        if account_ids:
            account_list = [int(id.strip()) for id in account_ids.split(',')]
            queryset = queryset.filter(account_id__in=account_list)
            
        # Filtro por cartão de crédito
        if credit_card_isnull == 'true':
            queryset = queryset.filter(credit_card__isnull=True)
        elif account_isnull == 'true':
            queryset = queryset.filter(account__isnull=True)
        
        # Agrupar por categoria e somar valores
        category_totals = {}
        for transaction in queryset:
            category_name = transaction.category.nome if transaction.category else 'Sem categoria'
            if category_name not in category_totals:
                category_totals[category_name] = 0
            category_totals[category_name] += abs(float(transaction.valor))
        
        return Response(category_totals)

    @action(detail=True, methods=['post'])
    def confirm_credit_card_transaction(self, request, pk=None):
        """Confirma uma transação de cartão de crédito (representa pagamento da fatura)"""
        transaction = self.get_object()
        
        # Verificar se é transação de cartão
        if not transaction.credit_card:
            return Response(
                {'error': 'Esta não é uma transação de cartão de crédito'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se já está confirmada
        if transaction.confirmada:
            return Response(
                {'error': 'Esta transação já está confirmada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Confirmar a transação
            transaction.confirmada = True
            transaction.save(update_fields=['confirmada'])
            
            return Response({
                'message': 'Transação confirmada com sucesso (fatura paga)',
                'transaction': TransactionSerializer(transaction).data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Erro ao confirmar transação: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CreditCardInvoiceViewSet(WorkspaceRequiredMixin, viewsets.ModelViewSet):
    """ViewSet para gerenciar faturas de cartão de crédito"""
    serializer_class = CreditCardInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Retorna faturas filtradas por workspace"""
        queryset = CreditCardInvoice.objects.select_related('credit_card')
        # Filtrar por workspace através do cartão
        return queryset.filter(credit_card__workspace=self.request.workspace)

    def perform_create(self, serializer):
        """Salva a fatura com validações"""
        # Validar se o cartão pertence ao workspace
        credit_card = serializer.validated_data['credit_card']
        if credit_card.workspace != self.request.workspace:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Cartão não pertence ao workspace atual")
            
        serializer.save()

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Fecha uma fatura calculando o total das transações"""
        invoice = self.get_object()
        
        if invoice.status != 'aberta':
            return Response(
                {'error': 'Apenas faturas abertas podem ser fechadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            invoice.fechar_fatura()
            return Response({
                'message': 'Fatura fechada com sucesso',
                'invoice': CreditCardInvoiceSerializer(invoice).data
            })
        except Exception as e:
            return Response(
                {'error': f'Erro ao fechar fatura: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        """Registra pagamento de uma fatura"""
        invoice = self.get_object()
        
        valor = request.data.get('valor')
        conta_origem_id = request.data.get('conta_origem')
        
        if not valor or not conta_origem_id:
            return Response(
                {'error': 'Valor e conta de origem são obrigatórios'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Validar conta de origem
            from apps.accounts.models import Account
            conta_origem = Account.objects.get(
                id=conta_origem_id,
                workspace=self.request.workspace
            )
            
            # Registrar pagamento
            invoice.pagar_fatura(valor, conta_origem)
            
            return Response({
                'message': 'Pagamento registrado com sucesso',
                'invoice': CreditCardInvoiceSerializer(invoice).data
            })
            
        except Account.DoesNotExist:
            return Response(
                {'error': 'Conta de origem não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Erro ao registrar pagamento: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_card(self, request):
        """Lista faturas por cartão"""
        credit_card_id = request.query_params.get('credit_card_id')
        
        if not credit_card_id:
            return Response(
                {'error': 'ID do cartão é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoices = self.get_queryset().filter(credit_card_id=credit_card_id)
        serializer = self.get_serializer(invoices, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def validate_transaction_date(request):
    """Valida se uma data pode ser usada para transação em cartão"""
    credit_card_id = request.data.get('credit_card_id')
    transaction_date = request.data.get('date')
    
    if not credit_card_id or not transaction_date:
        return Response(
            {'error': 'ID do cartão e data são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from apps.accounts.models import CreditCard
        from datetime import datetime
        
        credit_card = CreditCard.objects.get(
            id=credit_card_id,
            workspace=request.workspace
        )
        
        # Converter string para date
        if isinstance(transaction_date, str):
            transaction_date = datetime.strptime(transaction_date, '%Y-%m-%d').date()
        
        # Calcular qual fatura esta transação afetaria
        transaction_month = transaction_date.month
        transaction_year = transaction_date.year
        transaction_day = transaction_date.day
        
        # Se a compra é após o fechamento, vai para a fatura do próximo mês
        invoice_month = transaction_month
        invoice_year = transaction_year
        
        if transaction_day > credit_card.dia_fechamento:
            if transaction_month == 12:
                invoice_month = 1
                invoice_year += 1
            else:
                invoice_month += 1
        
        # Verificar se existe fatura fechada para este período
        try:
            invoice = CreditCardInvoice.objects.get(
                credit_card=credit_card,
                mes=invoice_month,
                ano=invoice_year
            )
            
            if invoice.status == 'fechada':
                return Response({
                    'valid': False,
                    'message': 'Esta data corresponde a uma fatura fechada',
                    'invoice_status': invoice.status,
                    'suggested_date': None
                })
                
        except CreditCardInvoice.DoesNotExist:
            # Fatura não existe, pode criar transação
            pass
        
        return Response({
            'valid': True,
            'message': 'Data válida para transação',
            'invoice_month': f"{invoice_month:02d}/{invoice_year}"
        })
        
    except CreditCard.DoesNotExist:
        return Response(
            {'error': 'Cartão não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erro na validação: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_best_purchase_date(request):
    """Calcula a melhor data de compra para um cartão de crédito"""
    credit_card_id = request.query_params.get('credit_card_id')
    
    if not credit_card_id:
        return Response(
            {'error': 'ID do cartão é obrigatório'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from apps.accounts.models import CreditCard
        from datetime import date, timedelta
        
        credit_card = CreditCard.objects.get(
            id=credit_card_id,
            workspace=request.workspace
        )
        
        today = date.today()
        current_day = today.day
        current_month = today.month
        current_year = today.year
        
        # A melhor data é sempre o dia seguinte ao fechamento da fatura atual
        # Isso garante que a compra vai para a próxima fatura (maior prazo para pagamento)
        
        target_month = current_month
        target_year = current_year
        
        # Se já passou do fechamento deste mês, vai para o próximo mês
        if current_day > credit_card.dia_fechamento:
            target_month = current_month + 1 if current_month < 12 else 1
            target_year = current_year if current_month < 12 else current_year + 1
        
        # A melhor data é sempre o dia seguinte ao fechamento
        best_date = date(target_year, target_month, credit_card.dia_fechamento + 1)
        
        # Calcular o vencimento desta fatura
        due_date = date(target_year, target_month, credit_card.dia_vencimento)
        
        # Se o vencimento for antes do fechamento, vai para o próximo mês
        if credit_card.dia_vencimento <= credit_card.dia_fechamento:
            if target_month == 12:
                due_date = date(target_year + 1, 1, credit_card.dia_vencimento)
            else:
                due_date = date(target_year, target_month + 1, credit_card.dia_vencimento)
        
        days_to_due = (due_date - best_date).days
        
        return Response({
            'credit_card_id': credit_card_id,
            'credit_card_name': credit_card.nome,
            'best_date': best_date.isoformat(),
            'best_date_formatted': best_date.strftime('%d/%m/%Y'),
            'invoice_month': f"{target_month:02d}/{target_year}",
            'due_date': due_date.isoformat(),
            'due_date_formatted': due_date.strftime('%d/%m/%Y'),
            'days_to_due': days_to_due,
            'closing_day': credit_card.dia_fechamento,
            'due_day': credit_card.dia_vencimento
        })
        
    except CreditCard.DoesNotExist:
        return Response(
            {'error': 'Cartão não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erro no cálculo: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([])
def test_by_category_view(request):
    """View de teste para by-category sem autenticação"""
    from .models import Transaction
    
    # Buscar parâmetros de filtro
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    # Filtros base
    queryset = Transaction.objects.filter(confirmada=True, tipo='saida')
    
    # Filtro por período
    if start_date:
        queryset = queryset.filter(data__gte=start_date)
    if end_date:
        queryset = queryset.filter(data__lte=end_date)
    
    # Agrupar por categoria e somar valores
    category_totals = {}
    for transaction in queryset:
        category_name = transaction.category.nome if transaction.category else 'Sem categoria'
        if category_name not in category_totals:
            category_totals[category_name] = 0
        category_totals[category_name] += abs(float(transaction.valor))
    
    return Response({
        'total_transactions': queryset.count(),
        'categories': category_totals
    })
