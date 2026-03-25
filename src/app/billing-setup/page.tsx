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
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { gatewayClient } from '@/services/apiClient';

export default function BillingSetupPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState('');

  const corporateId = user?.corporate?.id;
  const corporateName = user?.corporate?.name;

  const handleSubmit = async () => {
    if (!phone.trim()) {
      setError('Please enter your M-Pesa phone number');
      return;
    }
    if (!corporateId) {
      setError('Organisation not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await gatewayClient.post('/billing/setup/', {
        corporate_id: corporateId,
        phone_number: phone.trim(),
      });
      const data = res.data as any;
      setTrialEndDate(data?.trial_end_date ?? '');
      setSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
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
              You're all set!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Your 14-day free trial has started.
            </Typography>
            {trialEndDate && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Trial ends on {new Date(trialEndDate).toLocaleDateString()}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={() => router.replace('/dashboard')}
            >
              Go to Dashboard
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
              <PhoneIcon />
            </Avatar>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Set up billing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {corporateName
                ? `Enter the M-Pesa number for ${corporateName} to start your 14-day free trial.`
                : 'Enter your M-Pesa number to start your 14-day free trial.'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="M-Pesa Phone Number"
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              helperText="This number will be used for billing when your trial ends"
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={loading || !phone.trim()}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PhoneIcon />}
            >
              {loading ? 'Setting up...' : 'Start Free Trial'}
            </Button>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              No charge during the 14-day trial. You'll receive an M-Pesa prompt when the trial ends.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
