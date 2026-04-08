'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Tab, Tabs, Card, CardContent, Grid, Alert, Chip,
  TextField, MenuItem, FormControlLabel, Checkbox, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Divider, Stack, Switch, Slider, Paper, IconButton, Tooltip,
  ToggleButton, ToggleButtonGroup, CircularProgress,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import CrudTable from '@/components/ui/CrudTable';
import FormModal from '@/components/ui/FormModal';
import { usePermissions } from '@/hooks/usePermissions';
import { useDepartments, usePositions, useLeaveTypes } from '@/hooks/useHRM';
import { useWarehouses } from '@/hooks/useInventory';
import { useTaxRates } from '@/hooks/useTax';
import { useBankAccounts } from '@/hooks/useBanking';
import hrmService, { Department, Position } from '@/services/hrmService';
import inventoryService, { Warehouse } from '@/services/inventoryService';
import taxService, { TaxRate } from '@/services/taxService';
import bankingService, { BankAccount } from '@/services/bankingService';
import { useCurrencyStore, SUPPORTED_CURRENCIES, CurrencyCode } from '@/store/currencyStore';
import { useCurrencyRates } from '@/hooks/useCurrency';
import roleService, { RoleWithPermissions, Permission, CorporateOption } from '@/services/roleService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
type RoleRow = Omit<RoleWithPermissions, 'id'> & { id: string };

function rows<T>(data: any, ...keys: string[]): T[] {
  for (const k of keys) if (data?.[k]) return data[k];
  return data?.results ?? [];
}

function Err({ msg }: { msg: string }) {
  return msg ? <Alert severity="error" sx={{ mb: 2 }}>{msg}</Alert> : null;
}

// ─── Base Currency Selector ───────────────────────────────────────────────────
function BaseCurrencySelector({ can }: { can: boolean }) {
  useCurrencyRates();
  const { baseCurrency, setBaseCurrency, currency, setCurrency, rates } = useCurrencyStore();

  const handleChange = (code: CurrencyCode) => {
    setBaseCurrency(code);
    // Also update display currency to match base when SUPERADMIN changes it
    setCurrency(code);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        select
        fullWidth
        label="Base Currency"
        value={baseCurrency}
        onChange={(e) => can && handleChange(e.target.value as CurrencyCode)}
        disabled={!can}
        helperText={can ? 'All monetary amounts are stored in this currency' : 'Only SUPERADMIN can change the base currency'}
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <MenuItem key={c.code} value={c.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 36 }}>{c.symbol}</Typography>
              <Typography variant="body2">{c.code} — {c.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </TextField>
      {Object.keys(rates).length > 0 && (
        <Alert severity="success" sx={{ py: 0.5 }}>
          Live rates loaded · Display currency: <strong>{currency}</strong>
        </Alert>
      )}
    </Box>
  );
}

// ─── Departments ──────────────────────────────────────────────────────────────
function DepartmentsPanel({ can }: { can: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useDepartments();
  const list = rows<Department>(data, 'departments', 'results');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [err, setErr] = useState('');

  const save = useMutation({
    mutationFn: () => editing ? hrmService.updateDepartment(editing.id, form) : hrmService.createDepartment(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hrm', 'departments'] }); setOpen(false); },
    onError: (e: any) => setErr(e?.response?.data?.message || 'Failed to save'),
  });
  const del = useMutation({
    mutationFn: (id: string) => hrmService.deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hrm', 'departments'] }),
  });

  const openAdd = () => { setEditing(null); setForm({ name: '', code: '', description: '' }); setErr(''); setOpen(true); };
  const openEdit = (r: Department) => { setEditing(r); setForm({ name: r.name, code: r.code, description: r.description || '' }); setErr(''); setOpen(true); };

  return (
    <>
      <CrudTable title="Departments" subtitle="Used in employee records and payroll"
        columns={[{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'employee_count', label: 'Employees' }, { key: 'description', label: 'Description' }]}
        rows={list} loading={isLoading} canAdd={can} canEdit={can} canDelete={can}
        onAdd={openAdd} onEdit={openEdit} onDelete={(r) => del.mutate(r.id)} emptyMessage="No departments yet" />
      <FormModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Department' : 'Add Department'} onSubmit={() => save.mutate()} loading={save.isPending}>
        <Err msg={err} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
          <TextField label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required fullWidth />
          <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
        </Box>
      </FormModal>
    </>
  );
}

// ─── Positions ────────────────────────────────────────────────────────────────
function PositionsPanel({ can }: { can: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = usePositions();
  const { data: deptData } = useDepartments();
  const list = rows<Position>(data, 'positions', 'results');
  const depts = rows<Department>(deptData, 'departments', 'results');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState({ title: '', department_id: '', description: '' });
  const [err, setErr] = useState('');

  const save = useMutation({
    mutationFn: () => editing ? hrmService.updatePosition(editing.id, form) : hrmService.createPosition(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hrm', 'positions'] }); setOpen(false); },
    onError: (e: any) => setErr(e?.response?.data?.message || 'Failed to save'),
  });
  const del = useMutation({
    mutationFn: (id: string) => hrmService.deletePosition(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hrm', 'positions'] }),
  });

  const openAdd = () => { setEditing(null); setForm({ title: '', department_id: '', description: '' }); setErr(''); setOpen(true); };
  const openEdit = (r: Position) => { setEditing(r); setForm({ title: r.title, department_id: r.department_id || '', description: r.description || '' }); setErr(''); setOpen(true); };

  return (
    <>
      <CrudTable title="Positions / Job Titles" subtitle="Assigned to employees and used in leave requests"
        columns={[{ key: 'title', label: 'Title' }, { key: 'department', label: 'Department' }, { key: 'description', label: 'Description' }]}
        rows={list} loading={isLoading} canAdd={can} canEdit={can} canDelete={can}
        onAdd={openAdd} onEdit={openEdit} onDelete={(r) => del.mutate(r.id)} emptyMessage="No positions yet" />
      <FormModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Position' : 'Add Position'} onSubmit={() => save.mutate()} loading={save.isPending}>
        <Err msg={err} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required fullWidth />
          <TextField select label="Department" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} fullWidth>
            <MenuItem value="">None</MenuItem>
            {depts.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
          <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
        </Box>
      </FormModal>
    </>
  );
}

// ─── Warehouses ───────────────────────────────────────────────────────────────
function WarehousesPanel({ can }: { can: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useWarehouses();
  const list = rows<Warehouse>(data, 'warehouses', 'results');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [form, setForm] = useState({ name: '', code: '', location: '', is_active: true });
  const [err, setErr] = useState('');

  const save = useMutation({
    mutationFn: () => editing ? inventoryService.updateWarehouse(editing.id, form) : inventoryService.createWarehouse(form as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory', 'warehouses'] }); setOpen(false); },
    onError: (e: any) => setErr(e?.response?.data?.message || 'Failed to save'),
  });
  const del = useMutation({
    mutationFn: (id: string) => inventoryService.deleteWarehouse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', 'warehouses'] }),
  });

  const openAdd = () => { setEditing(null); setForm({ name: '', code: '', location: '', is_active: true }); setErr(''); setOpen(true); };
  const openEdit = (r: Warehouse) => { setEditing(r); setForm({ name: r.name, code: r.code, location: r.location, is_active: r.is_active }); setErr(''); setOpen(true); };

  return (
    <>
      <CrudTable title="Warehouses" subtitle="Storage locations used in stock movements"
        columns={[
          { key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'location', label: 'Location' },
          { key: 'is_active', label: 'Status', render: (r) => <Chip label={r.is_active ? 'Active' : 'Inactive'} color={r.is_active ? 'success' : 'default'} size="small" /> },
        ]}
        rows={list} loading={isLoading} canAdd={can} canEdit={can} canDelete={can}
        onAdd={openAdd} onEdit={openEdit} onDelete={(r) => del.mutate(r.id)} emptyMessage="No warehouses yet" />
      <FormModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Warehouse' : 'Add Warehouse'} onSubmit={() => save.mutate()} loading={save.isPending}>
        <Err msg={err} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
          <TextField label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required fullWidth />
          <TextField label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} fullWidth />
          <FormControlLabel control={<Checkbox checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />} label="Active" />
        </Box>
      </FormModal>
    </>
  );
}

// ─── Tax Rates ────────────────────────────────────────────────────────────────
function TaxRatesPanel({ can }: { can: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useTaxRates();
  const list = rows<TaxRate>(data, 'tax_rates', 'results');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaxRate | null>(null);
  const [form, setForm] = useState({ name: '', rate: 0, type: 'sales' as TaxRate['type'], is_active: true, description: '' });
  const [err, setErr] = useState('');

  const save = useMutation({
    mutationFn: () => editing ? taxService.updateTaxRate(editing.id, form) : taxService.createTaxRate(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tax', 'rates'] }); setOpen(false); },
    onError: (e: any) => setErr(e?.response?.data?.message || 'Failed to save'),
  });
  const del = useMutation({
    mutationFn: (id: string) => taxService.deleteTaxRate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tax', 'rates'] }),
  });

  const openAdd = () => { setEditing(null); setForm({ name: '', rate: 0, type: 'sales', is_active: true, description: '' }); setErr(''); setOpen(true); };
  const openEdit = (r: TaxRate) => { setEditing(r); setForm({ name: r.name, rate: r.rate, type: r.type, is_active: r.is_active, description: r.description || '' }); setErr(''); setOpen(true); };

  return (
    <>
      <CrudTable title="Tax Rates" subtitle="Used on invoices, expenses, and sales"
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'rate', label: 'Rate', render: (r) => `${r.rate}%` },
          { key: 'type', label: 'Type', render: (r) => <Chip label={r.type} size="small" variant="outlined" /> },
          { key: 'is_active', label: 'Status', render: (r) => <Chip label={r.is_active ? 'Active' : 'Inactive'} color={r.is_active ? 'success' : 'default'} size="small" /> },
        ]}
        rows={list} loading={isLoading} canAdd={can} canEdit={can} canDelete={can}
        onAdd={openAdd} onEdit={openEdit} onDelete={(r) => del.mutate(r.id)} emptyMessage="No tax rates yet" />
      <FormModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Tax Rate' : 'Add Tax Rate'} onSubmit={() => save.mutate()} loading={save.isPending}>
        <Err msg={err} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
          <TextField label="Rate (%)" type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} required fullWidth inputProps={{ min: 0, max: 100, step: 0.01 }} />
          <TextField select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TaxRate['type'] })} fullWidth>
            {['sales', 'purchase', 'vat', 'other'].map((t) => <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
          </TextField>
          <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth />
          <FormControlLabel control={<Checkbox checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />} label="Active" />
        </Box>
      </FormModal>
    </>
  );
}

// ─── Roles & Permissions ──────────────────────────────────────────────────────
// Props: isSuperuser = Django is_superuser; isSuperAdmin = SUPERADMIN role
function RolesPanel({ isSuperuser, isSuperAdmin }: { isSuperuser: boolean; isSuperAdmin: boolean }) {
  const qc = useQueryClient();

  // SUPERUSER: corporate dropdown to filter roles across all orgs
  const [selectedCorp, setSelectedCorp] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [form, setForm] = useState({ name: '', description: '', permission_ids: [] as number[] });
  const [err, setErr] = useState('');
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);

  // SUPERUSER only: fetch all corporates for the dropdown
  const { data: corpsData } = useQuery({
    queryKey: ['roles-corporates'],
    queryFn: () => roleService.listCorporates().then(r => r.data),
    enabled: isSuperuser,
  });
  const corporates = corpsData?.corporates ?? [];

  // Fetch roles — SUPERUSER can filter by corporate; SUPERADMIN gets their own
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles-all', selectedCorp],
    queryFn: () => roleService.listAllRoles(selectedCorp || undefined).then(r => r.data),
  });

  const { data: permsData } = useQuery({
    queryKey: ['permissions-all'],
    queryFn: () => roleService.listAllPermissions().then(r => r.data),
  });

  const roles: RoleRow[] = (rolesData?.roles ?? []).map((r: RoleWithPermissions) => ({ ...r, id: String(r.id) }));
  const permissions = permsData?.permissions ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ['roles-all'] });

  const createMutation = useMutation({
    mutationFn: (d: { name: string; description: string; permission_ids: number[]; corporate_id?: string }) =>
      roleService.createRole(d),
    onSuccess: () => { invalidate(); setOpen(false); },
    onError: (e: any) => setErr(e?.response?.data?.error ?? 'Failed to create role'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: { role_id: number; name?: string; description?: string; permission_ids?: number[] }) =>
      roleService.updateRole(d),
    onSuccess: () => { invalidate(); setOpen(false); },
    onError: (e: any) => setErr(e?.response?.data?.error ?? 'Failed to update role'),
  });

  const deleteMutation = useMutation({
    mutationFn: (roleId: number) => roleService.deleteRole(roleId),
    onSuccess: invalidate,
    onError: (e: any) => alert(e?.response?.data?.error ?? 'Failed to delete role'),
  });

  const addPermMutation = useMutation({
    mutationFn: ({ roleId, permId }: { roleId: number; permId: number }) =>
      roleService.addPermission(roleId, permId),
    onSuccess: invalidate,
  });

  const removePermMutation = useMutation({
    mutationFn: ({ roleId, permId }: { roleId: number; permId: number }) =>
      roleService.removePermission(roleId, permId),
    onSuccess: invalidate,
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', permission_ids: [] });
    setErr('');
    setOpen(true);
  };

  const openEdit = (role: RoleRow) => {
    setEditing(role);
    setForm({
      name: role.name,
      description: role.description ?? '',
      permission_ids: role.permissions.map((p: Permission) => p.id),
    });
    setErr('');
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setErr('Role name is required'); return; }
    if (editing) {
      updateMutation.mutate({ role_id: Number(editing.id), ...form });
    } else {
      const payload: any = { ...form };
      if (isSuperuser && selectedCorp) payload.corporate_id = selectedCorp;
      createMutation.mutate(payload);
    }
  };

  const openPermDialog = (role: RoleRow) => {
    setSelectedRole(roles.find(r => r.id === role.id) ?? role);
    setPermDialogOpen(true);
  };

  const togglePermission = (permId: number) => {
    if (!selectedRole) return;
    const hasIt = selectedRole.permissions.some((p: Permission) => p.id === permId);
    const roleId = Number(selectedRole.id);
    if (hasIt) {
      removePermMutation.mutate({ roleId, permId });
      setSelectedRole(prev => prev ? { ...prev, permissions: prev.permissions.filter(p => p.id !== permId) } : null);
    } else {
      addPermMutation.mutate({ roleId, permId });
      const perm = permissions.find(p => p.id === permId);
      if (perm) setSelectedRole(prev => prev ? { ...prev, permissions: [...prev.permissions, perm] } : null);
    }
  };

  const permsByModule: Record<string, Permission[]> = {};
  permissions.forEach((p: Permission) => {
    if (!permsByModule[p.module_slug]) permsByModule[p.module_slug] = [];
    permsByModule[p.module_slug].push(p);
  });

  const isSystemRole = (name: string) => ['SUPERADMIN', 'SUPERUSER'].includes(name.toUpperCase());

  return (
    <>
      {isSuperuser && (
        <Box sx={{ mb: 2.5 }}>
          <Alert severity="info" sx={{ mb: 1.5 }}>
            As a system superuser you can view and manage roles for any organisation.
          </Alert>
          <TextField
            select size="small" label="Filter by Organisation"
            value={selectedCorp} onChange={e => setSelectedCorp(e.target.value)}
            sx={{ minWidth: 280 }}
          >
            <MenuItem value="">All organisations</MenuItem>
            {corporates.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {!isSuperuser && isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can create and manage roles for your organisation. System roles cannot be modified.
        </Alert>
      )}

      <CrudTable
        title="Roles & Permissions"
        subtitle={isSuperuser ? 'All organisation roles — select an organisation above to filter' : 'Roles for your organisation'}
        columns={[
          { key: 'name', label: 'Role Name' },
          { key: 'corporate_name', label: 'Organisation' },
          { key: 'description', label: 'Description' },
          {
            key: 'permissions',
            label: 'Permissions',
            render: (r: RoleRow) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {r.permissions.slice(0, 3).map((p: Permission) => (
                  <Chip key={p.id} label={p.name} size="small" variant="outlined" />
                ))}
                {r.permissions.length > 3 && (
                  <Chip label={`+${r.permissions.length - 3} more`} size="small" color="primary" />
                )}
                {!isSystemRole(r.name) && (
                  <Chip label="Manage" size="small" color="secondary"
                    onClick={() => openPermDialog(r)} sx={{ cursor: 'pointer' }} />
                )}
              </Box>
            ),
          },
        ]}
        rows={roles}
        loading={rolesLoading}
        canAdd={isSuperAdmin && !isSuperuser ? true : (isSuperuser && !!selectedCorp)}
        canEdit
        canDelete
        onAdd={openAdd}
        onEdit={(r: RoleRow) => { if (!isSystemRole(r.name)) openEdit(r); }}
        onDelete={(r: RoleRow) => {
          if (isSystemRole(r.name)) { alert('Cannot delete system roles'); return; }
          if (confirm(`Delete role "${r.name}"? This cannot be undone.`)) {
            deleteMutation.mutate(Number(r.id));
          }
        }}
        emptyMessage={isSuperuser && !selectedCorp ? 'Select an organisation to view its roles' : 'No roles yet'}
      />

      <FormModal
        open={open} onClose={() => setOpen(false)}
        title={editing ? `Edit Role: ${editing.name}` : 'Create Role'}
        onSubmit={handleSave}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Err msg={err} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Role Name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required fullWidth helperText="Cannot use SUPERADMIN or SUPERUSER" />
          <TextField label="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            fullWidth multiline rows={2} />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Permissions ({form.permission_ids.length} selected)
            </Typography>
            <Box sx={{ maxHeight: 280, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
              {Object.entries(permsByModule).map(([module, perms]) => (
                <Box key={module} sx={{ mb: 1 }}>
                  <Typography variant="caption" fontWeight={700} color="primary" sx={{ textTransform: 'uppercase' }}>
                    {module}
                  </Typography>
                  {perms.map((p: Permission) => (
                    <FormControlLabel key={p.id}
                      control={
                        <Checkbox size="small"
                          checked={form.permission_ids.includes(p.id)}
                          onChange={e => setForm({
                            ...form,
                            permission_ids: e.target.checked
                              ? [...form.permission_ids, p.id]
                              : form.permission_ids.filter(id => id !== p.id),
                          })}
                        />
                      }
                      label={<Typography variant="body2">{p.name}</Typography>}
                      sx={{ display: 'block', ml: 1 }}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </FormModal>

      <Dialog open={permDialogOpen} onClose={() => setPermDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Permissions — {selectedRole?.name}</DialogTitle>
        <DialogContent>
          {selectedRole && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {Object.entries(permsByModule).map(([module, perms]) => (
                <Box key={module}>
                  <Typography variant="subtitle2" fontWeight={700} color="primary"
                    sx={{ mb: 1, textTransform: 'uppercase' }}>{module}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {perms.map((p: Permission) => {
                      const hasIt = selectedRole.permissions.some((rp: Permission) => rp.id === p.id);
                      return (
                        <Chip key={p.id} label={p.name}
                          color={hasIt ? 'success' : 'default'}
                          variant={hasIt ? 'filled' : 'outlined'}
                          onClick={() => togglePermission(p.id)}
                          sx={{ cursor: 'pointer' }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Bank Accounts ────────────────────────────────────────────────────────────
function BankAccountsPanel({ can }: { can: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useBankAccounts();
  const list = rows<BankAccount>(data, 'bank_accounts', 'results');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [form, setForm] = useState({ bank_name: '', account_name: '', account_number: '', currency: 'KES', is_default: false, is_active: true });
  const [err, setErr] = useState('');

  const save = useMutation({
    mutationFn: () => editing ? bankingService.updateBankAccount(editing.id, form) : bankingService.createBankAccount(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['banking', 'accounts'] }); setOpen(false); },
    onError: (e: any) => setErr(e?.response?.data?.message || 'Failed to save'),
  });
  const del = useMutation({
    mutationFn: (id: string) => bankingService.deleteBankAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banking', 'accounts'] }),
  });

  const openAdd = () => { setEditing(null); setForm({ bank_name: '', account_name: '', account_number: '', currency: 'KES', is_default: false, is_active: true }); setErr(''); setOpen(true); };
  const openEdit = (r: BankAccount) => { setEditing(r); setForm({ bank_name: r.bank_name, account_name: r.account_name, account_number: r.account_number, currency: r.currency, is_default: r.is_default, is_active: r.is_active }); setErr(''); setOpen(true); };

  return (
    <>
      <CrudTable title="Bank Accounts" subtitle="Company accounts used for transactions and transfers"
        columns={[
          { key: 'bank_name', label: 'Bank' }, { key: 'account_name', label: 'Account Name' },
          { key: 'account_number', label: 'Account Number' }, { key: 'currency', label: 'Currency' },
          { key: 'is_default', label: 'Default', render: (r) => r.is_default ? <Chip label="Default" color="primary" size="small" /> : null },
          { key: 'is_active', label: 'Status', render: (r) => <Chip label={r.is_active ? 'Active' : 'Inactive'} color={r.is_active ? 'success' : 'default'} size="small" /> },
        ]}
        rows={list} loading={isLoading} canAdd={can} canEdit={can} canDelete={can}
        onAdd={openAdd} onEdit={openEdit} onDelete={(r) => del.mutate(r.id)} emptyMessage="No bank accounts yet" />
      <FormModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Bank Account' : 'Add Bank Account'} onSubmit={() => save.mutate()} loading={save.isPending}>
        <Err msg={err} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Bank Name" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} required fullWidth />
          <TextField label="Account Name" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} required fullWidth />
          <TextField label="Account Number" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} required fullWidth />
          <TextField select label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} fullWidth>
            {['KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <FormControlLabel control={<Checkbox checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />} label="Set as default account" />
          <FormControlLabel control={<Checkbox checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />} label="Active" />
        </Box>
      </FormModal>
    </>
  );
}

// ─── Document Templates ───────────────────────────────────────────────────────
const ACCENT_PRESETS = ['#1565C0', '#2E7D32', '#6A1B9A', '#C62828', '#E65100', '#00695C', '#37474F'];
const FONT_OPTIONS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat'];
const DOC_TYPES = [
  { key: 'quotation', label: 'Quotation' },
  { key: 'invoice', label: 'Invoice' },
  { key: 'purchase_order', label: 'Purchase Order' },
  { key: 'vendor_bill', label: 'Vendor Bill' },
];

interface DocTemplate {
  accentColor: string;
  font: string;
  logoAlign: 'left' | 'center' | 'right';
  showLogo: boolean;
  showTagline: boolean;
  tagline: string;
  footerText: string;
  showBankDetails: boolean;
  showSignatureLine: boolean;
  showStamp: boolean;
  borderStyle: 'none' | 'thin' | 'thick';
  headerBg: boolean;
}

const DEFAULT_TEMPLATE: DocTemplate = {
  accentColor: '#1565C0',
  font: 'Inter',
  logoAlign: 'left',
  showLogo: true,
  showTagline: false,
  tagline: '',
  footerText: 'Thank you for your business.',
  showBankDetails: true,
  showSignatureLine: true,
  showStamp: false,
  borderStyle: 'thin',
  headerBg: true,
};

const STORAGE_KEY = 'qp_doc_templates';

async function loadTemplates(): Promise<Record<string, DocTemplate>> {
  if (typeof window === 'undefined') return {};
  try {
    // Try to load from backend API
    const { gatewayClient } = await import('@/services/apiClient');
    const response = await gatewayClient.get('/api/orgauth/document-templates/get/');
    return response.data?.templates || {};
  } catch (error) {
    console.error('Failed to load templates from API, falling back to localStorage:', error);
    // Fallback to localStorage
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  }
}

async function saveTemplates(t: Record<string, DocTemplate>): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // Save to backend API
    const { gatewayClient } = await import('@/services/apiClient');
    await gatewayClient.post('/api/orgauth/document-templates/save/', { templates: t });
    // Also save to localStorage as backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  } catch (error) {
    console.error('Failed to save templates to API, saving to localStorage only:', error);
    // Fallback to localStorage only
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
    throw error;
  }
}

function DocPreview({ tpl, docType }: { tpl: DocTemplate; docType: string }) {
  const [logo, setLogo] = useState<string>('');
  
  // Fetch logo from localStorage or profile
  useEffect(() => {
    const storedLogo = localStorage.getItem('logo');
    if (storedLogo) {
      setLogo(storedLogo);
    }
  }, []);
  
  const label = DOC_TYPES.find(d => d.key === docType)?.label ?? 'Document';
  return (
    <Paper variant="outlined" sx={{
      p: 2.5, fontFamily: tpl.font, fontSize: 11,
      border: tpl.borderStyle === 'none' ? '1px solid #e0e0e0' :
              tpl.borderStyle === 'thin' ? `2px solid ${tpl.accentColor}33` :
              `4px solid ${tpl.accentColor}`,
      borderRadius: 1.5, minHeight: 320, position: 'relative', overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        mb: 2, pb: 1.5,
        ...(tpl.headerBg ? { bgcolor: `${tpl.accentColor}12`, mx: -2.5, mt: -2.5, px: 2.5, pt: 2, borderBottom: `2px solid ${tpl.accentColor}` } : { borderBottom: `1px solid #e0e0e0` }),
        flexDirection: tpl.logoAlign === 'right' ? 'row-reverse' : tpl.logoAlign === 'center' ? 'column' : 'row',
        gap: 1,
      }}>
        {tpl.showLogo && (
          logo ? (
            <Box
              component="img"
              src={logo}
              alt="Company Logo"
              sx={{ maxWidth: 80, maxHeight: 40, objectFit: 'contain' }}
            />
          ) : (
            <Box sx={{ width: 48, height: 24, bgcolor: tpl.accentColor, borderRadius: 0.5, opacity: 0.85,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontSize: 8, fontWeight: 700, fontFamily: tpl.font }}>LOGO</Typography>
            </Box>
          )
        )}
        <Box sx={{ textAlign: tpl.logoAlign }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13, color: tpl.accentColor, fontFamily: tpl.font }}>
            Your Company Name
          </Typography>
          {tpl.showTagline && tpl.tagline && (
            <Typography sx={{ fontSize: 9, color: 'text.secondary', fontFamily: tpl.font }}>{tpl.tagline}</Typography>
          )}
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 15, color: tpl.accentColor, fontFamily: tpl.font, textTransform: 'uppercase' }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 9, color: 'text.secondary', fontFamily: tpl.font }}>#QT-2026-001</Typography>
        </Box>
      </Box>

      {/* Body rows */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 8, fontWeight: 600, color: tpl.accentColor, textTransform: 'uppercase', mb: 0.3, fontFamily: tpl.font }}>Bill To</Typography>
          <Typography sx={{ fontSize: 9, fontFamily: tpl.font }}>Customer Name</Typography>
          <Typography sx={{ fontSize: 9, color: 'text.secondary', fontFamily: tpl.font }}>customer@email.com</Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}>
          <Typography sx={{ fontSize: 9, fontFamily: tpl.font }}>Date: 05 Apr 2026</Typography>
          <Typography sx={{ fontSize: 9, fontFamily: tpl.font }}>Due: 05 May 2026</Typography>
        </Box>
      </Box>

      {/* Line items table */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', bgcolor: tpl.accentColor, color: '#fff', px: 1, py: 0.5, borderRadius: '4px 4px 0 0' }}>
          {['Description', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
            <Typography key={h} sx={{ flex: i === 0 ? 3 : 1, fontSize: 8, fontWeight: 600, fontFamily: tpl.font, textAlign: i > 0 ? 'right' : 'left' }}>{h}</Typography>
          ))}
        </Box>
        {[['Professional Services', '5', '200.00', '1,000.00'], ['Consulting Fee', '2', '150.00', '300.00']].map((row, i) => (
          <Box key={i} sx={{ display: 'flex', px: 1, py: 0.4, bgcolor: i % 2 === 0 ? `${tpl.accentColor}08` : 'transparent', borderBottom: '1px solid #f0f0f0' }}>
            {row.map((cell, j) => (
              <Typography key={j} sx={{ flex: j === 0 ? 3 : 1, fontSize: 8, fontFamily: tpl.font, textAlign: j > 0 ? 'right' : 'left' }}>{cell}</Typography>
            ))}
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5, gap: 2 }}>
          <Typography sx={{ fontSize: 9, fontFamily: tpl.font, color: 'text.secondary' }}>Total:</Typography>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: tpl.accentColor, fontFamily: tpl.font }}>KES 1,300.00</Typography>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: `1px solid ${tpl.accentColor}33`, pt: 1, mt: 'auto' }}>
        {tpl.showBankDetails && (
          <Typography sx={{ fontSize: 8, color: 'text.secondary', fontFamily: tpl.font, mb: 0.3 }}>
            Bank: Your Bank · A/C: 1234567890 · Branch: Main
          </Typography>
        )}
        {tpl.showSignatureLine && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Box sx={{ borderTop: `1px solid #999`, width: 80, textAlign: 'center', pt: 0.3 }}>
              <Typography sx={{ fontSize: 7, color: 'text.secondary', fontFamily: tpl.font }}>Authorised Signature</Typography>
            </Box>
          </Box>
        )}
        <Typography sx={{ fontSize: 8, color: 'text.secondary', fontFamily: tpl.font, mt: 0.5, textAlign: 'center' }}>
          {tpl.footerText}
        </Typography>
      </Box>
    </Paper>
  );
}

function DocumentTemplatesPanel() {
  const [activeDoc, setActiveDoc] = useState('quotation');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Record<string, DocTemplate>>({});

  // Load templates on mount
  useEffect(() => {
    loadTemplates().then(loaded => {
      const result: Record<string, DocTemplate> = {};
      DOC_TYPES.forEach(d => { result[d.key] = loaded[d.key] ?? { ...DEFAULT_TEMPLATE }; });
      setTemplates(result);
      setLoading(false);
    }).catch(() => {
      // If loading fails, use defaults
      const result: Record<string, DocTemplate> = {};
      DOC_TYPES.forEach(d => { result[d.key] = { ...DEFAULT_TEMPLATE }; });
      setTemplates(result);
      setLoading(false);
    });
  }, []);

  const tpl = templates[activeDoc] ?? { ...DEFAULT_TEMPLATE };
  const set = (patch: Partial<DocTemplate>) => {
    setTemplates(prev => ({ ...prev, [activeDoc]: { ...prev[activeDoc], ...patch } }));
    setSaved(false);
  };

  const handleSave = async () => {
    // Check if logo exists when showLogo is enabled
    const hasLogoEnabled = Object.values(templates).some(t => t.showLogo);
    if (hasLogoEnabled) {
      const storedLogo = localStorage.getItem('logo');
      if (!storedLogo) {
        alert('Please upload a company logo before saving templates with logo enabled. Go to Org Admin > Logo Settings to upload your logo, then log in again to refresh.');
        return;
      }
    }
    
    setSaving(true);
    try {
      await saveTemplates(templates);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert('Failed to save templates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTemplates(prev => ({ ...prev, [activeDoc]: { ...DEFAULT_TEMPLATE } }));
    setSaved(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionOutlinedIcon sx={{ color: '#607D8B' }} />
            Document Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customise how your documents look when printed or sent to clients.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Reset to defaults">
            <IconButton size="small" onClick={handleReset} sx={{ color: 'text.secondary' }}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: '#607D8B', '&:hover': { bgcolor: '#546E7A' }, minWidth: 100 }}
          >
            {saved ? 'Saved ✓' : 'Save'}
          </Button>
        </Stack>
      </Box>

      {/* Doc type selector */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {DOC_TYPES.map(d => (
          <Chip
            key={d.key}
            label={d.label}
            onClick={() => setActiveDoc(d.key)}
            variant={activeDoc === d.key ? 'filled' : 'outlined'}
            color={activeDoc === d.key ? 'primary' : 'default'}
            sx={{ fontWeight: activeDoc === d.key ? 700 : 400 }}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>

            {/* Branding */}
            <Card variant="outlined">
              <CardContent sx={{ pb: '12px !important' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ColorLensOutlinedIcon fontSize="small" sx={{ color: '#607D8B' }} /> Branding
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>Accent Colour</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                      {ACCENT_PRESETS.map(c => (
                        <Box key={c} onClick={() => set({ accentColor: c })} sx={{
                          width: 28, height: 28, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                          border: tpl.accentColor === c ? '3px solid #333' : '2px solid transparent',
                          transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.15)' },
                        }} />
                      ))}
                      <Tooltip title="Custom colour">
                        <Box sx={{ position: 'relative', width: 28, height: 28 }}>
                          <Box component="input" type="color" value={tpl.accentColor}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ accentColor: e.target.value })}
                            sx={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', p: 0, opacity: 0, position: 'absolute', inset: 0 }} />
                          <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: tpl.accentColor, border: '2px dashed #999', pointerEvents: 'none' }} />
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>

                  <TextField select size="small" label="Font" value={tpl.font} onChange={e => set({ font: e.target.value })} fullWidth>
                    {FONT_OPTIONS.map(f => <MenuItem key={f} value={f} sx={{ fontFamily: f }}>{f}</MenuItem>)}
                  </TextField>

                  <Box>
                    <Typography variant="caption" color="text.secondary">Logo Alignment</Typography>
                    <ToggleButtonGroup exclusive size="small" value={tpl.logoAlign}
                      onChange={(_, v) => v && set({ logoAlign: v })} sx={{ mt: 0.5, display: 'flex' }}>
                      <ToggleButton value="left" sx={{ flex: 1 }}><FormatAlignLeftIcon fontSize="small" /></ToggleButton>
                      <ToggleButton value="center" sx={{ flex: 1 }}><FormatAlignCenterIcon fontSize="small" /></ToggleButton>
                      <ToggleButton value="right" sx={{ flex: 1 }}><FormatAlignRightIcon fontSize="small" /></ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Layout */}
            <Card variant="outlined">
              <CardContent sx={{ pb: '12px !important' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Layout</Typography>
                <Stack spacing={1}>
                  <TextField select size="small" label="Border Style" value={tpl.borderStyle}
                    onChange={e => set({ borderStyle: e.target.value as DocTemplate['borderStyle'] })} fullWidth>
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="thin">Thin accent border</MenuItem>
                    <MenuItem value="thick">Thick accent border</MenuItem>
                  </TextField>
                  <FormControlLabel control={<Switch size="small" checked={tpl.headerBg} onChange={e => set({ headerBg: e.target.checked })} />}
                    label={<Typography variant="body2">Coloured header background</Typography>} />
                  <FormControlLabel control={<Switch size="small" checked={tpl.showLogo} onChange={e => set({ showLogo: e.target.checked })} />}
                    label={<Typography variant="body2">Show company logo</Typography>} />
                  <FormControlLabel control={<Switch size="small" checked={tpl.showTagline} onChange={e => set({ showTagline: e.target.checked })} />}
                    label={<Typography variant="body2">Show tagline</Typography>} />
                  {tpl.showTagline && (
                    <TextField size="small" label="Tagline" value={tpl.tagline}
                      onChange={e => set({ tagline: e.target.value })} fullWidth placeholder="e.g. Excellence in every transaction" />
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Footer */}
            <Card variant="outlined">
              <CardContent sx={{ pb: '12px !important' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Footer & Extras</Typography>
                <Stack spacing={1}>
                  <TextField size="small" label="Footer message" value={tpl.footerText}
                    onChange={e => set({ footerText: e.target.value })} fullWidth multiline rows={2}
                    placeholder="Thank you for your business." />
                  <FormControlLabel control={<Switch size="small" checked={tpl.showBankDetails} onChange={e => set({ showBankDetails: e.target.checked })} />}
                    label={<Typography variant="body2">Show bank details</Typography>} />
                  <FormControlLabel control={<Switch size="small" checked={tpl.showSignatureLine} onChange={e => set({ showSignatureLine: e.target.checked })} />}
                    label={<Typography variant="body2">Show signature line</Typography>} />
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Live Preview */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ position: 'sticky', top: 80 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <VisibilityOutlinedIcon fontSize="small" sx={{ color: '#607D8B' }} />
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">Live Preview</Typography>
              <Chip label={DOC_TYPES.find(d => d.key === activeDoc)?.label} size="small" sx={{ ml: 'auto' }} />
            </Box>
            <DocPreview tpl={tpl} docType={activeDoc} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
              Preview is approximate. Actual documents may vary slightly.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsDashboard() {
  const [tab, setTab] = useState(0);
  const { isSuperuser, user } = usePermissions();
  const isSuperAdmin = isSuperuser || user?.role?.name === 'SUPERADMIN';

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Configure your ERP system preferences and defaults"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Settings' }]}
        icon={<SettingsIcon sx={{ fontSize: 26 }} />}
        color="#607D8B"
      />

      {!isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You are in read-only mode. Only SUPERADMIN users can create, edit, or delete settings.
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }} variant="scrollable" scrollButtons="auto">
        <Tab label="General" />
        <Tab label="Accounting" />
        <Tab label="Sales" />
        <Tab label="Purchases" />
        <Tab label="Banking" />
        <Tab label="Tax" />
        <Tab label="Contacts" />
        <Tab label="HRM" />
        {isSuperAdmin && <Tab label="Roles & Permissions" />}
        {isSuperAdmin && <Tab label="Document Templates" />}
      </Tabs>

      {/* General */}
      {tab === 0 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Currency</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Set the base currency for your organisation. All amounts are stored in this currency. The display currency can be switched from the top bar.
                </Typography>
                <BaseCurrencySelector can={isSuperAdmin} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Company Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                  Company profile, logo, fiscal year, and timezone are managed via the Account page (SUPERADMIN only).
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Users &amp; Permissions</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage users and roles from the Org Admin → Users section (SUPERADMIN only).
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Accounting */}
      {tab === 1 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Accounting Settings</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Chart of accounts, journal templates, and accounting periods are managed directly within the Accounting module.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Sales */}
      {tab === 2 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <TaxRatesPanel can={isSuperAdmin} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Purchases */}
      {tab === 3 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Expense Categories</Typography>
                <Typography variant="body2" color="text.secondary">
                  Expense categories (Office Supplies, Travel, Utilities, etc.) are standard and applied when recording expenses in the Accounting module.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <WarehousesPanel can={isSuperAdmin} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Banking */}
      {tab === 4 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <BankAccountsPanel can={isSuperAdmin} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tax */}
      {tab === 5 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <TaxRatesPanel can={isSuperAdmin} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Contacts */}
      {tab === 6 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Contact Types</Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact types (Customer, Vendor, Supplier, Employee, Other) are standard and selected when creating contacts.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* HRM */}
      {tab === 7 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <DepartmentsPanel can={isSuperAdmin} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <PositionsPanel can={isSuperAdmin} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Roles & Permissions (SUPERADMIN + SUPERUSER) */}
      {tab === 8 && isSuperAdmin && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <RolesPanel isSuperuser={isSuperuser} isSuperAdmin={isSuperAdmin} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Document Templates (SUPERADMIN only) */}
      {isSuperAdmin && tab === 9 && (
        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <DocumentTemplatesPanel />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
