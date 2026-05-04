'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useVerifyPayment } from '@/hooks/useBilling';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifyPayment = useVerifyPayment();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found');
      return;
    }

    // Verify payment
    verifyPayment.mutate(reference, {
      onSuccess: (response) => {
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Payment verified successfully');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setStatus('failed');
          setMessage(response.data.message || 'Payment verification failed');
        }
      },
      onError: (error: any) => {
        setStatus('failed');
        setMessage(error.response?.data?.error || 'Failed to verify payment');
      },
    });
  }, [searchParams]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          {status === 'verifying' && (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Verifying Payment
              </Typography>
              <Typography color="text.secondary">
                Please wait while we confirm your payment...
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleIcon
                sx={{ fontSize: 80, color: 'success.main', mb: 3 }}
              />
              <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main">
                Payment Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {message}
              </Typography>
              <Alert severity="success" sx={{ mt: 3, mb: 2 }}>
                Your subscription has been activated. Redirecting to dashboard...
              </Alert>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push('/dashboard')}
                sx={{ mt: 2 }}
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {status === 'failed' && (
            <>
              <ErrorIcon
                sx={{ fontSize: 80, color: 'error.main', mb: 3 }}
              />
              <Typography variant="h4" gutterBottom fontWeight="bold" color="error.main">
                Payment Failed
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {message}
              </Typography>
              <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
                Your payment could not be verified. Please try again or contact support.
              </Alert>
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push('/billing-setup')}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/contact')}
                >
                  Contact Support
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
