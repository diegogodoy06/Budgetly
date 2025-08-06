from rest_framework import serializers
from .models import Budget, BudgetCategory, BudgetAlert


class BudgetCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.nome', read_only=True)
    valor_restante = serializers.ReadOnlyField()
    percentual_usado = serializers.ReadOnlyField()
    is_excedido = serializers.ReadOnlyField()

    class Meta:
        model = BudgetCategory
        fields = ('id', 'category', 'category_name', 'valor_planejado', 'valor_gasto',
                 'valor_restante', 'percentual_usado', 'is_excedido', 'created_at', 'updated_at')
        read_only_fields = ('id', 'valor_gasto', 'created_at', 'updated_at')


class BudgetSerializer(serializers.ModelSerializer):
    categorias = BudgetCategorySerializer(many=True, read_only=True)
    valor_restante = serializers.ReadOnlyField()
    percentual_usado = serializers.ReadOnlyField()
    is_excedido = serializers.ReadOnlyField()
    valor_planejado_formatado = serializers.ReadOnlyField()
    valor_gasto_formatado = serializers.ReadOnlyField()

    class Meta:
        model = Budget
        fields = ('id', 'nome', 'descricao', 'tipo', 'mes', 'ano', 'data_inicio', 'data_fim',
                 'valor_planejado', 'valor_gasto', 'valor_restante', 'percentual_usado', 
                 'is_excedido', 'valor_planejado_formatado', 'valor_gasto_formatado',
                 'categorias', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'valor_gasto', 'created_at', 'updated_at')

    def validate(self, attrs):
        user = self.context['request'].user
        workspace = self.context.get('workspace')
        
        if not workspace:
            raise serializers.ValidationError("Workspace é obrigatório.")
        
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['workspace'] = self.context['workspace']
        return super().create(validated_data)


class BudgetAlertSerializer(serializers.ModelSerializer):
    budget_category_info = serializers.SerializerMethodField()

    class Meta:
        model = BudgetAlert
        fields = ('id', 'budget_category', 'budget_category_info', 'tipo_alerta', 'valor_limite', 
                 'ativo', 'notificado', 'created_at', 'updated_at')
        read_only_fields = ('id', 'notificado', 'created_at', 'updated_at')

    def get_budget_category_info(self, obj):
        return {
            'budget_name': obj.budget_category.budget.nome,
            'category_name': obj.budget_category.category.nome,
            'mes': obj.budget_category.budget.mes,
            'ano': obj.budget_category.budget.ano,
            'valor_planejado': obj.budget_category.valor_planejado,
            'valor_gasto': obj.budget_category.valor_gasto
        }


class BudgetSummarySerializer(serializers.Serializer):
    """Serializer para resumo de orçamentos"""
    total_planejado = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_gasto = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_restante = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_budgets = serializers.IntegerField()
    budgets_excedidos = serializers.IntegerField()
