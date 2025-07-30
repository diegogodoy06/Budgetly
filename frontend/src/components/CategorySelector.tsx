import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { categoriesAPI } from '@/services/api';
import type { Category, CategoryOption } from '@/types';

interface CategorySelectorProps {
  value?: number;
  onChange: (categoryId: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showHierarchy?: boolean; // Se true, mostra estrutura hierárquica visual
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  placeholder = "Selecione uma categoria",
  disabled = false,
  className = "",
  showHierarchy = false
}) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (showHierarchy) {
        // Carrega categorias em estrutura hierárquica
        try {
          console.log('CategorySelector: Tentando carregar hierarquia...');
          const data = await categoriesAPI.getHierarchy();
          console.log('CategorySelector: Dados hierárquicos recebidos:', data);
          const flatList = flattenHierarchy(data);
          setCategories(flatList);
        } catch (hierarchyError) {
          console.log('CategorySelector: Erro na API hierarchy, tentando API básica:', hierarchyError);
          
          // Fallback para API básica
          const data = await categoriesAPI.getAll();
          const hierarchyData = data
            .filter(cat => !cat.parent) // Apenas categorias principais
            .map(cat => ({
              ...cat,
              children: data.filter(child => child.parent === cat.id)
            }));
          
          const flatList = flattenHierarchy(hierarchyData);
          setCategories(flatList);
        }
      } else {
        // Carrega lista plana otimizada para dropdown
        try {
          const data = await categoriesAPI.getFlatList();
          setCategories(data);
        } catch (flatError) {
          console.log('CategorySelector: Erro na API flat-list, tentando API básica:', flatError);
          
          // Fallback para API básica e conversão manual
          const data = await categoriesAPI.getAll();
          const organized = data.map(category => ({
            id: category.id,
            nome: category.parent ? `  └─ ${category.nome}` : category.nome,
            nome_completo: category.parent ? 
              `${data.find(p => p.id === category.parent)?.nome || 'Categoria Pai'} > ${category.nome}` : 
              category.nome,
            parent_id: category.parent,
            is_subcategory: !!category.parent,
            cor: category.cor,
          }));
          setCategories(organized);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const flattenHierarchy = (hierarchicalCategories: Category[]): CategoryOption[] => {
    const result: CategoryOption[] = [];
    
    hierarchicalCategories.forEach(category => {
      // Adiciona categoria principal
      result.push({
        id: category.id,
        nome: category.nome,
        nome_completo: category.nome,
        parent_id: undefined,
        is_subcategory: false,
        cor: category.cor
      });
      
      // Adiciona subcategorias com indentação
      if (category.children && category.children.length > 0) {
        category.children.forEach(child => {
          result.push({
            id: child.id,
            nome: `  └─ ${child.nome}`,
            nome_completo: `${category.nome} > ${child.nome}`,
            parent_id: category.id,
            is_subcategory: true,
            cor: child.cor
          });
        });
      }
    });
    
    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    onChange(selectedId ? parseInt(selectedId) : undefined);
  };

  const getSelectedCategory = () => {
    if (!value) return null;
    return categories.find(cat => cat.id === value);
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
          <option>Carregando categorias...</option>
        </select>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <select disabled className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-500">
          <option>{error}</option>
        </select>
      </div>
    );
  }

  const selectedCategory = getSelectedCategory();

  return (
    <div className={`relative ${className}`}>
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
        }`}
      >
        <option value="">{placeholder}</option>
        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
            className={category.is_subcategory ? 'text-gray-600' : 'font-medium'}
          >
            {category.nome}
          </option>
        ))}
      </select>
      
      {/* Ícone de dropdown */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      {/* Indicador visual da categoria selecionada */}
      {selectedCategory && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: selectedCategory.cor }}
          />
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
