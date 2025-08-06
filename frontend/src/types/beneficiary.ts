export interface Beneficiary {
  id: number;
  nome: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBeneficiaryRequest {
  nome: string;
  is_active?: boolean;
}

export interface BeneficiarySearchParams {
  search?: string;
  is_active?: boolean;
  is_system?: boolean;
}

export interface BulkCreateBeneficiaryRequest {
  beneficiaries: CreateBeneficiaryRequest[];
}
