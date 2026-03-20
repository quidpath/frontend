'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { BankTransaction } from '@/services/bankingService';
import bankingService from '@/services/bankingService';
import { useBankAccounts } from '@/hooks/useBanking';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: BankTransaction | null;
  onSuccess: () => void;
}

const TRANSACTION_TYPES = ['deposit', 'withdrawal', 'transfer', 'charge'];
const TRANSACTION_STATUSES = ['pending', 'confirmed', 'reversed'];

export default function TransactionModal({ open, onClose, transaction, onSuccess }: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: accountsData } = useBankAccounts();
  
  const [formData, setFormData] = useState({
    bank_account_id: '',
    transaction_type: 'deposit' as 'deposit' | 'withdrawal' | 'transfer' | 'charge',
    amount: 0,
    reference: '',
    narration: '',
    transaction_date: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'confirmed' | 'reversed',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        bank_account_id: transaction.bank_account_id || '',
        transaction_type: transaction.transaction_type || 'deposit',
        amount: transaction.amount || 0,
        reference: transaction.reference || '',
        narration: transaction.narration || '',
        transaction_date: transaction.transaction_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: transaction.status || 'pending',
      });
    } else {
      setFormData({
        bank_account_id: '',
        transaction_type: 'deposit',
        amount: 0,
        reference: '',
        narration: '',
        transaction_date: new Date().toISOString().split('T')[0],
        status: 'pending',
      });
    }
    setErrors({});
  }, [transaction, open]);

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
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.transaction_date) newErrors.transaction_date = 'Transaction date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (transaction) {
        await bankingService.updateTransaction(transaction.id, formData);
      } else {
        await bankingService.createTransaction(formData);
      }
      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving transaction:', error);
      setErrors({ submit: 'Failed to save transaction. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'New Transaction'}
      subtitle={transaction ? 'Update transaction details' : 'Record a new bank transaction'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {transaction ? 'Update' : 'Create'} Transaction
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
            select
            label="Transaction Type"
            value={formData.transaction_type}
            onChange={(e) => handleChange('transaction_type', e.target.value)}
          >
            {TRANSACTION_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
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
            label="Transaction Date"
            value={formData.transaction_date}
            onChange={(e) => handleChange('transaction_date', e.target.value)}
            error={!!errors.transaction_date}
            helperText={errors.transaction_date}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {TRANSACTION_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>
            ))}
          </TextField>
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
            label="Narration"
            value={formData.narration}
            onChange={(e) => handleChange('narration', e.target.value)}
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
