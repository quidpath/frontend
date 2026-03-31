'use client';

import { useState } from 'react';
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
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import authService from '@/auth/authService';

const PLAN_OPTIONS = [
  { value: 'starter', label: 'Starter', price: 2500, features: ['Up to 5 users', 'Basic features', 'Email support'] },
  { value: 'professional', label: 'Professional', price: 5000, features: ['Up to 20 users', 'Advanced features', 'Priority support'] },
  { value: 'enterprise', label: 'Enterprise', price: 10000, features: ['Unlimited users', 'All features', '24/7 support'] },
];

export default function SignUpIndividualPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [planTier, setPlanTier] = useState('starter');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await authService.registerIndividual({
        username,
        email,
        password,
        plan_tier: planTier,
      });
      
      // Redirect to payment page
      const planPrice = PLAN_OPTIONS.find(p => p.value === planTier)?.price || 2500;
      router.push(`/payment?email=${encodeURIComponent(email)}&amount=${planPrice}&corporate_id=${response.data.corporate_id}&plan_tier=${planTier}&type=individual`);
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { error?: string } } })?.response?.data;
      const msg = res?.error ?? (typeof res === 'string' ? res : 'Registration failed.');
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={pageWrap}>
      <Paper sx={{ maxWidth: 400, width: '100%', p: 3 }}>
        <Typography variant="h5" gutterBottom>Individual Sign Up</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create your account - payment required to activate
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
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
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
