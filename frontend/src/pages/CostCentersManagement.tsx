import React, { useState } from 'react';
import { 
  PlusIcon, 
  BuildingOfficeIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gerenciar Centros de Custo
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure os centros de custo para organizar seus gastos por departamento ou finalidade
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setMostrarModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Centro de Custo
          </button>
        </div>
      </div>

      {/* Lista de Centros de Custo */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {centrosCusto.map((centroCusto) => (
            <li key={centroCusto.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className={`h-8 w-8 ${centroCusto.ativo ? 'text-primary-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-medium ${centroCusto.ativo ? 'text-gray-900' : 'text-gray-500'}`}>
                        {centroCusto.nome}
                      </h3>
                      {!centroCusto.ativo && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditar(centroCusto)}
                    className="text-gray-400 hover:text-primary-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleExcluir(centroCusto.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {centrosCusto.length === 0 && (
            <li>
              <div className="px-4 py-12 text-center">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum centro de custo</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece criando seu primeiro centro de custo.
                </p>
                <button
                  onClick={() => setMostrarModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Criar Primeiro Centro de Custo
                </button>
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Modal de Adicionar/Editar Centro de Custo */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {centroCustoEditando ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
              </h3>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setCentroCustoEditando(null);
                  setNovoCentroCusto({
                    nome: '',
                    ativo: true
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome do Centro de Custo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Centro de Custo
                </label>
                <input
                  type="text"
                  value={novoCentroCusto.nome}
                  onChange={(e) => setNovoCentroCusto(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Pessoal, Trabalho, Casa, Família..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use centros de custo para organizar gastos por departamento, projeto ou finalidade.
                </p>
              </div>

              {/* Opções */}
              <div className="space-y-3">
                {/* Ativo */}
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      novoCentroCusto.ativo ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        novoCentroCusto.ativo ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {centroCustoEditando ? 'Salvar Alterações' : 'Criar Centro de Custo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCentersManagement;
