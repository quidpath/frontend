'use client';

import React from 'react';
import { Box, Card, CardContent, Skeleton } from '@mui/material';

interface CardSkeletonProps {
  count?: number;
  showIcon?: boolean;
}

export default function CardSkeleton({ count = 4, showIcon = true }: CardSkeletonProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
                <Skeleton width="40%" height={32} />
              </Box>
              {showIcon && (
                <Skeleton variant="circular" width={40} height={40} />
              )}
            </Box>
            <Skeleton width="80%" height={16} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
