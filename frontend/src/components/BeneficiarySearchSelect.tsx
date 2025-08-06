import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import { beneficiaryService } from '../services/beneficiaryService';

interface BeneficiaryOption {
  id: number;
  nome: string;
}

interface BeneficiarySearchSelectProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  allowCreate?: boolean;
}

const BeneficiarySearchSelect: React.FC<BeneficiarySearchSelectProps> = ({
  value,
  onChange,
  placeholder = "Digite o nome do beneficiário...",
  label,
  error,
  disabled,
  required,
  allowCreate = true
}) => {
  const [options, setOptions] = useState<BeneficiaryOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      const response = await beneficiaryService.list();
      if (response) {
        setOptions(response);
      }
    } catch (error) {
      console.error('Erro ao carregar beneficiários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async (name: string): Promise<BeneficiaryOption> => {
    try {
      const response = await beneficiaryService.searchOrCreate(name);
      const beneficiary = response.beneficiary;
      
      // Atualiza a lista com o novo beneficiário
      if (beneficiary && !options.find(opt => opt.id === beneficiary.id)) {
        setOptions(prev => [...prev, beneficiary]);
      }
      
      return beneficiary;
    } catch (error) {
      console.error('Erro ao criar beneficiário:', error);
      throw error;
    }
  };

  return (
    <SearchableSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder={loading ? "Carregando beneficiários..." : placeholder}
      label={label}
      error={error}
      disabled={disabled || loading}
      required={required}
      allowCreate={allowCreate}
      onCreateNew={allowCreate ? handleCreateNew : undefined}
    />
  );
};

export default BeneficiarySearchSelect;
