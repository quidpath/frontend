'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert, Box, Button, Card, CardContent, CircularProgress,
  Divider, Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import axios from 'axios';
import { usePaystack } from '@/hooks/usePaystack';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function PaymentPage() {
  return (
    <Suspense fallback={<Box sx={pageWrap}><CircularProgress /></Box>}>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paystack = usePaystack();

  const [step, setStep] = useState<'idle' | 'initializing' | 'verifying' | 'done'>('idle');
  const [error, setError] = useState('');

  const email          = searchParams.get('email') || '';
  const amount         = parseFloat(searchParams.get('amount') || '0');
  const paymentType    = searchParams.get('type') || 'individual';
  const corporateId    = searchParams.get('corporate_id') || '';
  const registrationId = searchParams.get('registration_id') || '';
  const planId         = searchParams.get('plan_id') || '';
  const planTier       = searchParams.get('plan_tier') || 'starter';
  const planName       = searchParams.get('plan_name') || (planTier.charAt(0).toUpperCase() + planTier.slice(1));

  const verifyWithBackend = async (reference: string) => {
    setStep('verifying');
    try {
      if (paymentType === 'individual') {
        await axios.post(`${API_URL}/api/auth/payment/verify-individual/`, {
          reference,
          corporate_id: corporateId,
          plan_id: planId,
        });
      } else {
        await axios.post(`${API_URL}/api/orgauth/corporate/register/verify/`, {
          reference,
          registration_id: registrationId,
        });
      }
      setStep('done');
      setTimeout(() => {
        router.push(paymentType === 'individual' ? '/login?payment=success' : '/signup/corporate/success');
      }, 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'Verification failed. Please contact support.';
      setError(msg);
      setStep('idle');
    }
  };

  const handlePayNow = async () => {
    setError('');
    setStep('initializing');
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/payment/initialize/`, {
        email,
        amount,
        payment_type: paymentType,
        corporate_id: corporateId,
        registration_id: registrationId,
        plan_id: planId,
        plan_tier: planTier,
      });

      if (!data.access_code) {
        setError('Could not initialize payment. Please try again.');
        setStep('idle');
        return;
      }

      paystack.resumeTransaction(data.access_code, {
        onSuccess: (transaction) => verifyWithBackend(transaction.reference),
        onCancel: () => {
          setError('Payment cancelled. You can try again.');
          setStep('idle');
        },
        onError: (message) => {
          setError(message || 'Payment failed. Please try again.');
          setStep('idle');
        },
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'Failed to start payment. Please try again.';
      setError(msg);
      setStep('idle');
    }
  };

  if (step === 'done') {
    return (
      <Box sx={pageWrap}>
        <Card sx={cardSx}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            <Box sx={successCircle}>
              <CheckCircleIcon sx={{ fontSize: 48, color: '#fff' }} />
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>Payment Successful!</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {paymentType === 'individual'
                ? 'Your account is now active. Redirecting to login…'
                : 'Your registration is complete. Redirecting…'}
            </Typography>
            <CircularProgress size={24} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (step === 'verifying') {
    return (
      <Box sx={pageWrap}>
        <Card sx={cardSx}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            <CircularProgress size={56} sx={{ mb: 3 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>Confirming your payment…</Typography>
            <Typography color="text.secondary">Please wait, do not close this page.</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const busy = step === 'initializing';

  return (
    <Box sx={pageWrap}>
      <Card sx={cardSx}>
        <Box sx={headerSx}>
          <Box component="img" src="/quidpathLong.svg" alt="QuidPath"
            sx={{ height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} color="#fff" gutterBottom>
            {paymentType === 'individual' ? 'Complete Your Payment' : 'Verify Your Card'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            {paymentType === 'individual'
              ? 'Pay securely to activate your Quidpath account'
              : 'A KES 1 hold will be placed on your card and immediately released'}
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Payment Summary</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {paymentType === 'individual' ? 'Plan' : 'Organization'}
              </Typography>
              <Typography variant="body2" fontWeight={600}>{planName}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body2">{email}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" fontWeight={600}>Amount</Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                KES {amount.toLocaleString()}
              </Typography>
            </Box>
            {paymentType === 'corporate' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">Card verification only — no charge today.</Typography>
              </Alert>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>
          )}

          <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <CreditCardIcon color="primary" sx={{ mt: 0.3 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Secure card payment</Typography>
              <Typography variant="body2" color="text.secondary">
                Clicking the button below opens a secure Paystack payment window.
                Your card details are collected and processed directly by Paystack —
                we never see or store your card information.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handlePayNow}
            disabled={busy || !paystack.isLoaded}
            startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
            sx={{ py: 1.5, fontWeight: 700, mb: 2 }}
          >
            {!paystack.isLoaded ? 'Loading…' : busy ? 'Opening payment window…' : `Pay KES ${amount.toLocaleString()}`}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.75 }}>
            <LockIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              256-bit SSL encryption · Secured by Paystack
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

const pageWrap = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'background.default',
  p: 2,
  backgroundImage: 'radial-gradient(ellipse at 60% 0%, rgba(67,160,71,0.08) 0%, transparent 60%)',
};

const cardSx = {
  maxWidth: 480,
  width: '100%',
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
};

const headerSx = {
  background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 60%, #1ABC9C 100%)',
  px: 4,
  py: 4,
};

const successCircle = {
  width: 80,
  height: 80,
  borderRadius: '50%',
  mx: 'auto',
  mb: 3,
  background: 'linear-gradient(135deg, #43A047, #2E7D32)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
