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
  field?: string;
  condition_type: string;
  condition_type_display?: string;
  text_value?: string;
  text_values?: string[];
  numeric_value?: number;
  numeric_value_max?: number;
  date_value?: string;
  date_value_max?: string;
  boolean_value?: boolean;
  case_sensitive?: boolean;
  condition_value?: string;
  value?: string; // for form compatibility
  rule?: number;
  created_at?: string;
  category_refs?: any[];
  beneficiary_refs?: any[];
  account_refs?: any[];
}

export interface RuleAction {
  id?: number;
  action_type: string;
  action_type_display?: string;
  category?: any;
  beneficiary?: any;
  account?: any;
  tag?: string;
  text_value?: string;
  numeric_value?: number;
  date_value?: string;
  boolean_value?: boolean;
  overwrite_existing?: boolean;
  action_value?: string;
  value?: string; // for form compatibility
  rule?: number;
  created_at?: string;
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
  // Description conditions
  description_is: 'é',
  description_is_not: 'não é',
  description_contains: 'contém',
  description_not_contains: 'não contém',
  description_matches: 'regex',
  description_one_of: 'é uma de',
  description_not_one_of: 'não é uma de',
  
  // Amount conditions
  amount_is: 'é',
  amount_is_not: 'não é',
  amount_greater: 'maior que',
  amount_less: 'menor que',
  amount_range: 'entre',
  
  // Category conditions
  category_is: 'é',
  category_is_not: 'não é',
  category_one_of: 'é uma de',
  category_not_one_of: 'não é uma de',
  
  // Beneficiary conditions
  beneficiary_is: 'é',
  beneficiary_is_not: 'não é',
  beneficiary_contains: 'contém',
  beneficiary_not_contains: 'não contém',
  beneficiary_one_of: 'é um de',
  beneficiary_not_one_of: 'não é um de',
  
  // Account conditions
  account_is: 'é',
  account_is_not: 'não é',
  account_one_of: 'é uma de',
  account_not_one_of: 'não é uma de',
  
  // Date conditions
  date_is: 'é',
  date_is_not: 'não é',
  date_after: 'depois de',
  date_before: 'antes de',
  date_range: 'no período',
  
  // Transaction type
  transaction_type: 'tipo de transação'
};

// Available action types
export const ACTION_TYPES = {
  set_beneficiary: 'Definir beneficiário',
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