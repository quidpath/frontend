import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import billingService, {
  BillingPlan,
  Subscription,
  Invoice,
  Payment,
  AccessCheckResponse,
  PaymentInitiatePayload,
} from '@/services/billingService';
import { useSubscription as useSubscriptionHook } from '@/hooks/useBilling';

export const BILLING_KEYS = {
  all: ['billing'] as const,
  plans: (type?: string) => ['billing', 'plans', type] as const,
  subscription: () => ['billing', 'subscription'] as const,
  invoices: () => ['billing', 'invoices'] as const,
  payments: () => ['billing', 'payments'] as const,
  access: () => ['billing', 'access'] as const,
  trialStatus: () => ['billing', 'trial-status'] as const,
};

/** Fetch billing plans (public) */
export function usePlans(planType?: string) {
  return useQuery({
    queryKey: BILLING_KEYS.plans(planType),
    queryFn: async () => {
      const { data } = await billingService.getPlans(planType);
      // billing service returns { success, data: { plans, count } }
      return (data as any)?.data?.plans ?? (data as any)?.plans ?? [];
    },
    staleTime: 300_000,
  });
}

/** Fetch current subscription status */
export function useSubscription() {
  return useQuery({
    queryKey: BILLING_KEYS.subscription(),
    queryFn: async () => {
      const { data } = await billingService.getSubscriptionStatus();
      return data?.data?.subscription ?? null;
    },
    staleTime: 60_000,
    retry: false,
  });
}

/** Fetch invoices */
export function useInvoices() {
  return useQuery({
    queryKey: BILLING_KEYS.invoices(),
    queryFn: async () => {
      const { data } = await billingService.getInvoices();
      return (data as any)?.data?.invoices ?? [];
    },
    staleTime: 30_000,
  });
}

/** Fetch payment history */
export function usePaymentHistory() {
  return useQuery({
    queryKey: BILLING_KEYS.payments(),
    queryFn: async () => {
      const { data } = await billingService.getPaymentHistory();
      return (data as any)?.data?.payments ?? [];
    },
    staleTime: 30_000,
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
    retry: false,
  });
}

/** Get trial status */
export function useTrialStatus() {
  return useQuery({
    queryKey: BILLING_KEYS.trialStatus(),
    queryFn: async () => {
      const { data } = await billingService.getTrialStatus();
      return (data as any)?.data ?? null;
    },
    staleTime: 60_000,
    retry: false,
  });
}

/** Initiate M-Pesa payment mutation */
export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentInitiatePayload) =>
      billingService.initiatePayment(payload),
    onSuccess: () => {
      // Invalidate subscription and access after payment initiated
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.subscription() });
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.access() });
    },
  });
}

/** Create subscription mutation */
export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { plan_tier: string; billing_cycle?: string; promotion_code?: string }) =>
      billingService.createSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.subscription() });
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.access() });
    },
  });
}

/** Create trial mutation */
export function useCreateTrial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { corporate_name?: string; plan_tier?: string }) =>
      billingService.createTrial(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.subscription() });
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.access() });
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.trialStatus() });
    },
  });
}

/** Validate promotion code */
export function useValidatePromotion() {
  return useMutation({
    mutationFn: (payload: { promotion_code: string; amount: number; plan_tier: string }) =>
      billingService.validatePromotion(payload),
  });
}
