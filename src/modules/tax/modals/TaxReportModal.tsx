'use client';

import React, { useState } from 'react';
import { Button, TextField, Grid, Typography, Box } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { TaxReport } from '@/services/taxService';
import taxService from '@/services/taxService';
import { formatCurrency } from '@/utils/formatters';

interface TaxReportModalProps {
  open: boolean;
  onClose: () => void;
  report?: TaxReport | null;
  onSuccess: () => void;
}

export default function TaxReportModal({ open, onClose, report, onSuccess }: TaxReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    period_start: '',
    period_end: '',
  });

  const handleChange = (field: string, value: string) => {
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
    if (!formData.period_start) newErrors.period_start = 'Start date is required';
    if (!formData.period_end) newErrors.period_end = 'End date is required';
    if (formData.period_start && formData.period_end && formData.period_start > formData.period_end) {
      newErrors.period_end = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await taxService.generateTaxReport({
        period_start: formData.period_start,
        period_end: formData.period_end,
      });
      onSuccess();
    } catch (error: unknown) {
      console.error('Error generating tax report:', error);
      setErrors({ submit: 'Failed to generate tax report. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (report) {
    return (
      <UniversalModal
        open={open}
        onClose={onClose}
        title="Tax Report"
        subtitle={`Period: ${report.period_start} to ${report.period_end}`}
        maxWidth="sm"
        actions={
          <>
            <Button onClick={onClose}>Close</Button>
            <Button variant="contained" onClick={() => console.log('Download PDF')}>
              Download PDF
            </Button>
          </>
        }
      >
        <Box sx={{ bgcolor: 'grey.50', p: 2.5, borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Total Sales:</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" align="right">{formatCurrency(report.total_sales)}</Typography></Grid>
            
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Total Purchases:</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" align="right">{formatCurrency(report.total_purchases)}</Typography></Grid>
            
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Tax Collected:</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" align="right" color="success.main">{formatCurrency(report.tax_collected)}</Typography></Grid>
            
            <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Tax Paid:</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="body2" align="right" color="error.main">{formatCurrency(report.tax_paid)}</Typography></Grid>
            
            <Grid size={{ xs: 12 }}><Box sx={{ borderTop: 1, borderColor: 'divider', my: 1 }} /></Grid>
            
            <Grid size={{ xs: 6 }}><Typography variant="h6">Net Tax:</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography variant="h6" align="right" color={report.net_tax >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(report.net_tax)}</Typography></Grid>
          </Grid>
        </Box>
      </UniversalModal>
    );
  }

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title="Generate Tax Report"
      subtitle="Create a new tax report for a specific period"
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            Generate Report
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
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
        {errors.submit && (
          <Grid size={{ xs: 12 }}>
            <div style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.submit}</div>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
