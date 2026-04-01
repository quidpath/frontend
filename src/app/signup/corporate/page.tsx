'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Divider, Step, StepLabel, Stepper, TextField, Typography,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import { usePaystack } from '@/hooks/usePaystack';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

const steps = ['Organization Details', 'Payment Verification', 'Confirmation'];

const TRIAL_FEATURES = [
  'Full access to all modules',
  'Invoicing & expense tracking',
  'Banking & reconciliation',
  'Financial reports & analytics',
  'Unlimited users during trial',
  'Email & in-app support',
];

export default function SignUpCorporatePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Kenya',
    state: '',
    zip_code: '',
    industry: '',
    company_size: '',
    description: '',
    website: '',
  });

  // Payment state
  const [registrationId, setRegistrationId] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [authorizationUrl, setAuthorizationUrl] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'address', 'city', 'country'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);

    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (basic)
    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const initiatePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // First, initiate registration to get registration ID
      const response = await axios.post(`${API_URL}/api/orgauth/corporate/register/initiate/`, formData);
      const data = response.data;

      if (!data.success) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Redirect to custom payment page for card verification
      const queryParams = new URLSearchParams({
        email: formData.email,
        amount: '1', // KES 1 for card verification
        corporate_name: formData.name,
        registration_id: data.registration_id,
        type: 'corporate',
      });
      
      router.push(`/payment?${queryParams.toString()}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to initiate registration. Please try again.');
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    setLoading(true);
    setActiveStep(1);

    try {
      const response = await axios.post(`${API_URL}/corporate/payment/verify`, {
        registration_id: registrationId,
        reference: reference,
      });

      // Success!
      setActiveStep(2);
      setLoading(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Payment verification failed');
      setLoading(false);
      setActiveStep(0);
    }
  };

  // Check URL for payment callback
  useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get('reference');
      const regId = params.get('reg_id');

      if (reference && regId) {
        setRegistrationId(regId);
        setPaymentReference(reference);
        verifyPayment(reference);
      }
    }
  });

  // Success screen
  if (activeStep === 2) {
    return (
      <Box sx={pageWrap}>
        <Card sx={cardSx}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            <Box sx={brandBar}>
              <Box component="img" src="/quidpathLong.svg" alt="QuidPath" sx={{ height: 36, objectFit: 'contain' }} />
            </Box>

            <Box sx={{
              width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
              background: 'linear-gradient(135deg, #43A047, #2E7D32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: '#fff' }} />
            </Box>

            <Typography variant="h4" fontWeight={700} gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Your application has been submitted and is being reviewed by our team.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              You will receive an email with your login credentials once approved.
            </Typography>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                What happens next?
              </Typography>
              <Typography variant="body2">
                1. Our team reviews your application (usually within 24 hours)<br />
                2. You receive approval email with admin credentials<br />
                3. Log in and start your 30-day free trial
              </Typography>
            </Alert>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => router.push('/login')}
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Verifying payment
  if (activeStep === 1) {
    return (
      <Box sx={pageWrap}>
        <Card sx={cardSx}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Verifying Payment...
            </Typography>
            <Typography color="text.secondary">
              Please wait while we confirm your payment
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Registration form
  return (
    <Box sx={pageWrap}>
      <Card sx={cardSx}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 60%, #1ABC9C 100%)',
          px: 4, py: 4, borderRadius: '14px 14px 0 0',
        }}>
          <Box component="img" src="/quidpathLong.svg" alt="QuidPath"
            sx={{ height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} color="#fff" gutterBottom>
            Register Your Organization
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Complete registration and verify your payment to get started
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Trial Features */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              What's included in your 30-day trial:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
              {TRIAL_FEATURES.map((feature) => (
                <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">{feature}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={(e) => { e.preventDefault(); initiatePayment(); }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Organization Information
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Organization Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />

                <TextField
                  required
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+254712345678"
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Box>

              <TextField
                required
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />

                <TextField
                  fullWidth
                  label="State/Region"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                />

                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="Industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="e.g., Technology, Retail"
                />

                <TextField
                  fullWidth
                  label="Company Size"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleInputChange}
                  placeholder="e.g., 1-10, 11-50"
                />
              </Box>

              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us about your organization"
              />
            </Box>

            <Box sx={{ mt: 4, p: 2, bgcolor: 'info.lighter', borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                <PaymentIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                Payment Verification
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You'll be redirected to Paystack to verify your payment method. A KES 1 hold will be placed on your card and immediately released. No charge today.
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
              sx={{ mt: 3, py: 1.5, fontWeight: 700 }}
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Already have an account?{' '}
              <Box component="a" href="/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Box>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

// Styles
const pageWrap = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'background.default',
  p: 2,
  backgroundImage: 'radial-gradient(ellipse at 60% 0%, rgba(67,160,71,0.08) 0%, transparent 60%)',
};

const cardSx = {
  maxWidth: 800,
  width: '100%',
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
};

const brandBar = {
  display: 'flex',
  justifyContent: 'center',
  mb: 3,
};
