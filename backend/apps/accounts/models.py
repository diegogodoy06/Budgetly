from django.contrib.auth.models import AbstractUser
from django.db import models
from decimal import Decimal


class User(AbstractUser):
    """Modelo personalizado de usuário"""
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class AccountType(models.TextChoices):
    """Tipos de conta"""
    CHECKING = 'checking', 'Conta Corrente'
    SAVINGS = 'savings', 'Poupança'
    WALLET = 'wallet', 'Carteira'
    CREDIT_CARD = 'credit_card', 'Cartão de Crédito'


class Account(models.Model):
    """Modelo para contas financeiras"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')
    name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=20, choices=AccountType.choices)
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Campos específicos para cartão de crédito
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    closing_day = models.IntegerField(null=True, blank=True, help_text="Dia do fechamento da fatura (1-31)")
    due_day = models.IntegerField(null=True, blank=True, help_text="Dia do vencimento da fatura (1-31)")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ['user', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_account_type_display()})"

    def save(self, *args, **kwargs):
        if self.pk is None:  # Novo objeto
            self.current_balance = self.initial_balance
        super().save(*args, **kwargs)

    @property
    def available_credit(self):
        """Retorna o crédito disponível para cartões de crédito"""
        if self.account_type == AccountType.CREDIT_CARD and self.credit_limit:
            return self.credit_limit + self.current_balance  # current_balance é negativo para cartão
        return None

    def update_balance(self, amount):
        """Atualiza o saldo da conta"""
        self.current_balance += Decimal(str(amount))
        self.save(update_fields=['current_balance', 'updated_at'])
