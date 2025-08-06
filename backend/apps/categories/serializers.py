from rest_framework import serializers
from .models import Category, CostCenter


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'nome', 'descricao', 'cor', 'icone', 'parent',
            'nivel_importancia', 'considerar_dashboard', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')


class CostCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostCenter
        fields = [
            'id', 'nome', 'descricao', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')
