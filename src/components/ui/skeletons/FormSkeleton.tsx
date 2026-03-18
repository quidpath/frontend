'use client';

import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

interface FormSkeletonProps {
  fields?: number;
  showActions?: boolean;
}

export default function FormSkeleton({ fields = 6, showActions = true }: FormSkeletonProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Skeleton width="40%" height={32} sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {Array.from({ length: fields }).map((_, i) => (
          <Box key={i}>
            <Skeleton width="30%" height={20} sx={{ mb: 1 }} />
            <Skeleton width="100%" height={56} />
          </Box>
        ))}
      </Box>

      {showActions && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
          <Skeleton width={80} height={36} />
          <Skeleton width={80} height={36} />
        </Box>
      )}
    </Paper>
  );
}
