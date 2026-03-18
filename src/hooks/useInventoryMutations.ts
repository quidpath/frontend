import { useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryService, { Product, StockMovement } from '@/services/inventoryService';

export const PRODUCT_MUTATION_KEYS = {
  create: ['product', 'create'],
  update: ['product', 'update'],
  delete: ['product', 'delete'],
};

export const STOCK_MUTATION_KEYS = {
  adjust: ['stock', 'adjust'],
  transfer: ['stock', 'transfer'],
  count: ['stock', 'count'],
};

/** Create product */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      sku: string;
      category_id?: string;
      unit_price: string;
      cost_price?: string;
      reorder_level?: number;
      description?: string;
      barcode?: string;
    }) =>
      inventoryService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
    },
  });
}

/** Update product */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      inventoryService.updateProduct(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product'] });
    },
  });
}

/** Delete product */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      inventoryService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
    },
  });
}

/** Adjust stock */
export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      product_id: number;
      quantity: number;
      movement_type: 'in' | 'out' | 'adjustment';
      reason: string;
      reference?: string;
    }) =>
      inventoryService.adjustStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
    },
  });
}

/** Transfer stock between warehouses */
export function useTransferStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      product_id: number;
      from_warehouse_id: number;
      to_warehouse_id: number;
      quantity: number;
      reference?: string;
    }) =>
      inventoryService.transferStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'warehouses'] });
    },
  });
}

/** Stock count */
export function useStockCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      warehouse_id: number;
      product_id?: number;
      counted_quantity: number;
      notes?: string;
    }) =>
      inventoryService.stockCount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'counting'] });
    },
  });
}

/** Create warehouse */
export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; code: string; location?: string; capacity?: number }) =>
      inventoryService.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'warehouses'] });
    },
  });
}

/** Update warehouse */
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      inventoryService.updateWarehouse(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'warehouses'] });
    },
  });
}
