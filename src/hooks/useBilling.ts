import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import billingService, { Plan, SubscriptionStatus, Payment } from '@/services/billingService';

export const BILLING_KEYS = {
  all: ['billing'] as const,
  plans: () => ['billing', 'plans'] as const,
  subscription: () => ['billing', 'subscription'] as const,
  payments: () => ['billing', 'payments'] as const,
};

/** Fetch billing plans */
export function usePlans() {
  return useQuery({
    queryKey: BILLING_KEYS.plans(),
    queryFn: async () => {
      const res = await billingService.getPlans();
      return res.data.data as Plan[];
    },
    staleTime: 300_000, // 5 minutes
  });
}

/** Fetch current subscription status */
export function useSubscription() {
  return useQuery({
    queryKey: BILLING_KEYS.subscription(),
    queryFn: async () => {
      const res = await billingService.getSubscriptionStatus();
      return res.data.data as SubscriptionStatus;
    },
    staleTime: 60_000, // 1 minute
    retry: false,
  });
}

/** Fetch payment history */
export function usePaymentHistory() {
  return useQuery({
    queryKey: BILLING_KEYS.payments(),
    queryFn: async () => {
      const res = await billingService.getPaymentHistory();
      return res.data.data as Payment[];
    },
    staleTime: 30_000, // 30 seconds
  });
}

/** Initialize subscription payment */
export function useInitializeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { plan_code: string; callback_url: string }) =>
      billingService.initializeSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.subscription() });
    },
  });
}

/** Cancel subscription */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) =>
      billingService.cancelSubscription(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.subscription() });
    },
  });
}

/** Verify payment */
export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reference: string) =>
      billingService.verifyPayment(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.subscription() });
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.payments() });
    },
  });
}
