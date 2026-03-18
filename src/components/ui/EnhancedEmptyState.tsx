'use client';

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InboxIcon from '@mui/icons-material/Inbox';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export type EmptyStateType = 'no-data' | 'no-results' | 'error';

interface EnhancedEmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EnhancedEmptyState({
  type = 'no-data',
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: EnhancedEmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'no-results':
        return {
          icon: <SearchOffIcon sx={{ fontSize: 64, color: 'text.disabled' }} />,
          title: 'No results found',
          message: 'Try adjusting your search or filters',
        };
      case 'error':
        return {
          icon: <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />,
          title: 'Something went wrong',
          message: 'Unable to load data. Please try again.',
        };
      case 'no-data':
      default:
        return {
          icon: <InboxIcon sx={{ fontSize: 64, color: 'text.disabled' }} />,
          title: 'No records yet',
          message: 'Get started by creating your first record',
        };
    }
  };

  const defaults = getDefaultContent();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      <Box sx={{ mb: 3 }}>
        {icon || defaults.icon}
      </Box>

      {/* Title */}
      <Typography variant="h6" color="text.primary" gutterBottom fontWeight={600}>
        {title || defaults.title}
      </Typography>

      {/* Message */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {message || defaults.message}
      </Typography>

      {/* Action Button */}
      {onAction && actionLabel && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAction}
          size="large"
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
