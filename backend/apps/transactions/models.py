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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    
    # Contas envolvidas
    account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, 
                               related_name='transactions_from', verbose_name="Conta de origem")
    to_account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, 
                                  related_name='transactions_to', null=True, blank=True,
                                  verbose_name="Conta de destino")
    credit_card = models.ForeignKey('accounts.CreditCard', on_delete=models.CASCADE,
                                   related_name='transactions', null=True, blank=True,
                                   verbose_name="Cartão de crédito")
    
    # Dados básicos
    tipo = models.CharField(max_length=15, choices=TransactionType.choices)
    valor = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    descricao = models.CharField(max_length=255)
    observacoes = models.TextField(blank=True)
    data = models.DateField()
    
    # Categorização
    category = models.ForeignKey('categories.Category', on_delete=models.SET_NULL, 
                                null=True, blank=True, related_name='transactions')
    cost_center = models.ForeignKey('categories.CostCenter', on_delete=models.SET_NULL,
                                   null=True, blank=True, related_name='transactions')
    tags = models.ManyToManyField('categories.Tag', blank=True, related_name='transactions')
    
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

    def fechar_fatura(self):
        """Fecha a fatura calculando o total das transações"""
        transacoes = Transaction.objects.filter(
            credit_card=self.credit_card,
            tipo=TransactionType.SAIDA,
            data__month=self.mes,
            data__year=self.ano,
            confirmada=True
        )
        self.valor_total = sum(t.valor for t in transacoes)
        self.status = 'fechada'
        self.save()

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
