import { gatewayClient } from './apiClient';

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  balance?: number;
  created_at: string;
}

export interface BankAccountListResponse {
  results: BankAccount[];
  count: number;
}

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  bank_account_name: string;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'charge';
  amount: number;
  reference?: string;
  narration?: string;
  transaction_date: string;
  status: 'pending' | 'confirmed' | 'reversed';
  created_at: string;
}

export interface BankTransactionListResponse {
  results: BankTransaction[];
  count: number;
}

export interface BankReconciliation {
  id: string;
  bank_account_id: string;
  period_start: string;
  period_end: string;
  opening_balance: number;
  closing_balance: number;
  status: 'open' | 'reconciled' | 'discrepancy';
  created_at: string;
}

export interface InternalTransfer {
  id: string;
  from_account_id: string;
  from_account_name: string;
  to_account_id: string;
  to_account_name: string;
  amount: number;
  reference?: string;
  reason?: string;
  transfer_date: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

const bankingService = {
  // Bank Accounts
  getBankAccounts: (params?: Record<string, unknown>) =>
    gatewayClient.get<BankAccountListResponse>('/bank-account/list/', { params }),

  getBankAccount: (id: string) =>
    gatewayClient.get<BankAccount>(`/bank-account/get/`, { params: { id } }),

  createBankAccount: (data: Omit<BankAccount, 'id' | 'created_at' | 'balance'>) =>
    gatewayClient.post<BankAccount>('/bank-account/add/', data),

  updateBankAccount: (id: string, data: Partial<BankAccount>) =>
    gatewayClient.put<BankAccount>('/bank-account/update/', { id, ...data }),

  deleteBankAccount: (id: string) =>
    gatewayClient.delete('/bank-account/delete/', { params: { id } }),

  // Transactions
  getTransactions: (params?: Record<string, unknown>) =>
    gatewayClient.get<BankTransactionListResponse>('/transaction/list/', { params }),

  getTransaction: (id: string) =>
    gatewayClient.get<BankTransaction>(`/transaction/${id}/`),  createTransaction: (data: Omit<BankTransaction, 'id' | 'created_at' | 'bank_account_name'>) =>
    gatewayClient.post<BankTransaction>('/transaction/create/', data),

  updateTransaction: (id: string, data: Partial<BankTransaction>) =>
    gatewayClient.put<BankTransaction>('/transaction/update/', { id, ...data }),

  deleteTransaction: (id: string) =>
    gatewayClient.delete('/transaction/delete/', { params: { id } }),

  // Reconciliation
  getReconciliations: (params?: Record<string, unknown>) =>
    gatewayClient.get('/bank-reconciliation/list/', { params }),

  createReconciliation: (data: Omit<BankReconciliation, 'id' | 'created_at'>) =>
    gatewayClient.post('/bank-reconciliation/create/', data),

  // Internal Transfers
  getInternalTransfers: (params?: Record<string, unknown>) =>
    gatewayClient.get('/internal-transfer/list/', { params }),

  createInternalTransfer: (data: Omit<InternalTransfer, 'id' | 'created_at' | 'from_account_name' | 'to_account_name'>) =>
    gatewayClient.post('/internal-transfer/create/', data),
};

export default bankingService;
