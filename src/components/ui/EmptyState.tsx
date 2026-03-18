'use client';

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  title = 'No data',
  message = 'Nothing to show here yet.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 5,
        px: 3,
        gap: 1.5,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          backgroundColor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
          mb: 0.5,
        }}
      >
        {icon || <InboxIcon sx={{ fontSize: 26 }} />}
      </Box>
      <Typography variant="subtitle2" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
        {message}
      </Typography>
      {action && (
        <Button variant="outlined" size="small" onClick={action.onClick} sx={{ mt: 0.5 }}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
