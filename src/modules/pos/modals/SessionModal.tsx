'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { POSSession } from '@/services/posService';
import posService from '@/services/posService';

interface SessionModalProps {
  open: boolean;
  onClose: () => void;
  session?: POSSession | null;
  onSuccess: () => void;
  mode: 'open' | 'close';
}

export default function SessionModal({ open, onClose, session, onSuccess, mode }: SessionModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    terminal_id: '',
    opening_cash: 0,
    closing_cash: 0,
  });

  useEffect(() => {
    if (session && mode === 'close') {
      setFormData({
        terminal_id: session.terminal_id,
        opening_cash: session.opening_cash,
        closing_cash: 0,
      });
    } else {
      setFormData({
        terminal_id: '',
        opening_cash: 0,
        closing_cash: 0,
      });
    }
    setErrors({});
  }, [session, open, mode]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (mode === 'open') {
      if (!formData.terminal_id) newErrors.terminal_id = 'Terminal is required';
      if (formData.opening_cash < 0) newErrors.opening_cash = 'Opening cash must be positive';
    } else {
      if (formData.closing_cash < 0) newErrors.closing_cash = 'Closing cash must be positive';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'open') {
        await posService.openSession(formData.terminal_id, {
          opening_cash: formData.opening_cash,
        });
      } else if (session) {
        await posService.closeSession(session.id, formData.closing_cash);
      }
      onSuccess();
    } catch (error: unknown) {
      console.error('Error managing session:', error);
      setErrors({ submit: `Failed to ${mode} session. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={mode === 'open' ? 'Open Session' : 'Close Session'}
      subtitle={mode === 'open' ? 'Start a new POS session' : `Close session for ${session?.terminal_name}`}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {mode === 'open' ? 'Open' : 'Close'} Session
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        {mode === 'open' ? (
          <>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Terminal"
                value={formData.terminal_id}
                onChange={(e) => handleChange('terminal_id', e.target.value)}
                error={!!errors.terminal_id}
                helperText={errors.terminal_id}
                required
              >
                <MenuItem value="TERMINAL-01">Terminal 01</MenuItem>
                <MenuItem value="TERMINAL-02">Terminal 02</MenuItem>
                <MenuItem value="TERMINAL-03">Terminal 03</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="number"
                label="Opening Cash"
                value={formData.opening_cash}
                onChange={(e) => handleChange('opening_cash', Number(e.target.value))}
                error={!!errors.opening_cash}
                helperText={errors.opening_cash || 'Cash amount in the register at session start'}
                required
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Opening Cash"
                value={formData.opening_cash}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Total Sales"
                value={session?.total_sales || 0}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="number"
                label="Closing Cash"
                value={formData.closing_cash}
                onChange={(e) => handleChange('closing_cash', Number(e.target.value))}
                error={!!errors.closing_cash}
                helperText={errors.closing_cash || 'Actual cash amount in the register'}
                required
              />
            </Grid>
          </>
        )}

        {errors.submit && (
          <Grid size={{ xs: 12 }}>
            <div style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.submit}</div>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
