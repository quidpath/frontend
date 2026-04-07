'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Grid,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Expense } from '@/services/accountingService';
import accountingService from '@/services/accountingService';

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expense?: Expense | null;
  onSuccess: () => void;
}

const EXPENSE_CATEGORIES = [
  { value: 'OPERATING', label: 'Operating Expenses' },
  { value: 'ADMINISTRATIVE', label: 'Administrative' },
  { value: 'SELLING', label: 'Selling & Marketing' },
  { value: 'FINANCIAL', label: 'Financial' },
  { value: 'OTHER', label: 'Other' },
];

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Check',
];

export default function ExpenseModal({
  open,
  onClose,
  expense,
  onSuccess,
}: ExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    date: '',
    vendor: '',
    vendor_id: '',
    category: '',
    description: '',
    amount: '',
    payment_method: '',
    reference: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date || '',
        vendor: expense.vendor || '',
        vendor_id: expense.vendor_id || '',
        category: expense.category || '',
        description: expense.description || '',
        amount: String(expense.amount || ''),
        payment_method: expense.payment_method || '',
        reference: expense.reference || '',
      });
    } else {
      // Reset form for new expense
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        vendor_id: '',
        category: '',
        description: '',
        amount: '',
        payment_method: '',
        reference: '',
      });
    }
    setErrors({});
  }, [expense, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
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

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.vendor) newErrors.vendor = 'Vendor is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        date: formData.date,
        vendor_id: formData.vendor_id || formData.vendor,
        category: formData.category,
        description: formData.description,
        amount: Number(formData.amount),
        payment_method: formData.payment_method,
        reference: formData.reference,
      };

      if (expense) {
        await accountingService.updateExpense(expense.id, payload);
      } else {
        await accountingService.createExpense(payload);
      }

      onSuccess();
      // Show success notification (implement toast system)
    } catch (error: unknown) {
      console.error('Error saving expense:', error);
      // Show error notification
      setErrors({ submit: 'Failed to save expense. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={expense ? 'Edit Expense' : 'New Expense'}
      subtitle={expense ? `Editing expense from ${expense.vendor}` : 'Record a new business expense'}
      maxWidth="md"
      loading={loading}
      disableBackdropClick={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {expense ? 'Update' : 'Create'} Expense
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            error={!!errors.date}
            helperText={errors.date}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Vendor"
            value={formData.vendor}
            onChange={(e) => handleChange('vendor', e.target.value)}
            error={!!errors.vendor}
            helperText={errors.vendor}
            placeholder="Enter vendor name"
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            select
            label="Category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            error={!!errors.category}
            helperText={errors.category}
            required
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 0.01 }}
            required
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="What was this expense for?"
            multiline
            rows={2}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            select
            label="Payment Method"
            value={formData.payment_method}
            onChange={(e) => handleChange('payment_method', e.target.value)}
          >
            <MenuItem value="">
              <em>Select payment method</em>
            </MenuItem>
            {PAYMENT_METHODS.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Reference Number"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
            placeholder="Receipt or invoice number"
          />
        </Grid>

        {errors.submit && (
          <Grid size={{ xs: 12 }}>
            <div style={{ color: '#d32f2f', fontSize: '0.875rem' }}>
              {errors.submit}
            </div>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
