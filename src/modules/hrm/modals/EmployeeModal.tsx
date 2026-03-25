'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Employee } from '@/services/hrmService';
import hrmService from '@/services/hrmService';
import { useDepartments } from '@/hooks/useHRM';

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export default function EmployeeModal({ open, onClose, employee, onSuccess }: EmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const { data: deptData } = useDepartments();
  const departments = (deptData as any)?.results ?? (deptData as any)?.departments ?? [];
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    employee_id: '',
    department_id: '',
    position: '',
    join_date: '',
    salary: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        employee_id: employee.employee_id || '',
        department_id: employee.department_id || '',
        position: employee.position || '',
        join_date: employee.join_date || '',
        salary: String(employee.salary || ''),
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        employee_id: '',
        department_id: '',
        position: '',
        join_date: new Date().toISOString().split('T')[0],
        salary: '',
      });
    }
  }, [employee, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        salary: formData.salary ? Number(formData.salary) : undefined,
      };
      if (employee) {
        await hrmService.updateEmployee(employee.id, payload);
      } else {
        await hrmService.createEmployee(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={employee ? 'Edit Employee' : 'New Employee'}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {employee ? 'Update' : 'Create'} Employee
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Employee ID" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth select label="Department" value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}>
            {departments.length === 0
              ? <MenuItem disabled value="">No departments found</MenuItem>
              : departments.map((d: any) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)
            }
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Join Date" type="date" value={formData.join_date} onChange={(e) => setFormData({ ...formData, join_date: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Salary" type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
