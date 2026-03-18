'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { BankAccount } from '@/services/bankingService';
import bankingService from '@/services/bankingService';

interface BankAccountModalProps {
  open: boolean;
  onClose: () => void;
  account?: BankAccount | null;
  onSuccess: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS'];

export default function BankAccountModal({ open, onClose, account, onSuccess }: BankAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    currency: 'USD',
    is_default: false,
    is_active: true,
  });

  useEffect(() => {
    if (account) {
      setFormData({
        bank_name: account.bank_name || '',
        account_name: account.account_name || '',
        account_number: account.account_number || '',
        currency: account.currency || 'USD',
        is_default: account.is_default || false,
        is_active: account.is_active ?? true,
      });
    } else {
      setFormData({
        bank_name: '',
        account_name: '',
        account_number: '',
        currency: 'USD',
        is_default: false,
        is_active: true,
      });
    }
    setErrors({});
  }, [account, open]);

  const handleChange = (field: string, value: string | boolean) => {
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
    if (!formData.bank_name) newErrors.bank_name = 'Bank name is required';
    if (!formData.account_name) newErrors.account_name = 'Account name is required';
    if (!formData.account_number) newErrors.account_number = 'Account number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (account) {
        await bankingService.updateBankAccount(account.id, formData);
      } else {
        await bankingService.createBankAccount(formData);
      }
      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving bank account:', error);
      setErrors({ submit: 'Failed to save bank account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={account ? 'Edit Bank Account' : 'New Bank Account'}
      subtitle={account ? `Editing ${account.account_name}` : 'Add a new bank account'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {account ? 'Update' : 'Create'} Account
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Bank Name"
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
            error={!!errors.bank_name}
            helperText={errors.bank_name}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Account Name"
            value={formData.account_name}
            onChange={(e) => handleChange('account_name', e.target.value)}
            error={!!errors.account_name}
            helperText={errors.account_name}
            required
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Account Number"
            value={formData.account_number}
            onChange={(e) => handleChange('account_number', e.target.value)}
            error={!!errors.account_number}
            helperText={errors.account_number}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Currency"
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            {CURRENCIES.map((currency) => (
              <MenuItem key={currency} value={currency}>{currency}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_default}
                onChange={(e) => handleChange('is_default', e.target.checked)}
              />
            }
            label="Set as default account"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
              />
            }
            label="Active"
          />
        </Grid>
        {errors.submit && (
          <Grid item xs={12}>
            <div style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.submit}</div>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
