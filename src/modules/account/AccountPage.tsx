'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Tab, Tabs, Card, CardContent, Typography, Avatar, Grid, Divider,
  Chip, Button, TextField, Alert, CircularProgress, Table, TableBody,
  TableCell, TableHead, TableRow, MenuItem,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PageHeader from '@/components/ui/PageHeader';
import { useUserStore } from '@/store/userStore';
import {
  useAccessCheck, useSubscription, useInvoices, usePlans,
  useInitiatePayment, usePaymentHistory, BILLING_KEYS,
} from '@/hooks/useBilling';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';
import { useCurrencyStore } from '@/store/currencyStore';
import { usePaystack } from '@/hooks/usePaystack';

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Open billing tab automatically if redirected here after expiry
  const expiredParam = searchParams.get('expired');
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState(tabParam === 'billing' ? 1 : 0);

  const [email, setEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentResult, setPaymentResult] = useState<string | null>(null);
  
  const user = useUserStore((s) => s.user);
  const { data: access, isLoading: accessLoading } = useAccessCheck();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: plans = [], isLoading: plansLoading } = usePlans('organization');
  const { data: paymentHistory = [], isLoading: paymentsLoading } = usePaymentHistory();

  // Initialize Paystack
  const paystack = usePaystack();
  const [paystackBusy, setPaystackBusy] = useState(false);

  const handlePay = async () => {
    if (!selectedPlanId || !email) {
      setPaymentResult('Please select a plan and enter email');
      return;
    }

    const selectedPlan = (plans as any[]).find((p: any) => p.id === selectedPlanId);
    if (!selectedPlan) {
      setPaymentResult('Invalid plan selected');
      return;
    }

    const amount = selectedPlan.price_monthly || 0;
    setPaystackBusy(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';
      const { data } = await (await import('axios')).default.post(
        `${API_URL}/api/auth/payment/initialize/`,
        {
          email: email || user?.email || '',
          amount,
          payment_type: 'individual',
          corporate_id: user?.corporate?.id || '',
          plan_id: selectedPlanId,
        }
      );

      if (!data.access_code) {
        setPaymentResult('Could not initialize payment. Please try again.');
        setPaystackBusy(false);
        return;
      }

      paystack.resumeTransaction(data.access_code, {
        onSuccess: (transaction) => {
          setPaystackBusy(false);
          setPaymentResult(`Payment successful! Reference: ${transaction.reference}`);
          // Immediately refresh all billing data so access is restored
          queryClient.invalidateQueries({ queryKey: BILLING_KEYS.all });
        },
        onCancel: () => {
          setPaystackBusy(false);
          setPaymentResult('Payment cancelled');
        },
        onError: (message) => {
          setPaystackBusy(false);
          setPaymentResult(`Payment failed: ${message}`);
        },
      });
    } catch {
      setPaystackBusy(false);
      setPaymentResult('Failed to start payment. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'paid':
      case 'success':
        return 'success';
      case 'trial':
        return 'info';
      case 'suspended':
      case 'overdue':
      case 'failed':
        return 'error';
      case 'pending':
      case 'processing':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <PageHeader
        title="Account"
        subtitle="Manage your account information and billing"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Account' }]}
        icon={<AccountCircleIcon sx={{ fontSize: 26 }} />}
        color="#43A047"
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="User Information" icon={<AccountCircleIcon />} iconPosition="start" />
        <Tab label="Billing & Subscription" icon={<PaymentIcon />} iconPosition="start" />
      </Tabs>

      {/* User Information Tab */}
      {tab === 0 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                {user?.corporate?.logo ? (
                  <Avatar
                    src={user.corporate.logo}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      border: '4px solid',
                      borderColor: 'primary.main',
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      fontSize: '3rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #43A047, #1B5E20)',
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                  </Avatar>
                )}
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role?.name ?? 'User'}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountCircleIcon color="primary" />
                  Personal Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.username ?? 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.email ?? 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {(user as any)?.phone_number ?? 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.role?.name ?? 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2.5 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="primary" />
                  Organization Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Organization Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.corporate?.name ?? 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Organization ID
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {user?.corporate?.id ?? 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {(user?.corporate as any)?.phone ?? '—'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {(user?.corporate as any)?.email ?? '—'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={(user?.corporate as any)?.is_active ? 'Active' : 'Inactive'}
                        color={(user?.corporate as any)?.is_active ? 'success' : 'default'}
                        size="small"
                      />
                      {(user?.corporate as any)?.is_approved && (
                        <Chip label="Approved" color="success" size="small" variant="outlined" />
                      )}
                      {(user?.corporate as any)?.is_verified && (
                        <Chip label="Verified" color="info" size="small" variant="outlined" />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Billing & Subscription Tab */}
      {tab === 1 && (
        <Grid container spacing={2.5}>
          {/* Expiry banner when redirected here after subscription expired */}
          {expiredParam && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error" icon={<WarningAmberIcon />} sx={{ fontWeight: 600 }}>
                Your subscription has expired. Renew below to restore full access for all users in your organisation.
              </Alert>
            </Grid>
          )}
          {/* Access Status & Trial Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCardIcon color="primary" />
                  Access Status
                </Typography>
                <Divider sx={{ my: 2 }} />
                {accessLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : access ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <Chip
                        label={access.has_access ? 'Active' : 'No Access'}
                        color={access.has_access ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    {access.access_type && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Type:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {access.access_type.toUpperCase()}
                        </Typography>
                      </Box>
                    )}
                    {access.trial && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity={access.trial.days_remaining > 5 ? 'info' : 'warning'}>
                          <Typography variant="body2" fontWeight={600}>
                            Trial: {access.trial.days_remaining} days remaining
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            Expires: {new Date(access.trial.end_date).toLocaleDateString()}
                          </Typography>
                          {(access.trial as any).phone_number && (
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                              Phone: {(access.trial as any).phone_number}
                            </Typography>
                          )}
                        </Alert>
                      </Box>
                    )}
                    {!access.has_access && access.message && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {access.message}
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <Alert severity="warning">Unable to fetch access status</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Current Subscription */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaymentIcon color="primary" />
                  Current Subscription
                </Typography>
                <Divider sx={{ my: 2 }} />
                {subscriptionLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : subscription ? (
                  <Box>
                    <Typography variant="h5" fontWeight={600} color="primary.main" gutterBottom>
                      {subscription.plan_name}
                    </Typography>
                    <Chip
                      label={subscription.plan_tier}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Status:
                        </Typography>
                        <Chip
                          label={subscription.status}
                          color={getStatusColor(subscription.status)}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Billing Cycle:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {subscription.billing_cycle}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Amount:
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {formatCurrency(subscription.total_amount ?? 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Expires:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {new Date(subscription.end_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {subscription.next_billing_date && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Next Billing:
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {new Date(subscription.next_billing_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="info">No active subscription</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Subscribe / Pay */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaymentIcon color="primary" />
                  Subscribe or Make Payment
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2} sx={{ maxWidth: 600 }}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      select
                      fullWidth
                      label="Select Plan"
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      disabled={plansLoading}
                    >
                      {plansLoading ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} />
                        </MenuItem>
                      ) : (
                        (plans as any[]).map((p: any) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name} — {formatCurrency(p.price_monthly ?? 0)}/month
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      helperText="Email for payment receipt"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      onClick={handlePay}
                      disabled={!selectedPlanId || !email || paystackBusy}
                      startIcon={paystackBusy ? <CircularProgress size={20} /> : <PaymentIcon />}
                    >
                      {paystackBusy ? 'Processing...' : 'Pay with Paystack'}
                    </Button>
                  </Grid>
                  {paymentResult && (
                    <Grid size={{ xs: 12 }}>
                      <Alert
                        severity={paymentResult.includes('failed') || paymentResult.includes('Please') ? 'error' : 'success'}
                        onClose={() => setPaymentResult(null)}
                      >
                        {paymentResult}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Invoices */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon color="primary" />
                  Invoices
                </Typography>
                <Divider sx={{ my: 2 }} />
                {invoicesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (invoices as any[]).length === 0 ? (
                  <Alert severity="info">No invoices found</Alert>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Invoice #</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Paid At</TableCell>
                          <TableCell>Period</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(invoices as any[]).map((inv: any) => (
                          <TableRow key={inv.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                                {inv.invoice_number}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(Number(inv.total_amount))}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={inv.status}
                                color={getStatusColor(inv.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(inv.due_date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(inv.billing_period_start).toLocaleDateString()} -{' '}
                                {new Date(inv.billing_period_end).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Payment History */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCardIcon color="primary" />
                  Payment History
                </Typography>
                <Divider sx={{ my: 2 }} />
                {paymentsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (paymentHistory as any[]).length === 0 ? (
                  <Alert severity="info">No payment history found</Alert>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Reference</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Method</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(paymentHistory as any[]).map((payment: any) => (
                          <TableRow key={payment.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
                                {payment.reference}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(Number(payment.amount))}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={payment.method?.toUpperCase() ?? 'N/A'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={payment.status}
                                color={getStatusColor(payment.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
