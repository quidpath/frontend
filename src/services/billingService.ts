import { billingClient } from './apiClient';

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  trial_days: number;
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: string;
  plan: BillingPlan;
  status: 'trial' | 'active' | 'suspended' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  amount: string;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  paid_at?: string;
}

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  method: 'mpesa' | 'card' | 'bank_transfer' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference: string;
  created_at: string;
}

export interface AccessCheckResponse {
  has_access: boolean;
  subscription_status: string;
  trial_remaining_days?: number;
  blocked_reason?: string;
}

export interface BillingSummary {
  total_revenue: number;
  total_outstanding: number;
  total_overdue: number;
  active_subscriptions: number;
  mrr: number;
}

const billingService = {
  // Access Control
  checkAccess: () =>
    billingClient.get<AccessCheckResponse>('/api/billing/access/check/'),

  // Plans
  getPlans: () =>
    billingClient.get<BillingPlan[]>('/api/billing/plans/'),

  // Trials
  createTrial: (planId: string) =>
    billingClient.post('/api/billing/trials/create/', { plan_id: planId }),

  getTrialStatus: () =>
    billingClient.get('/api/billing/trials/status/'),

  // Subscriptions
  createSubscription: (payload: { plan_id: string; promotion_code?: string }) =>
    billingClient.post<Subscription>('/api/billing/subscriptions/create/', payload),

  getSubscriptionStatus: () =>
    billingClient.get<Subscription>('/api/billing/subscriptions/status/'),

  // Payments
  initiatePayment: (payload: { amount: string; method: string; invoice_id?: string }) =>
    billingClient.post('/api/billing/payments/initiate/', payload),

  checkPaymentStatus: (paymentId: string) =>
    billingClient.get(`/api/billing/payments/status/?payment_id=${paymentId}`),

  getPaymentHistory: (params?: Record<string, unknown>) =>
    billingClient.get<PaginatedResponse<Payment>>('/api/billing/payments/history/', { params }),

  // Invoices
  getInvoices: (params?: Record<string, unknown>) =>
    billingClient.get<PaginatedResponse<Invoice>>('/api/billing/invoices/', { params }),

  // Summary
  getSummary: () =>
    billingClient.get<BillingSummary>('/api/billing/summary/'),
};

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default billingService;
