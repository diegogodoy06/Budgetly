from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Account, CreditCard, CreditCardBrand


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
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Credenciais inválidas.')
            if not user.is_active:
                raise serializers.ValidationError('Conta desativada.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Email e senha são obrigatórios.')


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('id', 'nome', 'tipo', 'banco', 'codigo_banco', 'saldo_inicial', 
                 'saldo_atual', 'eh_conta', 'cor', 'icone', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'saldo_atual', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Define saldo_atual igual ao saldo_inicial na criação
        validated_data['saldo_atual'] = validated_data.get('saldo_inicial', 0)
        return super().create(validated_data)


class AccountBalanceSerializer(serializers.ModelSerializer):
    """Serializer simples para exibir apenas saldos"""
    class Meta:
        model = Account
        fields = ('id', 'nome', 'tipo', 'saldo_atual')
        read_only_fields = fields


class CreditCardSerializer(serializers.ModelSerializer):
    disponivel = serializers.ReadOnlyField()
    percentual_usado = serializers.ReadOnlyField()
    bandeira_display = serializers.CharField(source='get_bandeira_display', read_only=True)

    class Meta:
        model = CreditCard
        fields = ('id', 'nome', 'bandeira', 'bandeira_display', 'ultimos_4_digitos', 
                 'dia_vencimento', 'dia_fechamento', 'limite', 'saldo_atual', 
                 'disponivel', 'percentual_usado', 'cor', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'saldo_atual', 'disponivel', 'percentual_usado', 'created_at', 'updated_at')

    def validate_ultimos_4_digitos(self, value):
        if not value.isdigit() or len(value) != 4:
            raise serializers.ValidationError("Últimos 4 dígitos devem conter exatamente 4 números.")
        return value

    def validate_dia_vencimento(self, value):
        if not 1 <= value <= 31:
            raise serializers.ValidationError("Dia de vencimento deve estar entre 1 e 31.")
        return value

    def validate_dia_fechamento(self, value):
        if not 1 <= value <= 31:
            raise serializers.ValidationError("Dia de fechamento deve estar entre 1 e 31.")
        return value

    def validate_limite(self, value):
        if value <= 0:
            raise serializers.ValidationError("Limite deve ser maior que zero.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CreditCardBalanceSerializer(serializers.ModelSerializer):
    """Serializer simples para exibir apenas saldos de cartões"""
    disponivel = serializers.ReadOnlyField()
    
    class Meta:
        model = CreditCard
        fields = ('id', 'nome', 'bandeira', 'saldo_atual', 'limite', 'disponivel')
        read_only_fields = fields
