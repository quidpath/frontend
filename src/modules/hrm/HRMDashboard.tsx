'use client';

import React, { useState } from 'react';
import { Box, Button, Grid, Tab, Tabs, Typography, Avatar, alpha } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions, ActionMenuItem } from '@/components/ui/ActionMenu';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';
import { useEmployees, useDepartments, useLeaveRequests, usePayrollRuns, useHRMSummary } from '@/hooks/useHRM';
import { formatCurrency, formatDate, initials } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { Employee, Department, LeaveRequest, PayrollRun } from '@/services/hrmService';
import hrmService from '@/services/hrmService';

const EMPLOYEE_COLUMNS: TableColumn<Employee>[] = [
  {
    id: 'full_name',
    label: 'Employee',
    minWidth: 200,
    sortable: true,
    format: (val, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 30, height: 30, fontSize: '0.7rem', fontWeight: 700, background: 'linear-gradient(135deg, #C62828, #7B1818)' }}>
          {initials(val as string)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>{val as string}</Typography>
          <Typography variant="caption" color="text.secondary">{(row as Employee).employee_id}</Typography>
        </Box>
      </Box>
    ),
  },
  { id: 'department', label: 'Department', sortable: true },
  { id: 'position', label: 'Position' },
  { id: 'join_date', label: 'Join Date', format: (val) => formatDate(val as string) },
  { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
];

export default function HRMDashboard() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; message: string; onConfirm: () => void; severity?: 'warning' | 'error' | 'info';
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const { data: summary, isLoading: summaryLoading } = useHRMSummary();
  const { data: employees, isLoading: empLoading, refetch: refetchEmployees } = useEmployees({ page: page + 1, search });
  const { data: departments, isLoading: deptLoading, refetch: refetchDepts } = useDepartments();
  const { data: leaves, isLoading: leavesLoading, refetch: refetchLeaves } = useLeaveRequests();
  const { data: payroll, isLoading: payrollLoading, refetch: refetchPayroll } = usePayrollRuns();

  const handleDeleteEmployee = async (id: string) => {
    try { await hrmService.deleteEmployee(id); showSuccess('Employee deleted'); refetchEmployees(); }
    catch { showError('Failed to delete employee'); }
  };

  const handleDeleteDepartment = async (id: string) => {
    try { await hrmService.deleteDepartment(id); showSuccess('Department deleted'); refetchDepts(); }
    catch { showError('Failed to delete department'); }
  };

  const handleDeleteLeave = async (id: string) => {
    try { await hrmService.deleteLeaveRequest(id); showSuccess('Leave request deleted'); refetchLeaves(); }
    catch { showError('Failed to delete leave request'); }
  };

  const handleDeletePayroll = async (_id: string) => {
    showError('Payroll runs cannot be deleted once created');
  };

  const getEmployeeActions = (emp: Employee): ActionMenuItem[] => [
    commonActions.view(() => console.log('view employee', emp.id)),
    commonActions.edit(() => console.log('edit employee', emp.id)),
    commonActions.delete(() => setConfirmDialog({
      open: true, title: 'Delete Employee', severity: 'error',
      message: `Delete "${emp.full_name}"? This cannot be undone.`,
      onConfirm: () => handleDeleteEmployee(emp.id),
    })),
  ];

  const getDeptActions = (dept: Department): ActionMenuItem[] => [
    commonActions.view(() => console.log('view dept', dept.id)),
    commonActions.edit(() => console.log('edit dept', dept.id)),
    commonActions.delete(() => setConfirmDialog({
      open: true, title: 'Delete Department', severity: 'error',
      message: `Delete "${dept.name}"?`,
      onConfirm: () => handleDeleteDepartment(dept.id),
    })),
  ];

  const getLeaveActions = (leave: LeaveRequest): ActionMenuItem[] => [
    commonActions.view(() => console.log('view leave', leave.id)),
    commonActions.edit(() => console.log('edit leave', leave.id)),
    commonActions.delete(() => setConfirmDialog({
      open: true, title: 'Delete Leave Request', severity: 'warning',
      message: `Delete leave request for "${leave.employee_name}"?`,
      onConfirm: () => handleDeleteLeave(leave.id),
    })),
  ];

  const getPayrollActions = (run: PayrollRun): ActionMenuItem[] => [
    commonActions.view(() => console.log('view payroll', run.id)),
    commonActions.delete(() => setConfirmDialog({
      open: true, title: 'Delete Payroll Run', severity: 'error',
      message: `Delete payroll run for "${run.period}"?`,
      onConfirm: () => handleDeletePayroll(run.id),
    })),
  ];

  const EMPLOYEE_COLS: TableColumn<Employee>[] = [
    ...EMPLOYEE_COLUMNS,
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getEmployeeActions(row)} /> },
  ];

  const DEPT_COLUMNS: TableColumn<Department>[] = [
    { id: 'code', label: 'Code', format: (val) => <Typography variant="caption" fontWeight={600} sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{val as string}</Typography> },
    { id: 'name', label: 'Department', sortable: true, format: (val) => <Typography variant="body2" fontWeight={600}>{val as string}</Typography> },
    { id: 'head', label: 'Department Head' },
    { id: 'employee_count', label: 'Employees', align: 'right', sortable: true, format: (val) => <Typography variant="body2" fontWeight={600}>{(val as number).toLocaleString()}</Typography> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getDeptActions(row)} /> },
  ];

  const LEAVE_COLUMNS: TableColumn<LeaveRequest>[] = [
    { id: 'employee_name', label: 'Employee', sortable: true },
    { id: 'leave_type', label: 'Leave Type' },
    { id: 'start_date', label: 'From', format: (val) => formatDate(val as string) },
    { id: 'end_date', label: 'To', format: (val) => formatDate(val as string) },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getLeaveActions(row)} /> },
  ];

  const PAYROLL_COLUMNS: TableColumn<PayrollRun>[] = [
    { id: 'period', label: 'Period', format: (val) => <Typography variant="body2" fontWeight={600}>{val as string}</Typography> },
    { id: 'employee_count', label: 'Employees', align: 'right' },
    { id: 'total_amount', label: 'Total Amount', align: 'right', format: (val) => <Typography variant="body2" fontWeight={600}>{formatCurrency(val as string)}</Typography> },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'processed_at', label: 'Processed', format: (val) => formatDate(val as string) },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getPayrollActions(row)} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="HR Management"
        subtitle="Employees, payroll, attendance & organizational structure"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'HR Management' }]}
        icon={<BadgeIcon sx={{ fontSize: 26 }} />}
        color="#C62828"
        actions={<Button startIcon={<AddIcon />} variant="contained" size="small">Add Employee</Button>}
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard label="Total Employees" value={summary?.total_employees ?? '—'} change={2} changeLabel="new this month" trend="up" color="#C62828" loading={summaryLoading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard label="On Leave Today" value={summary?.on_leave_today ?? '—'} color="#F2A40E" loading={summaryLoading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard label="Pending Leaves" value={summary?.pending_leaves ?? '—'} color="#1565C0" loading={summaryLoading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard label="Departments" value={summary?.departments_count ?? '—'} color="#6A1B9A" loading={summaryLoading} />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }} sx={{ mb: 2.5 }}>
        <Tab label="Employees" />
        <Tab label="Departments" />
        <Tab label="Leave Requests" />
        <Tab label="Payroll" />
        <Tab label="Performance" />
      </Tabs>

      {tab === 0 && (
        <DataTable columns={EMPLOYEE_COLS} rows={employees?.results ?? []} loading={empLoading} total={employees?.count} page={page} pageSize={25} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="Search employees..." getRowId={(r) => r.id} />
      )}
      {tab === 1 && (
        <DataTable columns={DEPT_COLUMNS} rows={departments?.results ?? []} loading={deptLoading} getRowId={(r) => r.id} />
      )}
      {tab === 2 && (
        <DataTable columns={LEAVE_COLUMNS} rows={leaves?.results ?? []} loading={leavesLoading} getRowId={(r) => r.id} emptyMessage="No leave requests" />
      )}
      {tab === 3 && (
        <DataTable columns={PAYROLL_COLUMNS} rows={payroll?.results ?? []} loading={payrollLoading} getRowId={(r) => r.id} emptyMessage="No payroll runs" />
      )}
      {tab === 4 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Performance reviews and KPI tracking — connect HRM performance endpoint.</Typography>
        </Box>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, open: false }); }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        severity={confirmDialog.severity}
      />

      <NotificationToast
        open={notification.open}
        onClose={hideNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
}
