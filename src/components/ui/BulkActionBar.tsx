'use client';

import React from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Slide,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'text' | 'outlined' | 'contained';
}

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions?: BulkAction[];
}

export default function BulkActionBar({
  selectedCount,
  onClear,
  actions = [],
}: BulkActionBarProps) {
  return (
    <Slide direction="up" in={selectedCount > 0} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300,
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 3,
          minWidth: 400,
          maxWidth: '90vw',
        }}
      >
        <Chip
          label={`${selectedCount} selected`}
          color="primary"
          size="small"
          sx={{ fontWeight: 600 }}
        />

        <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
          {actions.map((action) => (
            <Button
              key={action.id}
              size="small"
              variant={action.variant || 'outlined'}
              color={action.color || 'primary'}
              startIcon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </Box>

        <IconButton size="small" onClick={onClear} sx={{ ml: 'auto' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Slide>
  );
}
