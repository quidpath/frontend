'use client';

import { Box, Button, Card, CardContent, Typography, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';

export default function CorporateSuccessPage() {
  const router = useRouter();

  return (
    <Box sx={pageWrap}>
      <Card sx={cardSx}>
        <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
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
  maxWidth: 520,
  width: '100%',
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
};
