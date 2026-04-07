'use client';

import { useState, useEffect } from 'react';
import { Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, CircularProgress, Grid, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import financeService from '@/services/financeService';
import type { SectionProps } from './_shared';

interface PettyCashFund {
  id: string; name: string; description: string; custodian: string; custodian_id: string;
  initial_amount: number; current_balance: number; is_active: boolean; created_at: string;
}

interface PettyCashTransaction {
  id: string; fund_id: string; fund_name: string; transaction_type: string;
  date: string; reference: string; description: string; category: string;
  amount: number; recipient: string; receipt_number: string; status: string;
  requested_by: string; created_at: string;
}

interface CorporateUser { id: string; username: string; email: string; }

function FundModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (m: string, s?: 'success' | 'error') => void }) {
  const [form, setForm] = useState({ name: '', description: '', custodian_id: '', initial_amount: '' });
  const [users, setUsers] = useState<CorporateUser[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      financeService.getCorporateUsers().then(r => setUsers(r.data?.users ?? [])).catch(() => setUsers([]));
      setForm({ name: '', description: '', custodian_id: '', initial_amount: '' });
    }
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await financeService.createPettyCashFund({ ...form, initial_amount: Number(form.initial_amount) });
      onSuccess('Fund created'); onClose();
    } catch { onSuccess('Failed to create fund', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>Create Petty Cash Fund<IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton></DialogTitle>
      <DialogContent dividers><Stack spacing={2}>
        <TextField label="Fund Name" size="small" fullWidth value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        <TextField label="Description" size="small" fullWidth multiline rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        <FormControl fullWidth size="small"><InputLabel>Custodian</InputLabel><Select value={form.custodian_id} label="Custodian" onChange={e => setForm(p => ({ ...p, custodian_id: e.target.value }))}>{users.map(u => <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>)}</Select></FormControl>
        <TextField label="Initial Amount" size="small" type="number" fullWidth value={form.initial_amount} onChange={e => setForm(p => ({ ...p, initial_amount: e.target.value }))} />
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}>Create</Button></DialogActions>
    </Dialog>
  );
}

function TransactionModal({ open, onClose, funds, onSuccess }: { open: boolean; onClose: () => void; funds: PettyCashFund[]; onSuccess: (m: string, s?: 'success' | 'error') => void }) {
  const [form, setForm] = useState({ fund_id: '', transaction_type: 'DISBURSEMENT', date: new Date().toISOString().slice(0, 10), reference: '', description: '', category: '', amount: '', recipient: '', receipt_number: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ fund_id: '', transaction_type: 'DISBURSEMENT', date: new Date().toISOString().slice(0, 10), reference: '', description: '', category: '', amount: '', recipient: '', receipt_number: '' });
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await financeService.createPettyCashTransaction({ ...form, amount: Number(form.amount) });
      onSuccess('Transaction created'); onClose();
    } catch { onSuccess('Failed to create transaction', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>New Transaction<IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton></DialogTitle>
      <DialogContent dividers><Stack spacing={2}>
        <FormControl fullWidth size="small"><InputLabel>Fund</InputLabel><Select value={form.fund_id} label="Fund" onChange={e => setForm(p => ({ ...p, fund_id: e.target.value }))}>{funds.map(f => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}</Select></FormControl>
        <FormControl fullWidth size="small"><InputLabel>Type</InputLabel><Select value={form.transaction_type} label="Type" onChange={e => setForm(p => ({ ...p, transaction_type: e.target.value }))}><MenuItem value="DISBURSEMENT">Disbursement</MenuItem><MenuItem value="REPLENISHMENT">Replenishment</MenuItem><MenuItem value="ADJUSTMENT">Adjustment</MenuItem></Select></FormControl>
        <TextField label="Date" type="date" size="small" fullWidth value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
        <TextField label="Reference" size="small" fullWidth value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
        <TextField label="Description" size="small" fullWidth multiline rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        <TextField label="Category" size="small" fullWidth value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
        <TextField label="Amount" size="small" type="number" fullWidth value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
        <TextField label="Recipient" size="small" fullWidth value={form.recipient} onChange={e => setForm(p => ({ ...p, recipient: e.target.value }))} />
        <TextField label="Receipt Number" size="small" fullWidth value={form.receipt_number} onChange={e => setForm(p => ({ ...p, receipt_number: e.target.value }))} />
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}>Create</Button></DialogActions>
    </Dialog>
  );
}

export default function PettyCashSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0);
  const [funds, setFunds] = useState<PettyCashFund[]>([]);
  const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      financeService.getPettyCashFunds().then(r => setFunds(r.data?.funds ?? [])),
      financeService.getPettyCashTransactions().then(r => setTransactions(r.data?.transactions ?? []))
    ]).finally(() => setLoading(false));
  }, []);

  const totalBalance = funds.reduce((s, f) => s + f.current_balance, 0);
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

  const handleApprove = async (id: string) => {
    try {
      await financeService.approvePettyCashTransaction(id);
      notify('Transaction approved');
      // Refresh data
      financeService.getPettyCashTransactions().then(r => setTransactions(r.data?.transactions ?? []));
      financeService.getPettyCashFunds().then(r => setFunds(r.data?.funds ?? []));
    } catch { notify('Failed to approve', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await financeService.deletePettyCashTransaction(id);
      notify('Transaction deleted');
      financeService.getPettyCashTransactions().then(r => setTransactions(r.data?.transactions ?? []));
    } catch { notify('Failed to delete', 'error'); }
  };

  const FUND_COLS: TableColumn<PettyCashFund>[] = [
    { id: 'name', label: 'Fund Name', sortable: true, minWidth: 160 },
    { id: 'custodian', label: 'Custodian' },
    { id: 'initial_amount', label: 'Initial', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'current_balance', label: 'Balance', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'is_active', label: 'Status', format: v => <StatusChip status={v ? 'active' : 'inactive'} label={v ? 'Active' : 'Inactive'} /> },
  ];

  const TXN_COLS: TableColumn<PettyCashTransaction>[] = [
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'fund_name', label: 'Fund' },
    { id: 'transaction_type', label: 'Type' },
    { id: 'reference', label: 'Reference' },
    { id: 'description', label: 'Description', minWidth: 150 },
    { id: 'amount', label: 'Amount', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
      <ActionMenu actions={[
        ...(row.status === 'PENDING' ? [{ label: 'Approve', onClick: () => handleApprove(row.id), icon: 'check' as const }] : []),
        ...(row.status === 'PENDING' ? [commonActions.delete(() => handleDelete(row.id))] : [])
      ]} />
    )},
  ];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Total Balance" value={formatCurrency(totalBalance)} trend="neutral" color="#2E7D32" loading={loading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Active Funds" value={funds.filter(f => f.is_active).length} trend="neutral" color="#1565C0" loading={loading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Transactions" value={transactions.length} trend="neutral" color="#F57C00" loading={loading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Pending Approval" value={pendingCount} trend="neutral" color="#C62828" loading={loading} /></Grid>
      </Grid>
      {subTab === 'funds' && <DataTable columns={FUND_COLS} rows={funds} loading={loading} total={funds.length} page={page} pageSize={25} onPageChange={setPage} onSearch={() => {}} searchPlaceholder="Search funds..." getRowId={r => r.id} emptyMessage="No petty cash funds yet." />}
      {subTab === 'transactions' && <DataTable columns={TXN_COLS} rows={transactions} loading={loading} total={transactions.length} page={page} pageSize={25} onPageChange={setPage} onSearch={() => {}} searchPlaceholder="Search transactions..." getRowId={r => r.id} emptyMessage="No transactions yet." />}
      <FundModal open={addOpen && subTab === 'funds'} onClose={() => setAddOpen(false)} onSuccess={(m, s) => { notify(m, s); setAddOpen(false); financeService.getPettyCashFunds().then(r => setFunds(r.data?.funds ?? [])); }} />
      <TransactionModal open={addOpen && subTab === 'transactions'} onClose={() => setAddOpen(false)} funds={funds} onSuccess={(m, s) => { notify(m, s); setAddOpen(false); financeService.getPettyCashTransactions().then(r => setTransactions(r.data?.transactions ?? [])); }} />
    </>
  );
}
