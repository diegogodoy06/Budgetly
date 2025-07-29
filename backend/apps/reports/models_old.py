from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ImportHistory(models.Model):
    """Histórico de importações de arquivos"""
    IMPORT_STATUS = [
        ('pending', 'Pendente'),
        ('processing', 'Processando'),
        ('completed', 'Concluído'),
        ('failed', 'Falhou'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='import_histories')
    filename = models.CharField(max_length=255)
    file_path = models.FileField(upload_to='imports/')
    account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='imports')
    status = models.CharField(max_length=15, choices=IMPORT_STATUS, default='pending')
    total_rows = models.IntegerField(default=0)
    processed_rows = models.IntegerField(default=0)
    successful_imports = models.IntegerField(default=0)
    failed_imports = models.IntegerField(default=0)
    error_log = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Importação {self.filename} - {self.get_status_display()}"

    @property
    def success_rate(self):
        """Taxa de sucesso da importação"""
        if self.processed_rows == 0:
            return 0
        return (self.successful_imports / self.processed_rows) * 100


class ReportTemplate(models.Model):
    """Templates para relatórios personalizados"""
    REPORT_TYPES = [
        ('monthly_summary', 'Resumo Mensal'),
        ('category_analysis', 'Análise por Categoria'),
        ('account_balance', 'Saldo das Contas'),
        ('cash_flow', 'Fluxo de Caixa'),
        ('budget_performance', 'Performance do Orçamento'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='report_templates')
    name = models.CharField(max_length=100)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    description = models.TextField(blank=True)
    filters = models.JSONField(default=dict, help_text="Filtros aplicados ao relatório")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ['user', 'name']

    def __str__(self):
        return self.name
