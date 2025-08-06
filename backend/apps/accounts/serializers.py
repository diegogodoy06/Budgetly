from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db.models import Sum, Q
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from drf_spectacular.utils import extend_schema_field
from decimal import Decimal
from .models import User, Account, CreditCard


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'avatar', 'full_name', 'date_joined')
        read_only_fields = ('id', 'username', 'date_joined')

    @extend_schema_field(serializers.CharField)
    def get_full_name(self, obj) -> str:
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer JWT customizado que retorna informações do usuário"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Adicionar informações do usuário ao response
        data['user'] = UserSerializer(self.user).data
        
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para mudança de senha"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    
    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Nova senha deve ter pelo menos 8 caracteres")
        return value


class AccountSerializer(serializers.ModelSerializer):
    saldo_formatado = serializers.SerializerMethodField()
    saldo_atual = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = [
            'id', 'nome', 'tipo', 'banco', 'codigo_banco',
            'saldo_inicial', 'saldo_atual', 'saldo_formatado',
            'eh_conta', 'cor', 'icone', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'saldo_formatado', 'saldo_atual')

    @extend_schema_field(serializers.CharField)
    def get_saldo_atual(self, obj) -> str:
        """Calcula o saldo atual baseado nas transações confirmadas usando agregação otimizada"""
        from apps.transactions.models import Transaction
        from decimal import Decimal
        
        # Usando uma única query com agregação condicional para melhor performance
        # Excluindo transações de "Saldo Inicial" para evitar duplicação
        resultado = Transaction.objects.filter(
            Q(account=obj) | Q(to_account=obj),
            confirmada=True
        ).exclude(
            # Excluir transações de saldo inicial para evitar contabilização dupla
            descricao__icontains='saldo inicial'
        ).aggregate(
            # Entradas na conta
            entradas=Sum('valor', filter=Q(account=obj, tipo='entrada')),
            # Saídas da conta
            saidas=Sum('valor', filter=Q(account=obj, tipo='saida')),
            # Transferências recebidas
            transferencias_recebidas=Sum('valor', filter=Q(to_account=obj, tipo='transferencia')),
            # Transferências enviadas
            transferencias_enviadas=Sum('valor', filter=Q(account=obj, tipo='transferencia'))
        )
        
        entradas = resultado['entradas'] or Decimal('0')
        saidas = resultado['saidas'] or Decimal('0')
        transferencias_recebidas = resultado['transferencias_recebidas'] or Decimal('0')
        transferencias_enviadas = resultado['transferencias_enviadas'] or Decimal('0')
        
        # Cálculo final: saldo inicial + entradas - saídas + transferências recebidas - transferências enviadas
        saldo_calculado = (
            obj.saldo_inicial + 
            entradas - saidas + 
            transferencias_recebidas - transferencias_enviadas
        )
        
        return str(saldo_calculado)

    @extend_schema_field(serializers.CharField)
    def get_saldo_formatado(self, obj) -> str:
        from decimal import Decimal
        saldo_atual = Decimal(self.get_saldo_atual(obj))
        return f"R$ {saldo_atual:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

    def create(self, validated_data):
        """Cria a conta e, se houver saldo inicial, cria a transação automática"""
        account = super().create(validated_data)
        
        # Se há saldo inicial diferente de zero, criar transação automática
        saldo_inicial = validated_data.get('saldo_inicial', 0)
        if saldo_inicial != 0:
            self._criar_transacao_saldo_inicial(account, saldo_inicial)
        
        return account

    def _criar_transacao_saldo_inicial(self, account, valor):
        """Cria transação automática para o saldo inicial"""
        from apps.transactions.models import Transaction
        from apps.categories.models import Category
        from decimal import Decimal
        
        # Determinar tipo da transação baseado no valor
        if valor > 0:
            tipo = 'entrada'
            descricao = f'Saldo inicial da conta {account.nome}'
        else:
            tipo = 'saida'
            descricao = f'Saldo inicial negativo da conta {account.nome}'
            valor = abs(valor)  # Converter para positivo pois Transaction.valor é sempre positivo
        
        # Buscar ou criar categoria "Saldo Inicial"
        categoria, created = Category.objects.get_or_create(
            workspace=account.workspace,
            nome='Saldo Inicial',
            defaults={
                'user': account.user,
                'cor': '#10B981',  # Verde
                'icone': 'bank',
                'descricao': 'Categoria para saldos iniciais das contas'
            }
        )
        
        # Criar a transação
        Transaction.objects.create(
            workspace=account.workspace,
            user=account.user,
            account=account,
            tipo=tipo,
            valor=Decimal(str(valor)),
            descricao=descricao,
            data=account.created_at.date(),
            category=categoria,
            confirmada=True,  # Saldo inicial sempre confirmado
            total_parcelas=1
        )

    def update(self, instance, validated_data):
        """Atualiza a conta, mas remove saldo_inicial dos dados editáveis"""
        # Remover saldo_inicial dos dados de atualização para torná-lo não editável
        validated_data.pop('saldo_inicial', None)
        return super().update(instance, validated_data)


class AccountBalanceSerializer(serializers.Serializer):
    """Serializer para atualização de saldo"""
    saldo_atual = serializers.DecimalField(max_digits=12, decimal_places=2)


class CreditCardSerializer(serializers.ModelSerializer):
    disponivel = serializers.SerializerMethodField()
    percentual_usado = serializers.SerializerMethodField()
    limite_formatado = serializers.SerializerMethodField()
    saldo_formatado = serializers.SerializerMethodField()
    saldo_atual = serializers.SerializerMethodField()

    class Meta:
        model = CreditCard
        fields = [
            'id', 'nome', 'bandeira', 'ultimos_4_digitos',
            'dia_vencimento', 'dia_fechamento', 'limite', 'limite_formatado',
            'saldo_atual', 'saldo_formatado', 'disponivel', 'percentual_usado',
            'cor', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'disponivel', 'percentual_usado', 'saldo_atual')

    @extend_schema_field(serializers.CharField)
    def get_saldo_atual(self, obj) -> str:
        """Calcula o saldo atual do cartão baseado nas transações de saída confirmadas usando agregação otimizada"""
        from apps.transactions.models import Transaction
        from decimal import Decimal
        
        # Para cartões de crédito, só contamos as saídas (gastos) usando uma query otimizada
        resultado = Transaction.objects.filter(
            credit_card=obj,
            tipo='saida',
            confirmada=True
        ).aggregate(total=Sum('valor'))
        
        gastos = resultado['total'] or Decimal('0')
        return str(gastos)

    @extend_schema_field(serializers.DecimalField(max_digits=12, decimal_places=2))
    def get_disponivel(self, obj) -> Decimal:
        """Retorna o valor disponível no cartão"""
        from decimal import Decimal
        saldo_atual = Decimal(self.get_saldo_atual(obj))
        return obj.limite - saldo_atual

    @extend_schema_field(serializers.FloatField)
    def get_percentual_usado(self, obj) -> float:
        """Retorna o percentual do limite usado"""
        if obj.limite > 0:
            from decimal import Decimal
            saldo_atual = Decimal(self.get_saldo_atual(obj))
            return float((saldo_atual / obj.limite) * 100)
        return 0

    @extend_schema_field(serializers.CharField)
    def get_limite_formatado(self, obj) -> str:
        return f"R$ {obj.limite:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

    @extend_schema_field(serializers.CharField)
    def get_saldo_formatado(self, obj) -> str:
        from decimal import Decimal
        saldo_atual = Decimal(self.get_saldo_atual(obj))
        return f"R$ {saldo_atual:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')


class CreditCardBalanceSerializer(serializers.Serializer):
    """Serializer para atualização de saldo do cartão"""
    saldo_atual = serializers.DecimalField(max_digits=12, decimal_places=2)

    def validate_saldo_atual(self, value):
        if value < 0:
            raise serializers.ValidationError("O saldo não pode ser negativo.")
        return value
