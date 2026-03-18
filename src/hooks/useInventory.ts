import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryService from '@/services/inventoryService';

export const INVENTORY_KEYS = {
  all: ['inventory'] as const,
  products: (params?: Record<string, unknown>) => ['inventory', 'products', params] as const,
  warehouses: (params?: Record<string, unknown>) => ['inventory', 'warehouses', params] as const,
  movements: (params?: Record<string, unknown>) => ['inventory', 'movements', params] as const,
  summary: () => ['inventory', 'summary'] as const,
};

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

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}
