'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { usePlans, useInitializeSubscription } from '@/hooks/useBilling';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

export default function BillingSetupPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { data: plans, isLoading } = usePlans();
  const initializeSubscription = useInitializeSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = async (planCode: string) => {
    try {
      setSelectedPlan(planCode);
      
      // Get callback URL
      const callbackUrl = `${window.location.origin}/payment/callback`;
      
      const response = await initializeSubscription.mutateAsync({
        plan_code: planCode,
        callback_url: callbackUrl,
      });

      if (response.data.success) {
        // Redirect to Paystack payment page
        window.location.href = response.data.data.authorization_url;
      } else {
        enqueueSnackbar('Failed to initialize payment', { variant: 'error' });
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      enqueueSnackbar(
        error.response?.data?.error || 'Failed to initialize subscription',
        { variant: 'error' }
      );
    } finally {
      setSelectedPlan(null);
    }
  };

  const getPlanColor = (code: string) => {
    if (code.includes('starter')) return 'primary';
    if (code.includes('professional')) return 'secondary';
    if (code.includes('enterprise')) return 'success';
    return 'default';
  };

  const formatPrice = (price: number, currency: string, cycle: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
    
    const cycleText = cycle === 'monthly' ? '/month' : cycle === 'quarterly' ? '/quarter' : '/year';
    return `${formatted}${cycleText}`;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Select the perfect plan for your business needs
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        You need an active subscription to access the system. Please select a plan below to continue.
      </Alert>

      <Grid container spacing={3}>
        {plans?.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.code.includes('professional') ? 2 : 1,
                borderColor: plan.code.includes('professional') ? 'primary.main' : 'divider',
              }}
            >
              {plan.code.includes('professional') && (
                <Chip
                  label="MOST POPULAR"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                />
              )}
              
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {plan.name}
                </Typography>
                
                <Box my={3}>
                  <Typography variant="h3" component="div" fontWeight="bold" color={getPlanColor(plan.code)}>
                    {formatPrice(plan.price, plan.currency, plan.billing_cycle)}
                  </Typography>
                </Box>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${plan.max_users === -1 ? 'Unlimited' : plan.max_users} Users`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={`${plan.max_storage_gb}GB Storage`} />
                  </ListItem>

                  {plan.features.accounting && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Accounting Module" />
                    </ListItem>
                  )}

                  {plan.features.inventory && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Inventory Management" />
                    </ListItem>
                  )}

                  {plan.features.crm && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="CRM" />
                    </ListItem>
                  )}

                  {plan.features.hrm && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="HR Management" />
                    </ListItem>
                  )}

                  {plan.features.pos && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Point of Sale" />
                    </ListItem>
                  )}

                  {plan.features.projects && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Project Management" />
                    </ListItem>
                  )}

                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={`${plan.features.reports || 'Basic'} Reports`} />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={`${plan.features.support || 'Email'} Support`} />
                  </ListItem>
                </List>

                <Button
                  variant={plan.code.includes('professional') ? 'contained' : 'outlined'}
                  color={getPlanColor(plan.code) as any}
                  fullWidth
                  size="large"
                  onClick={() => handleSubscribe(plan.code)}
                  disabled={selectedPlan === plan.code}
                  sx={{ mt: 3 }}
                >
                  {selectedPlan === plan.code ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={6}>
        <Typography variant="body2" color="text.secondary">
          All plans include 30-day money-back guarantee
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Need help choosing? Contact our sales team
        </Typography>
      </Box>
    </Container>
  );
}
