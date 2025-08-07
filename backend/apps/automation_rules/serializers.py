"""
Serializers for automation rules
"""
from rest_framework import serializers
from .models import AutomationRule, RuleCondition, RuleAction, RuleApplicationLog


class RuleConditionSerializer(serializers.ModelSerializer):
    """Serializer for rule conditions"""
    condition_value = serializers.CharField(source='get_condition_value', read_only=True)
    condition_type_display = serializers.CharField(source='get_condition_type_display', read_only=True)

    class Meta:
        model = RuleCondition
        fields = [
            'id', 'condition_type', 'condition_type_display', 'text_value',
            'numeric_value', 'numeric_value_max', 'boolean_value',
            'case_sensitive', 'condition_value', 'created_at'
        ]


class RuleActionSerializer(serializers.ModelSerializer):
    """Serializer for rule actions"""
    action_value = serializers.CharField(source='get_action_value', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    category_name = serializers.CharField(source='category.nome', read_only=True)
    beneficiary_name = serializers.CharField(source='beneficiary.nome', read_only=True)
    tag_name = serializers.CharField(source='tag.nome', read_only=True)

    class Meta:
        model = RuleAction
        fields = [
            'id', 'action_type', 'action_type_display', 'category', 'category_name',
            'beneficiary', 'beneficiary_name', 'tag', 'tag_name', 'text_value',
            'overwrite_existing', 'action_value', 'created_at'
        ]


class AutomationRuleSerializer(serializers.ModelSerializer):
    """Serializer for automation rules"""
    conditions = RuleConditionSerializer(many=True, read_only=True)
    actions = RuleActionSerializer(many=True, read_only=True)
    rule_type_display = serializers.CharField(source='get_rule_type_display', read_only=True)

    class Meta:
        model = AutomationRule
        fields = [
            'id', 'name', 'description', 'rule_type', 'rule_type_display',
            'is_active', 'priority', 'times_applied', 'last_applied_at',
            'conditions', 'actions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['times_applied', 'last_applied_at']


class AutomationRuleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating automation rules with nested conditions and actions"""
    conditions = RuleConditionSerializer(many=True)
    actions = RuleActionSerializer(many=True)

    class Meta:
        model = AutomationRule
        fields = [
            'name', 'description', 'rule_type', 'is_active', 'priority',
            'conditions', 'actions'
        ]

    def create(self, validated_data):
        conditions_data = validated_data.pop('conditions', [])
        actions_data = validated_data.pop('actions', [])
        
        # Create the rule
        rule = AutomationRule.objects.create(**validated_data)
        
        # Create conditions
        for condition_data in conditions_data:
            RuleCondition.objects.create(rule=rule, **condition_data)
        
        # Create actions
        for action_data in actions_data:
            RuleAction.objects.create(rule=rule, **action_data)
        
        return rule


class RuleApplicationLogSerializer(serializers.ModelSerializer):
    """Serializer for rule application logs"""
    rule_name = serializers.CharField(source='rule.name', read_only=True)
    transaction_description = serializers.CharField(source='transaction.descricao', read_only=True)
    transaction_amount = serializers.DecimalField(source='transaction.valor', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = RuleApplicationLog
        fields = [
            'id', 'rule_name', 'transaction_description', 'transaction_amount',
            'applied_at', 'actions_applied'
        ]


class RuleTestRequestSerializer(serializers.Serializer):
    """Serializer for testing rules against transactions"""
    transaction_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="IDs das transações para testar (deixe vazio para testar contra todas)"
    )
    rule_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="IDs das regras para testar (deixe vazio para testar todas)"
    )
    apply_rules = serializers.BooleanField(
        default=False,
        help_text="Se verdadeiro, aplica as regras. Se falso, apenas simula."
    )


class RuleTestResultSerializer(serializers.Serializer):
    """Serializer for rule test results"""
    transaction_id = serializers.IntegerField()
    transaction_description = serializers.CharField()
    matched_rules = serializers.ListField(child=serializers.DictField())
    applied_actions = serializers.ListField(child=serializers.DictField())
    would_apply_actions = serializers.ListField(child=serializers.DictField())