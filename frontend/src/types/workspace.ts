// Tipos para Workspaces
export interface Workspace {
  id: number;
  nome: string;
  descricao: string;
  criado_por: number;
  criado_por_nome: string;
  criado_por_email: string;
  membros_count: number;
  membros: WorkspaceMember[];
  user_role: 'admin' | 'editor' | 'viewer' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  role: 'admin' | 'editor' | 'viewer';
  role_display: string;
  joined_at: string;
  is_active: boolean;
}

export interface WorkspaceInvite {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface CreateWorkspaceData {
  nome: string;
  descricao: string;
}

export interface UpdateMemberData {
  role: 'admin' | 'editor' | 'viewer';
  is_active?: boolean;
}

// Tipos para Context
export interface WorkspaceContextType {
  // Estado
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  error: string | null;

  // Ações de Workspace
  loadWorkspaces: () => Promise<void>;
  createWorkspace: (data: CreateWorkspaceData) => Promise<Workspace>;
  updateWorkspace: (id: number, data: Partial<CreateWorkspaceData>) => Promise<Workspace>;
  deleteWorkspace: (id: number) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;

  // Ações de Membros
  inviteMember: (workspaceId: number, invite: WorkspaceInvite) => Promise<WorkspaceMember>;
  updateMember: (workspaceId: number, memberId: number, data: UpdateMemberData) => Promise<WorkspaceMember>;
  removeMember: (workspaceId: number, memberId: number) => Promise<void>;
  leaveWorkspace: (workspaceId: number) => Promise<void>;

  // Utilitários
  getWorkspaceById: (id: number) => Workspace | undefined;
  hasPermission: (workspace: Workspace | null, requiredRole: 'admin' | 'editor') => boolean;
}
