'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert, Box, Button, Card, CardContent, CircularProgress,
  Divider, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup,
  TextField, Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useUserStore } from '@/store/userStore';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function BillingSetupPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <BillingSetupContent />
    </Suspense>
  );
}

const TRIAL_FEATURES = [
  'Full access to all accounting modules',
  'Invoicing, expenses & vendor bills',
  'Banking & reconciliation',
  'Financial reports & analytics',
  'Unlimited users during trial',
  'Email & in-app support',
];

function BillingSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserStore((s) => s.user);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'bank'>('card');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState('');

  const corporateId = searchParams.get('corporate_id') || user?.corporate?.id || '';
  const corporateName = user?.corporate?.name || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'mobile_money' && !phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    
    if (!corporateId) {
      setError('Organisation not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (paymentMethod === 'card') {
        const response = await axios.post(`${API_URL}/api/billing/payments/individual/initiate/`, {
          corporate_id: corporateId,
          payment_method: 'card',
        });
        window.location.href = response.data.authorization_url;
      } else if (paymentMethod === 'mobile_money') {
        const response = await axios.post(`${API_URL}/api/billing/payments/individual/initiate/`, {
          corporate_id: corporateId,
          payment_method: 'mobile_money',
          phone_number: phone.trim(),
        });
        setTrialEndDate(response.data?.trial_end_date ?? '');
        setDone(true);
      } else {
        const response = await axios.post(`${API_URL}/api/billing/payments/individual/initiate/`, {
          corporate_id: corporateId,
          payment_method: 'bank',
        });
        setTrialEndDate(response.data?.trial_end_date ?? '');
        setDone(true);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    const status = params.get('status');

    if (reference && status === 'success') {
      setDone(true);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      setTrialEndDate(endDate.toISOString());
    }
  }, []);

  if (done) {
    return (
      <Box sx={pageWrap}>
        <Card sx={cardSx}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            <Box sx={brandBar}>
              <Box component="img" src="/quidpathLong.svg" alt="QuidPath" sx={{ height: 36, objectFit: 'contain' }} />
            </Box>

            <Box sx={{
              width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 2.5,
              background: 'linear-gradient(135deg, #43A047, #1B5E20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Box>

            <Typography variant="h5" fontWeight={700} gutterBottom>
              You are all set!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              Your 30-day free trial has started.
            </Typography>
            {trialEndDate && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Trial ends on{' '}
                <Box component="span" fontWeight={600} color="primary.main">
                  {new Date(trialEndDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Box>
              </Typography>
            )}

            <Alert severity="info" icon={<AccessTimeIcon />} sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
              {paymentMethod === 'card' && (
                <Typography variant="body2">
                  Your card has been verified. You will be charged when your trial ends. No charge today.
                </Typography>
              )}
              {paymentMethod === 'mobile_money' && phone && (
                <Typography variant="body2">
                  You will receive a payment prompt on <strong>{phone}</strong> when your trial ends. No charge today.
                </Typography>
              )}
              {paymentMethod === 'bank' && (
                <Typography variant="body2">
                  You will receive bank transfer instructions when your trial ends. No charge today.
                </Typography>
              )}
            </Alert>

            <Button variant="contained" size="large" fullWidth onClick={() => router.replace('/dashboard')} sx={{ py: 1.5, fontWeight: 700 }}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={pageWrap}>
      <Card sx={cardSx}>
        <Box sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 60%, #1ABC9C 100%)',
          px: 4, py: 3.5, borderRadius: '14px 14px 0 0',
        }}>
          <Box component="img" src="/quidpathLong.svg" alt="QuidPath"
            sx={{ height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} color="#fff" gutterBottom>
            Start your free trial
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            {corporateName ? `Set up billing for ${corporateName} - no charge for 30 days.` : 'Choose your payment method to activate your 30-day free trial.'}
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              What is included in your trial
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {TRIAL_FEATURES.map((f) => (
                <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary">{f}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 1.5, fontWeight: 600 }}>
                Choose payment method
              </FormLabel>
              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Card variant="outlined" sx={{
                    cursor: 'pointer',
                    borderColor: paymentMethod === 'card' ? 'primary.main' : 'divider',
                    borderWidth: paymentMethod === 'card' ? 2 : 1,
                    bgcolor: paymentMethod === 'card' ? 'rgba(67,160,71,0.04)' : 'transparent',
                  }} onClick={() => setPaymentMethod('card')}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <FormControlLabel value="card" control={<Radio />} label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCardIcon sx={{ color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body1" fontWeight={600}>Card Payment</Typography>
                            <Typography variant="caption" color="text.secondary">Visa, Mastercard, Verve - Instant verification</Typography>
                          </Box>
                        </Box>
                      } sx={{ m: 0, width: '100%' }} />
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{
                    cursor: 'pointer',
                    borderColor: paymentMethod === 'mobile_money' ? 'primary.main' : 'divider',
                    borderWidth: paymentMethod === 'mobile_money' ? 2 : 1,
                    bgcolor: paymentMethod === 'mobile_money' ? 'rgba(67,160,71,0.04)' : 'transparent',
                  }} onClick={() => setPaymentMethod('mobile_money')}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <FormControlLabel value="mobile_money" control={<Radio />} label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneAndroidIcon sx={{ color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body1" fontWeight={600}>Mobile Money</Typography>
                            <Typography variant="caption" color="text.secondary">M-Pesa, Airtel Money - Pay via phone</Typography>
                          </Box>
                        </Box>
                      } sx={{ m: 0, width: '100%' }} />
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{
                    cursor: 'pointer',
                    borderColor: paymentMethod === 'bank' ? 'primary.main' : 'divider',
                    borderWidth: paymentMethod === 'bank' ? 2 : 1,
                    bgcolor: paymentMethod === 'bank' ? 'rgba(67,160,71,0.04)' : 'transparent',
                  }} onClick={() => setPaymentMethod('bank')}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <FormControlLabel value="bank" control={<Radio />} label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalanceIcon sx={{ color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body1" fontWeight={600}>Bank Transfer</Typography>
                            <Typography variant="caption" color="text.secondary">Direct bank transfer - Manual verification</Typography>
                          </Box>
                        </Box>
                      } sx={{ m: 0, width: '100%' }} />
                    </CardContent>
                  </Card>
                </Box>
              </RadioGroup>
            </FormControl>

            {paymentMethod === 'mobile_money' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Mobile money number</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  This number will be charged when your trial ends.
                </Typography>
                <TextField fullWidth required autoFocus placeholder="e.g. 0712 345 678" value={phone}
                  onChange={(e) => setPhone(e.target.value)} inputProps={{ inputMode: 'tel' }}
                  InputProps={{ startAdornment: <PhoneAndroidIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} /> }}
                />
              </Box>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Button type="submit" variant="contained" size="large" fullWidth
              disabled={loading || (paymentMethod === 'mobile_money' && !phone.trim())}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ py: 1.5, fontWeight: 700, mb: 2 }}>
              {loading ? 'Processing' : 'Start 30-day free trial'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {[
                { icon: <LockOutlinedIcon sx={{ fontSize: 13 }} />, label: 'No charge today' },
                { icon: <AccessTimeIcon sx={{ fontSize: 13 }} />, label: '30 days free' },
                { icon: <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />, label: 'Cancel anytime' },
              ].map(({ icon, label }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ color: 'primary.main' }}>{icon}</Box>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                </Box>
              ))}
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

const brandBar = {
  display: 'flex',
  justifyContent: 'center',
  mb: 3,
};
