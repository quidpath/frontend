'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useSubscription } from '@/hooks/useBilling';

export default function PaymentRequiredPage() {
  const router = useRouter();
  const { data: subscriptionStatus } = useSubscription();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <LockIcon sx={{ fontSize: 100, color: 'warning.main', mb: 3 }} />
          
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Subscription Required
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            Your subscription has expired or is inactive
          </Typography>

          {subscriptionStatus && !subscriptionStatus.is_active && (
            <Alert severity="warning" sx={{ mt: 3, mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" gutterBottom>
                <strong>Status:</strong> {subscriptionStatus.message}
              </Typography>
              {subscriptionStatus.subscription && (
                <>
                  <Typography variant="body2" gutterBottom>
                    <strong>Plan:</strong> {subscriptionStatus.subscription.plan.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Expired:</strong> {new Date(subscriptionStatus.subscription.end_date).toLocaleDateString()}
                  </Typography>
                </>
              )}
            </Alert>
          )}

          <Typography variant="body1" paragraph>
            To continue using QuidPath ERP, please renew your subscription or choose a new plan.
          </Typography>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => router.push('/billing-setup')}
            >
              View Plans & Subscribe
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/contact')}
            >
              Contact Support
            </Button>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Need help? Our support team is here to assist you.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@quidpath.com | Phone: +254 700 000 000
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
