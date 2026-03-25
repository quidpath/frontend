'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  MenuItem,
  Chip,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { usePlans, useInitiatePayment } from '@/hooks/useBilling';
import { formatCurrency } from '@/utils/formatters';

export default function PaymentRequiredPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [phone, setPhone] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkoutId, setCheckoutId] = useState('');

  const { data: plans = [], isLoading: plansLoading } = usePlans('organization');
  const initiatePayment = useInitiatePayment();

  const corporateName = user?.corporate?.name;

  const handlePay = async () => {
    if (!selectedPlanId) {
      setError('Please select a plan');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your M-Pesa phone number');
      return;
    }

    setError('');

    try {
      const res = await initiatePayment.mutateAsync({
        plan_id: selectedPlanId,
        phone_number: phone.trim(),
        subscription_type: 'organization',
        corporate_name: corporateName,
      });
      const d = (res.data as any)?.data;
      setCheckoutId(d?.checkout_request_id ?? '');
      setSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data?.error || 'Payment failed. Please try again.');
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 480, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', py: 5, px: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Payment initiated
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Check your phone for the M-Pesa STK push prompt and enter your PIN to complete payment.
            </Typography>
            {checkoutId && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3, fontFamily: 'monospace' }}>
                Checkout ID: {checkoutId}
              </Typography>
            )}
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              Once payment is confirmed, your account will be activated automatically. This may take a few minutes.
            </Alert>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={() => router.replace('/dashboard')}
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ py: 4, px: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #43A047, #1B5E20)',
              }}
            >
              <PaymentIcon />
            </Avatar>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Payment required
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {corporateName
                ? `Choose a plan for ${corporateName} to start using the system.`
                : 'Choose a plan to start using the system.'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Select Plan"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              fullWidth
              disabled={plansLoading}
            >
              {plansLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                (plans as any[]).map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 1 }}>
                      <span>{p.name}</span>
                      <Chip
                        label={`${formatCurrency(p.price_monthly ?? 0)}/mo`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label="M-Pesa Phone Number"
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              helperText="Enter your M-Pesa registered phone number"
              onKeyDown={(e) => e.key === 'Enter' && handlePay()}
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handlePay}
              disabled={initiatePayment.isPending || !selectedPlanId || !phone.trim()}
              startIcon={initiatePayment.isPending ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
            >
              {initiatePayment.isPending ? 'Processing...' : 'Pay with M-Pesa'}
            </Button>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              You'll receive an M-Pesa prompt on your phone. Enter your PIN to complete payment.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
