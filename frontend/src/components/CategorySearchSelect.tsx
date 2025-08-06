import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import { categoriesAPI } from '../services/api';

interface CategoryOption {
  id: number;
  nome: string;
  parent?: number;
  isSelectable?: boolean;
  level?: number;
}

interface CategorySearchSelectProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const CategorySearchSelect: React.FC<CategorySearchSelectProps> = ({
  value,
  onChange,
  placeholder = "Digite para buscar categoria...",
  label,
  error,
  disabled,
  required
}) => {
  const [options, setOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getFlatList();
      if (response) {
        setOptions(response);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchableSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder={loading ? "Carregando categorias..." : placeholder}
      label={label}
      error={error}
      disabled={disabled || loading}
      required={required}
      allowCreate={false}
    />
  );
};

export default CategorySearchSelect;
