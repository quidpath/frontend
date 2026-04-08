// Comprehensive Accounting Types
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
  drafted_at?: string;
  posted_at?: string;
  posted_by?: string;
}

export interface Customer {
  id: string;
  category: 'individual' | 'company';
  company_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  state?: string;
  zip_code?: string;
  country: string;
  tax_id?: string;
  is_active: boolean;
  notes?: string;
}

export interface Vendor {
  id: string;
  category: 'individual' | 'company';
  company_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  state?: string;
  zip_code?: string;
  country: string;
  tax_id?: string;
  is_active: boolean;
  notes?: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  account_type: string;
  account_sub_type?: string;
  parent_account?: string;
  description?: string;
  is_active: boolean;
}

export interface AccountType {
  id: string;
  name: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  description: string;
  normal_balance: 'DEBIT' | 'CREDIT';
}

export interface AccountSubType {
  id: string;
  account_type: string;
  name: string;
  description: string;
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

export interface Expense {
  id: string;
  date: string;
  reference: string;
  description: string;
  category: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  expense_account_id: string;
  payment_account_id: string;
  vendor_id?: string;
  tax_rate_id?: string;
  is_posted: boolean;
  journal_entry_id?: string;
}

export interface TaxRate {
  id: string;
  name: 'exempt' | 'zero_rated' | 'general_rated';
  rate: number;
  sales_account?: string;
  purchase_account?: string;
}

export interface PettyCashFund {
  id: string;
  name: string;
  description: string;
  custodian: string;
  custodian_id: string;
  initial_amount: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
}

export interface PettyCashTransaction {
  id: string;
  fund_id: string;
  fund_name: string;
  transaction_type: 'DISBURSEMENT' | 'REPLENISHMENT' | 'ADJUSTMENT';
  date: string;
  reference: string;
  description: string;
  category: string;
  amount: number;
  recipient: string;
  receipt_number: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVERSED' | 'COMPLETED';
  requested_by: string;
  created_at: string;
}

export interface BankReconciliation {
  id: string;
  bank_account_id: string;
  bank_account_name: string;
  period_start: string;
  period_end: string;
  opening_balance: number;
  closing_balance: number;
  statement_balance: number;
  book_balance: number;
  difference: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED';
  created_at: string;
}

export interface ReconciliationItem {
  id: string;
  item_type: 'DEPOSIT_IN_TRANSIT' | 'OUTSTANDING_CHECK' | 'BANK_CHARGE' | 'BANK_ERROR' | 'BOOK_ERROR' | 'ADJUSTMENT';
  date: string;
  reference: string;
  description: string;
  amount: number;
  is_cleared: boolean;
  cleared_date?: string;
}

export interface TrialBalanceEntry {
  id: string;
  account_code: string;
  account_name: string;
  debit: string;
  credit: string;
  balance: string;
}

export interface TrialBalance {
  as_of_date: string;
  entries: TrialBalanceEntry[];
  totals: {
    total_debit: string;
    total_credit: string;
    difference: string;
    is_balanced: boolean;
  };
}

export interface LedgerEntry {
  id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  date: string;
  journal_entry_reference: string;
  journal_entry_id: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  status: string;
}

export interface FinancialReport {
  report_id: string;
  data: any;
}

export interface Quotation {
  id: string;
  number: string;
  customer: string;
  date: string;
  valid_until: string;
  status: string;
  salesperson: string;
  comments?: string;
  terms?: string;
  ship_date?: string;
  ship_via?: string;
  fob?: string;
  lines: any[];
  drafted_at?: string;
  posted_at?: string;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  vendor: string;
  date: string;
  expected_delivery: string;
  status: string;
  comments?: string;
  terms?: string;
  lines: any[];
  drafted_at?: string;
  posted_at?: string;
}

export interface VendorBill {
  id: string;
  number: string;
  vendor: string;
  date: string;
  due_date: string;
  status: string;
  comments?: string;
  terms?: string;
  sub_total: number;
  tax_total: number;
  total: number;
  lines: any[];
  drafted_at?: string;
  posted_at?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  category?: string;
  unit_cost: number;
  selling_price: number;
  quantity_on_hand: number;
  quantity_available: number;
  reorder_point: number;
  is_active: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  is_active: boolean;
  is_default: boolean;
}

export interface StockMovement {
  id: string;
  warehouse: string;
  item: string;
  movement_type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'damage' | 'loss';
  quantity: number;
  unit_cost: number;
  total_cost: number;
  movement_date: string;
  reference_number?: string;
  notes?: string;
  status: 'draft' | 'posted' | 'cancelled';
}
