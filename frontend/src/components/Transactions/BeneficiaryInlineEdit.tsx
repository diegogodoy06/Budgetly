import React, { useState, useEffect, useRef } from 'react';
import { beneficiaryService } from '@/services/beneficiaryService';
import { Beneficiary } from '@/types';

interface BeneficiaryInlineEditProps {
  value: string;
  onSave: (beneficiaryId: number | null, beneficiaryName?: string) => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const BeneficiaryInlineEdit: React.FC<BeneficiaryInlineEditProps> = ({
  value,
  onSave,
  onCancel,
  onKeyDown
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load beneficiaries on mount
  useEffect(() => {
    const loadBeneficiaries = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading beneficiaries for inline edit...');
        const data = await beneficiaryService.list();
        console.log('✅ Loaded beneficiaries:', data);
        setBeneficiaries(data || []);
      } catch (error) {
        console.error('❌ Error loading beneficiaries:', error);
        setBeneficiaries([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    loadBeneficiaries();
  }, []);

  // Filter beneficiaries based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBeneficiaries(beneficiaries);
    } else {
      const filtered = beneficiaries.filter(beneficiary =>
        beneficiary.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBeneficiaries(filtered);
    }
    setSelectedIndex(-1);
  }, [searchTerm, beneficiaries]);

  // Show dropdown when input is focused and has content
  useEffect(() => {
    setShowDropdown(searchTerm.length > 0 || beneficiaries.length > 0);
  }, [searchTerm, beneficiaries]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        handleBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDownInternal = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredBeneficiaries.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredBeneficiaries.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredBeneficiaries[selectedIndex]) {
        handleSelectBeneficiary(filteredBeneficiaries[selectedIndex]);
      } else if (searchTerm.trim()) {
        // Create new beneficiary if doesn't exist
        handleCreateAndSelect(searchTerm.trim());
      } else {
        handleSave();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else {
      onKeyDown(e);
    }
  };

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setSearchTerm(beneficiary.nome);
    setShowDropdown(false);
    onSave(beneficiary.id, beneficiary.nome);
  };

  const handleCreateAndSelect = async (name: string) => {
    try {
      const response = await beneficiaryService.searchOrCreate(name);
      const beneficiary = response.beneficiary;
      
      // Update local list if new beneficiary was created
      if (response.created) {
        setBeneficiaries(prev => [...prev, beneficiary]);
      }
      
      onSave(beneficiary.id, beneficiary.nome);
    } catch (error) {
      console.error('Error creating beneficiary:', error);
      // Fallback: save as text
      onSave(null, name);
    }
  };

  const handleBlur = () => {
    // Save current value when losing focus
    handleSave();
  };

  const handleSave = () => {
    const trimmedValue = searchTerm.trim();
    if (!trimmedValue) {
      onSave(null);
      return;
    }

    // Check if exact match exists
    const exactMatch = beneficiaries.find(b => 
      b.nome.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (exactMatch) {
      onSave(exactMatch.id, exactMatch.nome);
    } else {
      // Try to create new beneficiary
      handleCreateAndSelect(trimmedValue);
    }
  };

  return (
    <div className="relative min-w-[200px]">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDownInternal}
        onBlur={handleBlur}
        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        placeholder="Digite o nome do beneficiário"
        disabled={loading}
      />
      
      {showDropdown && (filteredBeneficiaries.length > 0 || searchTerm.trim()) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto"
        >
          {filteredBeneficiaries.length > 0 ? (
            <ul className="py-1">
              {filteredBeneficiaries.map((beneficiary, index) => (
                <li
                  key={beneficiary.id}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    index === selectedIndex
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelectBeneficiary(beneficiary)}
                >
                  {beneficiary.nome}
                </li>
              ))}
            </ul>
          ) : null}
          
          {searchTerm.trim() && !filteredBeneficiaries.some(b => 
            b.nome.toLowerCase() === searchTerm.toLowerCase()
          ) && (
            <div className="border-t border-gray-200">
              <div
                className={`px-3 py-2 cursor-pointer text-sm text-green-600 hover:bg-green-50 ${
                  selectedIndex === filteredBeneficiaries.length ? 'bg-green-100' : ''
                }`}
                onClick={() => handleCreateAndSelect(searchTerm.trim())}
              >
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">+</span>
                  Criar "{searchTerm.trim()}"
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={onCancel}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-800 text-xs"
        title="Cancelar"
      >
        ✕
      </button>
    </div>
  );
};

export default BeneficiaryInlineEdit;