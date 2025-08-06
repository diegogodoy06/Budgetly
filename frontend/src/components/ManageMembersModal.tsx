import { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  XMarkIcon, 
  CogIcon, 
  PencilIcon, 
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Workspace, WorkspaceMember } from '../types/workspace';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
}

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({ isOpen, onClose, workspace }) => {
  const { user } = useAuth();
  const { updateMember, removeMember, leaveWorkspace, loading, hasPermission } = useWorkspace();
  const [editingMember, setEditingMember] = useState<WorkspaceMember | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');

  const handleUpdateRole = async (member: WorkspaceMember) => {
    if (!editingMember || newRole === member.role) {
      setEditingMember(null);
      return;
    }

    try {
      await updateMember(workspace.id, member.id, { role: newRole });
      setEditingMember(null);
    } catch (error) {
      // Erro já é tratado no context
    }
  };

  const handleRemoveMember = async (member: WorkspaceMember) => {
    if (window.confirm(`Tem certeza que deseja remover ${member.user_name || member.user_email} do workspace?`)) {
      try {
        await removeMember(workspace.id, member.id);
      } catch (error) {
        // Erro já é tratado no context
      }
    }
  };

  const handleLeaveWorkspace = async () => {
    if (window.confirm('Tem certeza que deseja sair deste workspace? Você perderá acesso a todos os dados.')) {
      try {
        await leaveWorkspace(workspace.id);
        onClose();
      } catch (error) {
        // Erro já é tratado no context
      }
    }
  };

  const startEditingRole = (member: WorkspaceMember) => {
    setEditingMember(member);
    setNewRole(member.role);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Visualizador';
      default:
        return role;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isCurrentUser = (member: WorkspaceMember) => {
    return member.user === user?.id;
  };

  const canManageMembers = hasPermission(workspace, 'admin');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Membros do Workspace</h2>
              <p className="text-sm text-gray-500 mt-1">{workspace.nome} • {workspace.membros.length} membros</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Lista de membros */}
              <div className="space-y-3">
                {workspace.membros.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {member.user_name || member.user_email}
                            {isCurrentUser(member) && (
                              <span className="ml-2 text-xs text-blue-600 font-medium">(Você)</span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-500">{member.user_email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Membro desde {formatDate(member.joined_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Role */}
                      {editingMember?.id === member.id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="viewer">Visualizador</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Administrador</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(member)}
                            disabled={loading}
                            className="text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingMember(null)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span 
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getRoleColor(member.role)} ${canManageMembers && !isCurrentUser(member) ? 'cursor-pointer hover:opacity-80' : ''}`}
                          onClick={() => canManageMembers && !isCurrentUser(member) && startEditingRole(member)}
                          title={canManageMembers && !isCurrentUser(member) ? 'Clique para editar' : ''}
                        >
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{getRoleDisplay(member.role)}</span>
                        </span>
                      )}

                      {/* Actions */}
                      {canManageMembers && !isCurrentUser(member) && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          disabled={loading}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remover membro"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ação para sair do workspace */}
              {workspace.criado_por !== user?.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-orange-800 mb-1">
                          Sair do Workspace
                        </h4>
                        <p className="text-sm text-orange-700 mb-3">
                          Ao sair, você perderá acesso a todos os dados financeiros deste workspace.
                        </p>
                        <button
                          onClick={handleLeaveWorkspace}
                          disabled={loading}
                          className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Saindo...' : 'Sair do Workspace'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button 
              onClick={onClose} 
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
