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

export default function SignUpIndividualPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [planTier, setPlanTier] = useState('starter');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.registerIndividual({
        username,
        email,
        password,
        plan_tier: planTier,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { error?: string } } })?.response?.data;
      const msg = res?.error ?? (typeof res === 'string' ? res : 'Registration failed.');
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Paper sx={{ maxWidth: 400, p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="success.main" gutterBottom>Check your email</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We sent you an OTP. Verify it to activate your account, then sign in.
          </Typography>
          <Button component={Link} href="/login" variant="contained">Go to sign in</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper sx={{ maxWidth: 400, width: '100%', p: 3 }}>
        <Typography variant="h5" gutterBottom>Individual sign up</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create your account and workspace.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
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
          <TextField
            margin="normal"
            fullWidth
            select
            label="Plan"
            value={planTier}
            onChange={(e) => setPlanTier(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </TextField>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Already have an account? <Link href="/login">Sign in</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
