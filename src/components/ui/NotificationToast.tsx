'use client';

import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface NotificationToastProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: AlertColor;
  duration?: number;
}

export default function NotificationToast({
  open,
  onClose,
  message,
  severity = 'success',
  duration = 4000,
}: NotificationToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%', boxShadow: 3 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
