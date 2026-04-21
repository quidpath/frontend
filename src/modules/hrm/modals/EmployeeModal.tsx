'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, CircularProgress } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Employee } from '@/services/hrmService';
import hrmService from '@/services/hrmService';
import { useDepartments, usePositions } from '@/hooks/useHRM';

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export default function EmployeeModal({ open, onClose, employee, onSuccess }: EmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const { data: deptData, isLoading: deptLoading } = useDepartments();
  const { data: posData, isLoading: posLoading } = usePositions();
  const departments = (deptData as any)?.results ?? (deptData as any)?.departments ?? [];
  const positions = (posData as any)?.results ?? (posData as any)?.positions ?? [];
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    work_email: '',
    phone: '',
    employee_number: '',
    department_id: '',
    position_id: '',
    date_joined: '',
    salary: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        work_email: employee.work_email || '',
        phone: employee.phone || '',
        employee_number: employee.employee_number || '',
        department_id: employee.department_id || '',
        position_id: employee.position_id || '',
        date_joined: employee.date_joined || '',
        salary: String(employee.salary || ''),
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        work_email: '',
        phone: '',
        employee_number: '',
        department_id: '',
        position_id: '',
        date_joined: new Date().toISOString().split('T')[0],
        salary: '',
      });
    }
  }, [employee, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        work_email: formData.work_email,
        phone: formData.phone || undefined,
        employee_number: formData.employee_number || undefined,
        department_id: formData.department_id || undefined,
        position_id: formData.position_id || undefined,
        date_joined: formData.date_joined || undefined,
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
          <TextField fullWidth label="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Employee Number" value={formData.employee_number} onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Work Email" type="email" value={formData.work_email} onChange={(e) => setFormData({ ...formData, work_email: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            select 
            label="Department" 
            value={formData.department_id} 
            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
            disabled={deptLoading}
            InputProps={{
              endAdornment: deptLoading ? <CircularProgress size={20} /> : null,
            }}
          >
            <MenuItem value="">None</MenuItem>
            {departments.length === 0 && !deptLoading
              ? <MenuItem disabled value="">No departments found</MenuItem>
              : departments.map((d: any) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)
            }
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            select 
            label="Position" 
            value={formData.position_id} 
            onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
            disabled={posLoading}
            InputProps={{
              endAdornment: posLoading ? <CircularProgress size={20} /> : null,
            }}
          >
            <MenuItem value="">None</MenuItem>
            {positions.length === 0 && !posLoading
              ? <MenuItem disabled value="">No positions found</MenuItem>
              : positions.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)
            }
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Join Date" type="date" value={formData.date_joined} onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Salary" type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
