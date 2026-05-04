/**
 * QuidPath ERP - Accounting Service
 * Complete accounting module API client
 */
import { gatewayClient } from './apiClient';

const BASE_URL = '/api/v1/accounting';

// ============================================================================
// CUSTOMERS
// ============================================================================
export const customerService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/customers/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/customers/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/customers/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/customers/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/customers/${id}/delete/`),
  getStatement: (id: string, params?: any) => gatewayClient.get(`${BASE_URL}/customers/${id}/statement/`, { params }),
  getBalance: (id: string) => gatewayClient.get(`${BASE_URL}/customers/${id}/balance/`),
};

// ============================================================================
// INVOICES
// ============================================================================
export const invoiceService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/invoices/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/invoices/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/invoices/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/invoices/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/invoices/${id}/delete/`),
  post: (id: string) => gatewayClient.post(`${BASE_URL}/invoices/${id}/post/`, {}),
  send: (id: string, data?: any) => gatewayClient.post(`${BASE_URL}/invoices/${id}/send/`, data),
  getPdf: (id: string) => gatewayClient.get(`${BASE_URL}/invoices/${id}/pdf/`, { responseType: 'blob' }),
  duplicate: (id: string) => gatewayClient.post(`${BASE_URL}/invoices/${id}/duplicate/`, {}),
  markPaid: (id: string, data: any) => gatewayClient.post(`${BASE_URL}/invoices/${id}/mark-paid/`, data),
  getOverdue: (params?: any) => gatewayClient.get(`${BASE_URL}/invoices/overdue/`, { params }),
};

// ============================================================================
// QUOTES
// ============================================================================
export const quoteService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/quotes/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/quotes/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/quotes/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/quotes/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/quotes/${id}/delete/`),
  send: (id: string, data?: any) => gatewayClient.post(`${BASE_URL}/quotes/${id}/send/`, data),
  accept: (id: string) => gatewayClient.post(`${BASE_URL}/quotes/${id}/accept/`, {}),
  decline: (id: string, data?: any) => gatewayClient.post(`${BASE_URL}/quotes/${id}/decline/`, data),
};

// ============================================================================
// PAYMENTS
// ============================================================================
export const paymentService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/payments/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/payments/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/payments/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/payments/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/payments/${id}/delete/`),
  post: (id: string) => gatewayClient.post(`${BASE_URL}/payments/${id}/post/`, {}),
  paystackInitiate: (data: any) => gatewayClient.post(`${BASE_URL}/payments/paystack/initiate/`, data),
  getMethods: () => gatewayClient.get(`${BASE_URL}/payments/methods/`),
};

// ============================================================================
// VENDORS
// ============================================================================
export const vendorService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/vendors/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/vendors/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/vendors/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/vendors/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/vendors/${id}/delete/`),
  getBills: (id: string, params?: any) => gatewayClient.get(`${BASE_URL}/vendors/${id}/bills/`, { params }),
  getBalance: (id: string) => gatewayClient.get(`${BASE_URL}/vendors/${id}/balance/`),
};

// ============================================================================
// PURCHASE ORDERS
// ============================================================================
export const purchaseOrderService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/purchases/orders/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/purchases/orders/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/purchases/orders/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/purchases/orders/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/purchases/orders/${id}/delete/`),
  approve: (id: string) => gatewayClient.post(`${BASE_URL}/purchases/orders/${id}/approve/`, {}),
  receive: (id: string, data: any) => gatewayClient.post(`${BASE_URL}/purchases/orders/${id}/receive/`, data),
  send: (id: string, data?: any) => gatewayClient.post(`${BASE_URL}/purchases/orders/${id}/send/`, data),
};

// ============================================================================
// CHART OF ACCOUNTS
// ============================================================================
export const chartOfAccountsService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/accounts/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/accounts/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/accounts/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/accounts/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/accounts/${id}/delete/`),
};

// ============================================================================
// JOURNAL ENTRIES
// ============================================================================
export const journalEntryService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/journal-entries/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/journal-entries/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/journal-entries/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/journal-entries/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/journal-entries/${id}/delete/`),
  post: (id: string) => gatewayClient.post(`${BASE_URL}/journal-entries/${id}/post/`, {}),
};

// ============================================================================
// BANK ACCOUNTS
// ============================================================================
export const bankAccountService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/bank-accounts/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/bank-accounts/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/bank-accounts/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/bank-accounts/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/bank-accounts/${id}/delete/`),
  importStatement: (id: string, data: any) => gatewayClient.post(`${BASE_URL}/bank-accounts/${id}/import-statement/`, data),
  getTransactions: (id: string, params?: any) => gatewayClient.get(`${BASE_URL}/bank-accounts/${id}/transactions/`, { params }),
  reconcile: (id: string, data: any) => gatewayClient.post(`${BASE_URL}/bank-accounts/${id}/reconcile/`, data),
  applyRules: (id: string) => gatewayClient.post(`${BASE_URL}/bank-accounts/${id}/apply-rules/`, {}),
};

// ============================================================================
// BANK RULES
// ============================================================================
export const bankRuleService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/bank-rules/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/bank-rules/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/bank-rules/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/bank-rules/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/bank-rules/${id}/delete/`),
};

// ============================================================================
// VENDOR BILLS
// ============================================================================
export const vendorBillService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/vendor-bills/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/vendor-bills/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/vendor-bills/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/vendor-bills/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/vendor-bills/${id}/delete/`),
  approve: (id: string) => gatewayClient.post(`${BASE_URL}/vendor-bills/${id}/approve/`, {}),
  pay: (id: string, data: any) => gatewayClient.post(`${BASE_URL}/vendor-bills/${id}/pay/`, data),
  getOverdue: (params?: any) => gatewayClient.get(`${BASE_URL}/vendor-bills/overdue/`, { params }),
};

// ============================================================================
// EXPENSES
// ============================================================================
export const expenseService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/expenses/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/expenses/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/expenses/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/expenses/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/expenses/${id}/delete/`),
  approve: (id: string) => gatewayClient.post(`${BASE_URL}/expenses/${id}/approve/`, {}),
  reimburse: (id: string, data: any) => gatewayClient.post(`${BASE_URL}/expenses/${id}/reimburse/`, data),
};

// ============================================================================
// PETTY CASH
// ============================================================================
export const pettyCashService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/petty-cash/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/petty-cash/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/petty-cash/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/petty-cash/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/petty-cash/${id}/delete/`),
  topup: (id: string, data: any) => gatewayClient.post(`${BASE_URL}/petty-cash/${id}/topup/`, data),
  spend: (id: string, data: any) => gatewayClient.post(`${BASE_URL}/petty-cash/${id}/spend/`, data),
  getTransactions: (id: string, params?: any) => gatewayClient.get(`${BASE_URL}/petty-cash/${id}/transactions/`, { params }),
  reconcile: (id: string, data: any) => gatewayClient.post(`${BASE_URL}/petty-cash/${id}/reconcile/`, data),
};

// ============================================================================
// TAX RATES
// ============================================================================
export const taxRateService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/tax-rates/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/tax-rates/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/tax-rates/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/tax-rates/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/tax-rates/${id}/delete/`),
};

// ============================================================================
// FIXED ASSETS
// ============================================================================
export const fixedAssetService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/fixed-assets/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/fixed-assets/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/fixed-assets/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/fixed-assets/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/fixed-assets/${id}/delete/`),
  depreciate: (id: string) => gatewayClient.post(`${BASE_URL}/fixed-assets/${id}/depreciate/`, {}),
  depreciateAll: () => gatewayClient.post(`${BASE_URL}/fixed-assets/depreciate-all/`, {}),
  getSchedule: (id: string) => gatewayClient.get(`${BASE_URL}/fixed-assets/${id}/schedule/`),
  dispose: (id: string, data: any) => gatewayClient.post(`${BASE_URL}/fixed-assets/${id}/dispose/`, data),
};

// ============================================================================
// DASHBOARD
// ============================================================================
export const dashboardService = {
  getMain: () => gatewayClient.get(`${BASE_URL}/dashboard/`),
  getSummary: (params?: any) => gatewayClient.get(`${BASE_URL}/dashboard/summary/`, { params }),
  getCashflow: (params?: any) => gatewayClient.get(`${BASE_URL}/dashboard/cashflow/`, { params }),
  getOverdue: () => gatewayClient.get(`${BASE_URL}/dashboard/overdue/`),
  getHealthScorecard: () => gatewayClient.get(`${BASE_URL}/dashboard/health-scorecard/`),
};

// ============================================================================
// REPORTS
// ============================================================================
export const reportService = {
  list: () => gatewayClient.get(`${BASE_URL}/reports/`),
  profitLoss: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/profit-loss/`, { params }),
  balanceSheet: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/balance-sheet/`, { params }),
  cashFlow: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/cash-flow/`, { params }),
  trialBalance: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/trial-balance/`, { params }),
  agedReceivables: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/aged-receivables/`, { params }),
  agedPayables: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/aged-payables/`, { params }),
  bankReconciliation: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/bank-reconciliation/`, { params }),
  salesTax: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/sales-tax/`, { params }),
  accountTransactions: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/account-transactions/`, { params }),
  expenseSummary: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/expense-summary/`, { params }),
  cashFlowManager: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/cash-flow-manager/`, { params }),
  getDashboards: () => gatewayClient.get(`${BASE_URL}/reports/dashboards/`),
  getVisualizations: (params?: any) => gatewayClient.get(`${BASE_URL}/reports/visualizations/`, { params }),
};

// ============================================================================
// CONTACTS
// ============================================================================
export const contactService = {
  listAll: (params?: any) => gatewayClient.get(`${BASE_URL}/contacts/`, { params }),
  listCustomers: (params?: any) => gatewayClient.get(`${BASE_URL}/contacts/customers/`, { params }),
  listSuppliers: (params?: any) => gatewayClient.get(`${BASE_URL}/contacts/suppliers/`, { params }),
  get: (type: string, id: string) => gatewayClient.get(`${BASE_URL}/contacts/${type}/${id}/`),
  update: (type: string, id: string, data: any) => gatewayClient.put(`${BASE_URL}/contacts/${type}/${id}/update/`, data),
  getSettings: () => gatewayClient.get(`${BASE_URL}/contacts/settings/`),
  updateSettings: (data: any) => gatewayClient.put(`${BASE_URL}/contacts/settings/update/`, data),
};

// ============================================================================
// PRODUCTS
// ============================================================================
export const productService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/products/`, { params }),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/products/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/products/${id}/update/`, data),
};

// ============================================================================
// SETTINGS
// ============================================================================
export const settingsService = {
  get: () => gatewayClient.get(`${BASE_URL}/settings/`),
  update: (data: any) => gatewayClient.put(`${BASE_URL}/settings/update/`, data),
  getSales: () => gatewayClient.get(`${BASE_URL}/settings/sales/`),
  updateSales: (data: any) => gatewayClient.put(`${BASE_URL}/settings/sales/update/`, data),
  getPurchases: () => gatewayClient.get(`${BASE_URL}/settings/purchases/`),
  updatePurchases: (data: any) => gatewayClient.put(`${BASE_URL}/settings/purchases/update/`, data),
  getTax: () => gatewayClient.get(`${BASE_URL}/settings/tax/`),
  updateTax: (data: any) => gatewayClient.put(`${BASE_URL}/settings/tax/update/`, data),
  getTaxLiability: (params?: any) => gatewayClient.get(`${BASE_URL}/settings/tax/liability/`, { params }),
};

// ============================================================================
// PAYROLL
// ============================================================================
export const payrollService = {
  listEmployees: (params?: any) => gatewayClient.get(`${BASE_URL}/payroll/employees/`, { params }),
  getEmployee: (id: string) => gatewayClient.get(`${BASE_URL}/payroll/employees/${id}/`),
  createPayRun: (data: any) => gatewayClient.post(`${BASE_URL}/payroll/pay-runs/create/`, data),
  listPayRuns: (params?: any) => gatewayClient.get(`${BASE_URL}/payroll/pay-runs/`, { params }),
  getPayRun: (id: string) => gatewayClient.get(`${BASE_URL}/payroll/pay-runs/${id}/`),
  processPayRun: (id: string) => gatewayClient.post(`${BASE_URL}/payroll/pay-runs/${id}/process/`, {}),
  approvePayRun: (id: string) => gatewayClient.post(`${BASE_URL}/payroll/pay-runs/${id}/approve/`, {}),
  reversePayRun: (id: string) => gatewayClient.post(`${BASE_URL}/payroll/pay-runs/${id}/reverse/`, {}),
  listPayslips: (payRunId: string, params?: any) => gatewayClient.get(`${BASE_URL}/payroll/pay-runs/${payRunId}/payslips/`, { params }),
  getPayslip: (id: string) => gatewayClient.get(`${BASE_URL}/payroll/payslips/${id}/`),
  getPayslipPdf: (id: string) => gatewayClient.get(`${BASE_URL}/payroll/payslips/${id}/pdf/`, { responseType: 'blob' }),
  sendPayslip: (id: string, data?: any) => gatewayClient.post(`${BASE_URL}/payroll/payslips/${id}/send/`, data),
};

// Default export with all services
const accountingService = {
  customers: customerService,
  invoices: invoiceService,
  quotes: quoteService,
  payments: paymentService,
  vendors: vendorService,
  purchaseOrders: purchaseOrderService,
  chartOfAccounts: chartOfAccountsService,
  journalEntries: journalEntryService,
  bankAccounts: bankAccountService,
  bankRules: bankRuleService,
  vendorBills: vendorBillService,
  expenses: expenseService,
  pettyCash: pettyCashService,
  taxRates: taxRateService,
  fixedAssets: fixedAssetService,
  dashboard: dashboardService,
  reports: reportService,
  contacts: contactService,
  products: productService,
  settings: settingsService,
  payroll: payrollService,
};

export default accountingService;
