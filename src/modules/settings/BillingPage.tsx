'use client';

import React, { useState } from 'react';
import {
  useAccessCheck,
  useSubscription,
  useInvoices,
  usePlans,
  useInitiatePayment,
  useTrialStatus,
} from '@/hooks/useBilling';

export default function BillingPage() {
  const [phone, setPhone] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentResult, setPaymentResult] = useState<string | null>(null);

  const { data: access, isLoading: accessLoading } = useAccessCheck();
  const { data: subscription } = useSubscription();
  const { data: invoices = [] } = useInvoices();
  const { data: plans = [] } = usePlans('organization');
  const { data: trialStatus } = useTrialStatus();
  const initiatePayment = useInitiatePayment();

  const handlePay = async () => {
    if (!selectedPlanId || !phone) return;
    try {
      const res = await initiatePayment.mutateAsync({
        plan_id: selectedPlanId,
        phone_number: phone,
        subscription_type: 'organization',
      });
      const d = (res.data as any)?.data;
      setPaymentResult(
        d?.checkout_request_id
          ? `STK push sent. Check your phone. Checkout ID: ${d.checkout_request_id}`
          : 'Payment initiated.'
      );
    } catch (e: any) {
      setPaymentResult(e?.response?.data?.message || 'Payment failed.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Billing & Subscription</h1>

      {/* Access Status */}
      <section style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8 }}>
        <h2>Access Status</h2>
        {accessLoading ? (
          <p>Checking access...</p>
        ) : access ? (
          <div>
            <p>
              <strong>Status:</strong>{' '}
              <span style={{ color: access.has_access ? 'green' : 'red' }}>
                {access.has_access ? 'Active' : 'No Access'}
              </span>
            </p>
            {access.access_type && <p><strong>Type:</strong> {access.access_type}</p>}
            {access.trial && (
              <p><strong>Trial days remaining:</strong> {access.trial.days_remaining}</p>
            )}
            {!access.has_access && access.message && (
              <p style={{ color: '#c62828' }}>{access.message}</p>
            )}
          </div>
        ) : (
          <p>Unable to fetch access status.</p>
        )}
      </section>

      {/* Current Subscription */}
      {subscription && (
        <section style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <h2>Current Subscription</h2>
          <p><strong>Plan:</strong> {subscription.plan_name} ({subscription.plan_tier})</p>
          <p><strong>Status:</strong> {subscription.status}</p>
          <p><strong>Billing Cycle:</strong> {subscription.billing_cycle}</p>
          <p><strong>Amount:</strong> {subscription.currency} {subscription.total_amount?.toLocaleString()}</p>
          <p><strong>Expires:</strong> {new Date(subscription.end_date).toLocaleDateString()}</p>
        </section>
      )}

      {/* Trial Status */}
      {trialStatus?.has_trial && trialStatus.trial && (
        <section style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <h2>Trial</h2>
          <p><strong>Status:</strong> {trialStatus.trial.status}</p>
          <p><strong>Days Remaining:</strong> {trialStatus.trial.days_remaining}</p>
          <p><strong>Ends:</strong> {new Date(trialStatus.trial.end_date).toLocaleDateString()}</p>
        </section>
      )}

      {/* Initiate Payment */}
      <section style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8 }}>
        <h2>Subscribe / Pay</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 400 }}>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="">Select a plan</option>
            {(plans as any[]).map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name} — KES {p.price_monthly?.toLocaleString()}/mo
              </option>
            ))}
          </select>
          <input
            type="tel"
            placeholder="M-Pesa phone (e.g. 0712345678)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button
            onClick={handlePay}
            disabled={!selectedPlanId || !phone || initiatePayment.isPending}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              opacity: !selectedPlanId || !phone ? 0.6 : 1,
            }}
          >
            {initiatePayment.isPending ? 'Sending STK Push...' : 'Pay with M-Pesa'}
          </button>
          {paymentResult && (
            <p style={{ color: paymentResult.includes('failed') ? 'red' : 'green' }}>
              {paymentResult}
            </p>
          )}
        </div>
      </section>

      {/* Invoices */}
      <section style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8 }}>
        <h2>Invoices</h2>
        {(invoices as any[]).length === 0 ? (
          <p>No invoices found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Invoice #</th>
                <th style={{ padding: '0.5rem' }}>Amount</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem' }}>Due Date</th>
                <th style={{ padding: '0.5rem' }}>Paid At</th>
              </tr>
            </thead>
            <tbody>
              {(invoices as any[]).map((inv: any) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '0.5rem' }}>{inv.invoice_number}</td>
                  <td style={{ padding: '0.5rem' }}>{inv.currency} {Number(inv.total_amount).toLocaleString()}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{ color: inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'red' : '#555' }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.5rem' }}>{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
