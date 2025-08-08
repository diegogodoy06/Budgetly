from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'nome', 'descricao', 'cor', 'icone', 'parent',
            'nivel_importancia', 'considerar_dashboard', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')
        
    def validate_parent(self, value):
        """Valida que a categoria pai pertence ao mesmo workspace"""
        if value:
            # Obter workspace da view através do contexto
            request = self.context.get('request')
            if hasattr(request, 'workspace') and request.workspace:
                current_workspace = request.workspace
            else:
                # Fallback: buscar workspace do usuário
                from apps.accounts.models import WorkspaceMember
                workspace_member = WorkspaceMember.objects.filter(
                    user=request.user,
                    is_active=True
                ).first()
                if workspace_member:
                    current_workspace = workspace_member.workspace
                else:
                    raise serializers.ValidationError(
                        "Não foi possível determinar o workspace atual"
                    )
            
            if value.workspace != current_workspace:
                raise serializers.ValidationError(
                    "A categoria pai deve pertencer ao mesmo workspace"
                )
        return value
