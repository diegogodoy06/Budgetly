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
        print(f"🔧 WorkspaceViewMixin - User: {self.request.user}")
        print(f"🔧 WorkspaceViewMixin - Is authenticated: {self.request.user.is_authenticated}")
        
        # Check if user is authenticated
        if not self.request.user.is_authenticated:
            raise ValidationError("Usuário não autenticado")
        
        # Tentar obter workspace do request (setado pelo middleware)
        workspace = getattr(self.request, 'workspace', None)
        
        if workspace:
            print(f"🔧 WorkspaceViewMixin - Workspace from middleware: {workspace.id}")
            return workspace
            
        # Try to get workspace from X-Workspace-ID header
        workspace_id = self.request.headers.get('X-Workspace-ID')
        if workspace_id:
            try:
                workspace_id = int(workspace_id)
                from apps.accounts.models import WorkspaceMember
                # Validate that user has access to this workspace
                workspace_member = WorkspaceMember.objects.get(
                    workspace_id=workspace_id,
                    user=self.request.user,
                    is_active=True
                )
                workspace = workspace_member.workspace
                self.request.workspace = workspace  # Cache on request
                print(f"🔧 WorkspaceViewMixin - Workspace from header: {workspace.id}")
                return workspace
            except (ValueError, WorkspaceMember.DoesNotExist) as e:
                print(f"❌ WorkspaceViewMixin - Invalid workspace ID or access denied: {e}")
                raise ValidationError("Acesso negado ao workspace ou workspace não encontrado")
            
        # Fallback: buscar primeiro workspace ativo do usuário
        from apps.accounts.models import WorkspaceMember
        try:
            workspace_member = WorkspaceMember.objects.filter(
                user=self.request.user,
                is_active=True
            ).first()
            
            if workspace_member:
                self.request.workspace = workspace_member.workspace  # Cache on request
                print(f"🔧 WorkspaceViewMixin - Fallback workspace: {workspace_member.workspace.id}")
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
