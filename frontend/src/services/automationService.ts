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
    return response.data;
  },

  async getRulesByStage(): Promise<Record<string, AutomationRule[]>> {
    const response = await api.get('/api/automation-rules/rules/by_stage/');
    return response.data;
  },

  async getRule(id: number): Promise<AutomationRule> {
    const response = await api.get(`/api/automation-rules/rules/${id}/`);
    return response.data;
  },

  async createRule(data: AutomationRuleFormData): Promise<AutomationRule> {
    const response = await api.post('/api/automation-rules/rules/', data);
    return response.data;
  },

  async updateRule(id: number, data: Partial<AutomationRuleFormData>): Promise<AutomationRule> {
    const response = await api.patch(`/api/automation-rules/rules/${id}/`, data);
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
    return response.data;
  },

  async updateSettings(data: Partial<AutomationSettings>): Promise<AutomationSettings> {
    const response = await api.patch('/api/automation-rules/settings/', data);
    return response.data;
  },

  // Logs
  async getLogs(params?: { rule_id?: number; transaction_id?: number; limit?: number }): Promise<RuleApplicationLog[]> {
    const response = await api.get('/api/automation-rules/logs/', { params });
    return response.data;
  },

  // Utility functions
  async getAvailableCategories(): Promise<any[]> {
    const response = await api.get('/api/categorias/');
    return response.data;
  },

  async getAvailableAccounts(): Promise<any[]> {
    const response = await api.get('/api/accounts/');
    return response.data;
  },

  async getAvailableBeneficiaries(): Promise<any[]> {
    const response = await api.get('/api/beneficiarios/');
    return response.data;
  }
};

export default automationService;