"""
Mixins para views com suporte a workspace
"""
from rest_framework.exceptions import ValidationError


class WorkspaceViewMixin:
    """
    Mixin que adiciona suporte robusto a workspace em views
    """
    
    def get_user_workspace(self):
        """
        Obtém o workspace atual do usuário com fallback
        """
        # Tentar obter workspace do request (setado pelo middleware)
        workspace = getattr(self.request, 'workspace', None)
        
        if workspace:
            return workspace
            
        # Fallback: buscar primeiro workspace ativo do usuário
        from apps.accounts.models import WorkspaceMember
        try:
            workspace_member = WorkspaceMember.objects.filter(
                user=self.request.user,
                is_active=True
            ).first()
            
            if workspace_member:
                return workspace_member.workspace
                
        except Exception as e:
            print(f"❌ Erro ao buscar workspace: {e}")
            
        # Se chegou até aqui, usuário não tem workspace
        raise ValidationError("Usuário não tem acesso a nenhum workspace ativo")
    
    def get_queryset(self):
        """
        Override padrão que filtra por workspace
        """
        try:
            workspace = self.get_user_workspace()
            
            # Tentar obter o modelo da classe serializer
            if hasattr(self, 'serializer_class') and hasattr(self.serializer_class, 'Meta'):
                model = self.serializer_class.Meta.model
            else:
                # Fallback para model definido diretamente na view
                model = getattr(self, 'model', None)
                
            if model:
                # Verificar se o modelo tem campo is_active
                queryset = model.objects.filter(workspace=workspace)
                if hasattr(model, 'is_active'):
                    queryset = queryset.filter(is_active=True)
                return queryset
            else:
                # Se não conseguir determinar o modelo, retorna queryset vazio
                from django.db.models import QuerySet
                return QuerySet().none()
                
        except ValidationError:
            # Retorna queryset vazio se não conseguir determinar workspace
            if hasattr(self, 'serializer_class') and hasattr(self.serializer_class, 'Meta'):
                model = self.serializer_class.Meta.model
                return model.objects.none()
            return None
    
    def perform_create(self, serializer):
        """
        Override padrão que salva com workspace e user
        """
        workspace = self.get_user_workspace()
        serializer.save(
            workspace=workspace,
            user=self.request.user
        )
