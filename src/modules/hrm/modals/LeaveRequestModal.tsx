'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { LeaveRequest } from '@/services/hrmService';
import hrmService from '@/services/hrmService';
import { useEmployees } from '@/hooks/useHRM';

interface LeaveRequestModalProps {
  open: boolean;
  onClose: () => void;
  leaveRequest?: LeaveRequest | null;
  onSuccess: () => void;
}

const LEAVE_TYPES = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid', 'Other'];

export default function LeaveRequestModal({ open, onClose, leaveRequest, onSuccess }: LeaveRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const { data: employeesData } = useEmployees();
  const employees = (employeesData as any)?.results ?? (employeesData as any)?.employees ?? [];
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'Annual',
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        employee_id: leaveRequest.employee_id || '',
        leave_type: leaveRequest.leave_type || 'Annual',
        start_date: leaveRequest.start_date || '',
        end_date: leaveRequest.end_date || '',
        reason: leaveRequest.reason || '',
      });
    } else {
      setFormData({
        employee_id: '',
        leave_type: 'Annual',
        start_date: '',
        end_date: '',
        reason: '',
      });
    }
  }, [leaveRequest, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (leaveRequest) {
        await hrmService.updateLeaveRequest(leaveRequest.id, formData);
      } else {
        await hrmService.requestLeave(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving leave request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={leaveRequest ? 'Edit Leave Request' : 'Request Leave'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {leaveRequest ? 'Update' : 'Submit'} Request
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth select label="Employee" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} required>
            {employees.length === 0
              ? <MenuItem disabled value="">No employees found</MenuItem>
              : employees.map((e: any) => <MenuItem key={e.id} value={e.id}>{e.full_name}</MenuItem>)
            }
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth select label="Leave Type" value={formData.leave_type} onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}>
            {LEAVE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Start Date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} InputLabelProps={{ shrink: true }} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="End Date" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} InputLabelProps={{ shrink: true }} required />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} multiline rows={3} required />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
