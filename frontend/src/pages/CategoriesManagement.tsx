import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  FolderIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { categoriesAPI } from '@/services/api';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#3b82f6',
    icone: '📁',
    parent: undefined as number | undefined,
    nivel_importancia: 'necessario' as 'essencial' | 'necessario' | 'superfluo',
    considerar_dashboard: true
  });

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      
      // Primeiro tenta a API hierárquica
      try {
        console.log('Tentando carregar hierarquia...');
        const data = await categoriesAPI.getHierarchy();
        console.log('Dados hierárquicos recebidos:', data);
        setCategories(data);
      } catch (hierarchyError) {
        console.log('Erro na API hierarchy, tentando API básica:', hierarchyError);
        
        // Fallback para API básica
        const data = await categoriesAPI.getAll();
        console.log('Dados básicos recebidos:', data);
        
        // Converte para formato hierárquico básico
        const hierarchyData = data
          .filter(cat => !cat.parent) // Apenas categorias principais
          .map(cat => ({
            ...cat,
            children: data.filter(child => child.parent === cat.id)
          }));
        
        console.log('Dados convertidos para hierarquia:', hierarchyData);
        setCategories(hierarchyData);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (category: Category | null = null, parentId?: number) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        nome: category.nome,
        descricao: category.descricao,
        cor: category.cor,
        icone: category.icone,
        parent: category.parent,
        nivel_importancia: category.nivel_importancia,
        considerar_dashboard: category.considerar_dashboard
      });
    } else {
      setEditingCategory(null);
      setFormData({
        nome: '',
        descricao: '',
        cor: '#3b82f6',
        icone: '📁',
        parent: parentId,
        nivel_importancia: 'necessario',
        considerar_dashboard: true
      });
    }
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      nome: '',
      descricao: '',
      cor: '#3b82f6',
      icone: '📁',
      parent: undefined,
      nivel_importancia: 'necessario',
      considerar_dashboard: true
    });
  };

  const salvarCategoria = async () => {
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoriesAPI.create(formData);
        toast.success('Categoria criada com sucesso!');
      }
      
      fecharModal();
      carregarCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const excluirCategoria = async (category: Category) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.nome}"?`)) {
      return;
    }

    try {
      await categoriesAPI.delete(category.id);
      toast.success('Categoria excluída com sucesso!');
      carregarCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const renderCategoryCard = (category: Category) => {
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <div key={category.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Header da Categoria Principal */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Ícone da categoria */}
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                style={{ backgroundColor: category.cor }}
              >
                <span>{category.icone}</span>
              </div>
              
              {/* Informações da categoria */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{category.nome}</h3>
                <p className="text-sm text-gray-600">{category.descricao}</p>
                {hasChildren && (
                  <p className="text-xs text-gray-400 mt-1">
                    {category.children?.length} subcategorias
                  </p>
                )}
              </div>
            </div>

            {/* Menu de ações */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => abrirModal(null, category.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Adicionar subcategoria"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => abrirModal(category)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar categoria"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => excluirCategoria(category)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir categoria"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subcategorias */}
        {hasChildren && (
          <div className="p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <TagIcon className="h-4 w-4 mr-2" />
              Subcategorias
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.children?.map(subcategory => (
                <div 
                  key={subcategory.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div 
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: subcategory.cor + '20' }}
                      >
                        <span className="text-sm">{subcategory.icone}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {subcategory.nome}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {subcategory.descricao}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirModal(subcategory)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Editar subcategoria"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => excluirCategoria(subcategory)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
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

        {/* Se não tem subcategorias, mostra um placeholder */}
        {!hasChildren && (
          <div className="p-6 text-center">
            <div className="text-gray-400">
              <TagIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Nenhuma subcategoria</p>
              <button
                onClick={() => abrirModal(null, category.id)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Adicionar primeira subcategoria
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gerenciamento de Categorias
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Organize suas transações com categorias principais e subcategorias em cards visuais
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => abrirModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Categoria Principal
          </button>
        </div>
      </div>

      {/* Lista de Categorias em Cards */}
      <div className="space-y-6">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma categoria encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando sua primeira categoria principal.
            </p>
            <div className="mt-6">
              <button
                onClick={() => abrirModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nova Categoria
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map(category => renderCategoryCard(category))}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? 'Editar Categoria' : 
                 formData.parent ? 'Nova Subcategoria' : 'Nova Categoria Principal'}
              </h3>
              
              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Alimentação, Padaria..."
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição da categoria"
                  />
                </div>

                {/* Cor e Ícone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor
                    </label>
                    <input
                      type="color"
                      value={formData.cor}
                      onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ícone
                    </label>
                    <input
                      type="text"
                      value={formData.icone}
                      onChange={(e) => setFormData(prev => ({ ...prev, icone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="😊"
                    />
                  </div>
                </div>

                {/* Categoria Pai (apenas para subcategorias) */}
                {formData.parent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria Principal
                    </label>
                    <select
                      value={formData.parent || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, parent: parseInt(e.target.value) || undefined }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma categoria principal</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Nível de Importância */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nível de Importância
                  </label>
                  <select
                    value={formData.nivel_importancia}
                    onChange={(e) => setFormData(prev => ({ ...prev, nivel_importancia: e.target.value as 'essencial' | 'necessario' | 'superfluo' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="essencial">Essencial</option>
                    <option value="necessario">Necessário</option>
                    <option value="superfluo">Supérfluo</option>
                  </select>
                </div>

                {/* Considerar no Dashboard */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="considerar_dashboard"
                    checked={formData.considerar_dashboard}
                    onChange={(e) => setFormData(prev => ({ ...prev, considerar_dashboard: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="considerar_dashboard" className="ml-2 block text-sm text-gray-900">
                    Considerar no Dashboard
                  </label>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={fecharModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarCategoria}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
