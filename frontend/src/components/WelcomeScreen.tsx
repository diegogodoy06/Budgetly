import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { 
  BuildingOfficeIcon, 
  PlusIcon,
  UserGroupIcon,
  ChartBarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const WelcomeScreen: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { loading } = useWorkspace();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full p-6 shadow-lg">
              <BuildingOfficeIcon className="h-16 w-16 text-indigo-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bem-vindo ao <span className="text-indigo-600">Budgetly</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Organize suas finanças com workspaces personalizados. 
            Crie espaços separados para casa, trabalho ou projetos pessoais.
          </p>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <PlusIcon className="h-6 w-6 mr-2" />
            Criar Primeiro Workspace
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
              <CreditCardIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Contas & Cartões
            </h3>
            <p className="text-gray-600">
              Gerencie suas contas bancárias e cartões de crédito em um só lugar
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Relatórios
            </h3>
            <p className="text-gray-600">
              Visualize seus gastos com gráficos e relatórios detalhados
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-4">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Colaboração
            </h3>
            <p className="text-gray-600">
              Compartilhe workspaces com familiares ou colegas de trabalho
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            O que são Workspaces?
          </h3>
          <p className="text-gray-600 text-left">
            Workspaces são espaços organizacionais que permitem separar suas finanças por contexto. 
            Por exemplo, você pode ter um workspace para "Casa" com suas contas pessoais, 
            outro para "Empresa" com contas empresariais, e assim por diante. 
            Cada workspace mantém seus próprios dados isolados e você pode convidar outras pessoas para colaborar.
          </p>
        </div>
      </div>

      {/* Modal */}
      <CreateWorkspaceModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
};

export default WelcomeScreen;
