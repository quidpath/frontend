'use client';

import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import authService from '@/auth/authService';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';

export default function PaymentRequiredPage() {
  const router = useRouter();
  const clearUser = useUserStore((s) => s.clearUser);

  const handleLogout = () => {
    authService.logout();
    clearUser();
    router.replace('/login');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      p: 2,
      backgroundImage: 'radial-gradient(ellipse at 60% 0%, rgba(67,160,71,0.08) 0%, transparent 60%)',
    }}>
      <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 3,
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LockOutlinedIcon sx={{ fontSize: 36, color: '#fff' }} />
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            Access Suspended
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Your organisation's subscription has expired or is inactive.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Please contact your organisation administrator to renew the subscription.
            Access will be restored immediately once payment is confirmed.
          </Typography>

          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={handleLogout}
            sx={{ py: 1.2, fontWeight: 600 }}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
