from rest_framework import serializers
from .models import Category, Tag


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'color', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'created_at')
        read_only_fields = ('id', 'created_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CategoryWithTransactionCountSerializer(serializers.ModelSerializer):
    transaction_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'color', 'transaction_count')

    def get_transaction_count(self, obj):
        return obj.transactions.count()
