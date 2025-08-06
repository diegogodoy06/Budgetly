import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { workspaceService } from '../services/workspaceService';
import { useAuth } from './AuthContext';
import { 
  Workspace, 
  WorkspaceContextType, 
  CreateWorkspaceData, 
  WorkspaceInvite, 
  UpdateMemberData,
  WorkspaceMember 
} from '../types/workspace';

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar workspaces
  const loadWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando workspaces...');
      const data = await workspaceService.getWorkspaces();
      console.log('✅ Workspaces carregados:', data);
      
      // Extrair array de workspaces da resposta paginada
      const workspacesList = Array.isArray(data) ? data : (data as any).results || [];
      console.log('📋 Lista de workspaces extraída:', workspacesList);
      setWorkspaces(workspacesList);
      
      // Verificar se há workspace salvo no localStorage
      const savedWorkspaceId = localStorage.getItem('current_workspace_id');
      let workspaceToSelect: Workspace | null = null;
      
      if (savedWorkspaceId && workspacesList.length > 0) {
        // Tentar encontrar o workspace salvo
        const savedWorkspace = workspacesList.find((w: Workspace) => w.id.toString() === savedWorkspaceId);
        if (savedWorkspace) {
          console.log('✅ Workspace salvo encontrado:', savedWorkspace.nome);
          workspaceToSelect = savedWorkspace;
        } else {
          console.log('⚠️ Workspace salvo não encontrado, selecionando primeiro');
          workspaceToSelect = workspacesList[0];
        }
      } else if (workspacesList.length > 0) {
        console.log('🎯 Nenhum workspace salvo, selecionando primeiro');
        workspaceToSelect = workspacesList[0];
      }
      
      // Definir workspace (mesmo se já houver um definido, para garantir persistência)
      if (workspaceToSelect) {
        console.log('🎯 Definindo workspace:', workspaceToSelect.nome);
        setCurrentWorkspace(workspaceToSelect);
        localStorage.setItem('current_workspace_id', workspaceToSelect.id.toString());
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar workspaces:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Erro ao carregar workspaces';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Se o erro for de autenticação, não continue tentando
      if (error.response?.status === 401) {
        console.log('🔒 Erro de autenticação - usuário não logado');
        return;
      }
    } finally {
      setLoading(false);
    }
  }, []); // Sem dependências - a função só muda quando necessário

  // Carregar workspaces automaticamente quando usuário está autenticado
  useEffect(() => {
    console.log('🔍 WorkspaceContext useEffect - user:', !!user, 'token:', !!token);
    if (user && token) {
      console.log('👤 Usuário autenticado, carregando workspaces...');
      loadWorkspaces();
    } else {
      console.log('❌ Usuário não autenticado, limpando dados');
      // Limpar dados quando usuário não está autenticado
      setWorkspaces([]);
      setCurrentWorkspace(null);
    }
  }, [user, token]);

  // Criar workspace
  const createWorkspace = async (data: CreateWorkspaceData): Promise<Workspace> => {
    try {
      setLoading(true);
      const newWorkspace = await workspaceService.createWorkspace(data);
      setWorkspaces(prev => [...prev, newWorkspace]);
      toast.success('Workspace criado com sucesso!');
      return newWorkspace;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao criar workspace';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar workspace
  const updateWorkspace = async (id: number, data: Partial<CreateWorkspaceData>): Promise<Workspace> => {
    try {
      setLoading(true);
      const updatedWorkspace = await workspaceService.updateWorkspace(id, data);
      setWorkspaces(prev => prev.map(w => w.id === id ? updatedWorkspace : w));
      
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(updatedWorkspace);
      }
      
      toast.success('Workspace atualizado com sucesso!');
      return updatedWorkspace;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao atualizar workspace';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Excluir workspace
  const deleteWorkspace = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      await workspaceService.deleteWorkspace(id);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      
      if (currentWorkspace?.id === id) {
        const remainingWorkspaces = workspaces.filter(w => w.id !== id);
        setCurrentWorkspace(remainingWorkspaces.length > 0 ? remainingWorkspaces[0] : null);
      }
      
      toast.success('Workspace excluído com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao excluir workspace';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Definir workspace atual
  const setCurrentWorkspaceHandler = useCallback((workspace: Workspace | null) => {
    console.log('🔄 Mudando workspace de:', currentWorkspace?.nome, 'para:', workspace?.nome);
    
    // Mostrar loading durante a troca
    if (currentWorkspace && workspace && currentWorkspace.id !== workspace.id) {
      console.log('🧹 Limpando dados do workspace anterior');
      toast.loading('Carregando dados do novo workspace...', {
        id: 'workspace-change',
        duration: 1500
      });
    }
    
    setCurrentWorkspace(workspace);
    if (workspace) {
      localStorage.setItem('current_workspace_id', workspace.id.toString());
      console.log('✅ Workspace ativo:', workspace.nome, 'ID:', workspace.id);
    } else {
      localStorage.removeItem('current_workspace_id');
      console.log('❌ Nenhum workspace ativo');
    }
    
    // Disparar evento customizado para outras partes da aplicação
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('workspaceChanged', { 
        detail: { 
          previousWorkspace: currentWorkspace, 
          newWorkspace: workspace 
        } 
      }));
      
      // Remover loading após um tempo
      setTimeout(() => {
        toast.dismiss('workspace-change');
        if (workspace) {
          toast.success(`Workspace "${workspace.nome}" carregado!`, {
            duration: 2000
          });
        }
      }, 1000);
    }
  }, [currentWorkspace]);

  // Convidar membro
  const inviteMember = async (workspaceId: number, invite: WorkspaceInvite): Promise<WorkspaceMember> => {
    try {
      setLoading(true);
      const newMember = await workspaceService.inviteMember(workspaceId, invite);
      
      // Atualizar workspace com novo membro
      setWorkspaces(prev => prev.map(w => {
        if (w.id === workspaceId) {
          return {
            ...w,
            membros: [...w.membros, newMember],
            membros_count: w.membros_count + 1
          };
        }
        return w;
      }));
      
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(prev => prev ? {
          ...prev,
          membros: [...prev.membros, newMember],
          membros_count: prev.membros_count + 1
        } : null);
      }
      
      toast.success('Membro convidado com sucesso!');
      return newMember;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.email?.[0] || 'Erro ao convidar membro';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar membro
  const updateMember = async (workspaceId: number, memberId: number, data: UpdateMemberData): Promise<WorkspaceMember> => {
    try {
      setLoading(true);
      const updatedMember = await workspaceService.updateMember(workspaceId, memberId, data);
      
      // Atualizar workspace
      setWorkspaces(prev => prev.map(w => {
        if (w.id === workspaceId) {
          return {
            ...w,
            membros: w.membros.map(m => m.id === memberId ? updatedMember : m)
          };
        }
        return w;
      }));
      
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(prev => prev ? {
          ...prev,
          membros: prev.membros.map(m => m.id === memberId ? updatedMember : m)
        } : null);
      }
      
      toast.success('Membro atualizado com sucesso!');
      return updatedMember;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao atualizar membro';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remover membro
  const removeMember = async (workspaceId: number, memberId: number): Promise<void> => {
    try {
      setLoading(true);
      await workspaceService.removeMember(workspaceId, memberId);
      
      // Atualizar workspace
      setWorkspaces(prev => prev.map(w => {
        if (w.id === workspaceId) {
          return {
            ...w,
            membros: w.membros.filter(m => m.id !== memberId),
            membros_count: w.membros_count - 1
          };
        }
        return w;
      }));
      
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(prev => prev ? {
          ...prev,
          membros: prev.membros.filter(m => m.id !== memberId),
          membros_count: prev.membros_count - 1
        } : null);
      }
      
      toast.success('Membro removido com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao remover membro';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sair do workspace
  const leaveWorkspace = async (workspaceId: number): Promise<void> => {
    try {
      setLoading(true);
      await workspaceService.leaveWorkspace(workspaceId);
      
      // Remover workspace da lista
      setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
      
      if (currentWorkspace?.id === workspaceId) {
        const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
        setCurrentWorkspace(remainingWorkspaces.length > 0 ? remainingWorkspaces[0] : null);
      }
      
      toast.success('Você saiu do workspace com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao sair do workspace';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Utilitários
  const getWorkspaceById = (id: number): Workspace | undefined => {
    return workspaces.find(w => w.id === id);
  };

  const hasPermission = (workspace: Workspace | null, requiredRole: 'admin' | 'editor'): boolean => {
    if (!workspace || !workspace.user_role) return false;
    
    if (requiredRole === 'admin') {
      return workspace.user_role === 'admin';
    }
    
    if (requiredRole === 'editor') {
      return workspace.user_role === 'admin' || workspace.user_role === 'editor';
    }
    
    return false;
  };

  // Carregar workspace salvo no localStorage
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem('current_workspace_id');
    if (savedWorkspaceId && workspaces.length > 0) {
      const workspace = workspaces.find(w => w.id === parseInt(savedWorkspaceId));
      if (workspace) {
        setCurrentWorkspace(workspace);
      }
    }
  }, [workspaces]);

  const value: WorkspaceContextType = {
    // Estado
    workspaces,
    currentWorkspace,
    loading,
    error,

    // Ações de Workspace
    loadWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace: setCurrentWorkspaceHandler,

    // Ações de Membros
    inviteMember,
    updateMember,
    removeMember,
    leaveWorkspace,

    // Utilitários
    getWorkspaceById,
    hasPermission,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
