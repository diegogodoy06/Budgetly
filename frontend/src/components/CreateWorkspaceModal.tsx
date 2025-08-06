import { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreateWorkspaceData } from '../types/workspace';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { createWorkspace, loading, setCurrentWorkspace } = useWorkspace();
  const [formData, setFormData] = useState<CreateWorkspaceData>({
    nome: '',
    descricao: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      return;
    }

    try {
      const newWorkspace = await createWorkspace(formData);
      // Definir o novo workspace como atual
      setCurrentWorkspace(newWorkspace);
      setFormData({ nome: '', descricao: '' });
      onClose();
    } catch (error) {
      // Erro já é tratado no context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            <h2 className="text-xl font-semibold text-gray-900">Novo Workspace</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <form id="create-workspace-form" onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Workspace *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: Minha Casa, Empresa, Pessoal"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Descreva o propósito deste workspace..."
                  />
                </div>

                {/* Informação sobre papel */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Importante:</strong> Você será automaticamente adicionado como administrador do workspace e poderá convidar outros membros.
                  </p>
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
              form="create-workspace-form"
              disabled={loading || !formData.nome.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Workspace'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
