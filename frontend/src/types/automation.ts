export interface AutomationRule {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  stage: 'pre' | 'default' | 'post';
  rule_type: 'categorization' | 'beneficiary' | 'tag' | 'combination';
  priority: number;
  workspace: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  times_applied: number;
  last_applied_at?: string;
}

export interface RuleCondition {
  id?: number;
  field: string;
  condition_type: string;
  value: string;
  rule?: number;
}

export interface RuleAction {
  id?: number;
  action_type: string;
  value: string;
  rule?: number;
}

export interface AutomationSettings {
  id: number;
  workspace: number;
  auto_learning_enabled: boolean;
  auto_learning_categorization: boolean;
  auto_learning_beneficiary: boolean;
  auto_suggest_rules: boolean;
  min_confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface RuleApplicationLog {
  id: number;
  rule: AutomationRule;
  transaction: number;
  applied_at: string;
  conditions_matched: Record<string, any>;
  actions_executed: Record<string, any>;
  execution_time_ms: number;
}

// Form interfaces
export interface AutomationRuleFormData {
  name: string;
  description?: string;
  is_active: boolean;
  stage: 'pre' | 'default' | 'post';
  rule_type: 'categorization' | 'beneficiary' | 'tag' | 'combination';
  conditions: RuleConditionFormData[];
  actions: RuleActionFormData[];
}

export interface RuleConditionFormData {
  field: string;
  condition_type: string;
  value: string;
}

export interface RuleActionFormData {
  action_type: string;
  value: string;
}

// Available field types for conditions
export const CONDITION_FIELDS = {
  description: 'Descrição',
  amount: 'Valor',
  category: 'Categoria',
  date: 'Data',
  account: 'Conta',
  payee: 'Beneficiário'
};

// Available condition types
export const CONDITION_TYPES = {
  // Text conditions
  is: 'é',
  is_not: 'não é',
  contains: 'contém',
  not_contains: 'não contém',
  matches: 'regex',
  one_of: 'é uma de',
  not_one_of: 'não é uma de',
  
  // Numeric conditions
  equals: 'igual a',
  greater: 'maior que',
  less: 'menor que',
  range: 'entre',
  
  // Date conditions
  before: 'antes de',
  after: 'depois de',
  date_range: 'no período'
};

// Available action types
export const ACTION_TYPES = {
  set_payee: 'Definir beneficiário',
  set_category: 'Definir categoria',
  set_account: 'Definir conta',
  set_description: 'Definir descrição',
  set_amount: 'Definir valor',
  set_date: 'Definir data',
  set_notes: 'Definir observações',
  append_notes: 'Adicionar às observações',
  prepend_notes: 'Adicionar no início das observações',
  mark_cleared: 'Marcar como compensado',
  add_tag: 'Adicionar tag'
};

// Rule stages
export const RULE_STAGES = {
  pre: 'Pré-processamento',
  default: 'Principal',
  post: 'Pós-processamento'
};

// Rule types
export const RULE_TYPES = {
  categorization: 'Categorização',
  beneficiary: 'Beneficiário',
  tag: 'Tag',
  combination: 'Combinação'
};