from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
from datetime import date, timedelta
import calendar

User = get_user_model()


class TransactionType(models.TextChoices):
    """Tipos de transação"""
    ENTRADA = 'entrada', 'Entrada'
    SAIDA = 'saida', 'Saída'
    TRANSFERENCIA = 'transferencia', 'Transferência'


class RecurrenceType(models.TextChoices):
    """Tipos de recorrência"""
    NENHUMA = 'nenhuma', 'Nenhuma'
    DIARIA = 'diaria', 'Diária'
    SEMANAL = 'semanal', 'Semanal'
    MENSAL = 'mensal', 'Mensal'
    ANUAL = 'anual', 'Anual'


class Transaction(models.Model):
    """Modelo para transações financeiras"""
    workspace = models.ForeignKey('accounts.Workspace', on_delete=models.CASCADE, related_name='transactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    
    # Contas envolvidas
    account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, 
                               related_name='transactions_from', null=True, blank=True,
                               verbose_name="Conta de origem")
    to_account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, 
                                  related_name='transactions_to', null=True, blank=True,
                                  verbose_name="Conta de destino")
    credit_card = models.ForeignKey('accounts.CreditCard', on_delete=models.CASCADE,
                                   related_name='transactions', null=True, blank=True,
                                   verbose_name="Cartão de crédito")
    
    # Dados básicos
    tipo = models.CharField(max_length=15, choices=TransactionType.choices)
    valor = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    descricao = models.CharField(max_length=200, verbose_name="Descrição")
    data = models.DateField()
    
    # Categorização
    category = models.ForeignKey('categories.Category', on_delete=models.SET_NULL, 
                                null=True, blank=True, related_name='transactions')
    tags = models.ManyToManyField('categories.Tag', blank=True, related_name='transactions')
    
    # Beneficiário
    beneficiario = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.SET_NULL,
                                   null=True, blank=True, related_name='transactions',
                                   verbose_name="Beneficiário")
    
    # Parcelamento
    total_parcelas = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    numero_parcela = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    transacao_pai = models.ForeignKey('self', on_delete=models.CASCADE, 
                                     null=True, blank=True, related_name='parcelas')
    
    # Recorrência
    tipo_recorrencia = models.CharField(max_length=10, choices=RecurrenceType.choices, 
                                       default=RecurrenceType.NENHUMA)
    data_fim_recorrencia = models.DateField(null=True, blank=True)
    
    # Status
    confirmada = models.BooleanField(default=True, help_text="Se a transação foi confirmada/processada")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-data', '-created_at']
        verbose_name = 'Transação'
        verbose_name_plural = 'Transações'

    def __str__(self):
        return f"{self.descricao} - R$ {self.valor} ({self.data})"

    def clean(self):
        """Validação personalizada do modelo"""
        from django.core.exceptions import ValidationError
        
        # Para transferências, deve ter conta origem e destino
        if self.tipo == TransactionType.TRANSFERENCIA:
            if not self.account or not self.to_account:
                raise ValidationError("Transferências devem ter conta de origem e destino.")
            if self.account == self.to_account:
                raise ValidationError("Conta de origem e destino não podem ser iguais.")
            if self.credit_card:
                raise ValidationError("Transferências não podem usar cartão de crédito.")
        else:
            # Para outros tipos, deve ter account OU credit_card (não ambos)
            if not self.account and not self.credit_card:
                raise ValidationError("Deve ser especificada uma conta ou cartão de crédito.")
            if self.account and self.credit_card:
                raise ValidationError("Não é possível especificar conta e cartão de crédito ao mesmo tempo.")
        
        # Parcelamento só é válido para cartão de crédito
        if self.total_parcelas > 1 and not self.credit_card:
            raise ValidationError("Parcelamento só é permitido para transações de cartão de crédito.")
        
        # Validar número da parcela
        if self.numero_parcela > self.total_parcelas:
            raise ValidationError("Número da parcela não pode ser maior que o total de parcelas.")
            
        # Transações de cartão de crédito agora podem começar como pendentes
        # e serem confirmadas quando a fatura for paga

    @property
    def valor_formatado(self):
        """Retorna o valor formatado em reais"""
        return f"R$ {self.valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

    @property
    def is_parcelada(self):
        """Verifica se a transação é parcelada"""
        return self.total_parcelas > 1

    @property
    def is_recorrente(self):
        """Verifica se a transação é recorrente"""
        return self.tipo_recorrencia != RecurrenceType.NENHUMA


class CreditCardInvoice(models.Model):
    """Modelo para faturas de cartão de crédito"""
    STATUS_CHOICES = [
        ('aberta', 'Aberta'),
        ('fechada', 'Fechada'),
        ('paga', 'Paga'),
        ('vencida', 'Vencida'),
    ]
    
    credit_card = models.ForeignKey('accounts.CreditCard', on_delete=models.CASCADE, 
                                   related_name='invoices')
    mes = models.IntegerField()
    ano = models.IntegerField()
    data_fechamento = models.DateField()
    data_vencimento = models.DateField()
    valor_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    valor_pago = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='aberta')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-ano', '-mes']
        unique_together = ['credit_card', 'mes', 'ano']
        verbose_name = 'Fatura do Cartão'
        verbose_name_plural = 'Faturas do Cartão'

    def __str__(self):
        return f"Fatura {self.credit_card.nome} - {self.mes:02d}/{self.ano}"

    @property
    def valor_restante(self):
        """Valor restante a ser pago"""
        return self.valor_total - self.valor_pago

    @property
    def valor_total_formatado(self):
        """Retorna o valor total formatado em reais"""
        return f"R$ {self.valor_total:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        
    @property
    def is_current_month(self):
        """Verifica se é a fatura do mês atual"""
        from datetime import date
        today = date.today()
        return self.ano == today.year and self.mes == today.month
        
    @property
    def days_to_close(self):
        """Dias restantes para fechamento (se aberta)"""
        if self.status != 'aberta':
            return 0
            
        from datetime import date
        today = date.today()
        
        if not self.is_current_month:
            return 0
            
        return max(0, self.credit_card.dia_fechamento - today.day)
        
    @property
    def is_overdue(self):
        """Verifica se a fatura está vencida"""
        from datetime import date
        return self.status in ['fechada', 'paga'] and date.today() > self.data_vencimento
        
    def can_add_transactions(self):
        """Verifica se ainda é possível adicionar transações nesta fatura"""
        return self.status == 'aberta' and self.days_to_close > 0

    def fechar_fatura(self):
        """Fecha a fatura calculando o total das transações e cria transação pendente para pagamento"""
        from datetime import date
        from decimal import Decimal
        
        if self.status == 'fechada':
            return  # Já fechada
            
        # Calcular o total das transações da fatura baseado no período correto
        # Para cartão: transações do período de fechamento anterior ao atual
        data_inicio = date(self.ano, self.mes, 1)
        if self.mes == 1:
            data_fim = date(self.ano - 1, 12, self.credit_card.dia_fechamento)
        else:
            data_fim = date(self.ano, self.mes - 1, self.credit_card.dia_fechamento)
            
        # Se for mês atual, usar até o dia de fechamento
        if (self.ano == date.today().year and self.mes == date.today().month and 
            date.today().day >= self.credit_card.dia_fechamento):
            data_fim = date(self.ano, self.mes, self.credit_card.dia_fechamento)
        
        transacoes = Transaction.objects.filter(
            credit_card=self.credit_card,
            tipo=TransactionType.SAIDA,
            data__gte=data_fim + timedelta(days=1) if data_fim else data_inicio,
            data__lte=date(self.ano, self.mes, self.credit_card.dia_fechamento),
            confirmada=True
        )
        
        self.valor_total = sum(t.valor for t in transacoes) or Decimal('0')
        self.status = 'fechada'
        
        # NOVA REGRA: Confirmar todas as transações de cartão desta fatura
        transacoes_cartao = Transaction.objects.filter(
            credit_card=self.credit_card,
            data__gte=data_inicio,
            data__lte=date(self.ano, self.mes, self.credit_card.dia_fechamento),
            workspace=self.credit_card.workspace
        )
        
        # Confirmar todas as transações de cartão desta fatura
        transacoes_confirmadas = transacoes_cartao.update(confirmada=True)
        print(f"💳 Fatura {self.credit_card.nome} {self.mes:02d}/{self.ano} fechada: {transacoes_confirmadas} transações confirmadas automaticamente")
        
        self.save()
        
        # Criar transação pendente para pagamento da fatura se houver valor
        if self.valor_total > 0:
            # Verificar se já existe uma transação de pagamento para esta fatura
            existing_payment = Transaction.objects.filter(
                user=self.credit_card.user,
                workspace=self.credit_card.workspace,
                descricao__icontains=f"Pagamento fatura {self.credit_card.nome} {self.mes:02d}/{self.ano}",
                tipo=TransactionType.SAIDA,
                valor=self.valor_total
            ).first()
            
            if not existing_payment:
                Transaction.objects.create(
                    user=self.credit_card.user,
                    workspace=self.credit_card.workspace,
                    tipo=TransactionType.SAIDA,
                    valor=self.valor_total,
                    descricao=f"Pagamento fatura {self.credit_card.nome} {self.mes:02d}/{self.ano}",
                    data=self.data_vencimento,
                    confirmada=False  # Transação pendente
                )
                
        return self

    def pagar_fatura(self, valor, conta_origem):
        """Registra o pagamento da fatura"""
        if valor > self.valor_restante:
            valor = self.valor_restante
        
        # Cria transação de pagamento
        Transaction.objects.create(
            user=self.credit_card.user,
            account=conta_origem,
            tipo=TransactionType.SAIDA,
            valor=valor,
            descricao=f"Pagamento fatura {self.credit_card.nome} {self.mes:02d}/{self.ano}",
            data=date.today(),
            confirmada=True
        )
        
        self.valor_pago += valor
        if self.valor_pago >= self.valor_total:
            self.status = 'paga'
        self.save()


class ImportData(models.Model):
    """Modelo para controle de importação de extratos"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='imports')
    account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, 
                               related_name='imports')
    arquivo_nome = models.CharField(max_length=255)
    data_importacao = models.DateTimeField(auto_now_add=True)
    total_registros = models.IntegerField(default=0)
    registros_processados = models.IntegerField(default=0)
    registros_erro = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=[
        ('processando', 'Processando'),
        ('concluido', 'Concluído'),
        ('erro', 'Erro'),
    ], default='processando')
    observacoes = models.TextField(blank=True)

    class Meta:
        ordering = ['-data_importacao']
        verbose_name = 'Importação'
        verbose_name_plural = 'Importações'

    def __str__(self):
        return f"Importação {self.arquivo_nome} - {self.data_importacao}"
