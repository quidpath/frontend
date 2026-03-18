'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, InputAdornment } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Campaign } from '@/services/crmService';
import crmService from '@/services/crmService';

interface CampaignModalProps {
  open: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  onSuccess: () => void;
}

export default function CampaignModal({ open, onClose, campaign, onSuccess }: CampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'social' | 'event',
    status: 'draft' as 'draft' | 'active' | 'paused' | 'completed',
    start_date: '',
    end_date: '',
    budget: '',
    description: '',
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        type: campaign.type || 'email',
        status: campaign.status || 'draft',
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || '',
        budget: String(campaign.budget || ''),
        description: campaign.description || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'email',
        status: 'draft',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        budget: '',
        description: '',
      });
    }
  }, [campaign, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, budget: Number(formData.budget) };
      if (campaign) {
        await crmService.updateCampaign(campaign.id, payload);
      } else {
        await crmService.createCampaign(payload as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={campaign ? 'Edit Campaign' : 'New Campaign'}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {campaign ? 'Update' : 'Create'} Campaign
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField fullWidth label="Campaign Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select label="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="sms">SMS</MenuItem>
            <MenuItem value="social">Social Media</MenuItem>
            <MenuItem value="event">Event</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Start Date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="End Date" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Budget" type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
