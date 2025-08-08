import api from './api';
import type { 
  AutomationRule, 
  AutomationRuleFormData, 
  AutomationSettings,
  RuleApplicationLog 
} from '@/types/automation';

export const automationService = {
  // Rules CRUD
  async getRules(): Promise<AutomationRule[]> {
    const response = await api.get('/api/automation-rules/rules/');
    return response.data.results || response.data;
  },

  async getRulesByStage(): Promise<Record<string, AutomationRule[]>> {
    const response = await api.get('/api/automation-rules/rules/by_stage/');
    return response.data;
  },

  async getRule(id: number): Promise<AutomationRule> {
    const response = await api.get(`/api/automation-rules/rules/${id}/`);
    return response.data;
  },

  // Transform form data to API format
  transformFormDataToAPI(data: AutomationRuleFormData) {
    return {
      ...data,
      conditions: data.conditions.map(condition => ({
        field: condition.field || 'description', // Ensure field is always set
        condition_type: condition.condition_type,
        text_value: condition.value, // Map value to text_value for API
        case_sensitive: false
      })),
      actions: data.actions.map(action => {
        const actionData: any = {
          action_type: action.action_type,
          overwrite_existing: false
        };

        // Map values based on action type
        if (action.action_type === 'set_category') {
          actionData.category = action.value ? parseInt(action.value) : null;
        } else if (action.action_type === 'set_beneficiary') {
          actionData.beneficiary = action.value ? parseInt(action.value) : null;
        } else if (action.action_type === 'set_account') {
          actionData.account = action.value ? parseInt(action.value) : null;
        } else {
          actionData.text_value = action.value;
        }

        return actionData;
      })
    };
  },

  async createRule(data: AutomationRuleFormData): Promise<AutomationRule> {
    console.log('🚀 Dados originais do formulário:', data);
    const transformedData = this.transformFormDataToAPI(data);
    console.log('🔄 Dados transformados para API:', transformedData);
    console.log('📡 URL:', '/api/automation-rules/rules/');
    const response = await api.post('/api/automation-rules/rules/', transformedData);
    console.log('✅ Resposta:', response.data);
    return response.data;
  },

  async updateRule(id: number, data: Partial<AutomationRuleFormData>): Promise<AutomationRule> {
    console.log('🔄 Atualizando regra:', id, data);
    const transformedData = this.transformFormDataToAPI(data as AutomationRuleFormData);
    console.log('🔄 Dados transformados para atualização:', transformedData);
    const response = await api.patch(`/api/automation-rules/rules/${id}/`, transformedData);
    return response.data;
  },

  async deleteRule(id: number): Promise<void> {
    await api.delete(`/api/automation-rules/rules/${id}/`);
  },

  // Rule management operations
  async reorderRules(rules: { id: number; priority: number }[]): Promise<void> {
    await api.post('/api/automation-rules/rules/reorder_rules/', { rules });
  },

  async toggleRulesStatus(ruleIds: number[], isActive: boolean): Promise<void> {
    await api.post('/api/automation-rules/rules/bulk_toggle/', {
      rule_ids: ruleIds,
      is_active: isActive
    });
  },

  async testRules(transactionData: any): Promise<any> {
    const response = await api.post('/api/automation-rules/rules/test_all_rules/', transactionData);
    return response.data;
  },

  // Settings
  async getSettings(): Promise<AutomationSettings> {
    const response = await api.get('/api/automation-rules/settings/');
    return response.data.results || response.data;
  },

  async updateSettings(data: Partial<AutomationSettings>): Promise<AutomationSettings> {
    const response = await api.patch('/api/automation-rules/settings/update_workspace_settings/', data);
    return response.data;
  },

  // Logs
  async getLogs(params?: { rule_id?: number; transaction_id?: number; limit?: number }): Promise<RuleApplicationLog[]> {
    const response = await api.get('/api/automation-rules/logs/', { params });
    return response.data.results || response.data;
  },

  // Utility functions
  async getAvailableCategories(): Promise<any[]> {
    const response = await api.get('/api/categories/categories/');
    return response.data.results || response.data;
  },

  async getAvailableAccounts(): Promise<any[]> {
    const response = await api.get('/api/accounts/accounts/');
    return response.data.results || response.data;
  },

  async getAvailableBeneficiaries(): Promise<any[]> {
    const response = await api.get('/api/beneficiaries/');
    return response.data.results || response.data;
  }
};

export default automationService;