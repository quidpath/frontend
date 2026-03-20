'use client';

import React, { useState } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import bankingService from '@/services/bankingService';
import { useBankAccounts } from '@/hooks/useBanking';

interface ReconciliationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReconciliationModal({ open, onClose, onSuccess }: ReconciliationModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: accountsData } = useBankAccounts();
  
  const [formData, setFormData] = useState({
    bank_account_id: '',
    period_start: '',
    period_end: '',
    opening_balance: 0,
    closing_balance: 0,
  });

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
    if (!formData.bank_account_id) newErrors.bank_account_id = 'Bank account is required';
    if (!formData.period_start) newErrors.period_start = 'Start date is required';
    if (!formData.period_end) newErrors.period_end = 'End date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await bankingService.createReconciliation({
        bank_account_id: formData.bank_account_id,
        period_start: formData.period_start,
        period_end: formData.period_end,
        opening_balance: formData.opening_balance,
        closing_balance: formData.closing_balance,
        status: 'open',
      });
      onSuccess();
    } catch (error: unknown) {
      console.error('Error creating reconciliation:', error);
      setErrors({ submit: 'Failed to create reconciliation. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title="Bank Reconciliation"
      subtitle="Reconcile bank statement with records"
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            Start Reconciliation
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label="Bank Account"
            value={formData.bank_account_id}
            onChange={(e) => handleChange('bank_account_id', e.target.value)}
            error={!!errors.bank_account_id}
            helperText={errors.bank_account_id}
            required
          >
            {accountsData?.results.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.account_name} - {account.bank_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Period Start"
            value={formData.period_start}
            onChange={(e) => handleChange('period_start', e.target.value)}
            error={!!errors.period_start}
            helperText={errors.period_start}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Period End"
            value={formData.period_end}
            onChange={(e) => handleChange('period_end', e.target.value)}
            error={!!errors.period_end}
            helperText={errors.period_end}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Opening Balance"
            value={formData.opening_balance}
            onChange={(e) => handleChange('opening_balance', Number(e.target.value))}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Closing Balance"
            value={formData.closing_balance}
            onChange={(e) => handleChange('closing_balance', Number(e.target.value))}
          />
        </Grid>
        {errors.submit && (
          <Grid size={{ xs: 12 }}>
            <div style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.submit}</div>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
