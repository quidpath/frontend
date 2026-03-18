import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import billingService, { BillingPlan, Subscription, Invoice, Payment, BillingSummary } from '@/services/billingService';

export const BILLING_KEYS = {
  all: ['billing'] as const,
  plans: () => ['billing', 'plans'] as const,
  subscription: () => ['billing', 'subscription'] as const,
  invoices: (params?: Record<string, unknown>) => ['billing', 'invoices', params] as const,
  payments: (params?: Record<string, unknown>) => ['billing', 'payments', params] as const,
  summary: () => ['billing', 'summary'] as const,
  access: () => ['billing', 'access'] as const,
};

/** Fetch billing plans */
export function usePlans() {
  return useQuery({
    queryKey: BILLING_KEYS.plans(),
    queryFn: async () => {
      const { data } = await billingService.getPlans();
      return data ?? [];
    },
    staleTime: 300_000, // 5 minutes
  });
}

/** Fetch current subscription status */
export function useSubscription() {
  return useQuery({
    queryKey: BILLING_KEYS.subscription(),
    queryFn: async () => {
      const { data } = await billingService.getSubscriptionStatus();
      return data;
    },
    staleTime: 60_000, // 1 minute
    retry: false,
  });
}

/** Fetch invoices with pagination */
export function useInvoices(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: BILLING_KEYS.invoices(params),
    queryFn: async () => {
      const { data } = await billingService.getInvoices(params);
      return data;
    },
    staleTime: 30_000,
  });
}

/** Fetch payment history */
export function usePaymentHistory(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: BILLING_KEYS.payments(params),
    queryFn: async () => {
      const { data } = await billingService.getPaymentHistory(params);
      return data;
    },
    staleTime: 30_000,
  });
}

/** Fetch billing summary for dashboard */
export function useBillingSummary() {
  return useQuery({
    queryKey: BILLING_KEYS.summary(),
    queryFn: async () => {
      const { data } = await billingService.getSummary();
      return data;
    },
    staleTime: 60_000,
  });
}

/** Check access status */
export function useAccessCheck() {
  return useQuery({
    queryKey: BILLING_KEYS.access(),
    queryFn: async () => {
      const { data } = await billingService.checkAccess();
      return data;
    },
    staleTime: 30_000,
  });
}

/** Create subscription mutation */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { plan_id: string; promotion_code?: string }) =>
      billingService.createSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.subscription() });
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.access() });
    },
  });
}

/** Initiate payment mutation */
export function useInitiatePayment() {
  return useMutation({
    mutationFn: (payload: { amount: string; method: string; invoice_id?: string }) =>
      billingService.initiatePayment(payload),
  });
}

/** Create trial mutation */
export function useCreateTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) =>
      billingService.createTrial(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.subscription() });
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.access() });
    },
  });
}
