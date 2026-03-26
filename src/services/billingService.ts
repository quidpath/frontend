/**
 * All billing calls go through the main gateway (/api/billing/*).
 * The gateway authenticates the user JWT and forwards to the billing
 * microservice using X-Service-Key — no direct frontend→billing calls.
 */
import { gatewayClient } from './apiClient';

export interface BillingPlan {
  id: string;
  name: string;
  tier: string;
  plan_type: string;
  description: string;
  price_monthly: number;
  price_quarterly?: number;
  price_yearly?: number;
  included_users: number;
  additional_user_price: number;
  max_users?: number;
  limits?: Record<string, unknown>;
}

export interface Subscription {
  id: string;
  corporate_id: string;
  plan_name: string;
  plan_tier: string;
  status: 'trial' | 'active' | 'suspended' | 'cancelled' | 'expired';
  billing_cycle: string;
  total_amount: number;
  currency: string;
  end_date: string;
  next_billing_date?: string;
}

export interface Invoice {
  id: string;
  corporate_id: string;
  invoice_number: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  total_amount: number;
  currency: string;
  due_date: string;
  paid_at?: string;
  billing_period_start: string;
  billing_period_end: string;
}

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  method: 'mpesa' | 'card' | 'bank_transfer' | 'cash';
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  reference: string;
  created_at: string;
}

export interface AccessCheckResponse {
  success: boolean;
  has_access: boolean;
  access_type?: 'trial' | 'subscription' | null;
  reason?: string;
  message?: string;
  trial?: { status: string; days_remaining: number; end_date: string; phone_number?: string };
  subscription?: Subscription;
}

export interface PaymentInitiatePayload {
  plan_id: string;
  phone_number: string;
  billing_cycle?: string;
  subscription_type?: 'individual' | 'organization';
  corporate_name?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const billingService = {
  // Plans — public GET
  getPlans: (planType?: string) =>
    gatewayClient.get('/api/billing/plans/', { params: planType ? { type: planType } : undefined }),

  // Access check
  checkAccess: () =>
    gatewayClient.post<AccessCheckResponse>('/api/billing/access/check/', {}),

  // Trials
  createTrial: (payload: { corporate_name?: string; plan_tier?: string }) =>
    gatewayClient.post('/api/billing/trials/create/', payload),

  getTrialStatus: () =>
    gatewayClient.post('/api/billing/trials/status/', {}),

  // Subscriptions
  getSubscriptionStatus: () =>
    gatewayClient.post<{ success: boolean; data: { subscription: Subscription | null } }>(
      '/api/billing/subscriptions/status/',
      {}
    ),

  createSubscription: (payload: { plan_tier: string; billing_cycle?: string; promotion_code?: string }) =>
    gatewayClient.post<Subscription>('/api/billing/subscriptions/create/', payload),

  // Payments — plan_id based (creates subscription + invoice internally)
  initiatePayment: (payload: PaymentInitiatePayload) =>
    gatewayClient.post('/api/billing/payments/initiate/', payload),

  checkPaymentStatus: (paymentId: string) =>
    gatewayClient.post('/api/billing/payments/status/', { payment_id: paymentId }),

  getPaymentHistory: () =>
    gatewayClient.post<{ payments: Payment[] }>('/api/billing/payments/history/', {}),

  // Invoices
  getInvoices: () =>
    gatewayClient.post<{ invoices: Invoice[]; corporate_id: string }>('/api/billing/invoices/', {}),

  // Promotions — public
  validatePromotion: (payload: { promotion_code: string; amount: number; plan_tier: string }) =>
    gatewayClient.post('/api/billing/promotions/validate/', payload),
};

export default billingService;
