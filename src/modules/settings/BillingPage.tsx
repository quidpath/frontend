'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useSubscription, usePaymentHistory, useCancelSubscription } from '@/hooks/useBilling';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

export default function BillingPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { data: subscriptionStatus, isLoading: loadingSubscription } = useSubscription();
  const { data: payments, isLoading: loadingPayments } = usePaymentHistory();
  const cancelSubscription = useCancelSubscription();
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription.mutateAsync(cancelReason);
      enqueueSnackbar('Subscription cancelled successfully', { variant: 'success' });
      setCancelDialogOpen(false);
      setCancelReason('');
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.error || 'Failed to cancel subscription',
        { variant: 'error' }
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loadingSubscription) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Billing & Subscription
      </Typography>

      {/* Current Subscription */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Subscription
          </Typography>

          {subscriptionStatus?.has_subscription && subscriptionStatus.subscription ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Plan
                </Typography>
                <Typography variant="h6">
                  {subscriptionStatus.subscription.plan.name}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={subscriptionStatus.subscription.status.toUpperCase()}
                  color={getStatusColor(subscriptionStatus.subscription.status) as any}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="h6">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: subscriptionStatus.subscription.plan.currency,
                  }).format(subscriptionStatus.subscription.plan.price)}
                  /{subscriptionStatus.subscription.plan.billing_cycle}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Days Remaining
                </Typography>
                <Typography variant="h6">
                  {subscriptionStatus.days_remaining} days
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Start Date
                </Typography>
                <Typography>
                  {new Date(subscriptionStatus.subscription.start_date).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  End Date
                </Typography>
                <Typography>
                  {new Date(subscriptionStatus.subscription.end_date).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Next Billing Date
                </Typography>
                <Typography>
                  {new Date(subscriptionStatus.subscription.next_billing_date).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Auto Renew
                </Typography>
                <Typography>
                  {subscriptionStatus.subscription.auto_renew ? 'Enabled' : 'Disabled'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => router.push('/billing-setup')}
                  >
                    Change Plan
                  </Button>
                  {subscriptionStatus.subscription.status === 'active' && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                You don't have an active subscription
              </Alert>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push('/billing-setup')}
              >
                Subscribe Now
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment History
          </Typography>

          {loadingPayments ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : payments && payments.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{payment.reference}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: payment.currency,
                        }).format(payment.amount)}
                      </TableCell>
                      <TableCell>{payment.payment_method}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status.toUpperCase()}
                          color={getPaymentStatusColor(payment.status) as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">No payment history available</Typography>
          )}
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to cancel your subscription? You will lose access to all features.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Help us improve by telling us why you're cancelling..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Subscription
          </Button>
          <Button
            onClick={handleCancelSubscription}
            color="error"
            variant="contained"
            disabled={cancelSubscription.isPending}
          >
            {cancelSubscription.isPending ? <CircularProgress size={24} /> : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
