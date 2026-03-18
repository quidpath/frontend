import { useMutation, useQueryClient } from '@tanstack/react-query';
import posService, { POSOrder } from '@/services/posService';

export const ORDER_MUTATION_KEYS = {
  create: ['order', 'create'],
  update: ['order', 'update'],
  delete: ['order', 'delete'],
  addLine: ['order', 'addLine'],
  removeLine: ['order', 'removeLine'],
  pay: ['order', 'pay'],
  refund: ['order', 'refund'],
};

export const SESSION_MUTATION_KEYS = {
  open: ['session', 'open'],
  close: ['session', 'close'],
};

/** Create order */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      store_id: number;
      terminal_id?: number;
      customer_id?: number;
      notes?: string;
    }) =>
      posService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'summary'] });
    },
  });
}

/** Update order */
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      posService.updateOrder(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'order'] });
    },
  });
}

/** Delete order */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      posService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'summary'] });
    },
  });
}

/** Add order line */
export function useAddOrderLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      order_id: number;
      product_id: number;
      quantity: number;
      unit_price?: string;
      discount?: number;
    }) =>
      posService.addOrderLine(data),
    onSuccess: (_, { order_id }) => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'order', order_id] });
    },
  });
}

/** Remove order line */
export function useRemoveOrderLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { order_id: number; line_id: number }) =>
      posService.removeOrderLine(data),
    onSuccess: (_, { order_id }) => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'order', order_id] });
    },
  });
}

/** Process payment */
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      order_id: number;
      payment_method: 'cash' | 'card' | 'mobile';
      amount?: string;
      reference?: string;
    }) =>
      posService.processPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'summary'] });
    },
  });
}

/** Process refund */
export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      order_id: number;
      reason: string;
      refund_amount?: string;
    }) =>
      posService.processRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'summary'] });
    },
  });
}

/** Open POS session */
export function useOpenSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { terminal_id: number; opening_balance?: string }) =>
      posService.openSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'sessions'] });
    },
  });
}

/** Close POS session */
export function useCloseSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { session_id: number; closing_notes?: string }) =>
      posService.closeSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'summary'] });
    },
  });
}
