import React, { useState } from 'react';
import { useBeneficiaries } from '../hooks/useBeneficiaries';
import { 
  UserGroupIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { CreateBeneficiaryRequest } from '../types';

const BeneficiaryCard: React.FC<{
  beneficiary: any;
  onEdit: (beneficiary: any) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, is_active: boolean) => void;
}> = ({ beneficiary, onEdit, onDelete, onToggleActive }) => {
  return (
    <div className={`glass-card p-4 float-card ${!beneficiary.is_active ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {beneficiary.nome}
            {beneficiary.is_system && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400">
                Sistema
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Criado em {new Date(beneficiary.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleActive(beneficiary.id, !beneficiary.is_active)}
            className={`p-2 rounded-lg transition-colors ${
              beneficiary.is_active 
                ? 'text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20' 
                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            title={beneficiary.is_active ? 'Desativar' : 'Ativar'}
          >
            {beneficiary.is_active ? (
              <EyeIcon className="h-5 w-5" />
            ) : (
              <EyeSlashIcon className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={() => onEdit(beneficiary)}
            className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Editar"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          {!beneficiary.is_system && (
            <button
              onClick={() => onDelete(beneficiary.id)}
              className="p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
              title="Excluir"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BeneficiaryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateBeneficiaryRequest) => void;
  beneficiary?: any;
  loading: boolean;
}> = ({ isOpen, onClose, onSave, beneficiary, loading }) => {
  const [formData, setFormData] = useState<CreateBeneficiaryRequest>({
    nome: beneficiary?.nome || '',
    is_active: beneficiary?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      is_active: true
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {beneficiary ? 'Editar Beneficiário' : 'Novo Beneficiário'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Beneficiário
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o nome do beneficiário"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Beneficiário ativo
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nome.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {loading ? 'Salvando...' : (beneficiary ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BeneficiariesPage: React.FC = () => {
  const {
    beneficiaries,
    loading,
    error,
    createBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    toggleBeneficiaryActive
  } = useBeneficiaries();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredBeneficiaries = (Array.isArray(beneficiaries) ? beneficiaries : []).filter(beneficiary => {
    const matchesSearch = beneficiary.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && beneficiary.is_active) ||
      (filter === 'inactive' && !beneficiary.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateBeneficiary = async (data: CreateBeneficiaryRequest) => {
    const success = await createBeneficiary(data);
    if (success) {
      setShowModal(false);
    }
  };

  const handleEditBeneficiary = async (data: CreateBeneficiaryRequest) => {
    if (editingBeneficiary) {
      const success = await updateBeneficiary(editingBeneficiary.id, data);
      if (success) {
        setShowModal(false);
        setEditingBeneficiary(null);
      }
    }
  };

  const handleDeleteBeneficiary = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este beneficiário?')) {
      await deleteBeneficiary(id);
    }
  };

  const openEditModal = (beneficiary: any) => {
    setEditingBeneficiary(beneficiary);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBeneficiary(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <UserGroupIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Beneficiários</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie os beneficiários das suas transações</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Beneficiário
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar beneficiários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="form-select"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card p-4 mb-6 border border-danger-200/50 dark:border-danger-800/50">
          <p className="text-danger-800 dark:text-danger-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Beneficiaries List */}
      {!loading && (
        <div className="grid gap-4">
          {filteredBeneficiaries.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'Nenhum beneficiário encontrado com os filtros aplicados.' 
                  : 'Nenhum beneficiário cadastrado ainda.'}
              </p>
            </div>
          ) : (
            filteredBeneficiaries.map((beneficiary) => (
              <BeneficiaryCard
                key={beneficiary.id}
                beneficiary={beneficiary}
                onEdit={openEditModal}
                onDelete={handleDeleteBeneficiary}
                onToggleActive={toggleBeneficiaryActive}
              />
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <BeneficiaryModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={editingBeneficiary ? handleEditBeneficiary : handleCreateBeneficiary}
        beneficiary={editingBeneficiary}
        loading={loading}
      />
    </div>
  );
};

export default BeneficiariesPage;
