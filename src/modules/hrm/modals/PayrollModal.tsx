'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { PayrollRun } from '@/services/hrmService';
import hrmService from '@/services/hrmService';

interface PayrollModalProps {
  open: boolean;
  onClose: () => void;
  payrollRun?: PayrollRun | null;
  onSuccess: () => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PayrollModal({ open, onClose, payrollRun, onSuccess }: PayrollModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (payrollRun) {
      setFormData({
        month: payrollRun.month || '',
        year: payrollRun.year || new Date().getFullYear(),
      });
    } else {
      const currentMonth = MONTHS[new Date().getMonth()];
      setFormData({
        month: currentMonth,
        year: new Date().getFullYear(),
      });
    }
  }, [payrollRun, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await hrmService.createPayrollRun(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating payroll run:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title="Create Payroll Run"
      maxWidth="xs"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            Create Payroll
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth select label="Month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} required>
            {MONTHS.map((month) => (
              <MenuItem key={month} value={month}>{month}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} required />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
