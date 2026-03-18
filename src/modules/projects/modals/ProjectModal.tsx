'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, InputAdornment } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Project } from '@/services/projectsService';
import projectsService from '@/services/projectsService';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
  onSuccess: () => void;
}

const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];

export default function ProjectModal({ open, onClose, project, onSuccess }: ProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    client: '',
    status: 'planning' as any,
    start_date: '',
    end_date: '',
    budget: '',
    manager: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        code: project.code || '',
        description: project.description || '',
        client: project.client || '',
        status: project.status || 'planning',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        budget: String(project.budget || ''),
        manager: project.manager || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        client: '',
        status: 'planning',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        budget: '',
        manager: '',
      });
    }
  }, [project, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, budget: formData.budget ? Number(formData.budget) : undefined };
      if (project) {
        await projectsService.updateProject(project.id, payload);
      } else {
        await projectsService.createProject(payload as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={project ? 'Edit Project' : 'New Project'}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {project ? 'Update' : 'Create'} Project
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={8}>
          <TextField fullWidth label="Project Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={2} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Client" value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
            {PROJECT_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Start Date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="End Date" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Budget" type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Project Manager" value={formData.manager} onChange={(e) => setFormData({ ...formData, manager: e.target.value })} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
