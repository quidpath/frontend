'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Task } from '@/services/projectsService';
import projectsService from '@/services/projectsService';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  onSuccess: () => void;
}

const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done'];
const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function TaskModal({ open, onClose, task, onSuccess }: TaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    status: 'todo' as any,
    priority: 'medium' as any,
    assigned_to: '',
    due_date: '',
    estimated_hours: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        project_id: task.project_id || '',
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assigned_to: task.assigned_to || '',
        due_date: task.due_date || '',
        estimated_hours: String(task.estimated_hours || ''),
      });
    } else {
      setFormData({
        project_id: '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigned_to: '',
        due_date: '',
        estimated_hours: '',
      });
    }
  }, [task, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, estimated_hours: formData.estimated_hours ? Number(formData.estimated_hours) : undefined };
      if (task) {
        await projectsService.updateTask(task.id, payload);
      } else {
        await projectsService.createTask(payload as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={task ? 'Edit Task' : 'New Task'}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {task ? 'Update' : 'Create'} Task
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField fullWidth label="Project ID" value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })} required />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Task Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
            {TASK_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}>
            {TASK_PRIORITIES.map((priority) => (
              <MenuItem key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Assigned To" value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Due Date" type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Estimated Hours" type="number" value={formData.estimated_hours} onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
