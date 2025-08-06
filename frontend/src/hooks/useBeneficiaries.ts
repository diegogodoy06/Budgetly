import { useState, useEffect, useCallback } from 'react';
import { beneficiaryService } from '../services/beneficiaryService';
import { Beneficiary, CreateBeneficiaryRequest, BeneficiarySearchParams } from '../types';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const useBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  const loadBeneficiaries = useCallback(async (params?: BeneficiarySearchParams) => {
    if (!currentWorkspace) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await beneficiaryService.list(params);
      setBeneficiaries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar beneficiários');
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  const createBeneficiary = useCallback(async (data: CreateBeneficiaryRequest): Promise<Beneficiary | null> => {
    if (!currentWorkspace) return null;

    setLoading(true);
    setError(null);
    
    try {
      const newBeneficiary = await beneficiaryService.create(data);
      setBeneficiaries(prev => [...prev, newBeneficiary]);
      return newBeneficiary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar beneficiário');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  const updateBeneficiary = useCallback(async (id: number, data: Partial<CreateBeneficiaryRequest>): Promise<Beneficiary | null> => {
    if (!currentWorkspace) return null;

    setLoading(true);
    setError(null);
    
    try {
      const updatedBeneficiary = await beneficiaryService.update(id, data);
      setBeneficiaries(prev => 
        prev.map(beneficiary => 
          beneficiary.id === id ? updatedBeneficiary : beneficiary
        )
      );
      return updatedBeneficiary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar beneficiário');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  const deleteBeneficiary = useCallback(async (id: number): Promise<boolean> => {
    if (!currentWorkspace) return false;

    setLoading(true);
    setError(null);
    
    try {
      await beneficiaryService.delete(id);
      setBeneficiaries(prev => prev.filter(beneficiary => beneficiary.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover beneficiário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  const toggleBeneficiaryActive = useCallback(async (id: number, is_active: boolean): Promise<Beneficiary | null> => {
    if (!currentWorkspace) return null;

    setLoading(true);
    setError(null);
    
    try {
      const updatedBeneficiary = await beneficiaryService.toggleActive(id, is_active);
      setBeneficiaries(prev => 
        prev.map(beneficiary => 
          beneficiary.id === id ? updatedBeneficiary : beneficiary
        )
      );
      return updatedBeneficiary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status do beneficiário');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  const bulkCreateBeneficiaries = useCallback(async (beneficiariesData: CreateBeneficiaryRequest[]): Promise<Beneficiary[] | null> => {
    if (!currentWorkspace) return null;

    setLoading(true);
    setError(null);
    
    try {
      const newBeneficiaries = await beneficiaryService.bulkCreate(beneficiariesData);
      setBeneficiaries(prev => [...prev, ...newBeneficiaries]);
      return newBeneficiaries;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar beneficiários em lote');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  // Auto-load quando o workspace mudar
  useEffect(() => {
    if (currentWorkspace) {
      loadBeneficiaries();
    } else {
      setBeneficiaries([]);
    }
  }, [currentWorkspace, loadBeneficiaries]);

  return {
    beneficiaries,
    loading,
    error,
    loadBeneficiaries,
    createBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    toggleBeneficiaryActive,
    bulkCreateBeneficiaries
  };
};
