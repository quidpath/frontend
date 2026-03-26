import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import billingService, {
  AccessCheckResponse,
  PaymentInitiatePayload,
  Subscription,
} from '@/services/billingService';

export const BILLING_KEYS = {
  all: ['billing'] as const,
  plans: (type?: string) => ['billing', 'plans', type] as const,
  subscription: () => ['billing', 'subscription'] as const,
  invoices: () => ['billing', 'invoices'] as const,
  payments: () => ['billing', 'payments'] as const,
  access: () => ['billing', 'access'] as const,
  trialStatus: () => ['billing', 'trial-status'] as const,
};

// ─── Response shape helpers ───────────────────────────────────────────────────
// Gateway wraps billing responses as: { success, data: <billing_svc_response> }
// Billing service itself wraps as:    { success, data: { ... } }
// So the full path is: response.data  →  { success, data: billingData }
//                      billingData    →  { success, data: { plans/invoices/etc } }

function unwrap(response: any, ...keys: string[]): any {
  // response.data = gateway wrapper { success, data: billingData }
  let val = response?.data?.data;
  for (const k of keys) {
    val = val?.[k] ?? val?.data?.[k];
  }
  return val ?? null;
}

/** Fetch billing plans (public — no auth needed) */
export function usePlans(planType?: string) {
  return useQuery({
    queryKey: BILLING_KEYS.plans(planType),
    queryFn: async () => {
      const res = await billingService.getPlans(planType);
      // gateway: { success, data: { plans, count } }
      return res.data?.data?.plans ?? res.data?.plans ?? [];
    },
    staleTime: 300_000,
  });
}

/** Fetch current subscription status */
export function useSubscription() {
  return useQuery({
    queryKey: BILLING_KEYS.subscription(),
    queryFn: async () => {
      const res = await billingService.getSubscriptionStatus();
      // gateway: { success, data: { subscription } }
      const data = res.data as any;
      return data?.data?.subscription ?? data?.subscription ?? null;
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
      const res = await billingService.getInvoices();
      // gateway: { success, data: { invoices, corporate_id } }
      const data = res.data as any;
      return data?.data?.invoices ?? data?.invoices ?? [];
    },
    staleTime: 30_000,
  });
}

/** Fetch payment history */
export function usePaymentHistory() {
  return useQuery({
    queryKey: BILLING_KEYS.payments(),
    queryFn: async () => {
      const res = await billingService.getPaymentHistory();
      // gateway: { success, data: { payments } }
      const data = res.data as any;
      return data?.data?.payments ?? data?.payments ?? [];
    },
    staleTime: 30_000,
  });
}

/** Check access status */
export function useAccessCheck() {
  return useQuery({
    queryKey: BILLING_KEYS.access(),
    queryFn: async () => {
      const res = await billingService.checkAccess();
      // gateway: { success, has_access, access_type, trial, ... }
      return res.data as AccessCheckResponse;
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
      const res = await billingService.getTrialStatus();
      // gateway: { success, data: { has_trial, trial } }
      return res.data?.data ?? null;
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
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.subscription() });
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.access() });
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.payments() });
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
