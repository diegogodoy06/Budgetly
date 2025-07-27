from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Account, AccountType


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
    available_credit = serializers.ReadOnlyField()
    account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)

    class Meta:
        model = Account
        fields = ('id', 'name', 'account_type', 'account_type_display', 'initial_balance', 
                 'current_balance', 'credit_limit', 'closing_day', 'due_day', 
                 'available_credit', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'current_balance', 'created_at', 'updated_at')

    def validate(self, attrs):
        account_type = attrs.get('account_type')
        
        if account_type == AccountType.CREDIT_CARD:
            if not attrs.get('credit_limit'):
                raise serializers.ValidationError("Limite de crédito é obrigatório para cartões de crédito.")
            if not attrs.get('closing_day') or not attrs.get('due_day'):
                raise serializers.ValidationError("Dia de fechamento e vencimento são obrigatórios para cartões de crédito.")
        
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AccountBalanceSerializer(serializers.ModelSerializer):
    """Serializer simples para exibir apenas saldos"""
    class Meta:
        model = Account
        fields = ('id', 'name', 'account_type', 'current_balance', 'available_credit')
        read_only_fields = fields
