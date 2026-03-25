'use client';

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, IconButton, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  loading?: boolean;
  submitLabel?: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md';
}

export default function FormModal({
  open, onClose, title, onSubmit, loading, submitLabel = 'Save', children, maxWidth = 'sm',
}: FormModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>{title}</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>{children}</DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
