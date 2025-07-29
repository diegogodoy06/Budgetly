from rest_framework import serializers
from apps.categories.models import Category, Tag
from .models import Transaction, CreditCardInvoice, TransactionType


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.nome', read_only=True)
    account_name = serializers.CharField(source='account.nome', read_only=True)
    to_account_name = serializers.CharField(source='to_account.nome', read_only=True)
    tags_list = serializers.StringRelatedField(source='tags', many=True, read_only=True)
    valor_formatado = serializers.CharField(read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'account', 'to_account', 'credit_card',
            'tipo', 'valor', 'valor_formatado', 'descricao', 'observacoes', 'data',
            'category', 'category_name', 'cost_center', 'tags', 'tags_list',
            'total_parcelas', 'numero_parcela', 'transacao_pai',
            'tipo_recorrencia', 'data_fim_recorrencia',
            'confirmada', 'created_at', 'updated_at',
            'account_name', 'to_account_name'
        ]
        read_only_fields = ('user', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        tags = validated_data.pop('tags', [])
        
        transaction = Transaction.objects.create(**validated_data)
        if tags:
            transaction.tags.set(tags)
        
        # Criar parcelas se necessário
        if transaction.total_parcelas > 1:
            self._criar_parcelas(transaction)
        
        return transaction

    def _criar_parcelas(self, transaction):
        """Cria as parcelas restantes da transação"""
        from datetime import date
        from dateutil.relativedelta import relativedelta
        
        for i in range(2, transaction.total_parcelas + 1):
            # Calcula a data da próxima parcela (mês seguinte)
            nova_data = transaction.data + relativedelta(months=i-1)
            
            Transaction.objects.create(
                user=transaction.user,
                account=transaction.account,
                to_account=transaction.to_account,
                credit_card=transaction.credit_card,
                tipo=transaction.tipo,
                valor=transaction.valor,
                descricao=f"{transaction.descricao} ({i}/{transaction.total_parcelas})",
                observacoes=transaction.observacoes,
                data=nova_data,
                category=transaction.category,
                cost_center=transaction.cost_center,
                total_parcelas=transaction.total_parcelas,
                numero_parcela=i,
                transacao_pai=transaction,
                tipo_recorrencia=transaction.tipo_recorrencia,
                data_fim_recorrencia=transaction.data_fim_recorrencia,
                confirmada=transaction.confirmada
            )


class CreditCardInvoiceSerializer(serializers.ModelSerializer):
    credit_card_name = serializers.CharField(source='credit_card.nome', read_only=True)
    valor_total_formatado = serializers.CharField(read_only=True)
    valor_restante = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = CreditCardInvoice
        fields = [
            'id', 'credit_card', 'credit_card_name', 'mes', 'ano',
            'data_fechamento', 'data_vencimento', 'valor_total', 'valor_total_formatado',
            'valor_pago', 'valor_restante', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'valor_total')


class PayInvoiceSerializer(serializers.Serializer):
    """Serializer para pagamento de fatura"""
    valor = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0.01)
    conta_origem = serializers.IntegerField()
    
    def validate_conta_origem(self, value):
        """Valida se a conta de origem existe e pertence ao usuário"""
        from apps.accounts.models import Account
        
        try:
            account = Account.objects.get(id=value, user=self.context['request'].user)
            return value
        except Account.DoesNotExist:
            raise serializers.ValidationError("Conta de origem não encontrada.")


class CreateInvoiceSerializer(serializers.Serializer):
    """Serializer para criação de fatura"""
    mes = serializers.IntegerField(min_value=1, max_value=12)
    ano = serializers.IntegerField(min_value=2020, max_value=2030)
    
    def validate(self, data):
        """Valida se não existe fatura para o período"""
        credit_card_id = self.context.get('credit_card_id')
        
        if CreditCardInvoice.objects.filter(
            credit_card_id=credit_card_id,
            mes=data['mes'],
            ano=data['ano']
        ).exists():
            raise serializers.ValidationError(
                "Já existe uma fatura para este período."
            )
        
        return data


class TransactionFilterSerializer(serializers.Serializer):
    """Serializer para filtros de transação"""
    data_inicio = serializers.DateField(required=False)
    data_fim = serializers.DateField(required=False)
    tipo = serializers.ChoiceField(choices=TransactionType.choices, required=False)
    category = serializers.IntegerField(required=False)
    account = serializers.IntegerField(required=False)
    valor_min = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    valor_max = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    confirmada = serializers.BooleanField(required=False)
