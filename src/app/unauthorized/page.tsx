'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 2,
      }}
    >
      <Typography variant="h4">Access denied</Typography>
      <Typography color="text.secondary">
        You don&apos;t have permission to view this page.
      </Typography>
      <Button component={Link} href="/dashboard" variant="contained">
        Go to Dashboard
      </Button>
    </Box>
  );
}
