from django.contrib.auth.models import AbstractUser
from django.db import models
from decimal import Decimal


class Workspace(models.Model):
    """Modelo para espaços de trabalho compartilhados"""
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    criado_por = models.ForeignKey('User', on_delete=models.CASCADE, related_name='workspaces_criados')
    membros = models.ManyToManyField('User', through='WorkspaceMember', related_name='workspaces')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nome']
        unique_together = ['criado_por', 'nome']

    def __str__(self):
        return f"{self.nome} (por {self.criado_por.email})"


class WorkspaceMemberRole(models.TextChoices):
    """Níveis de acesso ao workspace"""
    ADMIN = 'admin', 'Administrador'
    EDITOR = 'editor', 'Editor'
    VIEWER = 'viewer', 'Visualizador'


class WorkspaceMember(models.Model):
    """Modelo para membros de um workspace"""
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=WorkspaceMemberRole.choices, default=WorkspaceMemberRole.VIEWER)
    
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['workspace', 'user']

    def __str__(self):
        return f"{self.user.email} - {self.workspace.nome} ({self.role})"


class User(AbstractUser):
    """Modelo personalizado de usuário"""
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefone")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Foto do perfil")
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
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='accounts')
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
        unique_together = ['workspace', 'nome']

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
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='credit_cards')
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
        unique_together = ['workspace', 'nome']

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
