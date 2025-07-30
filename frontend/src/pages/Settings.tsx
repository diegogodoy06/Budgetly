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
    adicionarCentroCusto,
    editarCentroCusto,
    excluirCentroCusto
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
    importancia: 'necessario' as 'essencial' | 'necessario' | 'superfluo',
    tipoCategoria: 'principal' as 'principal' | 'subcategoria',
    parent: undefined as number | undefined,
    cor: '#3b82f6',
    icone: '📁'
  });

  const [novoCentroCusto, setNovoCentroCusto] = useState({
    nome: '',
    ativo: true
  });

  // Função para resetar formulário de categoria
  const resetFormularioCategoria = () => {
    setNovaCategoria({
      nome: '',
      ativa: true,
      considerarDashboard: true,
      importancia: 'necessario',
      tipoCategoria: 'principal',
      parent: undefined,
      cor: '#3b82f6',
      icone: '📁'
    });
  };

  // Busca categorias principais para o dropdown de subcategorias
  const categoriasPrincipais = categorias.filter(cat => !cat.parent);

  const getImportanciaLabel = (importancia: string) => {
    switch (importancia) {
      case 'essencial': return 'Essencial';
      case 'necessario': return 'Necessário';
      case 'superfluo': return 'Supérfluo';
      default: return importancia;
    }
  };

  // Função temporária para toggle de centro de custo (será implementada no contexto depois)
  const toggleCentroCustoAtivo = (id: number) => {
    console.log('Toggle centro de custo:', id);
    // TODO: Implementar no contexto
  };

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
    resetFormularioCategoria();
    setMostrarModalCategoria(false);
    setCategoriaEditando(null);
  };

  const handleEditarCategoria = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setNovaCategoria({
      nome: categoria.nome,
      ativa: categoria.ativa,
      considerarDashboard: categoria.considerarDashboard,
      importancia: categoria.importancia,
      tipoCategoria: categoria.parent ? 'subcategoria' : 'principal',
      parent: categoria.parent,
      cor: categoria.cor || '#3b82f6',
      icone: categoria.icone || '📁'
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

          <div className="mt-6">
            {/* Cards de Categorias Principais */}
            <div className="grid gap-6">
              {categoriasPrincipais.map((categoriaPrincipal) => {
                const subcategorias = categorias.filter(cat => cat.parent === categoriaPrincipal.id);
                
                return (
                  <div key={categoriaPrincipal.id} className="bg-gray-50 rounded-lg border border-gray-200">
                    {/* Header da Categoria Principal */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {categoriaPrincipal.icone && (
                            <span className="mr-3 text-2xl">{categoriaPrincipal.icone}</span>
                          )}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {categoriaPrincipal.nome}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                categoriaPrincipal.ativa 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {categoriaPrincipal.ativa ? 'Ativa' : 'Inativa'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {getImportanciaLabel(categoriaPrincipal.importancia)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Dashboard: {categoriaPrincipal.considerarDashboard ? 'Sim' : 'Não'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditarCategoria(categoriaPrincipal)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Editar categoria"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirCategoria(categoriaPrincipal.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Excluir categoria"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subcategorias */}
                    {subcategorias.length > 0 && (
                      <div className="px-6 py-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                          Subcategorias ({subcategorias.length})
                        </h5>
                        <div className="grid gap-3">
                          {subcategorias.map((subcategoria) => (
                            <div key={subcategoria.id} className="bg-white rounded-md border border-gray-200 p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {subcategoria.icone && (
                                    <span className="mr-2 text-lg">{subcategoria.icone}</span>
                                  )}
                                  <div>
                                    <span className="font-medium text-gray-900">{subcategoria.nome}</span>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        subcategoria.ativa 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {subcategoria.ativa ? 'Ativa' : 'Inativa'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {getImportanciaLabel(subcategoria.importancia)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleEditarCategoria(subcategoria)}
                                    className="text-blue-600 hover:text-blue-900 p-1"
                                    title="Editar subcategoria"
                                  >
                                    <PencilIcon className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleExcluirCategoria(subcategoria.id)}
                                    className="text-red-600 hover:text-red-900 p-1"
                                    title="Excluir subcategoria"
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botão para adicionar subcategoria */}
                    <div className="px-6 py-3 border-t border-gray-200 bg-gray-25">
                      <button
                        onClick={() => {
                          setNovaCategoria({
                            nome: '',
                            ativa: true,
                            considerarDashboard: true,
                            importancia: 'necessario',
                            tipoCategoria: 'subcategoria',
                            parent: categoriaPrincipal.id,
                            cor: '#3b82f6',
                            icone: '📁'
                          });
                          setMostrarModalCategoria(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Adicionar subcategoria
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Caso não haja categorias principais */}
              {categoriasPrincipais.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">Nenhuma categoria encontrada</h3>
                  <p className="text-sm text-gray-500">Comece criando sua primeira categoria principal.</p>
                </div>
              )}
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
                  resetFormularioCategoria();
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
                  Tipo de Categoria
                </label>
                <select
                  value={novaCategoria.tipoCategoria}
                  onChange={(e) => {
                    const tipo = e.target.value as 'principal' | 'subcategoria';
                    setNovaCategoria(prev => ({ 
                      ...prev, 
                      tipoCategoria: tipo,
                      parent: tipo === 'principal' ? undefined : prev.parent
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="principal">Categoria Principal</option>
                  <option value="subcategoria">Subcategoria</option>
                </select>
              </div>

              {novaCategoria.tipoCategoria === 'subcategoria' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria Pai
                  </label>
                  <select
                    value={novaCategoria.parent || ''}
                    onChange={(e) => setNovaCategoria(prev => ({ 
                      ...prev, 
                      parent: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione uma categoria principal...</option>
                    {categoriasPrincipais.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={novaCategoria.cor}
                    onChange={(e) => setNovaCategoria(prev => ({ ...prev, cor: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone
                  </label>
                  <input
                    type="text"
                    value={novaCategoria.icone}
                    onChange={(e) => setNovaCategoria(prev => ({ ...prev, icone: e.target.value }))}
                    placeholder="📁"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                    resetFormularioCategoria();
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
