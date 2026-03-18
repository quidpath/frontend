'use client';

import React from 'react';
import { Box } from '@mui/material';
import DashboardLayout from './DashboardLayout';

interface ModuleLayoutProps {
  children: React.ReactNode;
}

export default function ModuleLayout({ children }: ModuleLayoutProps) {
  return (
    <DashboardLayout>
      <Box
        sx={{
          animation: 'fadeIn 0.2s ease',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(6px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {children}
      </Box>
    </DashboardLayout>
  );
}
