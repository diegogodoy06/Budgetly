import { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusIcon, 
  UserGroupIcon, 
  CogIcon, 
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { ManageMembersModal } from '../components/ManageMembersModal';
import { EditWorkspaceModal } from '../components/EditWorkspaceModal';
import { Workspace } from '../types/workspace';

export default function WorkspacesPage() {
  console.log('🔄 WorkspacesPage: Inicializando componente');
  
  const { user } = useAuth();
  const { 
    workspaces, 
    currentWorkspace, 
    loading, 
    error,
    setCurrentWorkspace,
    deleteWorkspace,
    hasPermission
  } = useWorkspace();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  console.log('🔍 WorkspacesPage: Estado atual', {
    user: !!user,
    workspacesCount: workspaces?.length || 0,
    currentWorkspace: currentWorkspace?.nome || 'nenhum',
    loading,
    error
  });

  // Remover useEffect desnecessário que estava causando loop infinito
  // O WorkspaceContext já carrega os workspaces automaticamente

  const handleSelectWorkspace = (workspace: Workspace) => {
    try {
      console.log('🎯 Selecionando workspace:', workspace);
      setCurrentWorkspace(workspace);
    } catch (error) {
      console.error('❌ Erro ao selecionar workspace:', error);
    }
  };

  const handleDeleteWorkspace = async (workspace: Workspace) => {
    if (window.confirm(`Tem certeza que deseja excluir o workspace "${workspace.nome}"?`)) {
      try {
        await deleteWorkspace(workspace.id);
      } catch (error) {
        console.error('❌ Erro ao excluir workspace:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <CogIcon className="h-4 w-4" />;
      case 'editor':
        return <PencilIcon className="h-4 w-4" />;
      case 'viewer':
        return <EyeIcon className="h-4 w-4" />;
      default:
        return <EyeIcon className="h-4 w-4" />;
    }
  };

  console.log('🎨 WorkspacesPage: Renderizando página');

  if (loading && workspaces.length === 0) {
    console.log('⏳ WorkspacesPage: Exibindo loading');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando workspaces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('❌ WorkspacesPage: Exibindo erro:', error);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar workspaces</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ WorkspacesPage: Renderizando conteúdo principal');

  return (
    <div className="space-y-6">
      {/* Debug info - remover em produção */}
      <div className="bg-gray-100 rounded p-2 text-xs text-gray-600">
        Debug: {workspaces?.length || 0} workspaces, loading: {loading ? 'sim' : 'não'}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Workspaces</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus espaços de trabalho financeiros
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Workspace
        </button>
      </div>

      {/* Workspace Atual */}
      {currentWorkspace && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h2 className="text-lg font-semibold text-blue-900">
                  {currentWorkspace.nome}
                </h2>
                <p className="text-sm text-blue-700">Workspace Ativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getRoleColor(currentWorkspace.user_role || 'viewer')}`}>
                {getRoleIcon(currentWorkspace.user_role || 'viewer')}
                <span className="ml-1">{currentWorkspace.user_role === 'admin' ? 'Administrador' : currentWorkspace.user_role === 'editor' ? 'Editor' : 'Visualizador'}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Workspaces */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Todos os Workspaces</h3>
        </div>
        
        {workspaces.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum workspace</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando seu primeiro workspace.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Novo Workspace
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  currentWorkspace?.id === workspace.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {workspace.nome}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {workspace.descricao || 'Sem descrição'}
                        </p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <span>Criado por: {workspace.criado_por_nome}</span>
                          <span>•</span>
                          <span>{workspace.membros_count} membros</span>
                          <span>•</span>
                          <span>Criado em {formatDate(workspace.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Papel do usuário */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getRoleColor(workspace.user_role || 'viewer')}`}>
                      {getRoleIcon(workspace.user_role || 'viewer')}
                      <span className="ml-1">
                        {workspace.user_role === 'admin' ? 'Admin' : 
                         workspace.user_role === 'editor' ? 'Editor' : 'Viewer'}
                      </span>
                    </span>

                    {/* Botões de ação */}
                    <div className="flex items-center space-x-1">
                      {/* Selecionar workspace */}
                      {currentWorkspace?.id !== workspace.id && (
                        <button
                          onClick={() => handleSelectWorkspace(workspace)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Selecionar workspace"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      )}

                      {/* Convidar membro */}
                      {hasPermission(workspace, 'editor') && (
                        <button
                          onClick={() => {
                            setSelectedWorkspace(workspace);
                            setShowInviteModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Convidar membro"
                        >
                          <UserPlusIcon className="h-5 w-5" />
                        </button>
                      )}

                      {/* Gerenciar membros */}
                      <button
                        onClick={() => {
                          setSelectedWorkspace(workspace);
                          setShowMembersModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Gerenciar membros"
                      >
                        <UserGroupIcon className="h-5 w-5" />
                      </button>

                      {/* Editar workspace */}
                      {hasPermission(workspace, 'admin') && (
                        <button
                          onClick={() => {
                            setSelectedWorkspace(workspace);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Editar workspace"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}

                      {/* Excluir workspace */}
                      {workspace.criado_por === user?.id && (
                        <button
                          onClick={() => handleDeleteWorkspace(workspace)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir workspace"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      {showCreateModal && (
        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showInviteModal && selectedWorkspace && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedWorkspace(null);
          }}
          workspace={selectedWorkspace}
        />
      )}

      {showMembersModal && selectedWorkspace && (
        <ManageMembersModal
          isOpen={showMembersModal}
          onClose={() => {
            setShowMembersModal(false);
            setSelectedWorkspace(null);
          }}
          workspace={selectedWorkspace}
        />
      )}

      {showEditModal && selectedWorkspace && (
        <EditWorkspaceModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedWorkspace(null);
          }}
          workspace={selectedWorkspace}
        />
      )}
    </div>
  );
}
