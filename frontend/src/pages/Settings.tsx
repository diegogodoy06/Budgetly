import React, { useState } from 'react';
import { 
  PlusIcon, 
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useConfiguracoes, Categoria, CentroCusto } from '@/contexts/ConfiguracoesContext';

const Settings: React.FC = () => {
  // Usar o contexto global de configurações
  const {
    categorias,
    centrosCusto,
    adicionarCategoria,
    editarCategoria,
    excluirCategoria,
    toggleCategoriaAtiva,
    adicionarCentroCusto,
    editarCentroCusto,
    excluirCentroCusto,
    toggleCentroCustoAtivo
  } = useConfiguracoes();

  // Estados para modais
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [mostrarModalCentroCusto, setMostrarModalCentroCusto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [centroCustoEditando, setCentroCustoEditando] = useState<CentroCusto | null>(null);

  // Estados para formulários
  const [novaCategoria, setNovaCategoria] = useState({
    nome: '',
    ativa: true,
    considerarDashboard: true,
    importancia: 'necessario' as 'essencial' | 'necessario' | 'superfluo'
  });

  const [novoCentroCusto, setNovoCentroCusto] = useState({
    nome: '',
    ativo: true
  });

  // Funções para Categorias
  const handleSubmitCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (categoriaEditando) {
      // Editar categoria existente
      editarCategoria(categoriaEditando.id, {
        nome: novaCategoria.nome,
        ativa: novaCategoria.ativa,
        considerarDashboard: novaCategoria.considerarDashboard,
        importancia: novaCategoria.importancia
      });
    } else {
      // Criar nova categoria
      adicionarCategoria({
        nome: novaCategoria.nome,
        ativa: novaCategoria.ativa,
        considerarDashboard: novaCategoria.considerarDashboard,
        importancia: novaCategoria.importancia
      });
    }

    // Reset
    setNovaCategoria({ nome: '', ativa: true, considerarDashboard: true, importancia: 'necessario' });
    setMostrarModalCategoria(false);
    setCategoriaEditando(null);
  };

  const handleEditarCategoria = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setNovaCategoria({
      nome: categoria.nome,
      ativa: categoria.ativa,
      considerarDashboard: categoria.considerarDashboard,
      importancia: categoria.importancia
    });
    setMostrarModalCategoria(true);
  };

  const handleExcluirCategoria = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      excluirCategoria(id);
    }
  };

  // Funções para Centros de Custo
  const handleSubmitCentroCusto = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (centroCustoEditando) {
      // Editar centro de custo existente
      editarCentroCusto(centroCustoEditando.id, {
        nome: novoCentroCusto.nome,
        ativo: novoCentroCusto.ativo
      });
    } else {
      // Criar novo centro de custo
      adicionarCentroCusto({
        nome: novoCentroCusto.nome,
        ativo: novoCentroCusto.ativo
      });
    }

    // Reset
    setNovoCentroCusto({ nome: '', ativo: true });
    setMostrarModalCentroCusto(false);
    setCentroCustoEditando(null);
  };

  const handleEditarCentroCusto = (centroCusto: CentroCusto) => {
    setCentroCustoEditando(centroCusto);
    setNovoCentroCusto({
      nome: centroCusto.nome,
      ativo: centroCusto.ativo
    });
    setMostrarModalCentroCusto(true);
  };

  const handleExcluirCentroCusto = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este centro de custo?')) {
      excluirCentroCusto(id);
    }
  };

  const getImportanciaColor = (importancia: string) => {
    switch (importancia) {
      case 'essencial': return 'bg-red-100 text-red-800';
      case 'necessario': return 'bg-yellow-100 text-yellow-800';
      case 'superfluo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanciaLabel = (importancia: string) => {
    switch (importancia) {
      case 'essencial': return 'Essencial';
      case 'necessario': return 'Necessário';
      case 'superfluo': return 'Supérfluo';
      default: return importancia;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Configurações do Sistema
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie categorias e centros de custo globais do aplicativo
          </p>
        </div>
      </div>

      {/* Seção de Categorias */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Categorias
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie as categorias disponíveis para classificação de transações
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setMostrarModalCategoria(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nova Categoria
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dashboard
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Importância
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {categoria.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleCategoriaAtiva(categoria.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            categoria.ativa 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {categoria.ativa ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categoria.considerarDashboard ? 'Sim' : 'Não'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImportanciaColor(categoria.importancia)}`}>
                          {getImportanciaLabel(categoria.importancia)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditarCategoria(categoria)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirCategoria(categoria.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Centros de Custo */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Centros de Custo
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie os centros de custo para organização de despesas
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setMostrarModalCentroCusto(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Novo Centro de Custo
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {centrosCusto.map((centro) => (
                    <tr key={centro.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {centro.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleCentroCustoAtivo(centro.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            centro.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {centro.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditarCentroCusto(centro)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirCentroCusto(centro.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Categoria */}
      {mostrarModalCategoria && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => {
                  setMostrarModalCategoria(false);
                  setCategoriaEditando(null);
                  setNovaCategoria({ nome: '', ativa: true, considerarDashboard: true, importancia: 'necessario' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitCategoria} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Alimentação, Transporte..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importância
                </label>
                <select
                  value={novaCategoria.importancia}
                  onChange={(e) => setNovaCategoria(prev => ({ ...prev, importancia: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="essencial">Essencial</option>
                  <option value="necessario">Necessário</option>
                  <option value="superfluo">Supérfluo</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Categoria Ativa
                  </label>
                  <p className="text-xs text-gray-500">
                    Disponível para seleção em transações
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNovaCategoria(prev => ({ ...prev, ativa: !prev.ativa }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    novaCategoria.ativa ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      novaCategoria.ativa ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Considerar no Dashboard
                  </label>
                  <p className="text-xs text-gray-500">
                    Incluir nos gráficos e relatórios principais
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNovaCategoria(prev => ({ ...prev, considerarDashboard: !prev.considerarDashboard }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    novaCategoria.considerarDashboard ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      novaCategoria.considerarDashboard ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalCategoria(false);
                    setCategoriaEditando(null);
                    setNovaCategoria({ nome: '', ativa: true, considerarDashboard: true, importancia: 'necessario' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {categoriaEditando ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Centro de Custo */}
      {mostrarModalCentroCusto && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {centroCustoEditando ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
              </h3>
              <button
                onClick={() => {
                  setMostrarModalCentroCusto(false);
                  setCentroCustoEditando(null);
                  setNovoCentroCusto({ nome: '', ativo: true });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitCentroCusto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Centro de Custo
                </label>
                <input
                  type="text"
                  value={novoCentroCusto.nome}
                  onChange={(e) => setNovoCentroCusto(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Pessoal, Trabalho, Família..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Centro de Custo Ativo
                  </label>
                  <p className="text-xs text-gray-500">
                    Disponível para seleção em transações
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

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalCentroCusto(false);
                    setCentroCustoEditando(null);
                    setNovoCentroCusto({ nome: '', ativo: true });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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

export default Settings;
