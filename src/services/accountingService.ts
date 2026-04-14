import { gatewayClient } from './apiClient';

/** Backend list response: { invoices, total, status_counts, code?, message? } */
export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  discount: number;
  taxable: string;
  tax_amount: number;
  sub_total: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  date: string;
  due_date: string;
  status: string;
  salesperson: string;
  ship_date?: string;
  ship_via?: string;
  terms?: string;
  fob?: string;
  comments?: string;
  purchase_order?: string;
  sub_total: number;
  tax_total: number;
  total: number;
  total_discount: number;
  lines: InvoiceLine[];
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  status_counts: Record<string, number>;
}

export interface JournalEntryLine {
  id: string;
  account_id: string;
  debit: string;
  credit: string;
  description?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  is_posted: boolean;
  lines: JournalEntryLine[];
}

export interface JournalListResponse {
  journal_entries: JournalEntry[];
  total: number;
}

/** Summary for dashboard (optional; backend may expose later). */
export interface Expense {
  id: string;
  date: string;
  vendor: string;
  vendor_id?: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  payment_method?: string;
  reference?: string;
  receipt_url?: string;
  tax_amount?: number;
  created_at?: string;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
}

export interface AccountingSummary {
  total_revenue?: number;
  total_revenue_previous?: number;
  total_revenue_change?: number;
  total_revenue_trend?: 'up' | 'down' | 'neutral';
  
  total_outstanding?: number;
  total_outstanding_previous?: number;
  total_outstanding_change?: number;
  total_outstanding_trend?: 'up' | 'down' | 'neutral';
  
  total_overdue?: number;
  total_overdue_previous?: number;
  total_overdue_change?: number;
  total_overdue_trend?: 'up' | 'down' | 'neutral';
  
  paid_this_month?: number;
  paid_this_month_previous?: number;
  paid_this_month_change?: number;
  paid_this_month_trend?: 'up' | 'down' | 'neutral';
  
  invoices_count?: number;
  currency?: string;
}

const accountingService = {
  getInvoices: (params?: Record<string, string>) =>
    gatewayClient.get<InvoiceListResponse>('/invoice/list/', { params }),

  getInvoice: (id: string) =>
    gatewayClient.get<Invoice>('/invoice/get/', { params: { id } }),

  // Creates invoice as draft — backend: POST /invoice/save-draft/
  createInvoice: (data: {
    customer: string; customer_id?: string; date: string; due_date: string;
    number?: string; terms?: string; comments?: string; purchase_order?: string;
    lines: unknown[];
  }) => {
    const payload = {
      customer: data.customer_id || data.customer,
      date: data.date,
      due_date: data.due_date,
      number: data.number || `INV-${Date.now()}`,
      terms: data.terms || '',
      comments: data.comments || '',
      purchase_order: data.purchase_order || '',
      lines: data.lines,
    };
    return gatewayClient.post<Invoice>('/invoice/save-draft/', payload);
  },

  updateInvoice: (id: string, data: Record<string, unknown>) =>
    gatewayClient.put<Invoice>('/invoice/update/', { id, ...data }),

  deleteInvoice: (id: string) =>
    gatewayClient.delete('/invoice/delete/', { params: { id } }),

  sendInvoice: (id: string) =>
    gatewayClient.post(`/invoice/${id}/send/`),

  getJournalEntries: (params?: Record<string, string>) =>
    gatewayClient.get<JournalListResponse>('/journal/list/', { params }),

  getJournalEntry: (id: string) =>
    gatewayClient.get<JournalEntry>('/journal/get/', { params: { id } }),

  createJournalEntry: (data: { date: string; reference: string; description: string; lines: unknown[] }) =>
    gatewayClient.post<JournalEntry>('/journal/create/', data),

  updateJournalEntry: (id: string, data: Record<string, unknown>) =>
    gatewayClient.put<JournalEntry>('/journal/update/', { id, ...data }),

  deleteJournalEntry: (id: string) =>
    gatewayClient.delete('/journal/delete/', { params: { id } }),

  postJournalEntry: (id: string) =>
    gatewayClient.post('/journal/post/', { id }),

  // Expenses
  getExpenses: (params?: Record<string, string>) =>
    gatewayClient.get<ExpenseListResponse>('/expense/list/', { params }),

  getExpense: (id: string) =>
    gatewayClient.get<Expense>('/expense/get/', { params: { id } }),

  createExpense: (data: {
    date: string; vendor_id?: string; category: string;
    description: string; amount: number; payment_method?: string; reference?: string;
  }) => {
    const backendData = {
      date: data.date,
      reference: data.reference || `EXP-${Date.now()}`,
      description: data.description,
      category: data.category,
      amount: data.amount,
      vendor_id: data.vendor_id,
    };
    return gatewayClient.post<Expense>('/expense/create/', backendData);
  },

  updateExpense: (id: string, data: Record<string, unknown>) =>
    gatewayClient.put<Expense>('/expense/update/', { id, ...data }),

  deleteExpense: (id: string) =>
    gatewayClient.delete('/expense/delete/', { params: { id } }),

  // Summary
  getSummary: () =>
    gatewayClient.get<AccountingSummary>('/accounting/summary/'),
};

// ============================================================================
// CUSTOMERS
// ============================================================================
export const customerService = {
  create: (data: any) => gatewayClient.post('/customer/create/', data),
  list: (params?: Record<string, string>) => gatewayClient.get('/customer/list/', { params }),
  update: (data: any) => gatewayClient.put('/customer/update/', data),
  delete: (id: string) => gatewayClient.delete('/customer/delete/', { params: { id } }),
};

// ============================================================================
// VENDORS
// ============================================================================
export const vendorService = {
  create: (data: any) => gatewayClient.post('/vendor/create/', data),
  list: (params?: Record<string, string>) => gatewayClient.get('/vendor/list/', { params }),
  get: (id: string) => gatewayClient.get('/vendor/get/', { params: { id } }),
  update: (data: any) => gatewayClient.put('/vendor/update/', data),
  delete: (id: string) => gatewayClient.delete('/vendor/delete/', { params: { id } }),
  search: (query: string) => gatewayClient.get('/vendor/search/', { params: { query } }),
};

// ============================================================================
// CHART OF ACCOUNTS
// ============================================================================
export const accountService = {
  create: (data: any) => gatewayClient.post('/account/create/', data),
  list: (params?: Record<string, string>) => gatewayClient.get('/account/list/', { params }),
  get: (id: string) => gatewayClient.get('/account/get/', { params: { id } }),
  update: (data: any) => gatewayClient.put('/account/update/', data),
  delete: (id: string) => gatewayClient.delete('/account/delete/', { params: { id } }),
  
  // Account Types
  createType: (data: any) => gatewayClient.post('/account-types/create/', data),
  listTypes: () => gatewayClient.get('/account-types/list/'),
  getType: (id: string) => gatewayClient.get('/account-types/get/', { params: { id } }),
  updateType: (data: any) => gatewayClient.put('/account-types/update/', data),
  deleteType: (id: string) => gatewayClient.delete('/account-types/delete/', { params: { id } }),
  
  // Account Sub-Types
  createSubType: (data: any) => gatewayClient.post('/account-sub-types/create/', data),
  listSubTypes: (params?: Record<string, string>) => gatewayClient.get('/account-sub-types/list/', { params }),
  getSubType: (id: string) => gatewayClient.get('/account-sub-types/get/', { params: { id } }),
  updateSubType: (data: any) => gatewayClient.put('/account-sub-types/update/', data),
  deleteSubType: (id: string) => gatewayClient.delete('/account-sub-types/delete/', { params: { id } }),
  
  seedDefaults: () => gatewayClient.post('/accounts/seed-defaults/', {}),
};

// ============================================================================
// JOURNAL ENTRIES - Extended
// ============================================================================
export const journalService = {
  ...accountingService, // Keep existing methods
  unpost: (id: string) => gatewayClient.post('/journal/unpost/', { id }),
  duplicate: (id: string) => gatewayClient.post('/journal/duplicate/', { id }),
};

// ============================================================================
// QUOTATIONS
// ============================================================================
export const quotationService = {
  saveDraft: (data: any) => gatewayClient.post('/quotation/save-draft/', data),
  createAndPost: (data: any) => gatewayClient.post('/quotation/create-and-post/', data),
  list: (params?: Record<string, string>) => gatewayClient.get('/quotation/list/', { params }),
  listDrafts: () => gatewayClient.get('/quotation/drafts/'),
  get: (id: string) => gatewayClient.get('/quotation/get/', { params: { id } }),
  update: (data: any) => gatewayClient.put('/quotation/update/', data),
  delete: (id: string) => gatewayClient.delete('/quotation/delete/', { params: { id } }),
  post: (id: string) => gatewayClient.post(`/quotation/${id}/post/`, {}),
  autoSave: (id: string, data: any) => gatewayClient.post(`/quotation/${id}/auto-save/`, data),
  send: (id: string) => gatewayClient.post(`/quotation/${id}/send/`, {}),
  convertToInvoice: (data: any) => gatewayClient.post('/quotation/invoice-quote/', data),
  downloadPdf: (id: string) => gatewayClient.get('/quotation/download-pdf/', { params: { id }, responseType: 'blob' }),
};

// ============================================================================
// PURCHASE ORDERS
// ============================================================================
export const purchaseOrderService = {
  saveDraft: (data: any) => gatewayClient.post('/purchase-orders/save-draft/', data),
  createAndPost: (data: any) => gatewayClient.post('/purchase-orders/create-and-post/', data),
  list: (params?: Record<string, string>) => gatewayClient.get('/purchase-orders/list/', { params }),
  listDrafts: () => gatewayClient.get('/purchase-orders/drafts/'),
  get: (id: string) => gatewayClient.get('/purchase-orders/get/', { params: { id } }),
  update: (data: any) => gatewayClient.put('/purchase-orders/update/', data),
  delete: (id: string) => gatewayClient.delete('/purchase-orders/delete/', { params: { id } }),
  post: (id: string) => gatewayClient.post(`/purchase-orders/${id}/post/`, {}),
  autoSave: (id: string, data: any) => gatewayClient.post(`/purchase-orders/${id}/auto-save/`, data),
  send: (id: string) => gatewayClient.post(`/purchase-orders/${id}/send/`, {}),
  downloadPdf: (id: string) => gatewayClient.get('/purchase-orders/download-pdf/', { params: { id }, responseType: 'blob' }),
};

// ============================================================================
// VENDOR BILLS
// ============================================================================
export const vendorBillService = {
  create: (data: any) => gatewayClient.post('/vendor-bill/create/', data),
  update: (data: any) => gatewayClient.put('/vendor-bill/update/', data),
  list: (params?: Record<string, string>) => gatewayClient.get('/vendor-bill/list/', { params }),
  listDrafts: () => gatewayClient.get('/vendor-bill/drafts/'),
  listPO: () => gatewayClient.get('/vendor-bill/po/list/'),
  get: (id: string) => gatewayClient.get('/vendor-bill/get/', { params: { id } }),
  delete: (id: string) => gatewayClient.delete('/vendor-bill/delete/', { params: { id } }),
  post: (id: string) => gatewayClient.post(`/vendor-bill/${id}/post/`, {}),
  autoSave: (id: string, data: any) => gatewayClient.post(`/vendor-bill/${id}/auto-save/`, data),
  convertFromPO: (data: any) => gatewayClient.post('/vendor-bill/convert-purchase-order/', data),
  downloadPdf: (id: string) => gatewayClient.get('/vendor-bill/download-pdf/', { params: { id }, responseType: 'blob' }),
};

// ============================================================================
// TAX RATES
// ============================================================================
export const taxRateService = {
  create: (data: any) => gatewayClient.post('/tax-rates/create/', data),
  list: () => gatewayClient.get('/tax-rates/list/'),
  get: (id: string) => gatewayClient.get('/tax-rates/get/', { params: { id } }),
  update: (data: any) => gatewayClient.put('/tax-rates/update/', data),
  delete: (id: string) => gatewayClient.delete('/tax-rates/delete/', { params: { id } }),
  seedDefaults: () => gatewayClient.post('/tax-rates/seed-defaults/', {}),
  getTaxRate: () => gatewayClient.get('/get-tax-rate/'),
};

// ============================================================================
// PETTY CASH
// ============================================================================
export const pettyCashService = {
  // Funds
  createFund: (data: any) => gatewayClient.post('/petty-cash/funds/create/', data),
  listFunds: () => gatewayClient.get('/petty-cash/funds/list/'),
  
  // Transactions
  createTransaction: (data: any) => gatewayClient.post('/petty-cash/transactions/create/', data),
  listTransactions: () => gatewayClient.get('/petty-cash/transactions/list/'),
  approveTransaction: (transaction_id: string) => gatewayClient.post('/petty-cash/transactions/approve/', { transaction_id }),
  reverseTransaction: (transaction_id: string) => gatewayClient.post('/petty-cash/transactions/reverse/', { transaction_id }),
  deleteTransaction: (id: string) => gatewayClient.delete('/petty-cash/transactions/delete/', { params: { id } }),
};

// ============================================================================
// BANK RECONCILIATION
// ============================================================================
export const bankReconciliationService = {
  create: (data: any) => gatewayClient.post('/bank-reconciliation/create/', data),
  list: () => gatewayClient.get('/bank-reconciliation/list/'),
  get: (id: string) => gatewayClient.get('/bank-reconciliation/get/', { params: { id } }),
  addItem: (data: any) => gatewayClient.post('/bank-reconciliation/add-item/', data),
  complete: (reconciliation_id: string) => gatewayClient.post('/bank-reconciliation/complete/', { reconciliation_id }),
  delete: (id: string) => gatewayClient.delete('/bank-reconciliation/delete/', { params: { id } }),
};

// ============================================================================
// REPORTS
// ============================================================================
export const reportService = {
  // Trial Balance & Ledger
  getTrialBalance: (params?: Record<string, string>) => gatewayClient.get('/trial-balance/', { params }),
  downloadTrialBalance: (params?: Record<string, string>) => gatewayClient.get('/trial-balance/download/', { params, responseType: 'blob' }),
  listLedger: (params?: Record<string, string>) => gatewayClient.get('/ledger/list/', { params }),
  downloadLedger: (params?: Record<string, string>) => gatewayClient.get('/ledger/download/', { params, responseType: 'blob' }),
  
  // Financial Reports
  generateProfitLoss: (data: any) => gatewayClient.post('/generate-pl/', data),
  generateBalanceSheet: (data: any) => gatewayClient.post('/generate-bs/', data),
  generateCashFlow: (data: any) => gatewayClient.post('/generate-cash-flow/', data),
  generateIncomeStatement: (data: any) => gatewayClient.post('/generate-income-statement/', data),
  retrieveReport: (report_id: string) => gatewayClient.get('/retrieve-report/', { params: { report_id } }),
  downloadReport: (report_id: string) => gatewayClient.get('/download-report/', { params: { report_id }, responseType: 'blob' }),
  
  // Direct Access Reports
  getBalanceSheet: (params?: Record<string, string>) => gatewayClient.get('/reports/balance-sheet/', { params }),
  getIncomeStatement: (params?: Record<string, string>) => gatewayClient.get('/reports/income-statement/', { params }),
  getProfitAndLoss: (params?: Record<string, string>) => gatewayClient.get('/reports/profit-and-loss/', { params }),
  getCashFlowStatement: (params?: Record<string, string>) => gatewayClient.get('/reports/cash-flow-statement/', { params }),
  
  // Aging Reports
  getAgingReport: (params?: Record<string, string>) => gatewayClient.get('/reports/aging/', { params }),
  downloadAgingReport: (params?: Record<string, string>) => gatewayClient.get('/reports/aging/download/', { params, responseType: 'blob' }),
  getAgedInvoices: (params?: Record<string, string>) => gatewayClient.get('/reports/aged-invoices/', { params }),
  downloadAgedInvoices: (params?: Record<string, string>) => gatewayClient.get('/reports/aged-invoices/download/', { params, responseType: 'blob' }),
  
  // Summary Reports
  getSalesSummary: (params?: Record<string, string>) => gatewayClient.get('/reports/sales-summary/', { params }),
  getPurchasesSummary: (params?: Record<string, string>) => gatewayClient.get('/reports/purchases-summary/', { params }),
  getExpensesSummary: (params?: Record<string, string>) => gatewayClient.get('/reports/expenses-summary/', { params }),
};

// ============================================================================
// INVENTORY
// ============================================================================
export const inventoryService = {
  // Warehouses
  createWarehouse: (data: any) => gatewayClient.post('/warehouses/create/', data),
  listWarehouses: () => gatewayClient.get('/warehouses/list/'),
  updateWarehouse: (id: string, data: any) => gatewayClient.put(`/warehouses/${id}/update/`, data),
  deleteWarehouse: (id: string) => gatewayClient.delete(`/warehouses/${id}/delete/`),
  
  // Inventory Items
  createItem: (data: any) => gatewayClient.post('/inventory-items/create/', data),
  listItems: (params?: Record<string, string>) => gatewayClient.get('/inventory-items/list/', { params }),
  updateItem: (id: string, data: any) => gatewayClient.put(`/inventory-items/${id}/update/`, data),
  deleteItem: (id: string) => gatewayClient.delete(`/inventory-items/${id}/delete/`),
  
  // Stock Movements
  createMovement: (data: any) => gatewayClient.post('/stock-movements/create/', data),
  listMovements: (params?: Record<string, string>) => gatewayClient.get('/stock-movements/list/', { params }),
};

// ============================================================================
// DOCUMENTS & ATTACHMENTS
// ============================================================================
export const documentService = {
  uploadAttachment: (data: FormData) => gatewayClient.post('/attachments/upload/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  listAttachments: (params?: Record<string, string>) => gatewayClient.get('/attachments/list/', { params }),
  deleteAttachment: (id: string) => gatewayClient.delete(`/attachments/${id}/delete/`),
};

// ============================================================================
// IMPORT / EXPORT
// ============================================================================
export const importExportService = {
  // Exports
  exportInvoices: (params?: Record<string, string>) => gatewayClient.get('/export/invoices/', { params, responseType: 'blob' }),
  exportVendorBills: (params?: Record<string, string>) => gatewayClient.get('/export/vendor-bills/', { params, responseType: 'blob' }),
  exportExpenses: (params?: Record<string, string>) => gatewayClient.get('/export/expenses/', { params, responseType: 'blob' }),
  exportQuotations: (params?: Record<string, string>) => gatewayClient.get('/export/quotations/', { params, responseType: 'blob' }),
  exportPurchaseOrders: (params?: Record<string, string>) => gatewayClient.get('/export/purchase-orders/', { params, responseType: 'blob' }),
  exportJournalEntries: (params?: Record<string, string>) => gatewayClient.get('/export/journal-entries/', { params, responseType: 'blob' }),
  exportFinancialReport: (params?: Record<string, string>) => gatewayClient.get('/export/financial-report/', { params, responseType: 'blob' }),
  
  // Imports
  importCustomers: (data: FormData) => gatewayClient.post('/import/customers/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  importVendors: (data: FormData) => gatewayClient.post('/import/vendors/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  importExpenses: (data: FormData) => gatewayClient.post('/import/expenses/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  importProducts: (data: FormData) => gatewayClient.post('/import/products/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadTemplate: (type: string) => gatewayClient.get('/import/template/', { params: { type }, responseType: 'blob' }),
};

// ============================================================================
// ANALYTICS & AUDIT
// ============================================================================
export const analyticsService = {
  getOverview: () => gatewayClient.get('/analytics/overview/'),
};

export const auditService = {
  listLogs: (params?: Record<string, string>) => gatewayClient.get('/audit-logs/list/', { params }),
};

// ============================================================================
// RECURRING TRANSACTIONS
// ============================================================================
export const recurringService = {
  list: () => gatewayClient.get('/recurring-transactions/list/'),
  update: (id: string, data: any) => gatewayClient.put(`/recurring-transactions/${id}/update/`, data),
};

// ============================================================================
// CURRENCY
// ============================================================================
export const currencyService = {
  getRates: () => gatewayClient.get('/currency/rates/'),
  refreshRates: () => gatewayClient.post('/currency/rates/refresh/', {}),
};

// Export default
export default accountingService;
