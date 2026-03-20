import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bankingService from '@/services/bankingService';

export const BANKING_KEYS = {
  all: ['banking'] as const,
  accounts: (params?: Record<string, unknown>) => ['banking', 'accounts', params] as const,
  transactions: (params?: Record<string, unknown>) => ['banking', 'transactions', params] as const,
  reconciliations: (params?: Record<string, unknown>) => ['banking', 'reconciliations', params] as const,
  transfers: (params?: Record<string, unknown>) => ['banking', 'transfers', params] as const,
};

export function useBankAccounts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: BANKING_KEYS.accounts(params),
    queryFn: async () => {
      const { data } = await bankingService.getBankAccounts(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useBankTransactions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: BANKING_KEYS.transactions(params),
    queryFn: async () => {
      const { data } = await bankingService.getTransactions(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bankingService.createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANKING_KEYS.all });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bankingService.deleteBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANKING_KEYS.all });
    },
  });
}

export function useInternalTransfers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: BANKING_KEYS.transfers(params),
    queryFn: async () => {
      const { data } = await bankingService.getInternalTransfers(params);
      return data;
    },
    staleTime: 30_000,
  });
}
