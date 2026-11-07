export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DocumentType = 'ORCAMENTO' | 'RECIBO';
export type DocumentStatus = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'PAGO' | 'CANCELADO';
export type PaymentMethod = 'PIX' | 'DINHEIRO';

export interface Profile {
  id: string;
  full_name: string;
  company_name: string;
  slogan: string;
  verse: string;
  pix_key: string;
  phone: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone?: string | null;
  tax_id?: string | null;
  default_location?: string | null;
  created_at: string;
}

export interface DocumentItem {
  id?: string;
  document_id?: string;
  order_index: number;
  title: string;
  object_description?: string | null;
  material_cost: number;
  labor_cost: number;
  total_cost: number;
}

export interface Document {
  id: string;
  user_id: string;
  client_id: string;
  document_type: DocumentType;
  code: string;
  issue_date: string;
  location?: string | null;
  status: DocumentStatus;
  payment_method?: PaymentMethod | null;
  pix_key_snapshot?: string | null;
  total_amount: number;
  notes?: string | null;
  origin_document_id?: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  items?: DocumentItem[];
}
