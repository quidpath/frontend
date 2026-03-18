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
import authService, { profileToStoredUser } from '@/auth/authService';
import { useUserStore } from '@/store/userStore';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authService.login(username, password);
      authService.setTokens(data.access, data.refresh);
      if (data.otp_required) {
        setStep('otp');
        setLoading(false);
        return;
      }
      await fetchProfileAndRedirect();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Login failed. Check username and password.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp(otpCode);
      authService.setTokens(data.access, data.refresh);
      await fetchProfileAndRedirect();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Invalid OTP.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  async function fetchProfileAndRedirect() {
    const { data } = await authService.getProfile();
    setUser(profileToStoredUser(data));
    router.replace('/dashboard');
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box
            component="img"
            src="/quidpathLong.svg"
            alt="QuidPath"
            sx={{
              height: 56,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </Box>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {step === 'login' ? 'Sign in' : 'Verify OTP'}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {step === 'login' ? (
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlined color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleVerifyOtp} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              label="OTP code"
              name="otp"
              autoComplete="one-time-code"
              autoFocus
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Verifying…' : 'Verify'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setStep('login');
                setOtpCode('');
                authService.logout();
              }}
            >
              Back to login
            </Button>
          </Box>
        )}
        {step === 'login' && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--mui-palette-primary-main)', fontWeight: 600 }}>
              Sign up
            </Link>
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
