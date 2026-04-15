import { useQuery } from '@tanstack/react-query';
import inventoryService from '@/services/inventoryService';

export const INVENTORY_KEYS = {
  all: ['inventory'] as const,
  products: (params?: Record<string, unknown>) => ['inventory', 'products', params] as const,
  warehouses: (params?: Record<string, unknown>) => ['inventory', 'warehouses', params] as const,
  movements: (params?: Record<string, unknown>) => ['inventory', 'movements', params] as const,
  summary: () => ['inventory', 'summary'] as const,
  integrationHealth: () => ['inventory', 'integration-health'] as const,
};

/**
 * Hook to fetch products with pagination and search
 * Uses integrated endpoint for full sync status
 */
export function useProducts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: INVENTORY_KEYS.products(params),
    queryFn: async () => {
      const { data } = await inventoryService.getProducts(params);
      return data;
    },
    staleTime: 30_000,
  });
}

/**
 * Hook to fetch warehouses
 */
export function useWarehouses(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: INVENTORY_KEYS.warehouses(params),
    queryFn: async () => {
      const { data } = await inventoryService.getWarehouses(params);
      return data;
    },
    staleTime: 30_000,
  });
}

/**
 * Hook to fetch stock movements
 * Uses integrated endpoint for full sync status
 */
export function useStockMovements(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: INVENTORY_KEYS.movements(params),
    queryFn: async () => {
      const { data } = await inventoryService.getStockMovements(params);
      return data;
    },
    staleTime: 30_000,
  });
}

/**
 * Hook to fetch inventory summary metrics
 */
export function useInventorySummary() {
  return useQuery({
    queryKey: INVENTORY_KEYS.summary(),
    queryFn: async () => {
      const { data } = await inventoryService.getSummary();
      return data;
    },
    staleTime: 60_000,
  });
}

/**
 * Hook to check integration health for all services
 * Monitors: Accounting, POS, CRM, HRM, Projects
 */
export function useIntegrationHealth() {
  return useQuery({
    queryKey: INVENTORY_KEYS.integrationHealth(),
    queryFn: async () => {
      const { data } = await inventoryService.checkIntegrationHealth();
      return data;
    },
    staleTime: 60_000, // Refresh every minute
    refetchInterval: 60_000, // Auto-refresh every minute
  });
}
