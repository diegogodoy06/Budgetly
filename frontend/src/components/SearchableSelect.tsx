import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Option {
  id: number;
  nome: string;
  parent?: number;
  isSelectable?: boolean;
  level?: number;
}

interface SearchableSelectProps {
  options: Option[];
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  allowCreate?: boolean;
  onCreateNew?: (name: string) => Promise<Option>;
  disabled?: boolean;
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Digite para buscar...",
  label,
  error,
  allowCreate = false,
  onCreateNew,
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isCreating, setIsCreating] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Encontrar opção selecionada
  const selectedOption = options.find(opt => opt.id === value);

  // Filtrar opções baseado na busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [searchTerm, options]);

  // Processar hierarquia de categorias
  const processedOptions = filteredOptions.map(option => {
    const level = getOptionLevel(option, options);
    return {
      ...option,
      level,
      isSelectable: option.isSelectable !== false && !hasChildren(option, options)
    };
  });

  // Verificar se opção tem filhos
  function hasChildren(option: Option, allOptions: Option[]): boolean {
    return allOptions.some(opt => opt.parent === option.id);
  }

  // Calcular nível da hierarquia
  function getOptionLevel(option: Option, allOptions: Option[], level = 0): number {
    if (!option.parent) return level;
    const parent = allOptions.find(opt => opt.id === option.parent);
    if (!parent) return level;
    return getOptionLevel(parent, allOptions, level + 1);
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegação por teclado
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      const selectableOptions = processedOptions.filter(opt => opt.isSelectable);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < selectableOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : selectableOptions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            const selectedOpt = selectableOptions[highlightedIndex];
            if (selectedOpt) {
              handleSelect(selectedOpt);
            }
          } else if (allowCreate && searchTerm && !processedOptions.some(opt => 
            opt.nome.toLowerCase() === searchTerm.toLowerCase()
          )) {
            handleCreateNew();
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, processedOptions, searchTerm, allowCreate]);

  const handleSelect = (option: Option) => {
    if (!option.isSelectable) return;
    
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleCreateNew = async () => {
    if (!allowCreate || !onCreateNew || !searchTerm.trim()) return;

    setIsCreating(true);
    try {
      const newOption = await onCreateNew(searchTerm.trim());
      handleSelect(newOption);
    } catch (error) {
      console.error('Erro ao criar nova opção:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setSearchTerm('');
    setIsOpen(false);
  };

  const renderOption = (option: Option, index: number) => {
    const indent = option.level ? option.level * 16 : 0;
    const isHighlighted = index === highlightedIndex;
    const isSelected = option.id === value;

    return (
      <li
        key={option.id}
        className={`
          px-3 py-2 cursor-pointer transition-colors relative
          ${!option.isSelectable 
            ? 'text-gray-400 cursor-not-allowed bg-gray-50 font-medium' 
            : isHighlighted 
              ? 'bg-blue-100 text-blue-900' 
              : isSelected 
                ? 'bg-blue-50 text-blue-700' 
                : 'hover:bg-gray-100'
          }
        `}
        style={{ paddingLeft: `${12 + indent}px` }}
        onClick={() => option.isSelectable && handleSelect(option)}
      >
        {!option.isSelectable && (
          <span className="text-xs text-gray-500 mr-2">📁</span>
        )}
        {option.nome}
        {!option.isSelectable && (
          <span className="text-xs text-gray-400 ml-2">(categoria pai)</span>
        )}
      </li>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div
          className={`
            w-full border rounded-lg bg-white cursor-text transition-all
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
          onClick={() => !disabled && inputRef.current?.focus()}
        >
          <div className="flex items-center px-3 py-2">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2" />
            
            {selectedOption && !isOpen ? (
              <div className="flex-1 flex items-center justify-between">
                <span className="text-gray-900">{selectedOption.nome}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 outline-none bg-transparent"
              />
            )}
            
            <ChevronDownIcon 
              className={`w-4 h-4 text-gray-400 transition-transform ml-2 ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            <ul ref={listRef} className="py-1">
              {processedOptions.filter(opt => opt.isSelectable).map((option, index) => 
                renderOption(option, index)
              )}
              
              {allowCreate && searchTerm && !processedOptions.some(opt => 
                opt.nome.toLowerCase() === searchTerm.toLowerCase()
              ) && (
                <li
                  className={`
                    px-3 py-2 cursor-pointer border-t border-gray-200 text-green-600 hover:bg-green-50
                    ${highlightedIndex === processedOptions.filter(opt => opt.isSelectable).length ? 'bg-green-100' : ''}
                  `}
                  onClick={handleCreateNew}
                >
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">+</span>
                    {isCreating ? 'Criando...' : `Criar "${searchTerm}"`}
                  </div>
                </li>
              )}
              
              {filteredOptions.length === 0 && !allowCreate && (
                <li className="px-3 py-2 text-gray-500 text-center">
                  Nenhuma opção encontrada
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SearchableSelect;
