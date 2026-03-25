'use client';

import React, { useState } from 'react';
import {
  Box, Tab, Tabs, Card, CardContent, Grid, Alert, Chip,
  TextField, MenuItem, FormControlLabel, Checkbox, Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    </Box>
  );
}
