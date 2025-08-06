import { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Workspace, WorkspaceInvite } from '../types/workspace';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, workspace }) => {
  const { inviteMember, loading } = useWorkspace();
  const [formData, setFormData] = useState<WorkspaceInvite>({
    email: '',
    role: 'viewer',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      return;
    }

    try {
      await inviteMember(workspace.id, formData);
      setFormData({ email: '', role: 'viewer' });
      onClose();
    } catch (error) {
      // Erro já é tratado no context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Convidar Membro</h2>
              <p className="text-sm text-gray-500 mt-1">Workspace: {workspace.nome}</p>
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
            <form id="invite-member-form" onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email do usuário *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="usuario@exemplo.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    O usuário deve já estar cadastrado no sistema
                  </p>
                </div>

                {/* Papel */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Papel no Workspace
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="viewer">Visualizador</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {/* Descrição dos papéis */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Papéis disponíveis:</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex">
                      <span className="font-medium w-20">Visualizador:</span>
                      <span>Pode apenas visualizar dados financeiros</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-20">Editor:</span>
                      <span>Pode criar e editar dados financeiros</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-20">Admin:</span>
                      <span>Controle total do workspace</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              form="invite-member-form"
              disabled={loading || !formData.email.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Convidando...' : 'Enviar Convite'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
