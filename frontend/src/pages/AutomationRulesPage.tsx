import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  CommandLineIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import automationService from '../services/automationService';
import type { AutomationRule } from '../types/automation';
import { RULE_STAGES, RULE_TYPES } from '../types/automation';
import CreateRuleModal from '../components/CreateRuleModal';
import EditRuleModal from '../components/EditRuleModal';

const AutomationRulesPage: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRules, setSelectedRules] = useState<number[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    pre: true,
    default: true,
    post: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados de automação...');
      const rulesData = await automationService.getRules();
      console.log('📊 Dados recebidos:', { rulesData });
      setRules(Array.isArray(rulesData) ? rulesData : []);
    } catch (error) {
      console.error('Error loading automation data:', error);
      toast.error('Erro ao carregar regras de automação');
      // Definir um array vazio em caso de erro
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (data: any) => {
    try {
      await automationService.createRule(data);
      toast.success('Regra criada com sucesso!');
      setCreateModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Erro ao criar regra');
    }
  };

  const handleEditRule = async (data: any) => {
    if (!editingRule) return;
    
    try {
      await automationService.updateRule(editingRule.id, data);
      toast.success('Regra atualizada com sucesso!');
      setEditModalOpen(false);
      setEditingRule(null);
      loadData();
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Erro ao atualizar regra');
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;

    try {
      await automationService.deleteRule(ruleId);
      toast.success('Regra excluída com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Erro ao excluir regra');
    }
  };

  const handleToggleRule = async (ruleId: number, isActive: boolean) => {
    try {
      await automationService.toggleRulesStatus([ruleId], isActive);
      toast.success(`Regra ${isActive ? 'ativada' : 'desativada'} com sucesso!`);
      loadData();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Erro ao alterar status da regra');
    }
  };

  const handleBulkToggle = async (isActive: boolean) => {
    if (selectedRules.length === 0) {
      toast.error('Selecione pelo menos uma regra');
      return;
    }

    try {
      await automationService.toggleRulesStatus(selectedRules, isActive);
      toast.success(`${selectedRules.length} regra(s) ${isActive ? 'ativada(s)' : 'desativada(s)'} com sucesso!`);
      setSelectedRules([]);
      loadData();
    } catch (error) {
      console.error('Error bulk toggling rules:', error);
      toast.error('Erro ao alterar status das regras');
    }
  };

  const handleMoveRule = async (ruleId: number, direction: 'up' | 'down') => {
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return;

    const newIndex = direction === 'up' ? ruleIndex - 1 : ruleIndex + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;

    const newRules = [...rules];
    [newRules[ruleIndex], newRules[newIndex]] = [newRules[newIndex], newRules[ruleIndex]];
    
    // Update priorities
    const updatedRules = newRules.map((rule, index) => ({
      id: rule.id,
      priority: index + 1
    }));

    try {
      await automationService.reorderRules(updatedRules);
      toast.success('Ordem das regras atualizada!');
      loadData();
    } catch (error) {
      console.error('Error reordering rules:', error);
      toast.error('Erro ao reordenar regras');
    }
  };

  const openEditModal = (rule: AutomationRule) => {
    setEditingRule(rule);
    setEditModalOpen(true);
  };

  const toggleStageExpansion = (stage: string) => {
    setExpandedStages(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };

  const toggleRuleSelection = (ruleId: number) => {
    setSelectedRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const groupedRules = (Array.isArray(rules) ? rules : []).reduce((acc, rule) => {
    if (!acc[rule.stage]) {
      acc[rule.stage] = [];
    }
    acc[rule.stage].push(rule);
    return acc;
  }, {} as Record<string, AutomationRule[]>);

  const getRuleConditionsSummary = (rule: AutomationRule) => {
    if (!rule.conditions || rule.conditions.length === 0) return 'Sem condições';
    
    return rule.conditions.map(condition => {
      // Use the correct field names from the API response
      const field = condition.field || 'descrição';
      const type = condition.condition_type_display || condition.condition_type;
      const value = condition.text_value || condition.condition_value || condition.value || '';
      return `${field} ${type} "${value}"`;
    }).join(' E ');
  };

  const getRuleActionsSummary = (rule: AutomationRule) => {
    if (!rule.actions || rule.actions.length === 0) return 'Sem ações';
    
    return rule.actions.map(action => {
      // Use the correct field names from the API response
      const type = action.action_type_display || action.action_type;
      const value = action.text_value || action.action_value || action.value || 
                   (action.category?.name) || (action.beneficiary?.name) || (action.account?.name) || '';
      return `${type}: ${value}`;
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CommandLineIcon className="h-8 w-8 mr-3 text-blue-600" />
            Automação de Transações
          </h1>
          <p className="mt-2 text-gray-600">
            Configure regras para automatizar o processamento de transações financeiras
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Regra
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CommandLineIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de Regras</p>
              <p className="text-2xl font-semibold text-gray-900">{rules.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Regras Ativas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {rules.filter(r => r.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <PauseIcon className="h-8 w-8 text-gray-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Regras Inativas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {rules.filter(r => !r.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Aplicações</p>
              <p className="text-2xl font-semibold text-gray-900">
                {rules.reduce((sum, rule) => sum + rule.times_applied, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRules.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedRules.length} regra(s) selecionada(s)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkToggle(true)}
                className="inline-flex items-center px-3 py-1 border border-green-300 rounded text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
              >
                <PlayIcon className="h-4 w-4 mr-1" />
                Ativar
              </button>
              <button
                onClick={() => handleBulkToggle(false)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
              >
                <PauseIcon className="h-4 w-4 mr-1" />
                Desativar
              </button>
              <button
                onClick={() => setSelectedRules([])}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules by Stage */}
      <div className="space-y-6">
        {Object.entries(RULE_STAGES).map(([stageKey, stageLabel]) => {
          const stageRules = groupedRules[stageKey] || [];
          const isExpanded = expandedStages[stageKey];
          
          return (
            <div key={stageKey} className="bg-white rounded-lg border border-gray-200">
              {/* Stage Header */}
              <div 
                className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleStageExpansion(stageKey)}
              >
                <div className="flex items-center">
                  <ChevronRightIcon 
                    className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                  <h3 className="ml-2 text-lg font-semibold text-gray-900">
                    {stageLabel}
                  </h3>
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {stageRules.length} regra(s)
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {stageKey === 'pre' && 'Executa antes de tudo (renomear beneficiário, etc.)'}
                  {stageKey === 'default' && 'Fluxo principal (categorização, etc.)'}
                  {stageKey === 'post' && 'Executa no final (sobrescrever campos, etc.)'}
                </div>
              </div>

              {/* Stage Rules */}
              {isExpanded && (
                <div className="divide-y divide-gray-200">
                  {stageRules.length === 0 ? (
                    <div className="p-8 text-center">
                      <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma regra</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Crie uma regra para o estágio {stageLabel.toLowerCase()}
                      </p>
                    </div>
                  ) : (
                    stageRules.map((rule, index) => (
                      <div key={rule.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedRules.includes(rule.id)}
                              onChange={() => toggleRuleSelection(rule.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-4 flex-1">
                              <div className="flex items-center">
                                <h4 className="text-sm font-medium text-gray-900">{rule.name}</h4>
                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  rule.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {rule.is_active ? 'Ativa' : 'Inativa'}
                                </span>
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {RULE_TYPES[rule.rule_type as keyof typeof RULE_TYPES]}
                                </span>
                              </div>
                              {rule.description && (
                                <p className="mt-1 text-sm text-gray-500">{rule.description}</p>
                              )}
                              <div className="mt-2 text-xs text-gray-600">
                                <p><strong>Se:</strong> {getRuleConditionsSummary(rule)}</p>
                                <p><strong>Então:</strong> {getRuleActionsSummary(rule)}</p>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                Aplicada {rule.times_applied} vez(es)
                                {rule.last_applied_at && ` • Última aplicação: ${new Date(rule.last_applied_at).toLocaleDateString()}`}
                              </div>
                            </div>
                          </div>

                          {/* Rule Actions */}
                          <div className="flex items-center space-x-2">
                            {/* Move buttons */}
                            <button
                              onClick={() => handleMoveRule(rule.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowUpIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleMoveRule(rule.id, 'down')}
                              disabled={index === stageRules.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowDownIcon className="h-4 w-4" />
                            </button>

                            {/* Toggle active/inactive */}
                            <button
                              onClick={() => handleToggleRule(rule.id, !rule.is_active)}
                              className={`p-2 rounded-lg ${
                                rule.is_active
                                  ? 'text-orange-600 hover:bg-orange-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {rule.is_active ? (
                                <PauseIcon className="h-4 w-4" />
                              ) : (
                                <PlayIcon className="h-4 w-4" />
                              )}
                            </button>

                            {/* Edit button */}
                            <button
                              onClick={() => openEditModal(rule)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {createModalOpen && (
        <CreateRuleModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateRule}
        />
      )}

      {editModalOpen && editingRule && (
        <EditRuleModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditRule}
          rule={editingRule}
        />
      )}
    </div>
  );
};

export default AutomationRulesPage;