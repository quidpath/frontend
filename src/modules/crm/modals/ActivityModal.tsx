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
    type: 'task' as 'call' | 'meeting' | 'email' | 'task' | 'note',
    subject: '',
    description: '',
    contact_id: '',
    due_date: '',
    completed: false,
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type || 'task',
        subject: activity.subject || '',
        description: activity.description || '',
        contact_id: activity.contact_id || '',
        due_date: activity.due_date || '',
        completed: activity.completed || false,
      });
    } else {
      setFormData({
        type: 'task',
        subject: '',
        description: '',
        contact_id: '',
        due_date: new Date().toISOString().split('T')[0],
        completed: false,
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
          <TextField fullWidth select label="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
            <MenuItem value="call">Call</MenuItem>
            <MenuItem value="meeting">Meeting</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="task">Task</MenuItem>
            <MenuItem value="note">Note</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Contact ID" value={formData.contact_id} onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Due Date" type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
