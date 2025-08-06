from rest_framework import serializers
from .models import Beneficiary


class BeneficiarySerializer(serializers.ModelSerializer):
    """Serializer para beneficiários"""
    
    class Meta:
        model = Beneficiary
        fields = [
            'id', 'nome', 'is_system', 'is_active', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'is_system', 'created_at', 'updated_at')

    def validate_nome(self, value):
        """Validar nome do beneficiário"""
        if not value or not value.strip():
            raise serializers.ValidationError("Nome do beneficiário é obrigatório.")
        
        # Normalizar nome
        nome_normalizado = ' '.join(value.strip().split())
        
        if len(nome_normalizado) < 2:
            raise serializers.ValidationError("Nome deve ter pelo menos 2 caracteres.")
        
        return nome_normalizado


class BeneficiaryCreateSerializer(BeneficiarySerializer):
    """Serializer para criação de beneficiários"""
    
    def validate(self, attrs):
        """Validação customizada para criação"""
        # Verificar se já existe beneficiário com mesmo nome no workspace
        # (isso será verificado no view level com workspace context)
        return attrs
