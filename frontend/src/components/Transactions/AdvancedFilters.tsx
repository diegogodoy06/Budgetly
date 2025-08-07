import React, { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon
} from '@heroicons/react/24/outline';

interface FilterOperation {
  value: string;
  label: string;
}

interface FilterField {
  value: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  operations: FilterOperation[];
  options?: Array<{ value: string | number; label: string }>;
}

interface ActiveFilter {
  id: string;
  field: string;
  fieldLabel: string;
  operation: string;
  operationLabel: string;
  value: string | number | string[];
  valueLabel: string;
}

interface AdvancedFiltersProps {
  accounts: Array<{ id: number; nome: string; tipo: string; banco?: string }>;
  creditCards: Array<{ id: number; nome: string; bandeira?: string }>;
  categories: Array<{ id: number; nome: string }>;
  onFiltersChange: (filters: ActiveFilter[]) => void;
  activeFilters: ActiveFilter[];
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  accounts,
  creditCards,
  categories,
  onFiltersChange,
  activeFilters
}) => {
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [showOperationDropdown, setShowOperationDropdown] = useState(false);
  const [selectedField, setSelectedField] = useState<FilterField | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<FilterOperation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define available filter fields
  const filterFields: FilterField[] = [
    {
      value: 'account',
      label: 'Conta',
      type: 'select',
      operations: [
        { value: 'is', label: 'é' },
        { value: 'is_not', label: 'não é' },
        { value: 'in', label: 'está em' },
        { value: 'not_in', label: 'não está em' }
      ],
      options: [
        ...accounts.map(acc => ({ value: acc.id, label: acc.nome })),
        ...creditCards.map(card => ({ value: `card_${card.id}`, label: `💳 ${card.nome}` }))
      ]
    },
    {
      value: 'amount',
      label: 'Valor',
      type: 'number',
      operations: [
        { value: 'equals', label: 'é igual a' },
        { value: 'not_equals', label: 'não é igual a' },
        { value: 'greater_than', label: 'é maior que' },
        { value: 'less_than', label: 'é menor que' },
        { value: 'greater_equal', label: 'é maior ou igual a' },
        { value: 'less_equal', label: 'é menor ou igual a' },
        { value: 'between', label: 'está entre' }
      ]
    },
    {
      value: 'description',
      label: 'Descrição',
      type: 'text',
      operations: [
        { value: 'contains', label: 'contém' },
        { value: 'not_contains', label: 'não contém' },
        { value: 'equals', label: 'é igual a' },
        { value: 'not_equals', label: 'não é igual a' },
        { value: 'starts_with', label: 'começa com' },
        { value: 'ends_with', label: 'termina com' }
      ]
    },
    {
      value: 'category',
      label: 'Categoria',
      type: 'select',
      operations: [
        { value: 'is', label: 'é' },
        { value: 'is_not', label: 'não é' },
        { value: 'in', label: 'está em' },
        { value: 'not_in', label: 'não está em' }
      ],
      options: categories.map(cat => ({ value: cat.id, label: cat.nome }))
    },
    {
      value: 'date',
      label: 'Data',
      type: 'date',
      operations: [
        { value: 'equals', label: 'é igual a' },
        { value: 'not_equals', label: 'não é igual a' },
        { value: 'before', label: 'é anterior a' },
        { value: 'after', label: 'é posterior a' },
        { value: 'between', label: 'está entre' }
      ]
    },
    {
      value: 'status',
      label: 'Status',
      type: 'select',
      operations: [
        { value: 'is', label: 'é' }
      ],
      options: [
        { value: 'confirmed', label: 'Confirmada' },
        { value: 'pending', label: 'Pendente' }
      ]
    },
    {
      value: 'type',
      label: 'Tipo',
      type: 'select',
      operations: [
        { value: 'is', label: 'é' },
        { value: 'is_not', label: 'não é' }
      ],
      options: [
        { value: 'entrada', label: 'Entrada' },
        { value: 'saida', label: 'Saída' },
        { value: 'transferencia', label: 'Transferência' }
      ]
    }
  ];

  // Handle clicking outside and ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Close all dropdowns and reset selection
        setShowFieldDropdown(false);
        setShowOperationDropdown(false);
        setSelectedField(null);
        setSelectedOperation(null);
        setInputValue('');
        setSelectedOptions([]);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close all dropdowns and reset selection
        setShowFieldDropdown(false);
        setShowOperationDropdown(false);
        setSelectedField(null);
        setSelectedOperation(null);
        setInputValue('');
        setSelectedOptions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleFieldSelect = (field: FilterField) => {
    setSelectedField(field);
    setSelectedOperation(null);
    setInputValue('');
    setSelectedOptions([]);
    // Fecha dropdown de campos e abre o de operações
    setShowFieldDropdown(false);
    setShowOperationDropdown(true);
  };

  const handleOperationSelect = (operation: FilterOperation) => {
    setSelectedOperation(operation);
    setShowOperationDropdown(false);
  };

  const resetSelection = () => {
    setShowFieldDropdown(false);
    setShowOperationDropdown(false);
    setSelectedField(null);
    setSelectedOperation(null);
    setInputValue('');
    setSelectedOptions([]);
  };

  const handleAddFilter = () => {
    if (!selectedField || !selectedOperation) return;

    let value: string | number | string[] = inputValue;
    let valueLabel = inputValue;

    // Handle different field types
    if (selectedField.type === 'select' && selectedField.options) {
      if (selectedOperation.value === 'in' || selectedOperation.value === 'not_in') {
        value = selectedOptions;
        valueLabel = selectedOptions
          .map(opt => selectedField.options?.find(o => o.value.toString() === opt)?.label || opt)
          .join(', ');
      } else {
        const selectedOption = selectedField.options.find(opt => opt.value.toString() === inputValue);
        valueLabel = selectedOption?.label || inputValue;
      }
    } else if (selectedField.type === 'number') {
      value = parseFloat(inputValue) || 0;
      valueLabel = inputValue;
    }

    const newFilter: ActiveFilter = {
      id: `filter_${Date.now()}_${Math.random()}`,
      field: selectedField.value,
      fieldLabel: selectedField.label,
      operation: selectedOperation.value,
      operationLabel: selectedOperation.label,
      value,
      valueLabel
    };

    onFiltersChange([...activeFilters, newFilter]);
    
    // Reset selection after adding filter
    resetSelection();
  };

  const removeFilter = (filterId: string) => {
    onFiltersChange(activeFilters.filter(f => f.id !== filterId));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const renderValueInput = () => {
    if (!selectedField || !selectedOperation) return null;

    if (selectedField.type === 'select' && selectedField.options) {
      if (selectedOperation.value === 'in' || selectedOperation.value === 'not_in') {
        // Multi-select - more compact for inline layout
        return (
          <div className="space-y-2">
            <div className="text-xs text-gray-600">
              Selecione as opções:
            </div>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 bg-gray-50">
              <div className="grid grid-cols-1 gap-1">
                {selectedField.options.map(option => (
                  <label key={option.value} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.value.toString())}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOptions([...selectedOptions, option.value.toString()]);
                        } else {
                          setSelectedOptions(selectedOptions.filter(v => v !== option.value.toString()));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      } else {
        // Single select
        return (
          <select
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            {selectedField.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }
    } else if (selectedField.type === 'date') {
      return (
        <input
          type="date"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    } else if (selectedField.type === 'number') {
      return (
        <input
          type="number"
          step="0.01"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite o valor..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    } else {
      return (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite o texto..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }
  };

  const canAddFilter = () => {
    if (!selectedField || !selectedOperation) return false;
    
    if (selectedField.type === 'select' && (selectedOperation.value === 'in' || selectedOperation.value === 'not_in')) {
      return selectedOptions.length > 0;
    }
    
    return inputValue.trim() !== '';
  };

  return (
    <div className="space-y-4">
      {/* Active Filters Display - Always visible outside dropdowns */}
      {activeFilters.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">
              Filtros ativos ({activeFilters.length}):
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Limpar todos
            </button>
          </div>
          
          {/* Compact filter display - horizontal layout */}
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <div
                key={filter.id}
                className="inline-flex items-center justify-between px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm"
              >
                <div className="text-blue-800">
                  <span className="font-medium">{filter.fieldLabel}</span>
                  {' '}
                  <span>{filter.operationLabel}</span>
                  {' '}
                  <span className="font-medium">{filter.valueLabel}</span>
                </div>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            setShowFieldDropdown(!showFieldDropdown);
            setShowOperationDropdown(false);
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Adicionar Filtro Avançado
        </button>

        {/* Field Selection Dropdown - Vertical */}
        {showFieldDropdown && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Selecione o campo:</div>
              <div className="space-y-1">
                {filterFields.map(field => (
                  <button
                    key={field.value}
                    onClick={() => handleFieldSelect(field)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700 border border-transparent hover:border-gray-200"
                  >
                    {field.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Operation Selection Dropdown - Grid Layout */}
        {showOperationDropdown && selectedField && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-50">
            <div className="p-4">
              <div className="text-sm font-medium text-gray-700 mb-3">
                {selectedField.label} - Selecione a operação:
              </div>
              
              {/* Operations in Grid Layout */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {selectedField.operations.map(operation => (
                  <button
                    key={operation.value}
                    onClick={() => handleOperationSelect(operation)}
                    className={`text-left px-3 py-2 text-sm rounded-md border transition-colors ${
                      selectedOperation?.value === operation.value
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {operation.label}
                  </button>
                ))}
              </div>

              {/* Value Input Field - Below operations */}
              {selectedOperation && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">Valor:</div>
                  {renderValueInput()}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={resetSelection}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddFilter}
                      disabled={!canAddFilter()}
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters;