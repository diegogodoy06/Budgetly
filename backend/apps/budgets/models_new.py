from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
from datetime import date

User = get_user_model()


class BudgetType(models.TextChoices):
    """Tipos de orçamento"""
    MENSAL = 'mensal', 'Mensal'
    ANUAL = 'anual', 'Anual'
    PERSONALIZADO = 'personalizado', 'Personalizado'


class Budget(models.Model):
    """Modelo para orçamentos"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    tipo = models.CharField(max_length=15, choices=BudgetType.choices, default=BudgetType.MENSAL)
    
    # Período
    mes = models.IntegerField(null=True, blank=True, help_text="Mês (1-12) para orçamentos mensais")
    ano = models.IntegerField()
    data_inicio = models.DateField(null=True, blank=True, help_text="Para orçamentos personalizados")
    data_fim = models.DateField(null=True, blank=True, help_text="Para orçamentos personalizados")
    
    valor_planejado = models.DecimalField(max_digits=12, decimal_places=2, 
                                         validators=[MinValueValidator(Decimal('0.01'))])
    valor_gasto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-ano', '-mes', 'nome']
        unique_together = ['user', 'nome', 'mes', 'ano']
        verbose_name = 'Orçamento'
        verbose_name_plural = 'Orçamentos'

    def __str__(self):
        if self.tipo == BudgetType.MENSAL:
            return f"{self.nome} - {self.mes:02d}/{self.ano}"
        return f"{self.nome} - {self.ano}"

    @property
    def valor_restante(self):
        """Valor restante do orçamento"""
        return self.valor_planejado - self.valor_gasto

    @property
    def percentual_usado(self):
        """Percentual utilizado do orçamento"""
        if self.valor_planejado == 0:
            return 0
        return (self.valor_gasto / self.valor_planejado) * 100

    @property
    def is_excedido(self):
        """Indica se o orçamento foi excedido"""
        return self.valor_gasto > self.valor_planejado

    @property
    def valor_planejado_formatado(self):
        """Retorna o valor planejado formatado em reais"""
        return f"R$ {self.valor_planejado:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

    @property
    def valor_gasto_formatado(self):
        """Retorna o valor gasto formatado em reais"""
        return f"R$ {self.valor_gasto:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

    def atualizar_valor_gasto(self):
        """Atualiza o valor gasto baseado nas transações"""
        from apps.transactions.models import Transaction, TransactionType
        
        # Define filtros baseados no tipo de orçamento
        filters = {
            'user': self.user,
            'tipo': TransactionType.SAIDA,
            'confirmada': True
        }
        
        if self.tipo == BudgetType.MENSAL:
            filters.update({
                'data__month': self.mes,
                'data__year': self.ano
            })
        elif self.tipo == BudgetType.ANUAL:
            filters['data__year'] = self.ano
        elif self.tipo == BudgetType.PERSONALIZADO and self.data_inicio and self.data_fim:
            filters.update({
                'data__gte': self.data_inicio,
                'data__lte': self.data_fim
            })
        
        # Filtra por categorias do orçamento
        categorias_budget = self.categorias.values_list('category_id', flat=True)
        if categorias_budget:
            filters['category_id__in'] = categorias_budget
        
        transacoes = Transaction.objects.filter(**filters)
        self.valor_gasto = sum(t.valor for t in transacoes)
        self.save(update_fields=['valor_gasto'])


class BudgetCategory(models.Model):
    """Modelo para categorias dentro de um orçamento"""
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='categorias')
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE)
    valor_planejado = models.DecimalField(max_digits=12, decimal_places=2,
                                         validators=[MinValueValidator(Decimal('0.01'))])
    valor_gasto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['budget', 'category']
        verbose_name = 'Categoria do Orçamento'
        verbose_name_plural = 'Categorias do Orçamento'

    def __str__(self):
        return f"{self.budget.nome} - {self.category.nome}"

    @property
    def valor_restante(self):
        """Valor restante da categoria"""
        return self.valor_planejado - self.valor_gasto

    @property
    def percentual_usado(self):
        """Percentual utilizado da categoria"""
        if self.valor_planejado == 0:
            return 0
        return (self.valor_gasto / self.valor_planejado) * 100

    @property
    def is_excedido(self):
        """Indica se a categoria excedeu o orçamento"""
        return self.valor_gasto > self.valor_planejado

    def atualizar_valor_gasto(self):
        """Atualiza o valor gasto da categoria"""
        from apps.transactions.models import Transaction, TransactionType
        
        # Define filtros baseados no tipo de orçamento
        filters = {
            'user': self.budget.user,
            'tipo': TransactionType.SAIDA,
            'category': self.category,
            'confirmada': True
        }
        
        if self.budget.tipo == BudgetType.MENSAL:
            filters.update({
                'data__month': self.budget.mes,
                'data__year': self.budget.ano
            })
        elif self.budget.tipo == BudgetType.ANUAL:
            filters['data__year'] = self.budget.ano
        elif self.budget.tipo == BudgetType.PERSONALIZADO:
            if self.budget.data_inicio and self.budget.data_fim:
                filters.update({
                    'data__gte': self.budget.data_inicio,
                    'data__lte': self.budget.data_fim
                })
        
        transacoes = Transaction.objects.filter(**filters)
        self.valor_gasto = sum(t.valor for t in transacoes)
        self.save(update_fields=['valor_gasto'])


class BudgetAlert(models.Model):
    """Modelo para alertas de orçamento"""
    ALERT_TYPES = [
        ('percentual', 'Percentual'),
        ('valor_fixo', 'Valor Fixo'),
    ]
    
    budget_category = models.ForeignKey(BudgetCategory, on_delete=models.CASCADE, 
                                       related_name='alertas')
    tipo_alerta = models.CharField(max_length=15, choices=ALERT_TYPES)
    valor_limite = models.DecimalField(max_digits=12, decimal_places=2,
                                      help_text="Valor em reais ou percentual (0-100)")
    ativo = models.BooleanField(default=True)
    notificado = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Alerta de Orçamento'
        verbose_name_plural = 'Alertas de Orçamento'

    def __str__(self):
        return f"Alerta {self.budget_category} - {self.valor_limite}"

    def verificar_alerta(self):
        """Verifica se o alerta deve ser disparado"""
        if not self.ativo or self.notificado:
            return False
        
        if self.tipo_alerta == 'percentual':
            return self.budget_category.percentual_usado >= self.valor_limite
        elif self.tipo_alerta == 'valor_fixo':
            return self.budget_category.valor_gasto >= self.valor_limite
        
        return False

    def marcar_como_notificado(self):
        """Marca o alerta como notificado"""
        self.notificado = True
        self.save(update_fields=['notificado'])
