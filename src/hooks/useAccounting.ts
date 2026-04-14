import { useQuery } from '@tanstack/react-query';
import accountingService, {
  AccountingSummary,
  Invoice,
  InvoiceListResponse,
  JournalEntry,
  JournalListResponse,
  Expense,
  ExpenseListResponse,
} from '@/services/accountingService';

export const ACCOUNTING_KEYS = {
  all: ['accounting'] as const,
  invoices: (params?: Record<string, string>) =>
    ['accounting', 'invoices', params] as const,
  invoice: (id: string) => ['accounting', 'invoice', id] as const,
  journals: (params?: Record<string, string>) =>
    ['accounting', 'journals', params] as const,
  journal: (id: string) => ['accounting', 'journal', id] as const,
  expenses: (params?: Record<string, string>) =>
    ['accounting', 'expenses', params] as const,
  expense: (id: string) => ['accounting', 'expense', id] as const,
  summary: () => ['accounting', 'summary'] as const,
  plans: () => ['accounting', 'plans'] as const,
};

export function useInvoices(params?: Record<string, string>) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.invoices(params),
    queryFn: async () => {
      const { data } = await accountingService.getInvoices(params);
      return data as InvoiceListResponse;
    },
    staleTime: 30_000,
  });
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.invoice(id ?? ''),
    queryFn: async () => {
      const { data } = await accountingService.getInvoice(id!);
      return data as Invoice;
    },
    enabled: !!id,
  });
}

export function useJournalEntries(params?: Record<string, string>) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.journals(params),
    queryFn: async () => {
      const { data } = await accountingService.getJournalEntries(params);
      return data as JournalListResponse;
    },
    staleTime: 30_000,
  });
}

export function useJournalEntry(id: string | null) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.journal(id ?? ''),
    queryFn: async () => {
      const { data } = await accountingService.getJournalEntry(id!);
      return data as JournalEntry;
    },
    enabled: !!id,
  });
}

export function useExpenses(params?: Record<string, string>) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.expenses(params),
    queryFn: async () => {
      const { data } = await accountingService.getExpenses(params);
      return data as ExpenseListResponse;
    },
    staleTime: 30_000,
  });
}

export function useExpense(id: string | null) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.expense(id ?? ''),
    queryFn: async () => {
      const { data } = await accountingService.getExpense(id!);
      return data as Expense;
    },
    enabled: !!id,
  });
}

/** Get accounting summary with real comparison data from backend */
export function useAccountingSummary() {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.summary(),
    queryFn: async () => {
      const { data } = await accountingService.getSummary();
      return data;
    },
    staleTime: 60_000,
  });
}

/** Billing plans — use the billing hook from useBilling instead. */
export function usePlans() {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.plans(),
    queryFn: async () => {
      // Plans are fetched via the billing gateway proxy
      const { gatewayClient } = await import('@/services/apiClient');
      type Plan = { id: number; name: string; price: string; billing_cycle: string; features: string[]; is_active: boolean; highlighted?: boolean };
      const { data } = await gatewayClient.get<{ data: { plans: Plan[] } }>('/api/billing/plans/');
      return (data as any)?.data?.plans ?? [];
    },
    staleTime: 300_000,
  });
}
