'use client';

import React from 'react';
import { Box, Grid, Skeleton } from '@mui/material';

export function MetricsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Skeleton width="60%" height={12} sx={{ mb: 1.5 }} />
            <Skeleton width="40%" height={36} sx={{ mb: 1 }} />
            <Skeleton width="50%" height={12} />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'grey.50' }}>
        <Skeleton width={180} height={14} />
      </Box>
      <Box>
        {Array.from({ length: rows }).map((_, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              gap: 2,
              px: 2,
              py: 1.5,
              borderBottom: i < rows - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} height={14} sx={{ flex: j === 0 ? 2 : 1 }} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <Box
      sx={{
        height,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Skeleton width="40%" height={20} />
      <Skeleton variant="rectangular" height={height - 80} sx={{ borderRadius: 1.5 }} />
      <Skeleton width="60%" height={14} />
    </Box>
  );
}

export default function LoadingSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <MetricsSkeleton />
      <TableSkeleton />
    </Box>
  );
}
