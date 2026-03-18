'use client';

import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import Link from 'next/link';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

export default function SignUpChoicePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Box
          component="img"
          src="/quidpathLong.svg"
          alt="QuidPath"
          sx={{
            height: 64,
            width: 'auto',
            objectFit: 'contain',
          }}
        />
      </Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Create an account
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Choose how you want to sign up
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 560 }}>
        <Card variant="outlined" sx={{ width: 260, textAlign: 'center' }}>
          <CardContent sx={{ pt: 3, pb: 3 }}>
            <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>Individual</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              For freelancers and sole traders. Get your own workspace.
            </Typography>
            <Button component={Link} href="/signup/individual" variant="contained" fullWidth>
              Sign up as individual
            </Button>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ width: 260, textAlign: 'center' }}>
          <CardContent sx={{ pt: 3, pb: 3 }}>
            <BusinessIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>Corporate</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Register your organisation. Pending approval, you’ll get access.
            </Typography>
            <Button component={Link} href="/signup/corporate" variant="contained" fullWidth>
              Register organisation
            </Button>
          </CardContent>
        </Card>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--mui-palette-primary-main)', fontWeight: 600 }}>
          Sign in
        </Link>
      </Typography>
    </Box>
  );
}
