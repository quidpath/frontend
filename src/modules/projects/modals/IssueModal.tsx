'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Issue } from '@/services/projectsService';
import projectsService from '@/services/projectsService';

interface IssueModalProps {
  open: boolean;
  onClose: () => void;
  issue?: Issue | null;
  onSuccess: () => void;
}

const ISSUE_TYPES = ['bug', 'feature', 'improvement', 'task'];
const ISSUE_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const ISSUE_PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function IssueModal({ open, onClose, issue, onSuccess }: IssueModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    type: 'bug' as any,
    status: 'open' as any,
    priority: 'medium' as any,
    assigned_to: '',
    reported_by: '',
  });

  useEffect(() => {
    if (issue) {
      setFormData({
        project_id: String(issue.project_id || ''),
        title: issue.title || '',
        description: issue.description || '',
        type: issue.type || 'bug',
        status: issue.status || 'open',
        priority: issue.priority || 'medium',
        assigned_to: issue.assigned_to || '',
        reported_by: issue.reported_by || '',
      });
    } else {
      setFormData({
        project_id: '',
        title: '',
        description: '',
        type: 'bug',
        status: 'open',
        priority: 'medium',
        assigned_to: '',
        reported_by: '',
      });
    }
  }, [issue, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const projectId = Number(formData.project_id);
      if (issue) {
        await projectsService.updateIssue(issue.project_id, issue.id, { ...formData, project_id: Number(formData.project_id) });
      } else {
        await projectsService.createIssue(projectId, formData as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving issue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={issue ? 'Edit Issue' : 'Report Issue'}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {issue ? 'Update' : 'Create'} Issue
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Project ID" value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Issue Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={4} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select label="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
            {ISSUE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
            {ISSUE_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}>
            {ISSUE_PRIORITIES.map((priority) => (
              <MenuItem key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Assigned To" value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Reported By" value={formData.reported_by} onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
