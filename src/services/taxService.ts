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
  // Tax rate is served from the accounting module
  getTaxRates: () =>
    gatewayClient.get<{ results: TaxRate[] }>('/get-tax-rate/'),

  getTaxRate: (id: string) =>
    gatewayClient.get<TaxRate>('/get-tax-rate/', { params: { id } }),

  createTaxRate: (data: Omit<TaxRate, 'id' | 'created_at'>) =>
    gatewayClient.post<TaxRate>('/get-tax-rate/', data),

  updateTaxRate: (id: string, data: Partial<TaxRate>) =>
    gatewayClient.put<TaxRate>('/get-tax-rate/', { id, ...data }),

  deleteTaxRate: (id: string) =>
    gatewayClient.delete('/get-tax-rate/', { params: { id } }),

  getTaxReports: (params?: Record<string, unknown>) =>
    gatewayClient.get<{ results: TaxReport[] }>('/reports/aging/', { params }),

  generateTaxReport: (data: { period_start: string; period_end: string }) =>
    gatewayClient.post<TaxReport>('/reports/aging/', data),
};

export default taxService;
