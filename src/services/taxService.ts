import { gatewayClient } from './apiClient';

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: 'sales' | 'purchase' | 'vat' | 'other';
  is_active: boolean;
  description?: string;
  created_at: string;
}

export interface TaxReport {
  id: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  total_purchases: number;
  tax_collected: number;
  tax_paid: number;
  net_tax: number;
  status: 'draft' | 'filed' | 'paid';
  created_at: string;
}

const taxService = {
  getTaxRates: () =>
    gatewayClient.get<{ results: TaxRate[] }>('/tax/rates/'),

  getTaxRate: (id: string) =>
    gatewayClient.get<TaxRate>(`/tax/rates/${id}/`),

  createTaxRate: (data: Omit<TaxRate, 'id' | 'created_at'>) =>
    gatewayClient.post<TaxRate>('/tax/rates/', data),

  updateTaxRate: (id: string, data: Partial<TaxRate>) =>
    gatewayClient.put<TaxRate>(`/tax/rates/${id}/`, data),

  deleteTaxRate: (id: string) =>
    gatewayClient.delete(`/tax/rates/${id}/`),

  getTaxReports: (params?: Record<string, unknown>) =>
    gatewayClient.get<{ results: TaxReport[] }>('/tax/reports/', { params }),

  generateTaxReport: (data: { period_start: string; period_end: string }) =>
    gatewayClient.post<TaxReport>('/tax/reports/generate/', data),
};

export default taxService;
