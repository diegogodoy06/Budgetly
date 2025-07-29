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
