/**
 * QuidPath ERP - Inventory Hooks
 * React Query hooks for inventory module
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryService from '@/services/inventoryService';

export const INVENTORY_KEYS = {
  all: ['inventory'] as const,
  products: () => ['inventory', 'products'] as const,
  product: (id: string) => ['inventory', 'products', id] as const,
  warehouses: () => ['inventory', 'warehouses'] as const,
  stock: (productId: string) => ['inventory', 'stock', productId] as const,
};

// Products
export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: [...INVENTORY_KEYS.products(), params],
    queryFn: () => inventoryService.products.list(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: INVENTORY_KEYS.product(id),
    queryFn: () => inventoryService.products.get(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.products.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.products() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryService.products.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.products() });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.product(variables.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.products.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.products() });
    },
  });
};

// Warehouses
export const useWarehouses = (params?: any) => {
  return useQuery({
    queryKey: [...INVENTORY_KEYS.warehouses(), params],
    queryFn: () => inventoryService.warehouses.list(params),
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.warehouses.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.warehouses() });
    },
  });
};

// Stock
export const useStockLevels = (productId: string, params?: any) => {
  return useQuery({
    queryKey: [...INVENTORY_KEYS.stock(productId), params],
    queryFn: () => inventoryService.stock.getLevels(productId, params),
    enabled: !!productId,
  });
};

export const useMoveStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.stock.move,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.products() });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
    },
  });
};
