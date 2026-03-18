'use client';

import React from 'react';
import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showToolbar?: boolean;
}

export default function TableSkeleton({
  rows = 8,
  columns = 5,
  showHeader = true,
  showToolbar = true,
}: TableSkeletonProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {showToolbar && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Skeleton width={200} height={40} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton width={80} height={36} />
            <Skeleton width={80} height={36} />
          </Box>
        </Box>
      )}

      <TableContainer>
        <Table>
          {showHeader && (
            <TableHead>
              <TableRow>
                {Array.from({ length: columns }).map((_, i) => (
                  <TableCell key={i}>
                    <Skeleton width="80%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}

          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton width={colIndex === 0 ? '60%' : '80%'} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
