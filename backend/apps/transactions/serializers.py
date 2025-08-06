from rest_framework import serializers
from .models import Transaction, CreditCardInvoice


class TransactionSerializer(serializers.ModelSerializer):
    valor_formatado = serializers.SerializerMethodField()
    account_name = serializers.CharField(source='account.nome', read_only=True)
    to_account_name = serializers.CharField(source='to_account.nome', read_only=True)
    credit_card_name = serializers.CharField(source='credit_card.nome', read_only=True)
    category_name = serializers.CharField(source='category.nome', read_only=True)
    beneficiario_name = serializers.CharField(source='beneficiario.nome', read_only=True)
    tipo_pagamento = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'tipo', 'valor', 'valor_formatado', 'descricao',
            'data', 'account', 'account_name', 'to_account', 'to_account_name', 
            'credit_card', 'credit_card_name', 'category', 'category_name', 
            'beneficiario', 'beneficiario_name', 'total_parcelas', 'numero_parcela',
            'tipo_recorrencia', 'data_fim_recorrencia', 'confirmada', 'tipo_pagamento',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'valor_formatado', 'tipo_pagamento')

    def get_valor_formatado(self, obj):
        return f"R$ {obj.valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    
    def get_tipo_pagamento(self, obj):
        """Retorna o tipo de pagamento (conta ou cartão)"""
        if obj.credit_card:
            return 'cartao'
        elif obj.account:
            return 'conta'
        return None

    def validate(self, data):
        """Validações customizadas com regras de negócio"""
        tipo = data.get('tipo')
        
        # Validações específicas por tipo de transação
        if tipo == 'transferencia':
            if not data.get('account') or not data.get('to_account'):
                raise serializers.ValidationError(
                    "Transferências devem ter conta de origem e destino."
                )
            if data.get('account') == data.get('to_account'):
                raise serializers.ValidationError(
                    "Conta de origem e destino não podem ser iguais."
                )
            if data.get('credit_card'):
                raise serializers.ValidationError(
                    "Transferências não podem usar cartão de crédito."
                )
            # Transferências não devem ter beneficiário especificado (será criado automaticamente)
            if data.get('beneficiario'):
                raise serializers.ValidationError(
                    "Transferências não permitem seleção manual de beneficiário."
                )
        else:
            # Para entrada/saída, deve ter account OU credit_card (não ambos)
            if not data.get('account') and not data.get('credit_card'):
                raise serializers.ValidationError(
                    "Deve ser especificada uma conta ou cartão de crédito."
                )
            if data.get('account') and data.get('credit_card'):
                raise serializers.ValidationError(
                    "Não é possível especificar conta e cartão de crédito ao mesmo tempo."
                )
            
            # Para entrada/saída, beneficiário será sempre a conta/cartão usado
            # Se foi especificado um beneficiário diferente, ignorar (será sobrescrito)
            if data.get('beneficiario'):
                # Avisar que o beneficiário será ignorado
                pass  # O beneficiário será automaticamente definido pela conta/cartão
        
        # Parcelamento só para cartão de crédito
        total_parcelas = data.get('total_parcelas', 1)
        if total_parcelas > 1 and not data.get('credit_card'):
            raise serializers.ValidationError(
                "Parcelamento só é permitido para transações de cartão de crédito."
            )
            
        return data


class CreditCardInvoiceSerializer(serializers.ModelSerializer):
    """Serializer para faturas de cartão de crédito"""
    valor_total_formatado = serializers.ReadOnlyField()
    valor_restante = serializers.ReadOnlyField()
    credit_card_name = serializers.CharField(source='credit_card.nome', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_current_month = serializers.ReadOnlyField()
    days_to_close = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    can_add_transactions = serializers.ReadOnlyField()
    
    class Meta:
        model = CreditCardInvoice
        fields = [
            'id', 'credit_card', 'credit_card_name', 'mes', 'ano',
            'data_fechamento', 'data_vencimento', 'valor_total', 'valor_total_formatado',
            'valor_pago', 'valor_restante', 'status', 'status_display',
            'is_current_month', 'days_to_close', 'is_overdue', 'can_add_transactions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')
        
    def validate(self, data):
        """Validações para fatura"""
        # Validar se já existe fatura para o mesmo cartão/período
        credit_card = data.get('credit_card')
        mes = data.get('mes')
        ano = data.get('ano')
        
        if credit_card and mes and ano:
            existing = CreditCardInvoice.objects.filter(
                credit_card=credit_card,
                mes=mes,
                ano=ano
            )
            
            # Se está editando, excluir a própria instância da verificação
            if self.instance:
                existing = existing.exclude(id=self.instance.id)
                
            if existing.exists():
                raise serializers.ValidationError(
                    f"Já existe uma fatura para {credit_card.nome} em {mes:02d}/{ano}"
                )
                
        return data
