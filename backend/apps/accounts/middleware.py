"""
Middleware para gerenciar workspace context em todas as requisições
"""
from django.http import HttpResponseBadRequest
from django.utils.deprecation import MiddlewareMixin
from apps.accounts.models import Workspace, WorkspaceMember


class WorkspaceMiddleware(MiddlewareMixin):
    """
    Middleware que adiciona workspace context às requisições autenticadas
    NOTA: Para API DRF, a autenticação acontece na view, não no middleware
    """
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Processa o cabeçalho X-Workspace-ID - para API DRF isso será feito nas views
        """
        # Inicializar workspace como None
        request.workspace = None
        request.workspace_id = None
        
        print(f"🔧 Middleware process_view para: {request.path}")
        print(f"🔧 Usuário Django middleware: {getattr(request, 'user', None)}")
        print(f"🔧 Headers X-Workspace-ID: {request.headers.get('X-Workspace-ID')}")
        
        # Para requests de API DRF, deixar as views processarem workspace
        if request.path.startswith('/api/'):
            print("🔧 API request - workspace será processado nas views DRF")
            return None
        
        # Para outras requests (admin, etc), processar workspace aqui
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            print("🔧 Usuário não autenticado, pulando middleware")
            return None
            
        # Endpoints que não precisam de workspace
        workspace_exempt_paths = [
            '/api/accounts/login/',
            '/api/accounts/register/',
            '/api/accounts/logout/',
            '/api/accounts/profile/',
            '/api/accounts/workspaces/',  # Para listar/criar workspaces
            '/api/accounts/workspaces',   # Variação sem barra final
        ]
        
        # Verificar se é endpoint isento
        if any(request.path.startswith(path) for path in workspace_exempt_paths):
            print("🔧 Endpoint isento de workspace")
            return None
            
        # Obter workspace ID do cabeçalho
        workspace_id = request.headers.get('X-Workspace-ID')
        
        if not workspace_id:
            # Para endpoints que precisam de workspace, apenas logar warning 
            # As views terão fallback para determinar workspace
            if request.path.startswith('/api/'):
                print("⚠️ X-Workspace-ID header não fornecido - views usarão fallback")
            return None
            
        try:
            workspace_id = int(workspace_id)
        except (ValueError, TypeError):
            print("❌ Formato inválido de X-Workspace-ID")
            return HttpResponseBadRequest('Invalid X-Workspace-ID format')
            
        # Verificar se o usuário tem acesso ao workspace
        try:
            workspace_member = WorkspaceMember.objects.get(
                workspace_id=workspace_id,
                user=request.user,
                is_active=True
            )
            request.workspace = workspace_member.workspace
            request.workspace_id = workspace_id
            
            print(f"✅ Workspace middleware: User {request.user.id} accessing workspace {workspace_id}")
            
        except WorkspaceMember.DoesNotExist:
            print("❌ Acesso negado ao workspace")
            return HttpResponseBadRequest('Access denied to workspace or workspace not found')
            
        return None
