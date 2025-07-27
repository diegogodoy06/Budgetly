from rest_framework import serializers
from decimal import Decimal
from .models import Transaction, CreditCardBill, TransactionType
from apps.accounts.serializers import AccountSerializer
from apps.categories.serializers import CategorySerializer, TagSerializer


class TransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    to_account_name = serializers.CharField(source='to_account.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    tags_data = TagSerializer(source='tags', many=True, read_only=True)

    class Meta:
        model = Transaction
        fields = ('id', 'account', 'account_name', 'to_account', 'to_account_name',
                 'transaction_type', 'transaction_type_display', 'amount', 'description',
                 'notes', 'date', 'category', 'category_name', 'tags', 'tags_data',
                 'installments', 'installment_number', 'parent_transaction',
                 'recurrence_type', 'recurrence_end_date', 'is_processed',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'is_processed', 'created_at', 'updated_at')

    def validate(self, attrs):
        account = attrs.get('account')
        to_account = attrs.get('to_account')
        transaction_type = attrs.get('transaction_type')
        
        # Validar se as contas pertencem ao usuário
        user = self.context['request'].user
        if account and account.user != user:
            raise serializers.ValidationError("Conta não pertence ao usuário.")
        
        if to_account and to_account.user != user:
            raise serializers.ValidationError("Conta de destino não pertence ao usuário.")
        
        # Validar transferência
        if transaction_type == TransactionType.TRANSFER:
            if not to_account:
                raise serializers.ValidationError("Conta de destino é obrigatória para transferências.")
            if account == to_account:
                raise serializers.ValidationError("Conta de origem e destino devem ser diferentes.")
        
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        
        # Extrair tags se fornecidas
        tags_data = self.context['request'].data.get('tags', [])
        
        transaction = super().create(validated_data)
        
        # Adicionar tags
        if tags_data:
            transaction.tags.set(tags_data)
        
        # Criar parcelas se necessário
        if transaction.installments > 1:
            transaction.create_installments()
        
        # Criar recorrência se necessário
        if transaction.recurrence_type != 'none':
            transaction.create_recurrence()
        
        return transaction


class TransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer simplificado para criação de transações"""
    class Meta:
        model = Transaction
        fields = ('account', 'to_account', 'transaction_type', 'amount', 'description',
                 'notes', 'date', 'category', 'tags', 'installments',
                 'recurrence_type', 'recurrence_end_date')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CreditCardBillSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    remaining_amount = serializers.ReadOnlyField()

    class Meta:
        model = CreditCardBill
        fields = ('id', 'account', 'account_name', 'month', 'year', 'closing_date',
                 'due_date', 'total_amount', 'paid_amount', 'remaining_amount',
                 'status', 'status_display', 'created_at', 'updated_at')
        read_only_fields = ('id', 'total_amount', 'created_at', 'updated_at')


class PayBillSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    from_account = serializers.IntegerField()

    def validate_from_account(self, value):
        from apps.accounts.models import Account
        user = self.context['request'].user
        try:
            account = Account.objects.get(id=value, user=user)
            return account
        except Account.DoesNotExist:
            raise serializers.ValidationError("Conta não encontrada.")


class TransactionSummarySerializer(serializers.Serializer):
    """Serializer para resumo de transações"""
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    transaction_count = serializers.IntegerField()
