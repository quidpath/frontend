import { gatewayClient } from './apiClient';

export interface AnalyticsKPIs {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  total_outstanding: number;
  total_overdue: number;
  total_bills: number;
  revenue_growth: number;
  invoice_count: number;
  expense_count: number;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ExpenseBreakdownItem {
  category: string;
  amount: number;
}

export interface TopCustomer {
  customer: string;
  revenue: number;
}

export interface InvoiceStatusItem {
  status: string;
  count: number;
}

export interface AnalyticsOverview {
  period: { start: string; end: string };
  kpis: AnalyticsKPIs;
  revenue_trend: RevenueTrendPoint[];
  expense_breakdown: ExpenseBreakdownItem[];
  top_customers: TopCustomer[];
  invoice_status: InvoiceStatusItem[];
}

export type ExportFormat = 'excel' | 'csv';
export type ImportEntity = 'customers' | 'vendors' | 'expenses' | 'products';

const analyticsService = {
  // ── Analytics overview ────────────────────────────────────────────────────
  getOverview: (params?: { start_date?: string; end_date?: string }) =>
    gatewayClient.get<{ data: AnalyticsOverview }>('/analytics/overview/', { params }),

  // ── Export endpoints — return blob ────────────────────────────────────────
  exportInvoices: (params: { format: ExportFormat; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/invoices/', { params, responseType: 'blob' }),

  exportVendorBills: (params: { format: ExportFormat; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/vendor-bills/', { params, responseType: 'blob' }),

  exportExpenses: (params: { format: ExportFormat; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/expenses/', { params, responseType: 'blob' }),

  exportQuotations: (params: { format: ExportFormat; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/quotations/', { params, responseType: 'blob' }),

  exportPurchaseOrders: (params: { format: ExportFormat; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/purchase-orders/', { params, responseType: 'blob' }),

  exportJournalEntries: (params: { format: ExportFormat; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/journal-entries/', { params, responseType: 'blob' }),

  exportFinancialReport: (params: { report_id: string; format: ExportFormat }) =>
    gatewayClient.get('/export/financial-report/', { params, responseType: 'blob' }),

  // ── Import endpoints — multipart/form-data ────────────────────────────────
  importCustomers: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return gatewayClient.post('/import/customers/', fd);
  },

  importVendors: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return gatewayClient.post('/import/vendors/', fd);
  },

  importExpenses: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return gatewayClient.post('/import/expenses/', fd);
  },

  importProducts: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return gatewayClient.post('/import/products/', fd);
  },

  downloadTemplate: (entity: ImportEntity) =>
    gatewayClient.get('/import/template/', { params: { entity }, responseType: 'blob' }),
};

export default analyticsService;
