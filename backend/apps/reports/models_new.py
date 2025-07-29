from django.db import models
from django.contrib.auth import get_user_model
from datetime import date, datetime, timedelta
import json

User = get_user_model()


class ReportType(models.TextChoices):
    """Tipos de relatório"""
    TRANSACOES = 'transacoes', 'Transações'
    CATEGORIAS = 'categorias', 'Por Categorias'
    CONTAS = 'contas', 'Por Contas'
    ORCAMENTOS = 'orcamentos', 'Orçamentos'
    FLUXO_CAIXA = 'fluxo_caixa', 'Fluxo de Caixa'
    COMPARATIVO = 'comparativo', 'Comparativo'


class ReportPeriod(models.TextChoices):
    """Períodos para relatórios"""
    MENSAL = 'mensal', 'Mensal'
    TRIMESTRAL = 'trimestral', 'Trimestral'
    SEMESTRAL = 'semestral', 'Semestral'
    ANUAL = 'anual', 'Anual'
    PERSONALIZADO = 'personalizado', 'Personalizado'


class Report(models.Model):
    """Modelo para relatórios salvos"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_reports')
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    tipo = models.CharField(max_length=20, choices=ReportType.choices)
    periodo = models.CharField(max_length=15, choices=ReportPeriod.choices)
    
    # Filtros do relatório (salvos como JSON)
    filtros = models.JSONField(default=dict, help_text="Filtros aplicados ao relatório")
    
    # Período específico
    data_inicio = models.DateField()
    data_fim = models.DateField()
    
    # Dados do relatório (cache)
    dados = models.JSONField(default=dict, help_text="Dados do relatório em cache")
    ultima_atualizacao = models.DateTimeField(null=True, blank=True)
    
    is_favorito = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'nome']
        verbose_name = 'Relatório'
        verbose_name_plural = 'Relatórios'

    def __str__(self):
        return f"{self.nome} - {self.get_tipo_display()}"

    def gerar_dados(self):
        """Gera os dados do relatório baseado no tipo"""
        if self.tipo == ReportType.TRANSACOES:
            self.dados = self._gerar_relatorio_transacoes()
        elif self.tipo == ReportType.CATEGORIAS:
            self.dados = self._gerar_relatorio_categorias()
        elif self.tipo == ReportType.CONTAS:
            self.dados = self._gerar_relatorio_contas()
        elif self.tipo == ReportType.ORCAMENTOS:
            self.dados = self._gerar_relatorio_orcamentos()
        elif self.tipo == ReportType.FLUXO_CAIXA:
            self.dados = self._gerar_relatorio_fluxo_caixa()
        elif self.tipo == ReportType.COMPARATIVO:
            self.dados = self._gerar_relatorio_comparativo()
        
        self.ultima_atualizacao = datetime.now()
        self.save(update_fields=['dados', 'ultima_atualizacao'])

    def _gerar_relatorio_transacoes(self):
        """Gera relatório de transações"""
        from apps.transactions.models import Transaction, TransactionType
        
        filters = {
            'user': self.user,
            'data__gte': self.data_inicio,
            'data__lte': self.data_fim,
            'confirmada': True
        }
        
        # Aplica filtros adicionais do JSON
        if self.filtros.get('categorias'):
            filters['category_id__in'] = self.filtros['categorias']
        if self.filtros.get('contas'):
            filters['account_id__in'] = self.filtros['contas']
        if self.filtros.get('tipo'):
            filters['tipo'] = self.filtros['tipo']
        
        transacoes = Transaction.objects.filter(**filters)
        
        total_entradas = sum(t.valor for t in transacoes.filter(tipo=TransactionType.ENTRADA))
        total_saidas = sum(t.valor for t in transacoes.filter(tipo=TransactionType.SAIDA))
        saldo = total_entradas - total_saidas
        
        return {
            'total_transacoes': transacoes.count(),
            'total_entradas': float(total_entradas),
            'total_saidas': float(total_saidas),
            'saldo_periodo': float(saldo),
            'periodo': f"{self.data_inicio} a {self.data_fim}"
        }

    def _gerar_relatorio_categorias(self):
        """Gera relatório por categorias"""
        from apps.transactions.models import Transaction, TransactionType
        from apps.categories.models import Category
        
        categorias_data = []
        categorias = Category.objects.filter(user=self.user, is_active=True)
        
        for categoria in categorias:
            transacoes = Transaction.objects.filter(
                user=self.user,
                category=categoria,
                data__gte=self.data_inicio,
                data__lte=self.data_fim,
                confirmada=True
            )
            
            entradas = sum(t.valor for t in transacoes.filter(tipo=TransactionType.ENTRADA))
            saidas = sum(t.valor for t in transacoes.filter(tipo=TransactionType.SAIDA))
            
            if entradas > 0 or saidas > 0:
                categorias_data.append({
                    'categoria': categoria.nome,
                    'entradas': float(entradas),
                    'saidas': float(saidas),
                    'saldo': float(entradas - saidas),
                    'total_transacoes': transacoes.count()
                })
        
        return {
            'categorias': categorias_data,
            'periodo': f"{self.data_inicio} a {self.data_fim}"
        }

    def _gerar_relatorio_contas(self):
        """Gera relatório por contas"""
        from apps.transactions.models import Transaction
        from apps.accounts.models import Account
        
        contas_data = []
        contas = Account.objects.filter(user=self.user, is_active=True)
        
        for conta in contas:
            transacoes = Transaction.objects.filter(
                user=self.user,
                account=conta,
                data__gte=self.data_inicio,
                data__lte=self.data_fim,
                confirmada=True
            )
            
            saldo_inicial = conta.saldo_inicial
            movimentacao = sum(
                t.valor if t.tipo == 'entrada' else -t.valor 
                for t in transacoes
            )
            
            contas_data.append({
                'conta': conta.nome,
                'tipo': conta.get_tipo_display(),
                'saldo_inicial': float(saldo_inicial),
                'movimentacao': float(movimentacao),
                'saldo_final': float(saldo_inicial + movimentacao),
                'total_transacoes': transacoes.count()
            })
        
        return {
            'contas': contas_data,
            'periodo': f"{self.data_inicio} a {self.data_fim}"
        }

    def _gerar_relatorio_orcamentos(self):
        """Gera relatório de orçamentos"""
        from apps.budgets.models import Budget, BudgetType
        
        budgets_data = []
        
        # Filtra orçamentos baseado no período
        if self.periodo == ReportPeriod.MENSAL:
            budgets = Budget.objects.filter(
                user=self.user,
                tipo=BudgetType.MENSAL,
                mes=self.data_inicio.month,
                ano=self.data_inicio.year,
                is_active=True
            )
        else:
            budgets = Budget.objects.filter(
                user=self.user,
                ano=self.data_inicio.year,
                is_active=True
            )
        
        for budget in budgets:
            budget.atualizar_valor_gasto()
            
            budgets_data.append({
                'orcamento': budget.nome,
                'tipo': budget.get_tipo_display(),
                'valor_planejado': float(budget.valor_planejado),
                'valor_gasto': float(budget.valor_gasto),
                'valor_restante': float(budget.valor_restante),
                'percentual_usado': float(budget.percentual_usado),
                'excedido': budget.is_excedido
            })
        
        return {
            'orcamentos': budgets_data,
            'periodo': f"{self.data_inicio} a {self.data_fim}"
        }

    def _gerar_relatorio_fluxo_caixa(self):
        """Gera relatório de fluxo de caixa"""
        from apps.transactions.models import Transaction, TransactionType
        
        fluxo_data = []
        data_atual = self.data_inicio
        
        while data_atual <= self.data_fim:
            transacoes_dia = Transaction.objects.filter(
                user=self.user,
                data=data_atual,
                confirmada=True
            )
            
            entradas = sum(t.valor for t in transacoes_dia.filter(tipo=TransactionType.ENTRADA))
            saidas = sum(t.valor for t in transacoes_dia.filter(tipo=TransactionType.SAIDA))
            
            fluxo_data.append({
                'data': data_atual.isoformat(),
                'entradas': float(entradas),
                'saidas': float(saidas),
                'saldo_dia': float(entradas - saidas)
            })
            
            data_atual += timedelta(days=1)
        
        return {
            'fluxo_diario': fluxo_data,
            'periodo': f"{self.data_inicio} a {self.data_fim}"
        }

    def _gerar_relatorio_comparativo(self):
        """Gera relatório comparativo entre períodos"""
        from apps.transactions.models import Transaction, TransactionType
        
        # Período atual
        atual_entradas = Transaction.objects.filter(
            user=self.user,
            tipo=TransactionType.ENTRADA,
            data__gte=self.data_inicio,
            data__lte=self.data_fim,
            confirmada=True
        ).aggregate(total=models.Sum('valor'))['total'] or 0
        
        atual_saidas = Transaction.objects.filter(
            user=self.user,
            tipo=TransactionType.SAIDA,
            data__gte=self.data_inicio,
            data__lte=self.data_fim,
            confirmada=True
        ).aggregate(total=models.Sum('valor'))['total'] or 0
        
        # Período anterior (mesmo intervalo)
        dias_periodo = (self.data_fim - self.data_inicio).days
        anterior_fim = self.data_inicio - timedelta(days=1)
        anterior_inicio = anterior_fim - timedelta(days=dias_periodo)
        
        anterior_entradas = Transaction.objects.filter(
            user=self.user,
            tipo=TransactionType.ENTRADA,
            data__gte=anterior_inicio,
            data__lte=anterior_fim,
            confirmada=True
        ).aggregate(total=models.Sum('valor'))['total'] or 0
        
        anterior_saidas = Transaction.objects.filter(
            user=self.user,
            tipo=TransactionType.SAIDA,
            data__gte=anterior_inicio,
            data__lte=anterior_fim,
            confirmada=True
        ).aggregate(total=models.Sum('valor'))['total'] or 0
        
        return {
            'periodo_atual': {
                'inicio': self.data_inicio.isoformat(),
                'fim': self.data_fim.isoformat(),
                'entradas': float(atual_entradas),
                'saidas': float(atual_saidas),
                'saldo': float(atual_entradas - atual_saidas)
            },
            'periodo_anterior': {
                'inicio': anterior_inicio.isoformat(),
                'fim': anterior_fim.isoformat(),
                'entradas': float(anterior_entradas),
                'saidas': float(anterior_saidas),
                'saldo': float(anterior_entradas - anterior_saidas)
            },
            'variacao': {
                'entradas': float(atual_entradas - anterior_entradas),
                'saidas': float(atual_saidas - anterior_saidas),
                'saldo': float((atual_entradas - atual_saidas) - (anterior_entradas - anterior_saidas))
            }
        }


class ImportHistory(models.Model):
    """Histórico de importações de arquivos"""
    IMPORT_STATUS = [
        ('processando', 'Processando'),
        ('concluido', 'Concluído'),
        ('erro', 'Erro'),
        ('cancelado', 'Cancelado'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='import_history')
    account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, 
                               related_name='import_history')
    arquivo_nome = models.CharField(max_length=255)
    formato_arquivo = models.CharField(max_length=10, choices=[
        ('csv', 'CSV'),
        ('xlsx', 'Excel'),
        ('ofx', 'OFX'),
    ])
    
    total_registros = models.IntegerField(default=0)
    registros_processados = models.IntegerField(default=0)
    registros_erro = models.IntegerField(default=0)
    registros_duplicados = models.IntegerField(default=0)
    
    status = models.CharField(max_length=15, choices=IMPORT_STATUS, default='processando')
    log_erros = models.JSONField(default=list, help_text="Log dos erros encontrados")
    
    data_importacao = models.DateTimeField(auto_now_add=True)
    data_conclusao = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-data_importacao']
        verbose_name = 'Histórico de Importação'
        verbose_name_plural = 'Histórico de Importações'

    def __str__(self):
        return f"Importação {self.arquivo_nome} - {self.get_status_display()}"

    @property
    def percentual_processado(self):
        """Percentual de registros processados"""
        if self.total_registros == 0:
            return 0
        return (self.registros_processados / self.total_registros) * 100

    @property
    def percentual_sucesso(self):
        """Percentual de sucesso na importação"""
        if self.registros_processados == 0:
            return 0
        sucesso = self.registros_processados - self.registros_erro
        return (sucesso / self.registros_processados) * 100
