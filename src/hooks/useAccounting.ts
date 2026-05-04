/**
 * QuidPath ERP - Accounting Hooks
 * React Query hooks for accounting module
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import accountingService from '@/services/accountingService';

// ============================================================================
// QUERY KEYS
// ============================================================================
export const ACCOUNTING_KEYS = {
  all: ['accounting'] as const,
  customers: () => ['accounting', 'customers'] as const,
  customer: (id: string) => ['accounting', 'customers', id] as const,
  invoices: () => ['accounting', 'invoices'] as const,
  invoice: (id: string) => ['accounting', 'invoices', id] as const,
  quotes: () => ['accounting', 'quotes'] as const,
  quote: (id: string) => ['accounting', 'quotes', id] as const,
  payments: () => ['accounting', 'payments'] as const,
  payment: (id: string) => ['accounting', 'payments', id] as const,
  vendors: () => ['accounting', 'vendors'] as const,
  vendor: (id: string) => ['accounting', 'vendors', id] as const,
  purchaseOrders: () => ['accounting', 'purchase-orders'] as const,
  purchaseOrder: (id: string) => ['accounting', 'purchase-orders', id] as const,
  chartOfAccounts: () => ['accounting', 'chart-of-accounts'] as const,
  journalEntries: () => ['accounting', 'journal-entries'] as const,
  bankAccounts: () => ['accounting', 'bank-accounts'] as const,
  bankRules: () => ['accounting', 'bank-rules'] as const,
  vendorBills: () => ['accounting', 'vendor-bills'] as const,
  expenses: () => ['accounting', 'expenses'] as const,
  pettyCash: () => ['accounting', 'petty-cash'] as const,
  taxRates: () => ['accounting', 'tax-rates'] as const,
  fixedAssets: () => ['accounting', 'fixed-assets'] as const,
  dashboard: () => ['accounting', 'dashboard'] as const,
  reports: () => ['accounting', 'reports'] as const,
};

// ============================================================================
// CUSTOMERS
// ============================================================================
export const useCustomers = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.customers(), params],
    queryFn: () => accountingService.customers.list(params),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.customer(id),
    queryFn: () => accountingService.customers.get(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.customers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.customers() });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      accountingService.customers.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.customers() });
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.customer(variables.id) });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.customers.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.customers() });
    },
  });
};

// ============================================================================
// INVOICES
// ============================================================================
export const useInvoices = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.invoices(), params],
    queryFn: () => accountingService.invoices.list(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.invoice(id),
    queryFn: () => accountingService.invoices.get(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.invoices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.invoices() });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      accountingService.invoices.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.invoices() });
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.invoice(variables.id) });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.invoices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.invoices() });
    },
  });
};

export const usePostInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.invoices.post,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.invoices() });
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.invoice(id) });
    },
  });
};

// ============================================================================
// QUOTES
// ============================================================================
export const useQuotes = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.quotes(), params],
    queryFn: () => accountingService.quotes.list(params),
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.quotes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.quotes() });
    },
  });
};

// ============================================================================
// PAYMENTS
// ============================================================================
export const usePayments = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.payments(), params],
    queryFn: () => accountingService.payments.list(params),
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.payments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.payments() });
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.invoices() });
    },
  });
};

// ============================================================================
// VENDORS
// ============================================================================
export const useVendors = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.vendors(), params],
    queryFn: () => accountingService.vendors.list(params),
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.vendors.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.vendors() });
    },
  });
};

// ============================================================================
// PURCHASE ORDERS
// ============================================================================
export const usePurchaseOrders = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.purchaseOrders(), params],
    queryFn: () => accountingService.purchaseOrders.list(params),
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.purchaseOrders.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.purchaseOrders() });
    },
  });
};

// ============================================================================
// DASHBOARD
// ============================================================================
export const useDashboard = () => {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.dashboard(),
    queryFn: accountingService.dashboard.getMain,
    staleTime: 60000, // 1 minute
  });
};

export const useDashboardSummary = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.dashboard(), 'summary', params],
    queryFn: () => accountingService.dashboard.getSummary(params),
    staleTime: 60000,
  });
};

// ============================================================================
// REPORTS
// ============================================================================
export const useProfitLoss = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.reports(), 'profit-loss', params],
    queryFn: () => accountingService.reports.profitLoss(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useBalanceSheet = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.reports(), 'balance-sheet', params],
    queryFn: () => accountingService.reports.balanceSheet(params),
    staleTime: 300000,
  });
};

export const useCashFlow = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.reports(), 'cash-flow', params],
    queryFn: () => accountingService.reports.cashFlow(params),
    staleTime: 300000,
  });
};

// ============================================================================
// CHART OF ACCOUNTS
// ============================================================================
export const useChartOfAccounts = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.chartOfAccounts(), params],
    queryFn: () => accountingService.chartOfAccounts.list(params),
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.chartOfAccounts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.chartOfAccounts() });
    },
  });
};

// ============================================================================
// JOURNAL ENTRIES
// ============================================================================
export const useJournalEntries = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.journalEntries(), params],
    queryFn: () => accountingService.journalEntries.list(params),
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.journalEntries.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.journalEntries() });
    },
  });
};

// ============================================================================
// BANK ACCOUNTS
// ============================================================================
export const useBankAccounts = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.bankAccounts(), params],
    queryFn: () => accountingService.bankAccounts.list(params),
  });
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.bankAccounts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.bankAccounts() });
    },
  });
};

// ============================================================================
// EXPENSES
// ============================================================================
export const useExpenses = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.expenses(), params],
    queryFn: () => accountingService.expenses.list(params),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.expenses.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.expenses() });
    },
  });
};

// ============================================================================
// TAX RATES
// ============================================================================
export const useTaxRates = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.taxRates(), params],
    queryFn: () => accountingService.taxRates.list(params),
  });
};

export const useCreateTaxRate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.taxRates.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.taxRates() });
    },
  });
};

// ============================================================================
// FIXED ASSETS
// ============================================================================
export const useFixedAssets = (params?: any) => {
  return useQuery({
    queryKey: [...ACCOUNTING_KEYS.fixedAssets(), params],
    queryFn: () => accountingService.fixedAssets.list(params),
  });
};

export const useCreateFixedAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountingService.fixedAssets.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.fixedAssets() });
    },
  });
};
