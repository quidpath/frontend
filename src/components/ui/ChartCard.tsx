'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Typography,
  alpha,
} from '@mui/material';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ChartCard({
  title,
  subtitle,
  height = 260,
  loading,
  actions,
  children,
  footer,
}: ChartCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
        </Box>

        {loading ? (
          <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2 }} />
        ) : (
          <Box sx={{ height, position: 'relative' }}>{children}</Box>
        )}

        {footer && (
          <>
            <Divider sx={{ mt: 2, mb: 1.5 }} />
            {footer}
          </>
        )}
      </CardContent>
    </Card>
  );
}
