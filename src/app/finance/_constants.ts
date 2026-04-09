export type PrimaryTab = 'overview' | 'sales' | 'purchases' | 'banking' | 'expenses' | 'pettycash' | 'tax' | 'reports' | 'inventory';

export const PRIMARY_TABS: { id: PrimaryTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'sales', label: 'Sales' },
  { id: 'purchases', label: 'Purchases' },
  { id: 'banking', label: 'Banking' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'pettycash', label: 'Petty Cash' },
  { id: 'tax', label: 'Tax' },
  { id: 'reports', label: 'Reports' },
  { id: 'inventory', label: 'Inventory' },
];

export const SECONDARY_TABS: Record<PrimaryTab, { id: string; label: string }[]> = {
  overview: [
    { id: 'transactions', label: 'Transactions' },
    { id: 'chart-of-accounts', label: 'Chart of Accounts' },
    { id: 'trial-balance', label: 'Trial Balance' },
    { id: 'ledger', label: 'Ledger' },
  ],
  sales: [
    { id: 'invoices', label: 'Invoices' },
    { id: 'quotes', label: 'Quotes' },
    { id: 'customers', label: 'Customers' },
  ],
  purchases: [
    { id: 'bills', label: 'Bills' },
    { id: 'purchase-orders', label: 'Purchase Orders' },
    { id: 'suppliers', label: 'Suppliers' },
  ],
  banking: [
    { id: 'bank-accounts', label: 'Bank Accounts' },
    { id: 'reconciliation', label: 'Reconciliation' },
    { id: 'transfers', label: 'Transfers' },
  ],
  expenses: [
    { id: 'all-expenses', label: 'All Expenses' },
    { id: 'pending-approval', label: 'Pending Approval' },
    { id: 'reimbursements', label: 'Reimbursements' },
  ],
  pettycash: [
    { id: 'funds', label: 'Funds' },
    { id: 'transactions', label: 'Transactions' },
  ],
  tax: [
    { id: 'tax-rates', label: 'Tax Rates' },
    { id: 'sales-tax-report', label: 'Sales Tax Report' },
    { id: 'filing-history', label: 'Filing History' },
  ],
  reports: [
    { id: 'financial', label: 'Financial Reports' },
    { id: 'aging', label: 'Aging Reports' },
    { id: 'summary', label: 'Summary Reports' },
  ],
  inventory: [
    { id: 'items', label: 'Items' },
    { id: 'warehouses', label: 'Warehouses' },
    { id: 'movements', label: 'Stock Movements' },
  ],
};

export const PRIMARY_ACTION_LABELS: Record<PrimaryTab, string> = {
  overview: 'New transaction',
  sales: 'New invoice',
  purchases: 'New bill',
  banking: 'New transfer',
  expenses: 'Log expense',
  pettycash: 'Add entry',
  tax: 'File return',
  reports: 'Generate report',
  inventory: 'New item',
};

// Per sub-tab action button config
export const SUB_ACTION: Record<string, { label: string }> = {
  transactions: { label: 'New Journal Entry' },
  'chart-of-accounts': { label: 'New Account' },
  'trial-balance': { label: 'Generate Report' },
  ledger: { label: 'View Ledger' },
  invoices: { label: 'New Invoice' },
  quotes: { label: 'New Quote' },
  customers: { label: 'New Customer' },
  bills: { label: 'New Bill' },
  'purchase-orders': { label: 'New Purchase Order' },
  suppliers: { label: 'New Supplier' },
  'bank-accounts': { label: 'Add Bank Account' },
  reconciliation: { label: 'Start Reconciliation' },
  transfers: { label: 'New Transfer' },
  'all-expenses': { label: 'Log Expense' },
  'pending-approval': { label: 'Submit for Approval' },
  reimbursements: { label: 'Request Reimbursement' },
  funds: { label: 'Create Fund' },
  'tax-rates': { label: 'Add Tax Rate' },
  'sales-tax-report': { label: 'Generate Report' },
  'filing-history': { label: 'File Return' },
  financial: { label: 'Generate Report' },
  aging: { label: 'Generate Report' },
  summary: { label: 'Generate Report' },
  items: { label: 'New Item' },
  warehouses: { label: 'New Warehouse' },
  movements: { label: 'New Movement' },
};

export const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: '#F1F5F9', color: '#64748B', label: 'Draft' },
  draft: { bg: '#F1F5F9', color: '#64748B', label: 'Draft' },
  PENDING: { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
  pending: { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
  POSTED: { bg: '#D1FAE5', color: '#059669', label: 'Posted' },
  posted: { bg: '#D1FAE5', color: '#059669', label: 'Posted' },
  PAID: { bg: '#D1FAE5', color: '#059669', label: 'Paid' },
  paid: { bg: '#D1FAE5', color: '#059669', label: 'Paid' },
  APPROVED: { bg: '#D1FAE5', color: '#059669', label: 'Approved' },
  approved: { bg: '#D1FAE5', color: '#059669', label: 'Approved' },
  OVERDUE: { bg: '#FEE2E2', color: '#DC2626', label: 'Overdue' },
  overdue: { bg: '#FEE2E2', color: '#DC2626', label: 'Overdue' },
  REJECTED: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
  rejected: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
  INVOICED: { bg: '#DBEAFE', color: '#2563EB', label: 'Invoiced' },
  invoiced: { bg: '#DBEAFE', color: '#2563EB', label: 'Invoiced' },
  confirmed: { bg: '#D1FAE5', color: '#059669', label: 'Confirmed' },
  CONFIRMED: { bg: '#D1FAE5', color: '#059669', label: 'Confirmed' },
  completed: { bg: '#D1FAE5', color: '#059669', label: 'Completed' },
  COMPLETED: { bg: '#D1FAE5', color: '#059669', label: 'Completed' },
  failed: { bg: '#FEE2E2', color: '#DC2626', label: 'Failed' },
  FAILED: { bg: '#FEE2E2', color: '#DC2626', label: 'Failed' },
  reversed: { bg: '#F3E8FF', color: '#7C3AED', label: 'Reversed' },
  open: { bg: '#FEF3C7', color: '#D97706', label: 'Open' },
  reconciled: { bg: '#D1FAE5', color: '#059669', label: 'Reconciled' },
  discrepancy: { bg: '#FEE2E2', color: '#DC2626', label: 'Discrepancy' },
  IN_PROGRESS: { bg: '#FEF3C7', color: '#D97706', label: 'In Progress' },
  REVIEWED: { bg: '#DBEAFE', color: '#2563EB', label: 'Reviewed' },
  active: { bg: '#D1FAE5', color: '#059669', label: 'Active' },
  inactive: { bg: '#F1F5F9', color: '#64748B', label: 'Inactive' },
};

export const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];
