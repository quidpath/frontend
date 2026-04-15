'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  alpha,
  Stack,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
      });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      setError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#fff',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #43A047, #1B5E20)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(67,160,71,0.35)',
                }}
              >
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1 }}>Q</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                QuidPath
              </Typography>
            </Box>
            <Button
              variant="text"
              component={Link}
              href="/"
              startIcon={<ArrowBackIcon />}
              sx={{ color: 'text.secondary' }}
            >
              Back to Home
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha('#43A047', 0.08)} 0%, transparent 100%)`,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                background: 'linear-gradient(135deg, #0F172A 0%, #1B5E20 50%, #0F172A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Get in Touch
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ maxWidth: 600, mx: 'auto' }}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Contact Form */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Send us a Message
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </Typography>

                  {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Thank you for contacting us! We'll get back to you soon. Redirecting to home...
                    </Alert>
                  )}

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />

                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />

                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="+254 XXX XXX XXX"
                      />

                      <TextField
                        fullWidth
                        label="Company Name"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        disabled={loading}
                      />

                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        multiline
                        rows={6}
                        placeholder="Tell us about your needs..."
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                        sx={{
                          background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                          boxShadow: '0 4px 20px rgba(67,160,71,0.35)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #388E3C, #1B5E20)',
                            boxShadow: '0 6px 24px rgba(67,160,71,0.45)',
                          },
                        }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Information */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={3}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Contact Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Reach out to us directly through any of these channels.
                    </Typography>

                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            backgroundColor: alpha('#43A047', 0.1),
                            color: 'primary.dark',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <EmailIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                            Email
                          </Typography>
                          <Typography
                            variant="body2"
                            color="primary.main"
                            component="a"
                            href="mailto:quidpath@gmail.com"
                            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                          >
                            quidpath@gmail.com
                          </Typography>
                        </Box>
                      </Box>

                      <Divider />

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            backgroundColor: alpha('#43A047', 0.1),
                            color: 'primary.dark',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <PhoneIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                            Phone
                          </Typography>
                          <Typography
                            variant="body2"
                            color="primary.main"
                            component="a"
                            href="tel:+254747498079"
                            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                          >
                            +254 747 498 079
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Monday - Friday, 9AM - 6PM EAT
                          </Typography>
                        </Box>
                      </Box>

                      <Divider />

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            backgroundColor: alpha('#43A047', 0.1),
                            color: 'primary.dark',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <LocationOnIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                            Location
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Nairobi, Kenya
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                    color: '#fff',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Need Immediate Help?
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      For urgent inquiries or technical support, reach out to us directly via phone or WhatsApp.
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      component="a"
                      href="https://wa.me/254747498079"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        backgroundColor: '#fff',
                        color: '#2E7D32',
                        fontWeight: 700,
                        '&:hover': {
                          backgroundColor: alpha('#fff', 0.9),
                        },
                      }}
                    >
                      Chat on WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
