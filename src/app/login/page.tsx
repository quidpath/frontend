'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import authService, { profileToStoredUser } from '@/auth/authService';
import { useUserStore } from '@/store/userStore';
import { gatewayClient } from '@/services/apiClient';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

type Step = 'login' | 'otp' | 'forgot-username' | 'forgot-otp' | 'forgot-reset';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((s) => s.setUser);

  // login / otp
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // forgot password
  const [fpUsername, setFpUsername] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [showFpPassword, setShowFpPassword] = useState(false);
  const [fpForgotPasswordId, setFpForgotPasswordId] = useState('');

  const [step, setStep] = useState<Step>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────
  function extractMsg(err: unknown, fallback: string): string {
    const d = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
    const m = d?.detail ?? d?.error ?? d?.message;
    return typeof m === 'string' ? m : fallback;
  }

  function resetToLogin() {
    setStep('login');
    setError(null);
    setSuccess(null);
    setFpUsername('');
    setFpOtp('');
    setFpNewPassword('');
    setFpConfirmPassword('');
    setFpForgotPasswordId('');
  }

  // ── login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authService.login(username, password);
      authService.setTokens(data.access, data.refresh);
      if (data.otp_required) { setStep('otp'); setLoading(false); return; }
      if (data.payment_required && data.corporate_id) {
        router.replace(`/settings/billing?corporate_id=${data.corporate_id}&setup=1`);
        return;
      }
      await fetchProfileAndRedirect();
    } catch (err) {
      setError(extractMsg(err, 'Login failed. Check username and password.'));
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
      if (data.payment_required && data.corporate_id) {
        router.replace(`/settings/billing?corporate_id=${data.corporate_id}&setup=1`);
        return;
      }
      await fetchProfileAndRedirect();
    } catch (err) {
      setError(extractMsg(err, 'Invalid OTP.'));
    } finally {
      setLoading(false);
    }
  };

  async function fetchProfileAndRedirect() {
    const { data } = await authService.getProfile();
    setUser(profileToStoredUser(data));
    const next = searchParams.get('next');
    router.replace(next && next.startsWith('/') ? next : '/dashboard');
  }

  // ── forgot password — step 1: send OTP ───────────────────────────────────
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await gatewayClient.post('/password-forgot/', { username: fpUsername });
      setSuccess('OTP sent to your registered email address.');
      setStep('forgot-otp');
    } catch (err) {
      setError(extractMsg(err, 'Could not send OTP. Check your username.'));
    } finally {
      setLoading(false);
    }
  };

  // ── forgot password — step 2: verify OTP ─────────────────────────────────
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const { data } = await gatewayClient.post<{ message: { forgot_password_id: string } | string }>(
        '/verify-pass-otp/',
        { otp: fpOtp }
      );
      // backend returns { message: { message: "...", forgot_password_id: "..." } }
      const msg = data.message;
      const fpId = typeof msg === 'object' ? msg.forgot_password_id : '';
      setFpForgotPasswordId(fpId);
      setSuccess('OTP verified. Please set your new password.');
      setStep('forgot-reset');
    } catch (err) {
      setError(extractMsg(err, 'Invalid or expired OTP.'));
    } finally {
      setLoading(false);
    }
  };

  // ── forgot password — step 3: reset password ─────────────────────────────
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (fpNewPassword !== fpConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (fpNewPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await gatewayClient.post('/reset-password/', { new_password: fpNewPassword });
      setSuccess('Password reset successfully. You can now sign in.');
      setTimeout(resetToLogin, 2000);
    } catch (err) {
      setError(extractMsg(err, 'Failed to reset password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  const titles: Record<Step, string> = {
    login: 'Sign in',
    otp: 'Verify OTP',
    'forgot-username': 'Forgot Password',
    'forgot-otp': 'Enter OTP',
    'forgot-reset': 'Set New Password',
  };

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
      <Paper elevation={2} sx={{ maxWidth: 400, width: '100%', p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box component="img" src="/quidpathLong.svg" alt="QuidPath" sx={{ height: 56, width: 'auto', objectFit: 'contain' }} />
        </Box>

        <Typography variant="h5" component="h1" gutterBottom align="center">
          {titles[step]}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* ── LOGIN ── */}
        {step === 'login' && (
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal" required fullWidth label="Username" name="username"
              autoComplete="username" autoFocus value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined color="action" /></InputAdornment> }}
            />
            <TextField
              margin="normal" required fullWidth name="password" label="Password"
              type={showPassword ? 'text' : 'password'} autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
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
            <Box sx={{ textAlign: 'right', mt: 0.5 }}>
              <Link
                component="button" type="button" variant="body2"
                onClick={() => { setError(null); setSuccess(null); setStep('forgot-username'); }}
                sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot password?
              </Link>
            </Box>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 2 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: 'var(--mui-palette-primary-main)', fontWeight: 600 }}>Sign up</Link>
            </Typography>
          </Box>
        )}

        {/* ── LOGIN OTP ── */}
        {step === 'otp' && (
          <Box component="form" onSubmit={handleVerifyOtp} noValidate>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              An OTP has been sent to your registered email. Enter it below.
            </Typography>
            <TextField
              margin="normal" required fullWidth label="OTP code" name="otp"
              autoComplete="one-time-code" autoFocus value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 1 }} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify'}
            </Button>
            <Button fullWidth variant="text" startIcon={<ArrowBackIcon />}
              onClick={() => { setStep('login'); setOtpCode(''); authService.logout(); }}>
              Back to login
            </Button>
          </Box>
        )}

        {/* ── FORGOT — step 1: enter username ── */}
        {step === 'forgot-username' && (
          <Box component="form" onSubmit={handleForgotSendOtp} noValidate>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your username and we&apos;ll send an OTP to your registered email.
            </Typography>
            <TextField
              margin="normal" required fullWidth label="Username" autoFocus
              value={fpUsername} onChange={(e) => setFpUsername(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined color="action" /></InputAdornment> }}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 1 }} disabled={loading || !fpUsername}>
              {loading ? 'Sending…' : 'Send OTP'}
            </Button>
            <Button fullWidth variant="text" startIcon={<ArrowBackIcon />} onClick={resetToLogin}>
              Back to login
            </Button>
          </Box>
        )}

        {/* ── FORGOT — step 2: verify OTP ── */}
        {step === 'forgot-otp' && (
          <Box component="form" onSubmit={handleForgotVerifyOtp} noValidate>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the 6-digit OTP sent to your email.
            </Typography>
            <TextField
              margin="normal" required fullWidth label="OTP code" autoFocus
              inputProps={{ maxLength: 6 }}
              value={fpOtp} onChange={(e) => setFpOtp(e.target.value)}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 1 }} disabled={loading || fpOtp.length < 6}>
              {loading ? 'Verifying…' : 'Verify OTP'}
            </Button>
            <Button fullWidth variant="text" startIcon={<ArrowBackIcon />}
              onClick={() => { setStep('forgot-username'); setError(null); setSuccess(null); setFpOtp(''); }}>
              Resend OTP
            </Button>
          </Box>
        )}

        {/* ── FORGOT — step 3: set new password ── */}
        {step === 'forgot-reset' && (
          <Box component="form" onSubmit={handleForgotReset} noValidate>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose a strong password (at least 8 characters).
            </Typography>
            <TextField
              margin="normal" required fullWidth label="New Password"
              type={showFpPassword ? 'text' : 'password'}
              value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlined color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowFpPassword(!showFpPassword)} edge="end">
                      {showFpPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal" required fullWidth label="Confirm Password"
              type={showFpPassword ? 'text' : 'password'}
              value={fpConfirmPassword} onChange={(e) => setFpConfirmPassword(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined color="action" /></InputAdornment> }}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 1 }}
              disabled={loading || !fpNewPassword || !fpConfirmPassword}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </Button>
            <Button fullWidth variant="text" startIcon={<ArrowBackIcon />} onClick={resetToLogin}>
              Back to login
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
