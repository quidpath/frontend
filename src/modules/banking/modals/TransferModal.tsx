'use client';

import React, { useState } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import bankingService from '@/services/bankingService';
import { useBankAccounts } from '@/hooks/useBanking';

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transfer?: import('@/services/bankingService').InternalTransfer | null;
}

export default function TransferModal({ open, onClose, onSuccess, transfer }: TransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: accountsData } = useBankAccounts();
  
  const [formData, setFormData] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: 0,
    reference: '',
    reason: '',
    transfer_date: new Date().toISOString().split('T')[0],
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
    if (!formData.from_account_id) newErrors.from_account_id = 'Source account is required';
    if (!formData.to_account_id) newErrors.to_account_id = 'Destination account is required';
    if (formData.from_account_id === formData.to_account_id) {
      newErrors.to_account_id = 'Source and destination must be different';
    }
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await bankingService.createInternalTransfer({
        from_account_id: formData.from_account_id,
        to_account_id: formData.to_account_id,
        amount: formData.amount,
        reference: formData.reference,
        reason: formData.reason,
        transfer_date: formData.transfer_date,
        status: 'pending',
      });
      onSuccess();
    } catch (error: unknown) {
      console.error('Error creating transfer:', error);
      setErrors({ submit: 'Failed to create transfer. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title="Internal Transfer"
      subtitle="Transfer funds between accounts"
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            Create Transfer
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label="From Account"
            value={formData.from_account_id}
            onChange={(e) => handleChange('from_account_id', e.target.value)}
            error={!!errors.from_account_id}
            helperText={errors.from_account_id}
            required
          >
            {accountsData?.results.filter(acc => acc.is_active).map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.account_name} - {account.bank_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label="To Account"
            value={formData.to_account_id}
            onChange={(e) => handleChange('to_account_id', e.target.value)}
            error={!!errors.to_account_id}
            helperText={errors.to_account_id}
            required
          >
            {accountsData?.results.filter(acc => acc.is_active && acc.id !== formData.from_account_id).map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.account_name} - {account.bank_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Amount"
            value={formData.amount}
            onChange={(e) => handleChange('amount', Number(e.target.value))}
            error={!!errors.amount}
            helperText={errors.amount}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Transfer Date"
            value={formData.transfer_date}
            onChange={(e) => handleChange('transfer_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Reference"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Reason"
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            multiline
            rows={2}
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
