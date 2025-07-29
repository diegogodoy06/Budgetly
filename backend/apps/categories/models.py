from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ImportanceLevel(models.TextChoices):
    """Níveis de importância para categorias"""
    ESSENCIAL = 'essencial', 'Essencial'
    NECESSARIO = 'necessario', 'Necessário'
    SUPERFLUO = 'superfluo', 'Supérfluo'


class Category(models.Model):
    """Modelo para categorias de transações"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    cor = models.CharField(max_length=7, default='#6366f1', help_text="Cor em formato hexadecimal")
    icone = models.CharField(max_length=50, default='tag')
    nivel_importancia = models.CharField(
        max_length=20, 
        choices=ImportanceLevel.choices, 
        default=ImportanceLevel.NECESSARIO
    )
    considerar_dashboard = models.BooleanField(
        default=True, 
        help_text="Se deve aparecer no dashboard principal"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nome']
        unique_together = ['user', 'nome']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.nome


class CostCenter(models.Model):
    """Modelo para centros de custo"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cost_centers')
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    cor = models.CharField(max_length=7, default='#10b981', help_text="Cor em formato hexadecimal")
    icone = models.CharField(max_length=50, default='building-office')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nome']
        unique_together = ['user', 'nome']
        verbose_name = 'Centro de Custo'
        verbose_name_plural = 'Centros de Custo'

    def __str__(self):
        return self.nome


class Tag(models.Model):
    """Modelo para tags de transações"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    nome = models.CharField(max_length=50)
    cor = models.CharField(max_length=7, default='#6b7280', help_text="Cor em formato hexadecimal")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nome']
        unique_together = ['user', 'nome']

    def __str__(self):
        return self.nome
