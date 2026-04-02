import { gatewayClient } from './apiClient';

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface ListMeta { count?: number; total?: number; status_counts?: Record<string, number> }

// ─── Invoices ─────────────────────────────────────────────────────────────────

export interface InvoiceLine {
  id?: string; description: string; quantity: number; unit_price: number;
  amount?: number; discount?: number; taxable?: string; tax_amount?: number;
  sub_total?: number; total?: number;
}
export interface Invoice {
  id: string; number: string; customer: string; customer_id?: string;
  date: string; due_date: string; status: string; salesperson?: string;
  ship_date?: string; ship_via?: string; terms?: string; fob?: string;
  comments?: string; purchase_order?: string;
  sub_total: number; tax_total: number; total: number; total_discount?: number;
  lines: InvoiceLine[];
}
export interface InvoiceListResponse { invoices: Invoice[]; total: number; status_counts: Record<string, number> }

// ─── Quotations ───────────────────────────────────────────────────────────────

export interface Quotation {
  id: string; number: string; customer: string; customer_id?: string;
  date: string; valid_until: string; status: string; salesperson?: string;
  comments?: string; T_and_C?: string; ship_date?: string; ship_via?: string; terms?: string; fob?: string;
  sub_total?: number; tax_total?: number; total?: number; lines?: InvoiceLine[];
}
export interface QuotationListResponse { quotations: Quotation[]; total: number }

// ─── Vendor Bills ─────────────────────────────────────────────────────────────

export interface VendorBill {
  id: string; number?: string; vendor: string; vendor_id?: string;
  date: string; due_date?: string; status: string;
  sub_total?: number; tax_total?: number; total?: number; lines?: InvoiceLine[];
}
export interface VendorBillListResponse { vendor_bills: VendorBill[]; total: number }

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export interface PurchaseOrder {
  id: string; number?: string; vendor: string; vendor_id?: string;
  date: string; expected_delivery?: string; status: string;
  sub_total?: number; tax_total?: number; total?: number; lines?: InvoiceLine[];
}
export interface PurchaseOrderListResponse { purchase_orders: PurchaseOrder[]; total: number }

// ─── Expenses ─────────────────────────────────────────────────────────────────

export interface Expense {
  id: string; date: string; vendor: string; vendor_id?: string;
  category: string; description: string; amount: number; status: string;
  payment_method?: string; reference?: string; receipt_url?: string;
  tax_amount?: number; created_at?: string;
}
export interface ExpenseListResponse { expenses: Expense[]; total: number }

// ─── Customers & Vendors ──────────────────────────────────────────────────────

export interface Customer {
  id: string; name: string; email?: string; phone?: string;
  address?: string; city?: string; country?: string; tax_id?: string;
}
export interface CustomerListResponse { customers: Customer[]; total: number }

export interface Vendor {
  id: string; name: string; email?: string; phone?: string;
  address?: string; city?: string; country?: string; tax_id?: string; category?: string;
}
export interface VendorListResponse { vendors: Vendor[]; total: number }

// ─── Chart of Accounts ────────────────────────────────────────────────────────

export interface Account {
  id: string; code: string; name: string; account_type?: string;
  account_sub_type?: string; description?: string; is_active: boolean;
}
export interface AccountListResponse { accounts: Account[]; total: number }

// ─── Banking ──────────────────────────────────────────────────────────────────

export interface BankAccount {
  id: string; bank_name: string; account_name: string; account_number: string;
  currency: string; is_default: boolean; is_active: boolean; balance?: number; created_at: string;
}
export interface BankTransaction {
  id: string; bank_account_id: string; bank_account_name?: string;
  transaction_type: string; amount: number; reference?: string;
  narration?: string; transaction_date: string; status: string; created_at: string;
}
export interface InternalTransfer {
  id: string; from_account_id: string; from_account_name?: string;
  to_account_id: string; to_account_name?: string;
  amount: number; reference?: string; reason?: string;
  transfer_date: string; status: string; created_at: string;
}
export interface BankReconciliation {
  id: string; bank_account_id: string; period_start: string; period_end: string;
  opening_balance: number; closing_balance: number; status: string; created_at: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface SalesSummary { total_invoiced?: number; total_paid?: number; total_overdue?: number; quotes_pending?: number }
export interface PurchasesSummary { total_bills?: number; total_paid?: number; total_unpaid?: number; purchase_orders_open?: number }
export interface ExpensesSummary { total_expenses?: number; pending_approval?: number; approved?: number; reimbursed?: number }

// ─── Service ──────────────────────────────────────────────────────────────────

const financeService = {
  // Invoices
  getInvoices: (p?: Record<string, string>) => gatewayClient.get<InvoiceListResponse>('/invoice/list/', { params: p }),
  getInvoice: (id: string) => gatewayClient.get<Invoice>('/invoice/get/', { params: { id } }),
  createInvoice: (d: Record<string, unknown>) => gatewayClient.post<Invoice>('/invoice/create-and-post/', d),
  saveDraftInvoice: (d: Record<string, unknown>) => gatewayClient.post<Invoice>('/invoice/save-draft/', d),
  updateInvoice: (d: Record<string, unknown>) => gatewayClient.put<Invoice>('/invoice/update/', d),
  deleteInvoice: (id: string) => gatewayClient.delete('/invoice/delete/', { params: { id } }),
  sendInvoice: (id: string) => gatewayClient.post(`/invoice/${id}/send/`),
  // Quotations
  getQuotations: (p?: Record<string, string>) => gatewayClient.get<QuotationListResponse>('/quotation/list/', { params: p }),
  getQuotation: (id: string) => gatewayClient.get<Quotation>('/quotation/get/', { params: { id } }),
  createQuotation: (d: Record<string, unknown>) => gatewayClient.post<Quotation>('/quotation/create-and-post/', d),
  updateQuotation: (d: Record<string, unknown>) => gatewayClient.put<Quotation>('/quotation/update/', d),
  deleteQuotation: (id: string) => gatewayClient.delete('/quotation/delete/', { params: { id } }),
  convertQuoteToInvoice: (id: string) => gatewayClient.post('/quotation/invoice-quote/', { quotation_id: id }),

  // Vendor Bills
  getVendorBills: (p?: Record<string, string>) => gatewayClient.get<VendorBillListResponse>('/vendor-bill/list/', { params: p }),
  getVendorBill: (id: string) => gatewayClient.get<VendorBill>('/vendor-bill/get/', { params: { id } }),
  createVendorBill: (d: Record<string, unknown>) => gatewayClient.post<VendorBill>('/vendor-bill/create/', d),
  updateVendorBill: (d: Record<string, unknown>) => gatewayClient.put<VendorBill>('/vendor-bill/update/', d),
  deleteVendorBill: (id: string) => gatewayClient.delete('/vendor-bill/delete/', { params: { id } }),

  // Purchase Orders
  getPurchaseOrders: (p?: Record<string, string>) => gatewayClient.get<PurchaseOrderListResponse>('/purchase-orders/list/', { params: p }),
  getPurchaseOrder: (id: string) => gatewayClient.get<PurchaseOrder>('/purchase-orders/get/', { params: { id } }),
  createPurchaseOrder: (d: Record<string, unknown>) => gatewayClient.post<PurchaseOrder>('/purchase-orders/create-and-post/', d),
  updatePurchaseOrder: (d: Record<string, unknown>) => gatewayClient.put<PurchaseOrder>('/purchase-orders/update/', d),
  deletePurchaseOrder: (id: string) => gatewayClient.delete('/purchase-orders/delete/', { params: { id } }),

  // Expenses
  getExpenses: (p?: Record<string, string>) => gatewayClient.get<ExpenseListResponse>('/expense/list/', { params: p }),
  getExpense: (id: string) => gatewayClient.get<Expense>('/expense/get/', { params: { id } }),
  createExpense: (d: Record<string, unknown>) => gatewayClient.post<Expense>('/expense/create/', d),
  updateExpense: (d: Record<string, unknown>) => gatewayClient.put<Expense>('/expense/update/', d),
  deleteExpense: (id: string) => gatewayClient.delete('/expense/delete/', { params: { id } }),

  // Customers
  getCustomers: (p?: Record<string, string>) => gatewayClient.get<CustomerListResponse>('/customer/list/', { params: p }),
  createCustomer: (d: Record<string, unknown>) => gatewayClient.post<Customer>('/customer/create/', d),
  updateCustomer: (d: Record<string, unknown>) => gatewayClient.put<Customer>('/customer/update/', d),
  deleteCustomer: (id: string) => gatewayClient.delete('/customer/delete/', { params: { id } }),

  // Vendors
  getVendors: (p?: Record<string, string>) => gatewayClient.get<VendorListResponse>('/vendor/list/', { params: p }),
  createVendor: (d: Record<string, unknown>) => gatewayClient.post<Vendor>('/vendor/create/', d),
  updateVendor: (d: Record<string, unknown>) => gatewayClient.put<Vendor>('/vendor/update/', d),
  deleteVendor: (id: string) => gatewayClient.delete('/vendor/delete/', { params: { id } }),

  // Chart of Accounts
  getAccounts: (p?: Record<string, string>) => gatewayClient.get<AccountListResponse>('/account/list/', { params: p }),
  createAccount: (d: Record<string, unknown>) => gatewayClient.post<Account>('/account/create/', d),
  updateAccount: (d: Record<string, unknown>) => gatewayClient.put<Account>('/account/update/', d),
  deleteAccount: (id: string) => gatewayClient.delete('/account/delete/', { params: { id } }),

  // Banking
  getBankAccounts: (p?: Record<string, unknown>) => gatewayClient.get('/bank-account/list/', { params: p }),
  createBankAccount: (d: Record<string, unknown>) => gatewayClient.post('/bank-account/add/', d),
  updateBankAccount: (d: Record<string, unknown>) => gatewayClient.put('/bank-account/update/', d),
  deleteBankAccount: (id: string) => gatewayClient.delete('/bank-account/delete/', { params: { id } }),

  getTransactions: (p?: Record<string, unknown>) => gatewayClient.get('/transaction/list/', { params: p }),
  createTransaction: (d: Record<string, unknown>) => gatewayClient.post('/transaction/create/', d),
  updateTransaction: (d: Record<string, unknown>) => gatewayClient.put('/transaction/update/', d),
  deleteTransaction: (id: string) => gatewayClient.delete('/transaction/delete/', { params: { id } }),

  getInternalTransfers: (p?: Record<string, unknown>) => gatewayClient.get('/internal-transfer/list/', { params: p }),
  createInternalTransfer: (d: Record<string, unknown>) => gatewayClient.post('/internal-transfer/create/', d),
  updateInternalTransfer: (d: Record<string, unknown>) => gatewayClient.put('/internal-transfer/update/', d),
  deleteInternalTransfer: (id: string) => gatewayClient.delete('/internal-transfer/delete/', { params: { id } }),

  getReconciliations: (p?: Record<string, unknown>) => gatewayClient.get('/bank-reconciliation/list/', { params: p }),
  createReconciliation: (d: Record<string, unknown>) => gatewayClient.post('/bank-reconciliation/create/', d),

  // Reports / Summaries
  getSalesSummary: (p?: Record<string, string>) => gatewayClient.get<SalesSummary>('/reports/sales-summary/', { params: p }),
  getPurchasesSummary: (p?: Record<string, string>) => gatewayClient.get<PurchasesSummary>('/reports/purchases-summary/', { params: p }),
  getExpensesSummary: (p?: Record<string, string>) => gatewayClient.get<ExpensesSummary>('/reports/expenses-summary/', { params: p }),
  getBalanceSheet: (p?: Record<string, string>) => gatewayClient.get('/reports/balance-sheet/', { params: p }),
  getProfitAndLoss: (p?: Record<string, string>) => gatewayClient.get('/reports/profit-and-loss/', { params: p }),
  getTaxRate: () => gatewayClient.get('/get-tax-rate/'),
};

export default financeService;
