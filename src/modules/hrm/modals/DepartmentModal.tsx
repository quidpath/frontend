'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Department } from '@/services/hrmService';
import hrmService from '@/services/hrmService';

interface DepartmentModalProps {
  open: boolean;
  onClose: () => void;
  department?: Department | null;
  onSuccess: () => void;
}

export default function DepartmentModal({ open, onClose, department, onSuccess }: DepartmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    head_id: '',
    description: '',
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        head_id: department.head_id || '',
        description: department.description || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        head_id: '',
        description: '',
      });
    }
  }, [department, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (department) {
        await hrmService.updateDepartment(department.id, formData);
      } else {
        await hrmService.createDepartment(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving department:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={department ? 'Edit Department' : 'New Department'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {department ? 'Update' : 'Create'} Department
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField fullWidth label="Department Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Department Head ID" value={formData.head_id} onChange={(e) => setFormData({ ...formData, head_id: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
