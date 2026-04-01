'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert, Box, Button, Card, CardContent, CircularProgress,
  TextField, Typography, InputAdornment, Divider,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { usePaystack } from '@/hooks/usePaystack';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

export default function PaymentPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Payment details from URL params
  const email = searchParams.get('email') || '';
  const amount = parseFloat(searchParams.get('amount') || '0');
  const corporateId = searchParams.get('corporate_id') || '';
  const planTier = searchParams.get('plan_tier') || 'starter';
  const paymentType = searchParams.get('type') || 'individual'; // individual or corporate
  const corporateName = searchParams.get('corporate_name') || '';
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Initialize Paystack
  const paystack = usePaystack({
    publicKey: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: amount,
    currency: 'KES',
    metadata: {
      corporate_id: corporateId,
      plan_tier: planTier,
      payment_type: paymentType,
      corporate_name: corporateName,
    },
    onSuccess: async (response) => {
      console.log('Payment successful:', response);
      await handlePaymentSuccess(response.reference);
    },
    onClose: () => {
      setError('Payment cancelled. Please try again.');
      setLoading(false);
    },
  });

  const handlePaymentSuccess = async (reference: string) => {
    setLoading(true);
    try {
      if (paymentType === 'individual') {
        // Verify individual payment with plan_id
        const planId = searchParams.get('plan_id') || '';
        await axios.post(`${API_URL}/api/auth/payment/verify-individual/`, {
          reference,
          corporate_id: corporateId,
          plan_id: planId,
        });
        
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?payment=success');
        }, 2000);
      } else {
        // Verify corporate payment
        const registrationId = searchParams.get('registration_id') || '';
        await axios.post(`${API_URL}/api/orgauth/corporate/register/verify/`, {
          reference,
          registration_id: registrationId,
        });
        
        setSuccess(true);
        setTimeout(() => {
          router.push('/signup/corporate/success');
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      setError('Please fill in all card details');
      return;
    }
    
    if (!PAYSTACK_PUBLIC_KEY) {
      setError('Payment system is not configured. Please contact support.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Initialize Paystack payment
    paystack.initializePayment();
  };

  if (success) {
    return (
      <Box sx={pageWrap}>
        <Card sx={cardSx}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
              background: 'linear-gradient(135deg, #43A047, #2E7D32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: '#fff' }} />
            </Box>

            <Typography variant="h4" fontWeight={700} gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {paymentType === 'individual' 
                ? 'Your account is now active. Redirecting to login...'
                : 'Your registration is complete. Redirecting...'}
            </Typography>
            <CircularProgress size={24} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={pageWrap}>
      <Card sx={cardSx}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 60%, #1ABC9C 100%)',
          px: 4, py: 4,
        }}>
          <Box component="img" src="/quidpathLong.svg" alt="QuidPath"
            sx={{ height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} color="#fff" gutterBottom>
            {paymentType === 'individual' ? 'Complete Your Payment' : 'Verify Your Card'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            {paymentType === 'individual' 
              ? 'Pay to activate your account and start using Quidpath'
              : 'We\'ll verify your card with a KES 1 hold (immediately released)'}
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Payment Summary */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Payment Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Plan</Typography>
              <Typography variant="body2" fontWeight={600}>{planTier.charAt(0).toUpperCase() + planTier.slice(1)}</Typography>
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
                <Typography variant="caption">
                  This is a card verification. No charge will be made today.
                </Typography>
              </Alert>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Card Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCardIcon color="primary" />
              Card Details
            </Typography>

            <TextField
              fullWidth
              required
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 19 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCardIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              required
              label="Cardholder Name"
              placeholder="JOHN DOE"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
              <TextField
                required
                label="Expiry Date"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                inputProps={{ maxLength: 5 }}
              />

              <TextField
                required
                label="CVV"
                placeholder="123"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                inputProps={{ maxLength: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || paystack.isLoading}
              startIcon={loading || paystack.isLoading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
              sx={{ py: 1.5, fontWeight: 700, mb: 2 }}
            >
              {loading || paystack.isLoading ? 'Processing...' : `Pay KES ${amount.toLocaleString()}`}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <LockIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Secured by Paystack • Your card details are encrypted
              </Typography>
            </Box>
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
  maxWidth: 520,
  width: '100%',
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
};
