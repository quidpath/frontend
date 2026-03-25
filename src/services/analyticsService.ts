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

const analyticsService = {
  getOverview: (params?: { start_date?: string; end_date?: string }) =>
    gatewayClient.get<{ data: AnalyticsOverview }>('/analytics/overview/', { params }),

  // Export endpoints — return blob URLs
  exportInvoices: (params: { format: 'excel' | 'csv'; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/invoices/', { params, responseType: 'blob' }),

  exportVendorBills: (params: { format: 'excel' | 'csv'; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/vendor-bills/', { params, responseType: 'blob' }),

  exportExpenses: (params: { format: 'excel' | 'csv'; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/expenses/', { params, responseType: 'blob' }),

  exportQuotations: (params: { format: 'excel' | 'csv'; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/quotations/', { params, responseType: 'blob' }),

  exportPurchaseOrders: (params: { format: 'excel' | 'csv'; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/purchase-orders/', { params, responseType: 'blob' }),

  exportJournalEntries: (params: { format: 'excel' | 'csv'; start_date?: string; end_date?: string }) =>
    gatewayClient.get('/export/journal-entries/', { params, responseType: 'blob' }),

  exportFinancialReport: (params: { report_id: string; format: 'excel' | 'csv' }) =>
    gatewayClient.get('/export/financial-report/', { params, responseType: 'blob' }),

  // Import endpoints
  importCustomers: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return gatewayClient.post('/import/customers/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  importVendors: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return gatewayClient.post('/import/vendors/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  importExpenses: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return gatewayClient.post('/import/expenses/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  importProducts: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return gatewayClient.post('/import/products/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  downloadTemplate: (entity: 'customers' | 'vendors' | 'expenses' | 'products') =>
    gatewayClient.get('/import/template/', { params: { entity }, responseType: 'blob' }),
};

export default analyticsService;
