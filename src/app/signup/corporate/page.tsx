'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import authService from '@/auth/authService';

export default function SignUpCorporatePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.createCorporate({
        name,
        email,
        phone: phone || undefined,
        industry: industry || undefined,
        description: description || undefined,
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
          <BusinessIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
          <Typography variant="h6" color="success.main" gutterBottom>Application submitted</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your organisation registration is pending approval. We’ll notify you at {email} once it’s reviewed.
          </Typography>
          <Button component={Link} href="/login" variant="outlined">Back to sign in</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper sx={{ maxWidth: 440, width: '100%', p: 3 }}>
        <Typography variant="h5" gutterBottom>Register your organisation</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Submit your company details. Access is granted after approval.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Organisation name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{ startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} /> }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField margin="normal" fullWidth label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField margin="normal" fullWidth label="Industry" name="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={2}
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit for approval'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Already have an account? <Link href="/login">Sign in</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
