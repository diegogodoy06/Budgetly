from django.contrib.auth.models import AbstractUser
from django.db import models
from decimal import Decimal


class User(AbstractUser):
    """Modelo personalizado de usuário"""
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class AccountType(models.TextChoices):
    """Tipos de conta"""
    CONTA_BANCARIA = 'conta-bancaria', 'Conta Bancária'
    CONTA_INVESTIMENTO = 'conta-investimento', 'Conta de Investimento'
    CRIPTOMOEDA = 'criptomoeda', 'Criptomoeda'
    COFRE = 'cofre', 'Cofre'
    CARTAO_PREPAGO = 'cartao-prepago', 'Cartão Pré-pago'


class Account(models.Model):
    """Modelo para carteiras/contas financeiras"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=AccountType.choices)
    banco = models.CharField(max_length=100, blank=True, null=True)
    codigo_banco = models.CharField(max_length=3, blank=True, null=True, help_text="Código de 3 dígitos do banco")
    saldo_inicial = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    saldo_atual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    eh_conta = models.BooleanField(default=True)
    cor = models.CharField(max_length=20, default='bg-blue-500')
    icone = models.CharField(max_length=20, default='bank')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nome']
        unique_together = ['user', 'nome']

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()})"


class CreditCardBrand(models.TextChoices):
    """Bandeiras de cartão de crédito"""
    VISA = 'Visa', 'Visa'
    MASTERCARD = 'Mastercard', 'Mastercard'
    ELO = 'Elo', 'Elo'
    AMERICAN_EXPRESS = 'American Express', 'American Express'
    HIPERCARD = 'Hipercard', 'Hipercard'
    DINERS_CLUB = 'Diners Club', 'Diners Club'
    DISCOVER = 'Discover', 'Discover'
    JCB = 'JCB', 'JCB'
    UNIONPAY = 'UnionPay', 'UnionPay'
    CABAL = 'Cabal', 'Cabal'
    AURA = 'Aura', 'Aura'
    BANRICOMPRAS = 'Banricompras', 'Banricompras'


class CreditCard(models.Model):
    """Modelo para cartões de crédito"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_cards')
    nome = models.CharField(max_length=100)
    bandeira = models.CharField(max_length=20, choices=CreditCardBrand.choices)
    ultimos_4_digitos = models.CharField(max_length=4, help_text="Últimos 4 dígitos do cartão")
    dia_vencimento = models.IntegerField(help_text="Dia do vencimento da fatura (1-31)")
    dia_fechamento = models.IntegerField(help_text="Dia do fechamento da fatura (1-31)")
    limite = models.DecimalField(max_digits=12, decimal_places=2)
    saldo_atual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cor = models.CharField(max_length=20, default='bg-blue-600')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nome']
        unique_together = ['user', 'nome']

    def __str__(self):
        return f"{self.nome} ({self.bandeira} ****{self.ultimos_4_digitos})"

    @property
    def disponivel(self):
        """Retorna o valor disponível no cartão"""
        return self.limite - self.saldo_atual

    @property
    def percentual_usado(self):
        """Retorna o percentual do limite usado"""
        if self.limite > 0:
            return (self.saldo_atual / self.limite) * 100
        return 0

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def update_balance(self, amount):
        """Atualiza o saldo atual do cartão"""
        self.saldo_atual += Decimal(str(amount))
        self.save(update_fields=['saldo_atual', 'updated_at'])
