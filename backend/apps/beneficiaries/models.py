from django.db import models
from django.contrib.auth import get_user_model
from apps.accounts.models import Workspace

User = get_user_model()


class BeneficiaryType(models.TextChoices):
    """Tipos de beneficiário"""
    PESSOA_FISICA = 'pessoa_fisica', 'Pessoa Física'
    PESSOA_JURIDICA = 'pessoa_juridica', 'Pessoa Jurídica'
    CONTA_BANCARIA = 'conta_bancaria', 'Conta Bancária'
    CARTAO_CREDITO = 'cartao_credito', 'Cartão de Crédito'
    PIX = 'pix', 'PIX'
    ESTABELECIMENTO = 'estabelecimento', 'Estabelecimento'
    OUTROS = 'outros', 'Outros'


class Beneficiary(models.Model):
    """
    Modelo para representar beneficiários de transações.
    Pode ser uma loja, pessoa física, pessoa jurídica, PIX, etc.
    """
    nome = models.CharField(max_length=255, verbose_name="Nome do Beneficiário")
    tipo = models.CharField(
        max_length=20, 
        choices=BeneficiaryType.choices,
        default=BeneficiaryType.OUTROS,
        verbose_name="Tipo"
    )
    descricao = models.TextField(blank=True, verbose_name="Descrição")
    workspace = models.ForeignKey(
        Workspace, 
        on_delete=models.CASCADE, 
        related_name='beneficiaries',
        verbose_name="Workspace"
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='beneficiaries',
        verbose_name="Usuário"
    )
    is_system = models.BooleanField(
        default=False, 
        verbose_name="Beneficiário do Sistema",
        help_text="Beneficiários criados automaticamente pelo sistema (contas/cartões)"
    )
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Beneficiário"
        verbose_name_plural = "Beneficiários"
        ordering = ['nome']
        unique_together = [['nome', 'workspace']]  # Nome único por workspace
        indexes = [
            models.Index(fields=['workspace', 'is_active']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['nome']),
            models.Index(fields=['tipo']),
        ]

    def __str__(self):
        return self.nome

    def save(self, *args, **kwargs):
        # Normalizar nome (remover espaços extras)
        self.nome = ' '.join(self.nome.split())
        super().save(*args, **kwargs)
