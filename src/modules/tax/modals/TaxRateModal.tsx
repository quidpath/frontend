'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { TaxRate } from '@/services/taxService';
import taxService from '@/services/taxService';

interface TaxRateModalProps {
  open: boolean;
  onClose: () => void;
  rate?: TaxRate | null;
  onSuccess: () => void;
}

const TAX_TYPES = ['sales', 'purchase', 'vat', 'other'];

export default function TaxRateModal({ open, onClose, rate, onSuccess }: TaxRateModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    type: 'sales' as 'sales' | 'purchase' | 'vat' | 'other',
    is_active: true,
    description: '',
  });

  useEffect(() => {
    if (rate) {
      setFormData({
        name: rate.name || '',
        rate: rate.rate || 0,
        type: rate.type || 'sales',
        is_active: rate.is_active ?? true,
        description: rate.description || '',
      });
    } else {
      setFormData({
        name: '',
        rate: 0,
        type: 'sales',
        is_active: true,
        description: '',
      });
    }
    setErrors({});
  }, [rate, open]);

  const handleChange = (field: string, value: string | number | boolean) => {
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
    if (!formData.name) newErrors.name = 'Tax name is required';
    if (formData.rate < 0 || formData.rate > 100) newErrors.rate = 'Rate must be between 0 and 100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (rate) {
        await taxService.updateTaxRate(rate.id, formData);
      } else {
        await taxService.createTaxRate(formData);
      }
      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving tax rate:', error);
      setErrors({ submit: 'Failed to save tax rate. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={rate ? 'Edit Tax Rate' : 'New Tax Rate'}
      subtitle={rate ? `Editing ${rate.name}` : 'Add a new tax rate'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {rate ? 'Update' : 'Create'} Tax Rate
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tax Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Type"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            {TAX_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Rate (%)"
            value={formData.rate}
            onChange={(e) => handleChange('rate', Number(e.target.value))}
            error={!!errors.rate}
            helperText={errors.rate}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={3}
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
