import { useQuery } from '@tanstack/react-query';
import posService from '@/services/posService';

export const POS_KEYS = {
  all: ['pos'] as const,
  orders: (params?: Record<string, unknown>) => ['pos', 'orders', params] as const,
  order: (id: number) => ['pos', 'order', id] as const,
  sessions: (params?: Record<string, unknown>) => ['pos', 'sessions', params] as const,
  purchases: (params?: Record<string, unknown>) => ['pos', 'purchases', params] as const,
  summary: () => ['pos', 'summary'] as const,
};

export function usePOSOrders(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: POS_KEYS.orders(params),
    queryFn: () => posService.getOrders(params).then((r) => r.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function usePurchases(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: POS_KEYS.purchases(params),
    queryFn: () => posService.getPurchases(params).then((r) => r.data),
    staleTime: 30_000,
  });
}

export function usePOSSummary() {
  return useQuery({
    queryKey: POS_KEYS.summary(),
    queryFn: () => posService.getSummary().then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function usePOSSessions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: POS_KEYS.sessions(params),
    queryFn: () => posService.getSessions(params).then((r) => r.data),
    staleTime: 30_000,
  });
}
