import axios from 'axios';
import { Workspace, WorkspaceInvite, CreateWorkspaceData, UpdateMemberData, WorkspaceMember } from '../types/workspace';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Usar a mesma instância de axios configurada
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class WorkspaceService {
  // Listar workspaces do usuário
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await api.get('/api/accounts/workspaces/');
    return response.data;
  }

  // Criar novo workspace
  async createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
    const response = await api.post('/api/accounts/workspaces/', data);
    return response.data;
  }

  // Obter detalhes de um workspace
  async getWorkspace(id: number): Promise<Workspace> {
    const response = await api.get(`/api/accounts/workspaces/${id}/`);
    return response.data;
  }

  // Atualizar workspace
  async updateWorkspace(id: number, data: Partial<CreateWorkspaceData>): Promise<Workspace> {
    const response = await api.patch(`/api/accounts/workspaces/${id}/`, data);
    return response.data;
  }

  // Excluir workspace
  async deleteWorkspace(id: number): Promise<void> {
    await api.delete(`/api/accounts/workspaces/${id}/`);
  }

  // Convidar membro para workspace
  async inviteMember(workspaceId: number, invite: WorkspaceInvite): Promise<WorkspaceMember> {
    const response = await api.post(`/api/accounts/workspaces/${workspaceId}/invite_member/`, invite);
    return response.data;
  }

  // Listar membros do workspace
  async getMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    const response = await api.get(`/api/accounts/workspaces/${workspaceId}/members/`);
    return response.data;
  }

  // Atualizar papel de um membro
  async updateMember(workspaceId: number, memberId: number, data: UpdateMemberData): Promise<WorkspaceMember> {
    const response = await api.patch(`/api/accounts/workspaces/${workspaceId}/members/${memberId}/`, data);
    return response.data;
  }

  // Remover membro do workspace
  async removeMember(workspaceId: number, memberId: number): Promise<void> {
    await api.delete(`/api/accounts/workspaces/${workspaceId}/members/${memberId}/`);
  }

  // Sair do workspace
  async leaveWorkspace(workspaceId: number): Promise<void> {
    await api.post(`/api/accounts/workspaces/${workspaceId}/leave/`, {});
  }
}

export const workspaceService = new WorkspaceService();
