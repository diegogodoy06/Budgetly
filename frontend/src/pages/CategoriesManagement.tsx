import React, { useState } from 'react';
import { 
  PlusIcon, 
  TagIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useConfiguracoes } from '@/contexts/ConfiguracoesContext';
import type { Categoria } from '@/contexts/ConfiguracoesContext';

const CategoriesManagement: React.FC = () => {
  const { 
    categorias, 
    adicionarCategoria, 
    editarCategoria, 
    excluirCategoria 
  } = useConfiguracoes();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [novaCategoria, setNovaCategoria] = useState({
    nome: '',
    ativa: true,
    considerarDashboard: true,
    importancia: 'necessario' as 'essencial' | 'necessario' | 'superfluo'
  });

  const niveisImportancia = [
    { value: 'essencial', label: 'Essencial', color: 'bg-red-100 text-red-800' },
    { value: 'necessario', label: 'Necessário', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'superfluo', label: 'Supérfluo', color: 'bg-green-100 text-green-800' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (categoriaEditando) {
      editarCategoria(categoriaEditando.id, novaCategoria);
    } else {
      adicionarCategoria(novaCategoria);
    }

    // Reset form
    setNovaCategoria({
      nome: '',
      ativa: true,
      considerarDashboard: true,
      importancia: 'necessario'
    });
    setMostrarModal(false);
    setCategoriaEditando(null);
  };

  const handleEditar = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setNovaCategoria({
      nome: categoria.nome,
      ativa: categoria.ativa,
      considerarDashboard: categoria.considerarDashboard,
      importancia: categoria.importancia
    });
    setMostrarModal(true);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      excluirCategoria(id);
    }
  };

  const getNivelImportanciaInfo = (nivel: string) => {
    return niveisImportancia.find(n => n.value === nivel) || niveisImportancia[1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gerenciar Categorias
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure as categorias para classificar suas transações
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setMostrarModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {categorias.map((categoria) => (
            <li key={categoria.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TagIcon className={`h-8 w-8 ${categoria.ativa ? 'text-primary-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-medium ${categoria.ativa ? 'text-gray-900' : 'text-gray-500'}`}>
                        {categoria.nome}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getNivelImportanciaInfo(categoria.importancia).color
                      }`}>
                        {getNivelImportanciaInfo(categoria.importancia).label}
                      </span>
                      {!categoria.ativa && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        Dashboard: {categoria.considerarDashboard ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditar(categoria)}
                    className="text-gray-400 hover:text-primary-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleExcluir(categoria.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {categorias.length === 0 && (
            <li>
              <div className="px-4 py-12 text-center">
                <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma categoria</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece criando sua primeira categoria.
                </p>
                <button
                  onClick={() => setMostrarModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Criar Primeira Categoria
                </button>
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Modal de Adicionar/Editar Categoria */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setCategoriaEditando(null);
                  setNovaCategoria({
                    nome: '',
                    ativa: true,
                    considerarDashboard: true,
                    importancia: 'necessario'
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome da Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Alimentação, Transporte, Saúde..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Nível de Importância */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Importância
                </label>
                <select
                  value={novaCategoria.importancia}
                  onChange={(e) => setNovaCategoria(prev => ({ 
                    ...prev, 
                    importancia: e.target.value as 'essencial' | 'necessario' | 'superfluo'
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {niveisImportancia.map((nivel) => (
                    <option key={nivel.value} value={nivel.value}>
                      {nivel.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Essencial: gastos indispensáveis | Necessário: gastos importantes | Supérfluo: gastos opcionais
                </p>
              </div>

              {/* Opções */}
              <div className="space-y-3">
                {/* Ativo */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Categoria Ativa
                    </label>
                    <p className="text-xs text-gray-500">
                      Categorias inativas não aparecem em formulários
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNovaCategoria(prev => ({ ...prev, ativa: !prev.ativa }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      novaCategoria.ativa ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        novaCategoria.ativa ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Considerar no Dashboard */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Exibir no Dashboard
                    </label>
                    <p className="text-xs text-gray-500">
                      Incluir esta categoria nos gráficos e relatórios principais
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNovaCategoria(prev => ({ ...prev, considerarDashboard: !prev.considerarDashboard }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      novaCategoria.considerarDashboard ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        novaCategoria.considerarDashboard ? 'translate-x-6' : 'translate-x-1'
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
                    setCategoriaEditando(null);
                    setNovaCategoria({
                      nome: '',
                      ativa: true,
                      considerarDashboard: true,
                      importancia: 'necessario'
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
                  {categoriaEditando ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
