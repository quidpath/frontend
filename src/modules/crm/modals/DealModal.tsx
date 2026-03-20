'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, InputAdornment } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Deal } from '@/services/crmService';
import crmService from '@/services/crmService';

interface DealModalProps {
  open: boolean;
  onClose: () => void;
  deal?: Deal | null;
  onSuccess: () => void;
}

const DEAL_STAGES = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function DealModal({ open, onClose, deal, onSuccess }: DealModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    contact_id: '',
    stage: 'Qualification',
    value: '',
    probability: '50',
    expected_close: '',
    description: '',
  });

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        contact_id: deal.contact_id || '',
        stage: deal.stage || 'Qualification',
        value: String(deal.value || ''),
        probability: String(deal.probability || 50),
        expected_close: deal.expected_close || '',
        description: deal.description || '',
      });
    } else {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setFormData({
        title: '',
        contact_id: '',
        stage: 'Qualification',
        value: '',
        probability: '50',
        expected_close: nextMonth.toISOString().split('T')[0],
        description: '',
      });
    }
  }, [deal, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        value: Number(formData.value),
        probability: Number(formData.probability),
        status: 'open' as const,
      };
      if (deal) {
        await crmService.updateDeal(deal.id, payload);
      } else {
        await crmService.createDeal(payload as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving deal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={deal ? 'Edit Deal' : 'New Deal'}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {deal ? 'Update' : 'Create'} Deal
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Deal Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Contact ID" value={formData.contact_id} onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth select label="Stage" value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })}>
            {DEAL_STAGES.map((stage) => (
              <MenuItem key={stage} value={stage}>{stage}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Value" type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Probability" type="number" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: e.target.value })} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} inputProps={{ min: 0, max: 100 }} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Expected Close Date" type="date" value={formData.expected_close} onChange={(e) => setFormData({ ...formData, expected_close: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
