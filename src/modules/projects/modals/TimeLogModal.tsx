'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { TimeLog } from '@/services/projectsService';
import projectsService from '@/services/projectsService';

interface TimeLogModalProps {
  open: boolean;
  onClose: () => void;
  timeLog?: TimeLog | null;
  onSuccess: () => void;
}

export default function TimeLogModal({ open, onClose, timeLog, onSuccess }: TimeLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    task_id: '',
    employee_id: '',
    hours: '',
    date: '',
    description: '',
    billable: true,
  });

  useEffect(() => {
    if (timeLog) {
      setFormData({
        task_id: String(timeLog.task_id || ''),
        employee_id: timeLog.employee_id || '',
        hours: String(timeLog.hours || ''),
        date: timeLog.date || '',
        description: timeLog.description || '',
        billable: timeLog.billable ?? true,
      });
    } else {
      setFormData({
        task_id: '',
        employee_id: '',
        hours: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        billable: true,
      });
    }
  }, [timeLog, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, task_id: Number(formData.task_id), hours: Number(formData.hours) };
      if (timeLog) {
        await projectsService.updateTimeLog(timeLog.id, payload);
      } else {
        await projectsService.createTimeLog(payload as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving time log:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={timeLog ? 'Edit Time Log' : 'Log Time'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {timeLog ? 'Update' : 'Log'} Time
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Task ID" value={formData.task_id} onChange={(e) => setFormData({ ...formData, task_id: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Employee ID" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Hours" type="number" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} inputProps={{ min: 0, step: 0.5 }} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} InputLabelProps={{ shrink: true }} required />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={2} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={<Checkbox checked={formData.billable} onChange={(e) => setFormData({ ...formData, billable: e.target.checked })} />}
            label="Billable"
          />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
