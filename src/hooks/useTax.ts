import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taxService from '@/services/taxService';

export const TAX_KEYS = {
  all: ['tax'] as const,
  rates: () => ['tax', 'rates'] as const,
  reports: (params?: Record<string, unknown>) => ['tax', 'reports', params] as const,
};

export function useTaxRates() {
  return useQuery({
    queryKey: TAX_KEYS.rates(),
    queryFn: async () => {
      const { data } = await taxService.getTaxRates();
      return data;
    },
    staleTime: 30_000,
  });
}

export function useTaxReports(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: TAX_KEYS.reports(params),
    queryFn: async () => {
      const { data } = await taxService.getTaxReports(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCreateTaxRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taxService.createTaxRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_KEYS.all });
    },
  });
}

export function useDeleteTaxRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taxService.deleteTaxRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_KEYS.all });
    },
  });
}

export function useGenerateTaxReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taxService.generateTaxReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_KEYS.all });
    },
  });
}
