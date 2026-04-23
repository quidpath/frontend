import { useQuery } from '@tanstack/react-query';
import bankingService from '@/services/bankingService';
import { accountService } from '@/services/accountingService';

const BANKING_KEYS = {
  all: ['banking'] as const,
  bankAccounts: (params?: Record<string, unknown>) => [...BANKING_KEYS.all, 'bankAccounts', params] as const,
  accounts: (params?: Record<string, string>) => [...BANKING_KEYS.all, 'accounts', params] as const,
  transactions: (params?: Record<string, unknown>) => [...BANKING_KEYS.all, 'transactions', params] as const,
};

/**
 * Fetch bank accounts
 */
export function useBankAccounts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: BANKING_KEYS.bankAccounts(params),
    queryFn: async () => {
      const response = await bankingService.getBankAccounts(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch chart of accounts
 */
export function useAccounts(params?: Record<string, string>) {
  return useQuery({
    queryKey: BANKING_KEYS.accounts(params),
    queryFn: async () => {
      const response = await accountService.list(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch payment accounts (both bank accounts and chart of accounts)
 */
export function usePaymentAccounts() {
  const { data: bankAccounts, isLoading: bankAccountsLoading } = useBankAccounts({ is_active: 'true' });
  const { data: accounts, isLoading: accountsLoading } = useAccounts({ account_type: 'ASSET' });

  const paymentAccounts = [
    ...(bankAccounts?.results || []).map((acc: any) => ({
      ...acc,
      type: 'bank',
      display_name: `${acc.bank_name} - ${acc.account_name}`,
      description: 'Bank Account'
    })),
    ...(accounts?.accounts || []).map((acc: any) => ({
      ...acc,
      type: 'account',
      display_name: `${acc.code} - ${acc.name}`,
      description: `${acc.account_type} Account`
    }))
  ];

  return {
    data: paymentAccounts,
    isLoading: bankAccountsLoading || accountsLoading,
  };
}

/**
 * Fetch bank transactions
 */
export function useBankTransactions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: BANKING_KEYS.transactions(params),
    queryFn: async () => {
      const response = await bankingService.getTransactions(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch internal transfers
 */
export function useInternalTransfers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...BANKING_KEYS.all, 'transfers', params] as const,
    queryFn: async () => {
      const response = await bankingService.getInternalTransfers(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}