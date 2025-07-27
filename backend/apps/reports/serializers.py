from rest_framework import serializers
from .models import ImportHistory, ReportTemplate


class ImportHistorySerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    success_rate = serializers.ReadOnlyField()

    class Meta:
        model = ImportHistory
        fields = ('id', 'filename', 'account', 'account_name', 'status', 'status_display',
                 'total_rows', 'processed_rows', 'successful_imports', 'failed_imports',
                 'success_rate', 'error_log', 'created_at', 'completed_at')
        read_only_fields = ('id', 'processed_rows', 'successful_imports', 'failed_imports',
                           'error_log', 'created_at', 'completed_at')


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    account = serializers.IntegerField()

    def validate_account(self, value):
        from apps.accounts.models import Account
        user = self.context['request'].user
        try:
            account = Account.objects.get(id=value, user=user)
            return account
        except Account.DoesNotExist:
            raise serializers.ValidationError("Conta não encontrada.")


class ReportTemplateSerializer(serializers.ModelSerializer):
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)

    class Meta:
        model = ReportTemplate
        fields = ('id', 'name', 'report_type', 'report_type_display', 'description',
                 'filters', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DashboardDataSerializer(serializers.Serializer):
    """Serializer para dados do dashboard"""
    total_accounts = serializers.IntegerField()
    total_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_bills = serializers.IntegerField()
    active_budgets = serializers.IntegerField()


class AccountBalanceChartSerializer(serializers.Serializer):
    """Serializer para gráfico de saldos das contas"""
    account_name = serializers.CharField()
    balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    account_type = serializers.CharField()


class CategoryExpenseChartSerializer(serializers.Serializer):
    """Serializer para gráfico de gastos por categoria"""
    category_name = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class MonthlyTrendSerializer(serializers.Serializer):
    """Serializer para tendência mensal"""
    month = serializers.CharField()
    income = serializers.DecimalField(max_digits=12, decimal_places=2)
    expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    net = serializers.DecimalField(max_digits=12, decimal_places=2)
