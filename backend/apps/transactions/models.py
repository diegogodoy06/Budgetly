from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
from datetime import date, timedelta
import calendar

User = get_user_model()


class TransactionType(models.TextChoices):
    """Tipos de transação"""
    INCOME = 'income', 'Entrada'
    EXPENSE = 'expense', 'Saída'
    TRANSFER = 'transfer', 'Transferência'


class RecurrenceType(models.TextChoices):
    """Tipos de recorrência"""
    NONE = 'none', 'Nenhuma'
    MONTHLY = 'monthly', 'Mensal'


class Transaction(models.Model):
    """Modelo para transações financeiras"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='transactions')
    to_account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, 
                                   related_name='transfer_transactions', null=True, blank=True)
    
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    description = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    date = models.DateField()
    
    category = models.ForeignKey('categories.Category', on_delete=models.SET_NULL, 
                                null=True, blank=True, related_name='transactions')
    tags = models.ManyToManyField('categories.Tag', blank=True, related_name='transactions')
    
    # Campos para parcelamento
    installments = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    installment_number = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    parent_transaction = models.ForeignKey('self', on_delete=models.CASCADE, 
                                          null=True, blank=True, related_name='child_transactions')
    
    # Campos para recorrência
    recurrence_type = models.CharField(max_length=10, choices=RecurrenceType.choices, default=RecurrenceType.NONE)
    recurrence_end_date = models.DateField(null=True, blank=True)
    
    is_processed = models.BooleanField(default=False, help_text="Indica se a transação já foi processada")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.description} - {self.amount} ({self.date})"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and not self.is_processed:
            self.process_transaction()

    def process_transaction(self):
        """Processa a transação, atualizando os saldos das contas"""
        if self.is_processed:
            return
        
        if self.transaction_type == TransactionType.INCOME:
            self.account.update_balance(self.amount)
        elif self.transaction_type == TransactionType.EXPENSE:
            self.account.update_balance(-self.amount)
        elif self.transaction_type == TransactionType.TRANSFER and self.to_account:
            self.account.update_balance(-self.amount)
            self.to_account.update_balance(self.amount)
        
        self.is_processed = True
        self.save(update_fields=['is_processed'])

    def create_installments(self):
        """Cria as parcelas restantes da transação"""
        if self.installments <= 1:
            return
        
        for i in range(2, self.installments + 1):
            next_date = self.get_next_installment_date(i)
            Transaction.objects.create(
                user=self.user,
                account=self.account,
                to_account=self.to_account,
                transaction_type=self.transaction_type,
                amount=self.amount,
                description=f"{self.description} ({i}/{self.installments})",
                notes=self.notes,
                date=next_date,
                category=self.category,
                installments=self.installments,
                installment_number=i,
                parent_transaction=self,
                recurrence_type=self.recurrence_type
            )

    def get_next_installment_date(self, installment_number):
        """Calcula a data da próxima parcela"""
        months_to_add = installment_number - 1
        year = self.date.year
        month = self.date.month + months_to_add
        
        while month > 12:
            month -= 12
            year += 1
        
        # Ajusta para o último dia do mês se necessário
        last_day = calendar.monthrange(year, month)[1]
        day = min(self.date.day, last_day)
        
        return date(year, month, day)

    def create_recurrence(self):
        """Cria transações recorrentes"""
        if self.recurrence_type == RecurrenceType.NONE:
            return
        
        current_date = self.date
        while True:
            if self.recurrence_type == RecurrenceType.MONTHLY:
                next_month = current_date.month + 1 if current_date.month < 12 else 1
                next_year = current_date.year if current_date.month < 12 else current_date.year + 1
                last_day = calendar.monthrange(next_year, next_month)[1]
                next_day = min(current_date.day, last_day)
                current_date = date(next_year, next_month, next_day)
            
            if self.recurrence_end_date and current_date > self.recurrence_end_date:
                break
            
            Transaction.objects.create(
                user=self.user,
                account=self.account,
                to_account=self.to_account,
                transaction_type=self.transaction_type,
                amount=self.amount,
                description=self.description,
                notes=self.notes,
                date=current_date,
                category=self.category,
                recurrence_type=self.recurrence_type,
                recurrence_end_date=self.recurrence_end_date,
                parent_transaction=self
            )


class CreditCardBill(models.Model):
    """Modelo para faturas de cartão de crédito"""
    BILL_STATUS = [
        ('open', 'Aberta'),
        ('closed', 'Fechada'),
        ('paid', 'Paga'),
        ('overdue', 'Vencida'),
    ]
    
    account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='bills')
    month = models.IntegerField()
    year = models.IntegerField()
    closing_date = models.DateField()
    due_date = models.DateField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=BILL_STATUS, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year', '-month']
        unique_together = ['account', 'month', 'year']

    def __str__(self):
        return f"Fatura {self.account.name} - {self.month:02d}/{self.year}"

    @property
    def remaining_amount(self):
        """Valor restante a ser pago"""
        return self.total_amount - self.paid_amount

    def close_bill(self):
        """Fecha a fatura e calcula o total"""
        transactions = Transaction.objects.filter(
            account=self.account,
            transaction_type=TransactionType.EXPENSE,
            date__month=self.month,
            date__year=self.year
        )
        self.total_amount = sum(t.amount for t in transactions)
        self.status = 'closed'
        self.save()

    def pay_bill(self, amount, from_account):
        """Registra o pagamento da fatura"""
        if amount > self.remaining_amount:
            amount = self.remaining_amount
        
        # Cria transação de transferência
        Transaction.objects.create(
            user=self.account.user,
            account=from_account,
            to_account=self.account,
            transaction_type=TransactionType.TRANSFER,
            amount=amount,
            description=f"Pagamento fatura {self.account.name} {self.month:02d}/{self.year}",
            date=date.today()
        )
        
        self.paid_amount += amount
        if self.paid_amount >= self.total_amount:
            self.status = 'paid'
        self.save()
