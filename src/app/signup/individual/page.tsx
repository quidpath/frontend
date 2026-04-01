'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import authService from '@/auth/authService';
import billingService from '@/services/billingService';
import type { BillingPlan } from '@/services/billingService';

export default function SignUpIndividualPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plans, setPlans] = useState<BillingPlan[]>([]);

  // Fetch plans from billing service
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await billingService.getPlans('individual');
        const plansData = response.data?.data?.plans || response.data?.plans || [];
        setPlans(plansData);
        
        // Set default plan to starter
        const starterPlan = plansData.find((p: BillingPlan) => p.tier === 'starter');
        if (starterPlan) {
          setSelectedPlanId(starterPlan.id);
        } else if (plansData.length > 0) {
          setSelectedPlanId(plansData[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setError('Failed to load plans. Please refresh the page.');
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedPlanId) {
      setError('Please select a plan');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.registerIndividual({
        username,
        email,
        password,
        plan_tier: selectedPlan?.tier || 'starter',
        plan_id: selectedPlanId,
      });
      
      // Redirect to payment page with plan_id
      const planPrice = selectedPlan?.price_monthly || 2500;
      router.push(`/payment?email=${encodeURIComponent(email)}&amount=${planPrice}&corporate_id=${response.data.corporate_id}&plan_id=${selectedPlanId}&plan_tier=${selectedPlan?.tier}&type=individual`);
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { error?: string } } })?.response?.data;
      const msg = res?.error ?? (typeof res === 'string' ? res : 'Registration failed.');
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  if (loadingPlans) {
    return (
      <Box sx={pageWrap}>
        <Paper sx={{ maxWidth: 400, width: '100%', p: 3, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading plans...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={pageWrap}>
      <Paper sx={{ maxWidth: 480, width: '100%', p: 3 }}>
        <Typography variant="h5" gutterBottom>Individual Sign Up</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create your account and choose your plan
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleRegister} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined color="action" /></InputAdornment> }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined color="action" /></InputAdornment> }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockOutlined color="action" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label="toggle password">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Choose Your Plan
          </Typography>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Select Plan</InputLabel>
            <Select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              label="Select Plan"
            >
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>{plan.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {plan.included_users} users included
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={700} color="primary.main">
                      KES {plan.price_monthly.toLocaleString()}/mo
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedPlan && (
            <Card variant="outlined" sx={{ mt: 2, bgcolor: 'grey.50' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {selectedPlan.name} Plan
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedPlan.description}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="body2">{selectedPlan.included_users} users included</Typography>
                  </Box>
                  {selectedPlan.max_users && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2">Up to {selectedPlan.max_users} users</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="body2">Additional users: KES {selectedPlan.additional_user_price}/user</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight={600}>Total Amount</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    KES {selectedPlan.price_monthly.toLocaleString()}/month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Payment Required
            </Typography>
            <Typography variant="body2">
              Payment is required to activate your account and access all features.
            </Typography>
          </Alert>

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading || !selectedPlanId}>
            {loading ? 'Creating account…' : 'Continue to Payment'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Already have an account? <Link href="/login">Sign in</Link>
        </Typography>
      </Paper>
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
