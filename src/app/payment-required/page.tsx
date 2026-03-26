'use client';

import React, { useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Divider, InputAdornment, Radio, TextField, Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PaymentIcon from '@mui/icons-material/Payment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { usePlans, useInitiatePayment } from '@/hooks/useBilling';
import { formatCurrency } from '@/utils/formatters';

export default function PaymentRequiredPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [checkoutId, setCheckoutId] = useState('');
  const [selectedPlanName, setSelectedPlanName] = useState('');

  const corporateName = user?.corporate?.name ?? '';
  const isSuperuser = user?.is_superuser;

  const { data: orgPlans = [], isLoading: orgLoading } = usePlans('organization');
  const { data: indPlans = [], isLoading: indLoading } = usePlans('individual');
  const plans = (isSuperuser ? indPlans : orgPlans) as any[];
  const plansLoading = isSuperuser ? indLoading : orgLoading;

  const initiatePayment = useInitiatePayment();

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) { setError('Please select a plan'); return; }
    if (!phone.trim()) { setError('Please enter your M-Pesa phone number'); return; }
    setError('');
    try {
      const res = await initiatePayment.mutateAsync({
        plan_id: selectedPlanId,
        phone_number: phone.trim(),
        subscription_type: isSuperuser ? 'individual' : 'organization',
        corporate_name: corporateName,
      });
      const d = (res.data as any)?.data;
      setCheckoutId(d?.checkout_request_id ?? '');
      setDone(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data?.error || 'Payment failed. Please try again.');
    }
  };

  if (done) {
    return (
      <Box sx={pageWrap}>
        <Card sx={cardSx}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            <Box sx={iconCircle}><PhoneAndroidIcon sx={{ fontSize: 36, color: '#fff' }} /></Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>Check your phone</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              An M-Pesa prompt has been sent to <Box component="span" fontWeight={600}>{phone}</Box>.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your M-Pesa PIN to complete payment for <strong>{selectedPlanName}</strong>.
            </Typography>
            {checkoutId && (
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2, fontFamily: 'monospace' }}>
                Ref: {checkoutId}
              </Typography>
            )}
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
              Your account will be activated automatically within a few minutes of payment confirmation.
            </Alert>
            <Button variant="contained" size="large" fullWidth onClick={() => router.replace('/dashboard')} sx={{ py: 1.5, fontWeight: 700 }}>
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={pageWrap}>
      <Card sx={cardSx}>
        <Box sx={headerBand}>
          <Box component="img" src="/quidpathLong.svg" alt="QuidPath"
            sx={{ height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} color="#fff" gutterBottom>
            {corporateName ? `Subscribe ${corporateName}` : 'Choose your plan'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            Select a plan and pay via M-Pesa to activate your account.
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box component="form" onSubmit={handlePay} noValidate>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Select a plan</Typography>

            {plansLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={28} /></Box>
            ) : plans.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 2 }}>No plans available. Please contact support.</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                {plans.map((plan: any) => {
                  const selected = selectedPlanId === plan.id;
                  return (
                    <Box
                      key={plan.id}
                      onClick={() => { setSelectedPlanId(plan.id); setSelectedPlanName(plan.name); }}
                      sx={{
                        border: '1.5px solid', borderColor: selected ? 'primary.main' : 'divider',
                        borderRadius: 2, p: 2, cursor: 'pointer',
                        bgcolor: selected ? 'rgba(67,160,71,0.04)' : 'background.paper',
                        transition: 'all 0.15s ease', display: 'flex', alignItems: 'flex-start', gap: 1.5,
                        '&:hover': { borderColor: 'primary.light', bgcolor: 'rgba(67,160,71,0.03)' },
                      }}
                    >
                      <Radio checked={selected} size="small" sx={{ p: 0, mt: 0.25, color: selected ? 'primary.main' : 'text.disabled' }}
                        onChange={() => { setSelectedPlanId(plan.id); setSelectedPlanName(plan.name); }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography variant="subtitle2" fontWeight={700}>{plan.name}</Typography>
                          {plan.is_featured && <Chip label="Popular" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />}
                        </Box>
                        {plan.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{plan.description}</Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                          <Typography variant="h6" fontWeight={700} color="primary.main">{formatCurrency(plan.price_monthly ?? 0)}</Typography>
                          <Typography variant="caption" color="text.secondary">/month</Typography>
                        </Box>
                      </Box>
                      {selected && <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.25 }} />}
                    </Box>
                  );
                })}
              </Box>
            )}

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>M-Pesa phone number</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Enter the number registered with M-Pesa to receive the payment prompt.
            </Typography>

            <TextField
              fullWidth required placeholder="e.g. 0712 345 678"
              value={phone} onChange={(e) => setPhone(e.target.value)}
              inputProps={{ inputMode: 'tel' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneAndroidIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Button
              type="submit" variant="contained" size="large" fullWidth
              disabled={initiatePayment.isPending || !selectedPlanId || !phone.trim()}
              startIcon={initiatePayment.isPending ? <CircularProgress size={18} color="inherit" /> : <PaymentIcon />}
              sx={{ py: 1.5, fontWeight: 700, mb: 2 }}
            >
              {initiatePayment.isPending ? 'Sending M-Pesa prompt…' : 'Pay with M-Pesa'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {[
                { icon: <LockOutlinedIcon sx={{ fontSize: 13 }} />, label: 'Secure payment' },
                { icon: <AccessTimeIcon sx={{ fontSize: 13 }} />, label: 'Instant activation' },
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
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  bgcolor: 'background.default', p: 2,
  backgroundImage: 'radial-gradient(ellipse at 60% 0%, rgba(67,160,71,0.08) 0%, transparent 60%)',
};
const cardSx = {
  maxWidth: 520, width: '100%', borderRadius: '14px', overflow: 'hidden',
  border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
};
const headerBand = {
  background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 60%, #1ABC9C 100%)',
  px: 4, py: 3.5, borderRadius: '14px 14px 0 0',
};
const iconCircle = {
  width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 2.5,
  background: 'linear-gradient(135deg, #43A047, #1B5E20)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
