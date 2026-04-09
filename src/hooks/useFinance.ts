import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import financeService from '@/services/financeService';

export const FK = {
  invoices: (p?: Record<string, string>) => ['finance', 'invoices', p] as const,
  quotations: (p?: Record<string, string>) => ['finance', 'quotations', p] as const,
  bills: (p?: Record<string, string>) => ['finance', 'bills', p] as const,
  purchaseOrders: (p?: Record<string, string>) => ['finance', 'purchaseOrders', p] as const,
  expenses: (p?: Record<string, string>) => ['finance', 'expenses', p] as const,
  customers: (p?: Record<string, string>) => ['finance', 'customers', p] as const,
  vendors: (p?: Record<string, string>) => ['finance', 'vendors', p] as const,
  accounts: (p?: Record<string, string>) => ['finance', 'accounts', p] as const,
  bankAccounts: () => ['finance', 'bankAccounts'] as const,
  transactions: (p?: Record<string, unknown>) => ['finance', 'transactions', p] as const,
  transfers: (p?: Record<string, unknown>) => ['finance', 'transfers', p] as const,
  reconciliations: () => ['finance', 'reconciliations'] as const,
  salesSummary: () => ['finance', 'salesSummary'] as const,
  purchasesSummary: () => ['finance', 'purchasesSummary'] as const,
  expensesSummary: () => ['finance', 'expensesSummary'] as const,
};

const STALE = 30_000;

export function useInvoices(p?: Record<string, string>) {
  return useQuery({ queryKey: FK.invoices(p), queryFn: () => financeService.getInvoices(p).then(r => r.data), staleTime: STALE });
}
export function useQuotations(p?: Record<string, string>) {
  return useQuery({ queryKey: FK.quotations(p), queryFn: () => financeService.getQuotations(p).then(r => r.data), staleTime: STALE });
}
export function useVendorBills(p?: Record<string, string>) {
  return useQuery({ queryKey: FK.bills(p), queryFn: () => financeService.getVendorBills(p).then(r => r.data), staleTime: STALE });
}
export function usePurchaseOrders(p?: Record<string, string>) {
  return useQuery({ queryKey: FK.purchaseOrders(p), queryFn: () => financeService.getPurchaseOrders(p).then(r => r.data), staleTime: STALE });
}
export function useExpenses(p?: Record<string, string>) {
  return useQuery({ queryKey: FK.expenses(p), queryFn: () => financeService.getExpenses(p).then(r => r.data), staleTime: STALE });
}
export function useCustomers(p?: Record<string, string>) {
  return useQuery({ queryKey: FK.customers(p), queryFn: () => financeService.getCustomers(p).then(r => r.data), staleTime: STALE });
}
export function useVendors(p?: Record<string, string>) {
  return useQuery({ queryKey: FK.vendors(p), queryFn: () => financeService.getVendors(p).then(r => r.data), staleTime: STALE });
}
export function useAccounts(p?: Record<string, string>) {
  return useQuery({ queryKey: FK.accounts(p), queryFn: () => financeService.getAccounts(p).then(r => r.data), staleTime: STALE });
}
export function useBankAccounts() {
  return useQuery({ queryKey: FK.bankAccounts(), queryFn: () => financeService.getBankAccounts().then(r => r.data as { results: import('@/services/financeService').BankAccount[]; count: number }), staleTime: STALE });
}
export function useTransactions(p?: Record<string, unknown>) {
  return useQuery({ queryKey: FK.transactions(p), queryFn: () => financeService.getTransactions(p).then(r => r.data as { results: import('@/services/financeService').BankTransaction[]; count: number }), staleTime: STALE });
}
export function useInternalTransfers(p?: Record<string, unknown>) {
  return useQuery({ queryKey: FK.transfers(p), queryFn: () => financeService.getInternalTransfers(p).then(r => r.data as { results: import('@/services/financeService').InternalTransfer[]; count: number }), staleTime: STALE });
}
export function useReconciliations() {
  return useQuery({ queryKey: FK.reconciliations(), queryFn: () => financeService.getReconciliations().then(r => r.data as { results: import('@/services/financeService').BankReconciliation[]; count: number }), staleTime: STALE });
}
export function useSalesSummary() {
  return useQuery({ queryKey: FK.salesSummary(), queryFn: () => financeService.getSalesSummary().then(r => r.data), staleTime: STALE });
}
export function usePurchasesSummary() {
  return useQuery({ queryKey: FK.purchasesSummary(), queryFn: () => financeService.getPurchasesSummary().then(r => r.data), staleTime: STALE });
}
export function useExpensesSummary() {
  return useQuery({ queryKey: FK.expensesSummary(), queryFn: () => financeService.getExpensesSummary().then(r => r.data), staleTime: STALE });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

function useInvalidate(keys: (keyof typeof FK)[]) {
  const qc = useQueryClient();
  return () => keys.forEach(k => qc.invalidateQueries({ queryKey: ['finance', k] }));
}

export function useCreateInvoice() {
  const inv = useInvalidate(['invoices', 'salesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createInvoice(d).then(r => r.data), onSuccess: inv });
}
export function useUpdateInvoice() {
  const inv = useInvalidate(['invoices', 'salesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.updateInvoice(d).then(r => r.data), onSuccess: inv });
}
export function useDeleteInvoice() {
  const inv = useInvalidate(['invoices', 'salesSummary']);
  return useMutation({ mutationFn: (id: string) => financeService.deleteInvoice(id), onSuccess: inv });
}

export function useCreateQuotation() {
  const inv = useInvalidate(['quotations']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createQuotation(d).then(r => r.data), onSuccess: inv });
}
export function useUpdateQuotation() {
  const inv = useInvalidate(['quotations']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.updateQuotation(d).then(r => r.data), onSuccess: inv });
}
export function useDeleteQuotation() {
  const inv = useInvalidate(['quotations']);
  return useMutation({ mutationFn: (id: string) => financeService.deleteQuotation(id), onSuccess: inv });
}

export function useCreateVendorBill() {
  const inv = useInvalidate(['bills', 'purchasesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createVendorBill(d).then(r => r.data), onSuccess: inv });
}
export function useUpdateVendorBill() {
  const inv = useInvalidate(['bills', 'purchasesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.updateVendorBill(d).then(r => r.data), onSuccess: inv });
}
export function useDeleteVendorBill() {
  const inv = useInvalidate(['bills', 'purchasesSummary']);
  return useMutation({ mutationFn: (id: string) => financeService.deleteVendorBill(id), onSuccess: inv });
}

export function useCreatePurchaseOrder() {
  const inv = useInvalidate(['purchaseOrders', 'purchasesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createPurchaseOrder(d).then(r => r.data), onSuccess: inv });
}
export function useDeletePurchaseOrder() {
  const inv = useInvalidate(['purchaseOrders', 'purchasesSummary']);
  return useMutation({ mutationFn: (id: string) => financeService.deletePurchaseOrder(id), onSuccess: inv });
}

export function useCreateExpense() {
  const inv = useInvalidate(['expenses', 'expensesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createExpense(d).then(r => r.data), onSuccess: inv });
}
export function useUpdateExpense() {
  const inv = useInvalidate(['expenses', 'expensesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.updateExpense(d).then(r => r.data), onSuccess: inv });
}
export function useDeleteExpense() {
  const inv = useInvalidate(['expenses', 'expensesSummary']);
  return useMutation({ mutationFn: (id: string) => financeService.deleteExpense(id), onSuccess: inv });
}

export function useCreateBankAccount() {
  const inv = useInvalidate(['bankAccounts']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createBankAccount(d).then(r => r.data), onSuccess: inv });
}
export function useUpdateBankAccount() {
  const inv = useInvalidate(['bankAccounts']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.updateBankAccount(d).then(r => r.data), onSuccess: inv });
}
export function useDeleteBankAccount() {
  const inv = useInvalidate(['bankAccounts']);
  return useMutation({ mutationFn: (id: string) => financeService.deleteBankAccount(id), onSuccess: inv });
}

export function useCreateCustomer() {
  const inv = useInvalidate(['customers']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createCustomer(d).then(r => r.data), onSuccess: inv });
}
export function useUpdateCustomer() {
  const inv = useInvalidate(['customers']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.updateCustomer(d).then(r => r.data), onSuccess: inv });
}
export function useDeleteCustomer() {
  const inv = useInvalidate(['customers']);
  return useMutation({ mutationFn: (id: string) => financeService.deleteCustomer(id), onSuccess: inv });
}

export function useCreateVendor() {
  const inv = useInvalidate(['vendors']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createVendor(d).then(r => r.data), onSuccess: inv });
}
export function useUpdateVendor() {
  const inv = useInvalidate(['vendors']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.updateVendor(d).then(r => r.data), onSuccess: inv });
}
export function useDeleteVendor() {
  const inv = useInvalidate(['vendors']);
  return useMutation({ mutationFn: (id: string) => financeService.deleteVendor(id), onSuccess: inv });
}

export function useUpdatePurchaseOrder() {
  const inv = useInvalidate(['purchaseOrders', 'purchasesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.updatePurchaseOrder(d).then(r => r.data), onSuccess: inv });
}

export function useCreateTransfer() {
  const inv = useInvalidate(['transfers', 'bankAccounts']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createInternalTransfer(d).then(r => r.data), onSuccess: inv });
}
export function useDeleteTransfer() {
  const inv = useInvalidate(['transfers']);
  return useMutation({ mutationFn: (id: string) => financeService.deleteInternalTransfer(id), onSuccess: inv });
}

export function useCreateTransaction() {
  const inv = useInvalidate(['transactions', 'bankAccounts']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createTransaction(d).then(r => r.data), onSuccess: inv });
}
export function useDeleteTransaction() {
  const inv = useInvalidate(['transactions']);
  return useMutation({ mutationFn: (id: string) => financeService.deleteTransaction(id), onSuccess: inv });
}

export function useRecordInvoicePayment() {
  const inv = useInvalidate(['invoices', 'salesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.recordInvoicePayment(d).then(r => r.data), onSuccess: inv });
}

export function useRecordBillPayment() {
  const inv = useInvalidate(['bills', 'purchasesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.recordBillPayment(d).then(r => r.data), onSuccess: inv });
}

export function useConvertQuoteToInvoice() {
  const inv = useInvalidate(['quotations', 'invoices', 'salesSummary']);
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => financeService.convertQuoteToInvoice(d).then(r => r.data),
    onSuccess: inv,
  });
}

export function useConvertPOToBill() {
  const inv = useInvalidate(['purchaseOrders', 'bills', 'purchasesSummary']);
  return useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.convertPOToBill(d).then(r => r.data), onSuccess: inv });
}
