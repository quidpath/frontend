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
  total_outstanding?: number;
  total_overdue?: number;
  paid_this_month?: number;
  invoices_count?: number;
  currency?: string;
}

const accountingService = {
  getInvoices: (params?: Record<string, string>) =>
    gatewayClient.get<InvoiceListResponse>('/invoice/list/', { params }),

  getInvoice: (id: string) =>
    gatewayClient.get<Invoice>('/invoice/get/', { params: { id } }),

  createInvoice: (data: { customer_id: string; lines: unknown[]; date?: string; due_date?: string; terms?: string; notes?: string }) =>
    gatewayClient.post<Invoice>('/invoice/create/', data),

  updateInvoice: (id: string, data: Record<string, unknown>) =>
    gatewayClient.put<Invoice>(`/invoice/update/${id}/`, data),

  deleteInvoice: (id: string) =>
    gatewayClient.delete(`/invoice/delete/${id}/`),

  sendInvoice: (id: string) =>
    gatewayClient.post(`/invoice/${id}/send/`),

  voidInvoice: (id: string) =>
    gatewayClient.post(`/invoice/void/${id}/`),

  getJournalEntries: (params?: Record<string, string>) =>
    gatewayClient.get<JournalListResponse>('/journal/list/', { params }),

  getJournalEntry: (id: string) =>
    gatewayClient.get<JournalEntry>('/journal/get/', { params: { id } }),

  createJournalEntry: (data: { date: string; reference: string; description: string; lines: unknown[] }) =>
    gatewayClient.post<JournalEntry>('/journal/create/', data),

  updateJournalEntry: (id: string, data: Record<string, unknown>) =>
    gatewayClient.put<JournalEntry>(`/journal/update/${id}/`, data),

  deleteJournalEntry: (id: string) =>
    gatewayClient.delete(`/journal/delete/${id}/`),

  postJournalEntry: (id: string) =>
    gatewayClient.post('/journal/post/', { id }),

  // Expenses
  getExpenses: (params?: Record<string, string>) =>
    gatewayClient.get<ExpenseListResponse>('/expense/list/', { params }),

  getExpense: (id: string) =>
    gatewayClient.get<Expense>('/expense/get/', { params: { id } }),

  createExpense: (data: { date: string; vendor_id: string; category: string; description: string; amount: number; payment_method?: string }) =>
    gatewayClient.post<Expense>('/expense/create/', data),

  updateExpense: (id: string, data: Record<string, unknown>) =>
    gatewayClient.put<Expense>(`/expense/update/${id}/`, data),

  deleteExpense: (id: string) =>
    gatewayClient.delete(`/expense/delete/${id}/`),

  // Summary
  getSummary: () =>
    gatewayClient.get<AccountingSummary>('/accounting/summary/'),
};

export default accountingService;
