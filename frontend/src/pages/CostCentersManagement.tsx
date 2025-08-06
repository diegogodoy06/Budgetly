import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { useConfiguracoes } from '@/contexts/ConfiguracoesContext';
import type { CentroCusto } from '@/contexts/ConfiguracoesContext';

const CostCentersManagement: React.FC = () => {
  const { 
    centrosCusto, 
    adicionarCentroCusto, 
    editarCentroCusto, 
    excluirCentroCusto 
  } = useConfiguracoes();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [centroCustoEditando, setCentroCustoEditando] = useState<CentroCusto | null>(null);
  const [novoCentroCusto, setNovoCentroCusto] = useState({
    nome: '',
    ativo: true
  });

  // Escutar mudanças de workspace
  useEffect(() => {
    const handleWorkspaceChange = (event: CustomEvent) => {
      console.log('🔄 CostCenters detectou mudança de workspace:', event.detail);
      const { previousWorkspace, newWorkspace } = event.detail;
      
      if (previousWorkspace?.id !== newWorkspace?.id) {
        console.log('✨ Centros de custo serão recarregados automaticamente via context');
        // O context ConfiguracoesContext já gerencia o recarregamento dos dados
        // quando há mudança de workspace, então não precisamos fazer nada aqui
      }
    };

    window.addEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
    
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (centroCustoEditando) {
      editarCentroCusto(centroCustoEditando.id, novoCentroCusto);
    } else {
      adicionarCentroCusto(novoCentroCusto);
    }

    // Reset form
    setNovoCentroCusto({
      nome: '',
      ativo: true
    });
    setMostrarModal(false);
    setCentroCustoEditando(null);
  };

  const handleEditar = (centroCusto: CentroCusto) => {
    setCentroCustoEditando(centroCusto);
    setNovoCentroCusto({
      nome: centroCusto.nome,
      ativo: centroCusto.ativo
    });
    setMostrarModal(true);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este centro de custo?')) {
      excluirCentroCusto(id);
    }
  };

  const renderCostCenterCard = (centroCusto: CentroCusto) => {
    return (
      <div 
        key={centroCusto.id} 
        className={`bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${
          !centroCusto.ativo ? 'opacity-75' : ''
        }`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-4 flex-1 min-w-0">
              {/* Ícone do centro de custo */}
              <div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 ${
                  centroCusto.ativo ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              >
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>
              
              {/* Informações do centro de custo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <h3 className={`text-xl font-semibold break-words leading-tight flex-1 ${
                    centroCusto.ativo ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {centroCusto.nome}
                  </h3>
                  
                  {/* Status Badge */}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                    centroCusto.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {centroCusto.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">
                  Centro de custo para organização de despesas{centroCusto.ativo ? '' : ' (Inativo)'}
                </p>
                
                {/* Estatísticas simuladas */}
                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <BanknotesIcon className="h-4 w-4 mr-1" />
                    <span>0 transações</span>
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    <span>Departamento</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu de ações */}
            <div className="flex items-start space-x-2 flex-shrink-0">
              <button
                onClick={() => handleEditar(centroCusto)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar centro de custo"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleExcluir(centroCusto.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir centro de custo"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer do card com informações adicionais */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Criado em: Jan 2025</span>
            <span>Última atualização: Hoje</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gerenciamento de Centros de Custo
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Organize suas despesas por departamento, projeto ou finalidade com cards visuais
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setMostrarModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Centro de Custo
          </button>
        </div>
      </div>

      {/* Lista de Centros de Custo em Cards */}
      <div className="space-y-6">
        {centrosCusto.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum centro de custo encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando seu primeiro centro de custo para organizar suas despesas.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setMostrarModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Criar Primeiro Centro de Custo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {centrosCusto.map(centroCusto => renderCostCenterCard(centroCusto))}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {centroCustoEditando ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Centro de Custo
                  </label>
                  <input
                    type="text"
                    value={novoCentroCusto.nome}
                    onChange={(e) => setNovoCentroCusto(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Pessoal, Trabalho, Casa, Família..."
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use centros de custo para organizar gastos por departamento, projeto ou finalidade.
                  </p>
                </div>

                {/* Status Ativo */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Centro de Custo Ativo
                    </label>
                    <p className="text-xs text-gray-500">
                      Centros de custo inativos não aparecem em formulários
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNovoCentroCusto(prev => ({ ...prev, ativo: !prev.ativo }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      novoCentroCusto.ativo ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        novoCentroCusto.ativo ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarModal(false);
                      setCentroCustoEditando(null);
                      setNovoCentroCusto({
                        nome: '',
                        ativo: true
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {centroCustoEditando ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCentersManagement;
