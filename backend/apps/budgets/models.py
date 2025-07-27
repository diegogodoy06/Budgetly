from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()


class Budget(models.Model):
    """Modelo para orçamentos mensais"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE, related_name='budgets')
    month = models.IntegerField()
    year = models.IntegerField()
    planned_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    spent_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year', '-month', 'category__name']
        unique_together = ['user', 'category', 'month', 'year']

    def __str__(self):
        return f"Orçamento {self.category.name} - {self.month:02d}/{self.year}"

    @property
    def remaining_amount(self):
        """Valor restante do orçamento"""
        return self.planned_amount - self.spent_amount

    @property
    def percentage_used(self):
        """Percentual utilizado do orçamento"""
        if self.planned_amount == 0:
            return 0
        return (self.spent_amount / self.planned_amount) * 100

    @property
    def is_over_budget(self):
        """Indica se o orçamento foi excedido"""
        return self.spent_amount > self.planned_amount

    def update_spent_amount(self):
        """Atualiza o valor gasto baseado nas transações"""
        from apps.transactions.models import Transaction, TransactionType
        
        transactions = Transaction.objects.filter(
            user=self.user,
            category=self.category,
            transaction_type=TransactionType.EXPENSE,
            date__month=self.month,
            date__year=self.year,
            is_processed=True
        )
        
        self.spent_amount = sum(t.amount for t in transactions)
        self.save(update_fields=['spent_amount', 'updated_at'])


class BudgetAlert(models.Model):
    """Modelo para alertas de orçamento"""
    ALERT_TYPES = [
        ('warning', 'Aviso (80%)'),
        ('danger', 'Perigo (100%)'),
        ('exceeded', 'Excedido'),
    ]
    
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=10, choices=ALERT_TYPES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Alerta {self.budget} - {self.get_alert_type_display()}"
