/**
 * QuidPath ERP - Purchasing Hooks
 * React Query hooks for purchasing module
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import purchasingService from '@/services/purchasingService';

export const PURCHASING_KEYS = {
  all: ['purchasing'] as const,
  vendors: () => ['purchasing', 'vendors'] as const,
  vendor: (id: string) => ['purchasing', 'vendors', id] as const,
  purchaseOrders: () => ['purchasing', 'purchase-orders'] as const,
  purchaseOrder: (id: string) => ['purchasing', 'purchase-orders', id] as const,
};

// Vendors
export const useVendors = (params?: any) => {
  return useQuery({
    queryKey: [...PURCHASING_KEYS.vendors(), params],
    queryFn: () => purchasingService.vendors.list(params),
  });
};

export const useVendor = (id: string) => {
  return useQuery({
    queryKey: PURCHASING_KEYS.vendor(id),
    queryFn: () => purchasingService.vendors.get(id),
    enabled: !!id,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchasingService.vendors.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASING_KEYS.vendors() });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      purchasingService.vendors.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PURCHASING_KEYS.vendors() });
      queryClient.invalidateQueries({ queryKey: PURCHASING_KEYS.vendor(variables.id) });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchasingService.vendors.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASING_KEYS.vendors() });
    },
  });
};

// Purchase Orders
export const usePurchaseOrders = (params?: any) => {
  return useQuery({
    queryKey: [...PURCHASING_KEYS.purchaseOrders(), params],
    queryFn: () => purchasingService.purchaseOrders.list(params),
  });
};

export const usePurchaseOrder = (id: string) => {
  return useQuery({
    queryKey: PURCHASING_KEYS.purchaseOrder(id),
    queryFn: () => purchasingService.purchaseOrders.get(id),
    enabled: !!id,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchasingService.purchaseOrders.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASING_KEYS.purchaseOrders() });
    },
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      purchasingService.purchaseOrders.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PURCHASING_KEYS.purchaseOrders() });
      queryClient.invalidateQueries({ queryKey: PURCHASING_KEYS.purchaseOrder(variables.id) });
    },
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchasingService.purchaseOrders.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASING_KEYS.purchaseOrders() });
    },
  });
};
