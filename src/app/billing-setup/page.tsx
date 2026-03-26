'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert, Avatar, Box, Button, Card, CardContent, Chip,
  CircularProgress, Divider, InputAdornment, TextField, Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useUserStore } from '@/store/userStore';
import { gatewayClient } from '@/services/apiClient';

export default function BillingSetupPage() {
  return (
    <Suspense>
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

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState('');

  // corporate_id can come from query param (email link) or from the logged-in user
  const corporateId = searchParams.get('corporate_id') || user?.corporate?.id || '';
  const corporateName = user?.corporate?.name || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { setError('Please enter your M-Pesa phone number'); return; }
    if (!corporateId) { setError('Organisation not found. Please log in again.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await gatewayClient.post('/billing/setup/', {
        corporate_id: corporateId,
        phone_number: phone.trim(),
      });
      const d = res.data as any;
      setTrialEndDate(d?.trial_end_date ?? '');
      setDone(true);
    } catch (e: any) {
      setError(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        'Setup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <Box sx={pageWrap}>
        <Card sx={cardSx}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            {/* Brand header */}
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
              You&apos;re all set!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              Your 14-day free trial has started.
            </Typography>
            {trialEndDate && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Trial ends on{' '}
                <Box component="span" fontWeight={600} color="primary.main">
                  {new Date(trialEndDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Box>
              </Typography>
            )}

            <Alert
              severity="info"
              icon={<AccessTimeIcon />}
              sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}
            >
              You&apos;ll receive an M-Pesa prompt on <strong>{phone}</strong> when your trial ends. No charge today.
            </Alert>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => router.replace('/dashboard')}
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ── Setup form ────────────────────────────────────────────────────────────
  return (
    <Box sx={pageWrap}>
      <Card sx={cardSx}>
        {/* Green brand header band */}
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
            {corporateName
              ? `Set up billing for ${corporateName} — no charge for 14 days.`
              : 'Enter your M-Pesa number to activate your 14-day free trial.'}
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Feature list */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              What&apos;s included in your trial
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

          {/* Phone input */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              M-Pesa billing number
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              This number will be charged when your trial ends. You can change it anytime.
            </Typography>

            <TextField
              fullWidth
              required
              autoFocus
              placeholder="e.g. 0712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !phone.trim()}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PhoneAndroidIcon />}
              sx={{ py: 1.5, fontWeight: 700, mb: 2 }}
            >
              {loading ? 'Activating trial…' : 'Start 14-day free trial'}
            </Button>

            {/* Trust signals */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {[
                { icon: <LockOutlinedIcon sx={{ fontSize: 13 }} />, label: 'No charge today' },
                { icon: <AccessTimeIcon sx={{ fontSize: 13 }} />, label: '14 days free' },
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

// ── Shared styles ─────────────────────────────────────────────────────────────
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

const brandBar = {
  display: 'flex',
  justifyContent: 'center',
  mb: 3,
};
