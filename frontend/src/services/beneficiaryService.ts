import apiClient from './api';
import { Beneficiary, CreateBeneficiaryRequest, BeneficiarySearchParams } from '../types';

export const beneficiaryService = {
  /**
   * Lista todos os beneficiários do workspace atual
   */
  list: async (params?: BeneficiarySearchParams): Promise<Beneficiary[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    
    if (params?.is_active !== undefined) {
      queryParams.append('is_active', params.is_active.toString());
    }
    
    if (params?.is_system !== undefined) {
      queryParams.append('is_system', params.is_system.toString());
    }
    
    const url = `/api/beneficiaries/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data.results || response.data;
  },

  /**
   * Busca um beneficiário por ID
   */
  get: async (id: number): Promise<Beneficiary> => {
    const response = await apiClient.get(`/api/beneficiaries/${id}/`);
    return response.data;
  },

  /**
   * Cria um novo beneficiário
   */
  create: async (data: CreateBeneficiaryRequest): Promise<Beneficiary> => {
    const response = await apiClient.post('/api/beneficiaries/', data);
    return response.data;
  },

  /**
   * Atualiza um beneficiário existente
   */
  update: async (id: number, data: Partial<CreateBeneficiaryRequest>): Promise<Beneficiary> => {
    const response = await apiClient.patch(`/api/beneficiaries/${id}/`, data);
    return response.data;
  },

  /**
   * Remove um beneficiário
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/beneficiaries/${id}/`);
  },

  /**
   * Criação em lote de beneficiários
   */
  bulkCreate: async (beneficiaries: CreateBeneficiaryRequest[]): Promise<Beneficiary[]> => {
    const response = await apiClient.post('/api/beneficiaries/bulk_create/', {
      beneficiaries
    });
    return response.data;
  },

  /**
   * Ativa/desativa um beneficiário
   */
  toggleActive: async (id: number, is_active: boolean): Promise<Beneficiary> => {
    const response = await apiClient.patch(`/api/beneficiaries/${id}/`, { is_active });
    return response.data;
  },

  /**
   * Busca beneficiário por nome, criando automaticamente se não existir
   */
  searchOrCreate: async (nome: string): Promise<{ created: boolean; beneficiary: Beneficiary }> => {
    const response = await apiClient.post('/api/beneficiaries/search-or-create/', { nome });
    return response.data;
  }
};

export default beneficiaryService;
