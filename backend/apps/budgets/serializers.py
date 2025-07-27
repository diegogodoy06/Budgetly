from rest_framework import serializers
from .models import Budget, BudgetAlert


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    remaining_amount = serializers.ReadOnlyField()
    percentage_used = serializers.ReadOnlyField()
    is_over_budget = serializers.ReadOnlyField()

    class Meta:
        model = Budget
        fields = ('id', 'category', 'category_name', 'month', 'year', 'planned_amount',
                 'spent_amount', 'remaining_amount', 'percentage_used', 'is_over_budget',
                 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'spent_amount', 'created_at', 'updated_at')

    def validate(self, attrs):
        user = self.context['request'].user
        category = attrs.get('category')
        
        if category and category.user != user:
            raise serializers.ValidationError("Categoria não pertence ao usuário.")
        
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetAlertSerializer(serializers.ModelSerializer):
    budget_info = serializers.SerializerMethodField()

    class Meta:
        model = BudgetAlert
        fields = ('id', 'budget', 'budget_info', 'alert_type', 'message', 'is_read', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_budget_info(self, obj):
        return {
            'category_name': obj.budget.category.name,
            'month': obj.budget.month,
            'year': obj.budget.year,
            'planned_amount': obj.budget.planned_amount,
            'spent_amount': obj.budget.spent_amount
        }


class BudgetSummarySerializer(serializers.Serializer):
    """Serializer para resumo de orçamentos"""
    total_planned = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_remaining = serializers.DecimalField(max_digits=12, decimal_places=2)
    budgets_count = serializers.IntegerField()
    over_budget_count = serializers.IntegerField()
