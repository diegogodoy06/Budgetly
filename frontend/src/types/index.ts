export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface Account {
  id: number;
  nome: string;
  tipo: 'conta-bancaria' | 'conta-investimento' | 'criptomoeda' | 'cofre' | 'cartao-prepago';
  banco?: string;
  codigo_banco?: string;
  saldo_inicial: string;
  saldo_atual: string;
  eh_conta: boolean;
  cor: string;
  icone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountFormData {
  nome: string;
  tipo: 'conta-bancaria' | 'conta-investimento' | 'criptomoeda' | 'cofre' | 'cartao-prepago';
  banco?: string;
  codigo_banco?: string;
  saldo_inicial: number;
  eh_conta: boolean;
  cor: string;
  icone: string;
}

export interface CreditCard {
  id: number;
  nome: string;
  bandeira: CreditCardBrand;
  bandeira_display: string;
  ultimos_4_digitos: string;
  dia_vencimento: number;
  dia_fechamento: number;
  limite: string;
  saldo_atual: string;
  disponivel: string;
  percentual_usado: number;
  cor: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreditCardBrand = 
  | 'Visa'
  | 'Mastercard'
  | 'American Express'
  | 'Elo'
  | 'Hipercard'
  | 'Diners Club'
  | 'Discover'
  | 'JCB'
  | 'UnionPay'
  | 'Cabal'
  | 'Aura'
  | 'Banricompras';

export interface CreditCardFormData {
  nome: string;
  bandeira: CreditCardBrand;
  ultimos_4_digitos: string;
  dia_vencimento: number;
  dia_fechamento: number;
  limite: number;
  cor: string;
}

export interface Category {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  nivel_importancia: 'essencial' | 'necessario' | 'superfluo';
  considerar_dashboard: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  nome: string;
  cor: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user: number;
  account: number;
  account_name: string;
  to_account?: number;
  to_account_name?: string;
  credit_card?: number;
  tipo: 'entrada' | 'saida' | 'transferencia';
  valor: string;
  valor_formatado: string;
  descricao: string;
  observacoes: string;
  data: string;
  category?: number;
  category_name?: string;
  cost_center?: number;
  tags: number[];
  tags_list: string[];
  total_parcelas: number;
  numero_parcela: number;
  transacao_pai?: number;
  tipo_recorrencia: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';
  data_fim_recorrencia?: string;
  confirmada: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionFormData {
  account: number;
  to_account?: number;
  credit_card?: number;
  tipo: 'entrada' | 'saida' | 'transferencia';
  valor: number;
  descricao: string;
  observacoes?: string;
  data: string;
  category?: number;
  cost_center?: number;
  tags?: number[];
  total_parcelas: number;
  tipo_recorrencia: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';
  data_fim_recorrencia?: string;
  confirmada: boolean;
}

export interface Budget {
  id: number;
  category: number;
  category_name: string;
  month: number;
  year: number;
  planned_amount: string;
  spent_amount: string;
  remaining_amount: string;
  percentage_used: number;
  is_over_budget: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditCardBill {
  id: number;
  account: number;
  account_name: string;
  month: number;
  year: number;
  closing_date: string;
  due_date: string;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  status: 'open' | 'closed' | 'paid' | 'overdue';
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  total_accounts: number;
  total_balance: string;
  monthly_income: string;
  monthly_expense: string;
  pending_bills: number;
  active_budgets: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}
