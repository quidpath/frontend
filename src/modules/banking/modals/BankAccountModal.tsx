'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, TextField, Grid, MenuItem, FormControlLabel, Checkbox, 
  Typography, Box, Divider, Alert 
} from '@mui/material';
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

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account', description: 'Traditional bank account' },
  { value: 'sacco', label: 'SACCO Account', description: 'Savings and Credit Cooperative' },
  { value: 'mobile_money', label: 'Mobile Money', description: 'M-Pesa, Airtel Money, etc.' },
  { value: 'till', label: 'Till Number', description: 'Business till or paybill' },
  { value: 'cash', label: 'Cash Account', description: 'Physical cash management' },
  { value: 'investment', label: 'Investment Account', description: 'Investment or savings account' },
  { value: 'other', label: 'Other', description: 'Other account type' },
];

export default function BankAccountModal({ open, onClose, account, onSuccess }: BankAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<{
    account_type: 'bank' | 'sacco' | 'mobile_money' | 'till' | 'cash' | 'investment' | 'other';
    bank_name: string;
    account_name: string;
    account_number: string;
    currency: string;
    provider_name: string;
    branch_code: string;
    swift_code: string;
    opening_balance: number;
    opening_balance_date: string;
    is_default: boolean;
    is_active: boolean;
  }>({
    account_type: 'bank',
    bank_name: '',
    account_name: '',
    account_number: '',
    currency: 'USD',
    provider_name: '',
    branch_code: '',
    swift_code: '',
    opening_balance: 0,
    opening_balance_date: new Date().toISOString().split('T')[0],
    is_default: false,
    is_active: true,
  });

  useEffect(() => {
    if (account) {
      setFormData({
        account_type: account.account_type || 'bank',
        bank_name: account.bank_name || '',
        account_name: account.account_name || '',
        account_number: account.account_number || '',
        currency: account.currency || 'USD',
        provider_name: account.provider_name || '',
        branch_code: account.branch_code || '',
        swift_code: account.swift_code || '',
        opening_balance: account.opening_balance || 0,
        opening_balance_date: account.opening_balance_date || new Date().toISOString().split('T')[0],
        is_default: account.is_default || false,
        is_active: account.is_active ?? true,
      });
    } else {
      setFormData({
        account_type: 'bank',
        bank_name: '',
        account_name: '',
        account_number: '',
        currency: 'USD',
        provider_name: '',
        branch_code: '',
        swift_code: '',
        opening_balance: 0,
        opening_balance_date: new Date().toISOString().split('T')[0],
        is_default: false,
        is_active: true,
      });
    }
    setErrors({});
  }, [account, open]);

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getFieldLabel = (field: string) => {
    const accountType = formData.account_type;
    switch (field) {
      case 'bank_name':
        if (accountType === 'sacco') return 'SACCO Name';
        if (accountType === 'mobile_money') return 'Provider Name';
        if (accountType === 'till') return 'Service Provider';
        if (accountType === 'cash') return 'Cash Location/Name';
        if (accountType === 'investment') return 'Institution Name';
        return 'Bank Name';
      case 'account_number':
        if (accountType === 'mobile_money') return 'Phone Number';
        if (accountType === 'till') return 'Till Number';
        if (accountType === 'cash') return 'Cash ID/Reference';
        return 'Account Number';
      case 'account_name':
        if (accountType === 'cash') return 'Cash Account Name';
        return 'Account Name';
      default:
        return field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getFieldPlaceholder = (field: string) => {
    const accountType = formData.account_type;
    switch (field) {
      case 'bank_name':
        if (accountType === 'sacco') return 'e.g., Stima SACCO';
        if (accountType === 'mobile_money') return 'e.g., Safaricom, Airtel';
        if (accountType === 'till') return 'e.g., Safaricom';
        if (accountType === 'cash') return 'e.g., Main Office Cash';
        return 'e.g., Equity Bank';
      case 'account_number':
        if (accountType === 'mobile_money') return 'e.g., +254712345678';
        if (accountType === 'till') return 'e.g., 123456';
        if (accountType === 'cash') return 'e.g., CASH-001';
        return 'e.g., 1234567890';
      case 'provider_name':
        return 'Additional provider information';
      case 'branch_code':
        if (accountType === 'sacco') return 'Branch or location code';
        return 'Branch code';
      default:
        return '';
    }
  };

  const shouldShowField = (field: string) => {
    const accountType = formData.account_type;
    switch (field) {
      case 'provider_name':
        return ['mobile_money', 'till', 'other'].includes(accountType);
      case 'branch_code':
        return ['bank', 'sacco'].includes(accountType);
      case 'swift_code':
        return accountType === 'bank';
      default:
        return true;
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.account_type) newErrors.account_type = 'Account type is required';
    if (!formData.bank_name) newErrors.bank_name = `${getFieldLabel('bank_name')} is required`;
    if (!formData.account_name) newErrors.account_name = `${getFieldLabel('account_name')} is required`;
    if (!formData.account_number) newErrors.account_number = `${getFieldLabel('account_number')} is required`;
    if (formData.opening_balance < 0) newErrors.opening_balance = 'Opening balance cannot be negative';
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
      console.error('Error saving account:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to save account. Please try again.';
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const selectedAccountType = ACCOUNT_TYPES.find(type => type.value === formData.account_type);

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={account ? 'Edit Account' : 'New Account'}
      subtitle={account ? `Editing ${account.account_name}` : 'Add a new financial account'}
      maxWidth="md"
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
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label="Account Type"
            value={formData.account_type}
            onChange={(e) => handleChange('account_type', e.target.value)}
            error={!!errors.account_type}
            helperText={errors.account_type}
            required
          >
            {ACCOUNT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">{type.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{type.description}</Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {selectedAccountType && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>{selectedAccountType.label}:</strong> {selectedAccountType.description}
              </Typography>
            </Alert>
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label={getFieldLabel('bank_name')}
            placeholder={getFieldPlaceholder('bank_name')}
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
            error={!!errors.bank_name}
            helperText={errors.bank_name}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label={getFieldLabel('account_name')}
            value={formData.account_name}
            onChange={(e) => handleChange('account_name', e.target.value)}
            error={!!errors.account_name}
            helperText={errors.account_name}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            fullWidth
            label={getFieldLabel('account_number')}
            placeholder={getFieldPlaceholder('account_number')}
            value={formData.account_number}
            onChange={(e) => handleChange('account_number', e.target.value)}
            error={!!errors.account_number}
            helperText={errors.account_number}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
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

        {shouldShowField('provider_name') && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Provider Details"
              placeholder={getFieldPlaceholder('provider_name')}
              value={formData.provider_name}
              onChange={(e) => handleChange('provider_name', e.target.value)}
            />
          </Grid>
        )}

        {shouldShowField('branch_code') && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Branch Code"
              placeholder={getFieldPlaceholder('branch_code')}
              value={formData.branch_code}
              onChange={(e) => handleChange('branch_code', e.target.value)}
            />
          </Grid>
        )}

        {shouldShowField('swift_code') && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="SWIFT/BIC Code"
              placeholder="e.g., EQBLKENA"
              value={formData.swift_code}
              onChange={(e) => handleChange('swift_code', e.target.value)}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Opening Balance</Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Opening Balance"
            value={formData.opening_balance}
            onChange={(e) => handleChange('opening_balance', Number(e.target.value))}
            error={!!errors.opening_balance}
            helperText={errors.opening_balance || 'Balance when account was added to system'}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Opening Balance Date"
            value={formData.opening_balance_date}
            onChange={(e) => handleChange('opening_balance_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
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

        <Grid size={{ xs: 12, sm: 6 }}>
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
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{errors.submit}</Alert>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
