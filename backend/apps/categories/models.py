from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ImportanceLevel(models.TextChoices):
    """Níveis de importância para categorias"""
    ESSENCIAL = 'essencial', 'Essencial'
    NECESSARIO = 'necessario', 'Necessário'
    SUPERFLUO = 'superfluo', 'Supérfluo'


class Category(models.Model):
    """Modelo para categorias de transações com suporte a hierarquia"""
    workspace = models.ForeignKey('accounts.Workspace', on_delete=models.CASCADE, related_name='categories')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    cor = models.CharField(max_length=7, default='#6366f1', help_text="Cor em formato hexadecimal")
    icone = models.CharField(max_length=50, default='tag')
    
    # Campo para hierarquia - referência para categoria pai
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='subcategories',
        help_text="Categoria pai (deixe vazio para categoria principal)"
    )
    
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
        verbose_name_plural = 'Categories'

    def __str__(self):
        if self.parent:
            return f"{self.parent.nome} > {self.nome}"
        return self.nome

    def clean(self):
        """Validações customizadas"""
        from django.core.exceptions import ValidationError
        
        # Evitar loops infinitos na hierarquia
        if self.parent:
            # Não pode ser pai de si mesmo
            if self.parent == self:
                raise ValidationError("Uma categoria não pode ser pai de si mesma.")
            
            # Não pode criar loops (máximo 2 níveis)
            if self.parent.parent is not None:
                raise ValidationError("Máximo 2 níveis de categorias são permitidos.")
            
            # Se tem parent, não pode ter subcategorias existentes
            if hasattr(self, 'pk') and self.pk and self.subcategories.exists():
                raise ValidationError("Não é possível mover uma categoria que possui subcategorias.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_parent(self):
        """Verifica se é uma categoria principal (pai)"""
        return self.parent is None

    @property
    def is_subcategory(self):
        """Verifica se é uma subcategoria"""
        return self.parent is not None

    @property
    def level(self):
        """Retorna o nível da categoria (0 = principal, 1 = subcategoria)"""
        return 0 if self.is_parent else 1

    @property
    def full_name(self):
        """Retorna o nome completo da categoria"""
        if self.parent:
            return f"{self.parent.nome} > {self.nome}"
        return self.nome

    def get_children(self):
        """Retorna todas as subcategorias desta categoria"""
        return self.subcategories.filter(is_active=True).order_by('nome')

    def get_ancestors(self):
        """Retorna todas as categorias pai desta categoria"""
        ancestors = []
        current = self.parent
        while current:
            ancestors.append(current)
            current = current.parent
        return ancestors

    def get_descendants(self):
        """Retorna todas as subcategorias desta categoria e suas subcategorias"""
        descendants = []
        for child in self.get_children():
            descendants.append(child)
            descendants.extend(child.get_descendants())
        return descendants

    @classmethod
    def get_main_categories(cls, workspace):
        """Retorna apenas as categorias principais de um workspace"""
        return cls.objects.filter(workspace=workspace, parent__isnull=True, is_active=True).order_by('nome')

    @classmethod
    def get_subcategories(cls, workspace, parent_id=None):
        """Retorna subcategorias de uma categoria específica ou todas"""
        queryset = cls.objects.filter(workspace=workspace, parent__isnull=False, is_active=True)
        if parent_id:
            queryset = queryset.filter(parent_id=parent_id)
        return queryset.order_by('parent__nome', 'nome')


class CostCenter(models.Model):
    """Modelo para centros de custo"""
    workspace = models.ForeignKey('accounts.Workspace', on_delete=models.CASCADE, related_name='cost_centers')
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
        verbose_name = 'Centro de Custo'
        verbose_name_plural = 'Centros de Custo'

    def __str__(self):
        return self.nome


class Tag(models.Model):
    """Modelo para tags de transações"""
    workspace = models.ForeignKey('accounts.Workspace', on_delete=models.CASCADE, related_name='tags')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    nome = models.CharField(max_length=50)
    cor = models.CharField(max_length=7, default='#6b7280', help_text="Cor em formato hexadecimal")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nome']

    def __str__(self):
        return self.nome
