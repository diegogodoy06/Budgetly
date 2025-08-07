import React, { useState, useEffect, useRef } from 'react';

interface InlineEditInputProps {
  type: 'text' | 'number' | 'date' | 'select';
  value: string;
  options?: Array<{ id: number | string; nome: string; label?: string }>;
  placeholder?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
}

const InlineEditInput: React.FC<InlineEditInputProps> = ({
  type,
  value,
  options = [],
  placeholder = '',
  onSave,
  onCancel,
  onKeyDown,
  autoFocus = true,
  maxLength,
  className = '',
  disabled = false
}) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      if (type === 'text' && inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [autoFocus, type]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
    onKeyDown?.(e);
  };

  const handleSave = () => {
    if (type === 'text' && editValue.trim() === '') {
      onCancel();
      return;
    }
    onSave(editValue);
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    // For selects, save immediately when a value is selected
    if (newValue) {
      setTimeout(() => onSave(newValue), 100);
    }
  };

  const baseClassName = `text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`;

  if (type === 'select') {
    return (
      <div className="flex items-center space-x-2 min-w-[200px]">
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={handleSelectChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${baseClassName} flex-1`}
          autoFocus={autoFocus}
          disabled={disabled}
        >
          <option value="">{placeholder || 'Selecione uma opção...'}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label || option.nome}
            </option>
          ))}
        </select>
        <button
          onClick={onCancel}
          className="text-red-600 hover:text-red-800 text-xs"
          title="Cancelar"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={baseClassName}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        disabled={disabled}
        title="Pressione Enter para salvar ou Escape para cancelar"
      />
      <button
        onClick={onCancel}
        className="text-red-600 hover:text-red-800 text-xs"
        title="Cancelar"
      >
        ✕
      </button>
    </div>
  );
};

export default InlineEditInput;