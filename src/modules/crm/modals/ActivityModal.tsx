'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Activity } from '@/services/crmService';
import crmService from '@/services/crmService';

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  activity?: Activity | null;
  onSuccess: () => void;
}

export default function ActivityModal({ open, onClose, activity, onSuccess }: ActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'task' as Activity['activity_type'],
    subject: '',
    description: '',
    contact: '',       // FK UUID
    scheduled_at: '',
    status: 'planned' as Activity['status'],
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        activity_type: activity.activity_type || 'task',
        subject: activity.subject || '',
        description: activity.description || '',
        contact: activity.contact || '',
        scheduled_at: activity.scheduled_at ? activity.scheduled_at.split('T')[0] : '',
        status: activity.status || 'planned',
      });
    } else {
      setFormData({
        activity_type: 'task',
        subject: '',
        description: '',
        contact: '',
        scheduled_at: new Date().toISOString().split('T')[0],
        status: 'planned',
      });
    }
  }, [activity, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (activity) {
        await crmService.updateActivity(activity.id, formData);
      } else {
        await crmService.createActivity(formData as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={activity ? 'Edit Activity' : 'New Activity'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {activity ? 'Update' : 'Create'} Activity
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth select label="Type" value={formData.activity_type} onChange={(e) => setFormData({ ...formData, activity_type: e.target.value as Activity['activity_type'] })}>
            <MenuItem value="call">Call</MenuItem>
            <MenuItem value="meeting">Meeting</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="task">Task</MenuItem>
            <MenuItem value="note">Note</MenuItem>
            <MenuItem value="demo">Demo</MenuItem>
            <MenuItem value="follow_up">Follow-up</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Contact ID" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Scheduled Date" type="date" value={formData.scheduled_at} onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
