'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { gatewayClient } from '@/services/apiClient';

export default function ActivateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [corporateId, setCorporateId] = useState('');
  const [planTier, setPlanTier] = useState('starter');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setError('Invalid activation link. Missing token or email.');
      setLoading(false);
      return;
    }

    activateAccount(token, email);
  }, [searchParams]);

  const activateAccount = async (token: string, email: string) => {
    try {
      const { data } = await gatewayClient.post<{
        message: string;
        username: string;
        payment_required: boolean;
        corporate_id: string;
        plan_tier: string;
      }>('/activate-account/', { token, email });

      setUsername(data.username);
      setCorporateId(data.corporate_id);
      setPlanTier(data.plan_tier || 'starter');
      setSuccess(true);
      setLoading(false);

      // Redirect to payment page after 3 seconds
      setTimeout(() => {
        router.push(`/settings/billing?corporate_id=${data.corporate_id}&setup=1&plan=${data.plan_tier}`);
      }, 3000);
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { error?: string } } })?.response?.data;
      const msg = res?.error ?? 'Account activation failed. The link may be invalid or expired.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper sx={{ maxWidth: 400, width: '100%', p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Activating your account...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we verify your activation link.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper sx={{ maxWidth: 400, width: '100%', p: 4, textAlign: 'center' }}>
          <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="error">
            Activation Failed
          </Typography>
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            {error}
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" href="/signup/individual">
              Sign up again
            </Button>
            <Button variant="contained" href="/login">
              Go to sign in
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper sx={{ maxWidth: 400, width: '100%', p: 4, textAlign: 'center' }}>
          <CheckCircleOutline sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="success.main">
            Account Activated!
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Welcome, {username}!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your account has been successfully activated. You'll be redirected to complete your subscription payment shortly...
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => router.push(`/settings/billing?corporate_id=${corporateId}&setup=1&plan=${planTier}`)}
          >
            Continue to Payment
          </Button>
        </Paper>
      </Box>
    );
  }

  return null;
}
