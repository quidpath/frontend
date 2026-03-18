'use client';

import React from 'react';
import { Box, Card, CardContent, LinearProgress, Skeleton, Typography, alpha } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string | number;
  total?: number;
  unit?: string;
  color?: string;
  description?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  total,
  unit,
  color = '#43A047',
  description,
  loading,
  icon,
}: StatCardProps) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const progress = total ? Math.min((numValue / total) * 100, 100) : undefined;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {loading ? (
          <Box>
            <Skeleton width="70%" height={14} sx={{ mb: 2 }} />
            <Skeleton width="40%" height={40} sx={{ mb: 1.5 }} />
            <Skeleton width="100%" height={6} sx={{ borderRadius: 3, mb: 1 }} />
            <Skeleton width="50%" height={12} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {icon && (
                <Box sx={{ color: color, display: 'flex' }}>{icon}</Box>
              )}
              <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                {label}
              </Typography>
            </Box>

            <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5, color: 'text.primary' }}>
              {typeof numValue === 'number' ? numValue.toLocaleString() : numValue}
              {unit && (
                <Typography component="span" variant="h6" color="text.secondary" fontWeight={500}>
                  {' '}
                  {unit}
                </Typography>
              )}
            </Typography>

            {total && (
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                of {total.toLocaleString()} {unit}
              </Typography>
            )}

            {progress !== undefined && (
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  mt: 1.5,
                  mb: 1,
                  height: 5,
                  borderRadius: 3,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: color,
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${alpha(color, 0.7)}, ${color})`,
                  },
                }}
              />
            )}

            {description && (
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
