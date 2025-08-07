import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import automationService from '../services/automationService';
import type { 
  AutomationRule,
  AutomationRuleFormData, 
  RuleConditionFormData, 
  RuleActionFormData 
} from '../types/automation';
import {
  CONDITION_FIELDS,
  CONDITION_TYPES,
  ACTION_TYPES,
  RULE_STAGES,
  RULE_TYPES
} from '../types/automation';

interface EditRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AutomationRuleFormData) => void;
  rule: AutomationRule;
}

const EditRuleModal: React.FC<EditRuleModalProps> = ({ isOpen, onClose, onSubmit, rule }) => {
  const [formData, setFormData] = useState<AutomationRuleFormData>({
    name: '',
    description: '',
    is_active: true,
    stage: 'default',
    rule_type: 'categorization',
    conditions: [],
    actions: []
  });

  const [availableOptions, setAvailableOptions] = useState({
    categories: [],
    accounts: [],
    beneficiaries: []
  });

  useEffect(() => {
    if (isOpen && rule) {
      setFormData({
        name: rule.name,
        description: rule.description || '',
        is_active: rule.is_active,
        stage: rule.stage,
        rule_type: rule.rule_type,
        conditions: rule.conditions || [{ field: 'description', condition_type: 'contains', value: '' }],
        actions: rule.actions || [{ action_type: 'set_category', value: '' }]
      });
      loadOptions();
    }
  }, [isOpen, rule]);

  const loadOptions = async () => {
    try {
      const [categories, accounts, beneficiaries] = await Promise.all([
        automationService.getAvailableCategories().catch(() => []),
        automationService.getAvailableAccounts().catch(() => []),
        automationService.getAvailableBeneficiaries().catch(() => [])
      ]);
      
      setAvailableOptions({
        categories,
        accounts,
        beneficiaries
      });
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome da regra é obrigatório');
      return;
    }

    if (formData.conditions.length === 0) {
      toast.error('Adicione pelo menos uma condição');
      return;
    }

    if (formData.actions.length === 0) {
      toast.error('Adicione pelo menos uma ação');
      return;
    }

    // Validate conditions
    for (const condition of formData.conditions) {
      if (!condition.value.trim()) {
        toast.error('Todas as condições devem ter um valor');
        return;
      }
    }

    // Validate actions
    for (const action of formData.actions) {
      if (!action.value.trim()) {
        toast.error('Todas as ações devem ter um valor');
        return;
      }
    }

    onSubmit(formData);
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: 'description', condition_type: 'contains', value: '' }]
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index: number, field: keyof RuleConditionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { action_type: 'set_category', value: '' }]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, field: keyof RuleActionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const getConditionTypes = (field: string) => {
    const textTypes = ['is', 'is_not', 'contains', 'not_contains', 'matches', 'one_of', 'not_one_of'];
    const numericTypes = ['equals', 'greater', 'less', 'range'];
    const dateTypes = ['before', 'after', 'date_range'];

    switch (field) {
      case 'amount':
        return numericTypes;
      case 'date':
        return dateTypes;
      default:
        return textTypes;
    }
  };

  const getActionOptions = (actionType: string) => {
    switch (actionType) {
      case 'set_category':
        return availableOptions.categories.map((cat: any) => ({ value: cat.id, label: cat.nome }));
      case 'set_account':
        return availableOptions.accounts.map((acc: any) => ({ value: acc.id, label: acc.nome }));
      case 'set_payee':
        return availableOptions.beneficiaries.map((ben: any) => ({ value: ben.id, label: ben.nome }));
      default:
        return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Regra de Automação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Regra *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Categorizar compras no Amazon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estágio
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(RULE_STAGES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo da Regra
              </label>
              <select
                value={formData.rule_type}
                onChange={(e) => setFormData(prev => ({ ...prev, rule_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(RULE_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Regra ativa
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição opcional da regra"
            />
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Condições (SE)</h3>
              <button
                type="button"
                onClick={addCondition}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {formData.conditions.map((condition, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {index > 0 && (
                    <span className="text-sm font-medium text-gray-600">E</span>
                  )}
                  
                  <select
                    value={condition.field}
                    onChange={(e) => updateCondition(index, 'field', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {Object.entries(CONDITION_FIELDS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>

                  <select
                    value={condition.condition_type}
                    onChange={(e) => updateCondition(index, 'condition_type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {getConditionTypes(condition.field).map(type => (
                      <option key={type} value={type}>
                        {CONDITION_TYPES[type as keyof typeof CONDITION_TYPES]}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Valor da condição"
                  />

                  {formData.conditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ações (ENTÃO)</h3>
              <button
                type="button"
                onClick={addAction}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {formData.actions.map((action, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <select
                    value={action.action_type}
                    onChange={(e) => updateAction(index, 'action_type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {Object.entries(ACTION_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>

                  {['set_category', 'set_account', 'set_payee'].includes(action.action_type) ? (
                    <select
                      value={action.value}
                      onChange={(e) => updateAction(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Selecione...</option>
                      {getActionOptions(action.action_type).map((option: any) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={action.value}
                      onChange={(e) => updateAction(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Valor da ação"
                    />
                  )}

                  {formData.actions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          {rule && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Estatísticas da Regra</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Aplicações:</span> {rule.times_applied} vez(es)
                </div>
                <div>
                  <span className="font-medium">Última aplicação:</span>{' '}
                  {rule.last_applied_at 
                    ? new Date(rule.last_applied_at).toLocaleDateString() 
                    : 'Nunca'
                  }
                </div>
                <div>
                  <span className="font-medium">Criada em:</span>{' '}
                  {new Date(rule.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Atualizada em:</span>{' '}
                  {new Date(rule.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRuleModal;