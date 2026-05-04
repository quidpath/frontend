/**
 * QuidPath ERP - Billing Service
 * Handles subscription and payment operations
 */
import { gatewayClient } from './apiClient';

export interface Plan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'quarterly' | 'annually';
  max_users: number;
  max_storage_gb: number;
  features: Record<string, any>;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  plan: {
    name: string;
    code: string;
    price: number;
    currency: string;
    billing_cycle: string;
  };
  start_date: string;
  end_date: string;
  next_billing_date: string;
  status: 'active' | 'past_due' | 'cancelled' | 'expired' | 'pending';
  auto_renew: boolean;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  is_active: boolean;
  is_trial: boolean;
  days_remaining: number;
  message: string;
  subscription?: Subscription;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  payment_method: string;
  reference: string;
  payment_date: string | null;
  created_at: string;
}

export interface PaymentInitResponse {
  success: boolean;
  authorization_url: string;
  access_code: string;
  reference: string;
  payment_id: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  subscription_id?: string;
  status?: string;
}

const billingService = {
  // Plans
  getPlans: () =>
    gatewayClient.get<{ success: boolean; data: Plan[] }>('/api/v1/billing/plans/'),

  // Subscription
  getSubscriptionStatus: () =>
    gatewayClient.get<{ success: boolean; data: SubscriptionStatus }>('/api/v1/billing/subscription/status/'),

  initializeSubscription: (payload: { plan_code: string; callback_url: string }) =>
    gatewayClient.post<{ success: boolean; data: PaymentInitResponse }>('/api/v1/billing/subscription/initialize/', payload),

  cancelSubscription: (reason?: string) =>
    gatewayClient.post<{ success: boolean; message: string }>('/api/v1/billing/subscription/cancel/', { reason }),

  // Payments
  verifyPayment: (reference: string) =>
    gatewayClient.get<PaymentVerifyResponse>(`/api/v1/billing/payment/verify/?reference=${reference}`),

  getPaymentHistory: () =>
    gatewayClient.get<{ success: boolean; data: Payment[] }>('/api/v1/billing/payments/history/'),
};

export default billingService;
