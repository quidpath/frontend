'use client';

import { useState, useEffect } from 'react';
import { Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, CircularProgress, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { useBankAccounts, useCreateBankAccount, useUpdateBankAccount, useDeleteBankAccount, useTransactions, useDeleteTransaction, useInternalTransfers, useCreateTransfer, useDeleteTransfer } from '@/hooks/useFinance';
import type { BankAccount, BankTransaction, InternalTransfer } from '@/services/financeService';
import type { SectionProps } from './_shared';

function BankAccountModal({ open, onClose, record, onSuccess }: { open: boolean; onClose: () => void; record?: BankAccount | null; onSuccess: (m: string, s?: 'success' | 'error') => void }) {
  const create = useCreateBankAccount(); const update = useUpdateBankAccount(); const saving = create.isPending || update.isPending;
  const [form, setForm] = useState({ bank_name: '', account_name: '', account_number: '', currency: 'USD' });
  useEffect(() => { if (!open) return; if (record) setForm({ bank_name: record.bank_name, account_name: record.account_name, account_number: record.account_number, currency: record.currency }); else setForm({ bank_name: '', account_name: '', account_number: '', currency: 'USD' }); }, [record, open]);
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const handleSave = async () => { try { if (record) await update.mutateAsync({ id: record.id, ...form }); else await create.mutateAsync(form as Record<string, unknown>); onSuccess(record ? 'Account updated' : 'Account added'); onClose(); } catch { onSuccess('Failed to save account', 'error'); } };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>{record ? 'Edit Bank Account' : 'Add Bank Account'}<IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton></DialogTitle>
      <DialogContent dividers><Stack spacing={2}>
        <TextField label="Bank Name" size="small" fullWidth value={form.bank_name} onChange={f('bank_name')} />
        <TextField label="Account Name" size="small" fullWidth value={form.account_name} onChange={f('account_name')} />
        <TextField label="Account Number" size="small" fullWidth value={form.account_number} onChange={f('account_number')} />
        <FormControl fullWidth size="small"><InputLabel>Currency</InputLabel><Select value={form.currency} label="Currency" onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>{['USD','KES','EUR','GBP','UGX','TZS'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl>
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}>Save</Button></DialogActions>
    </Dialog>
  );
}

function TransferModal({ open, onClose, accounts, onSuccess }: { open: boolean; onClose: () => void; accounts: BankAccount[]; onSuccess: (m: string, s?: 'success' | 'error') => void }) {
  const create = useCreateTransfer();
  const [form, setForm] = useState({ from_account_id: '', to_account_id: '', amount: '', reference: '', reason: '', transfer_date: new Date().toISOString().slice(0, 10) });
  useEffect(() => { if (!open) return; setForm({ from_account_id: '', to_account_id: '', amount: '', reference: '', reason: '', transfer_date: new Date().toISOString().slice(0, 10) }); }, [open]);
  const handleSave = async () => { try { await create.mutateAsync(form as Record<string, unknown>); onSuccess('Transfer created'); onClose(); } catch { onSuccess('Failed to create transfer', 'error'); } };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>New Transfer<IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton></DialogTitle>
      <DialogContent dividers><Stack spacing={2}>
        <FormControl fullWidth size="small"><InputLabel>From Account</InputLabel><Select value={form.from_account_id} label="From Account" onChange={e => setForm(p => ({ ...p, from_account_id: e.target.value }))}>{accounts.map(a => <MenuItem key={a.id} value={a.id}>{a.account_name} – {a.bank_name}</MenuItem>)}</Select></FormControl>
        <FormControl fullWidth size="small"><InputLabel>To Account</InputLabel><Select value={form.to_account_id} label="To Account" onChange={e => setForm(p => ({ ...p, to_account_id: e.target.value }))}>{accounts.map(a => <MenuItem key={a.id} value={a.id}>{a.account_name} – {a.bank_name}</MenuItem>)}</Select></FormControl>
        <TextField label="Amount" size="small" type="number" fullWidth value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
        <TextField label="Transfer Date" type="date" size="small" fullWidth value={form.transfer_date} onChange={e => setForm(p => ({ ...p, transfer_date: e.target.value }))} InputLabelProps={{ shrink: true }} />
        <TextField label="Reference" size="small" fullWidth value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={create.isPending} startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}>Save</Button></DialogActions>
    </Dialog>
  );
}

export default function BankingSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0); const [editAcc, setEditAcc] = useState<BankAccount | null>(null);
  const { data: accData, isLoading: accLoading } = useBankAccounts();
  const { data: txnData, isLoading: txnLoading } = useTransactions();
  const { data: trfData, isLoading: trfLoading } = useInternalTransfers();
  const delAcc = useDeleteBankAccount(); const delTxn = useDeleteTransaction(); const delTrf = useDeleteTransfer();
  const accounts = accData?.results ?? []; const txns = txnData?.results ?? []; const transfers = trfData?.results ?? [];
  const isAccounts = subTab === 'bank-accounts'; const isRecon = subTab === 'reconciliation'; const isTransfers = subTab === 'transfers';
  const ACC_COLS: TableColumn<BankAccount>[] = [
    { id: 'account_name', label: 'Account Name', sortable: true, minWidth: 160 },
    { id: 'bank_name', label: 'Bank', sortable: true },
    { id: 'account_number', label: 'Account #' },
    { id: 'currency', label: 'Currency' },
    { id: 'balance', label: 'Balance', align: 'right', format: v => formatCurrency(Number(v ?? 0)) },
    { id: 'is_default', label: 'Default', format: v => <StatusChip status={v ? 'active' : 'inactive'} label={v ? 'Default' : 'Secondary'} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={[commonActions.edit(() => setEditAcc(row)), commonActions.delete(() => delAcc.mutate(row.id, { onSuccess: () => notify('Account deleted'), onError: () => notify('Failed to delete', 'error') }))]} /> },
  ];
  const TXN_COLS: TableColumn<BankTransaction>[] = [
    { id: 'transaction_date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'transaction_type', label: 'Type' }, { id: 'reference', label: 'Reference' }, { id: 'narration', label: 'Narration' },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    { id: 'amount', label: 'Amount', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={[commonActions.delete(() => delTxn.mutate(row.id, { onSuccess: () => notify('Transaction deleted'), onError: () => notify('Failed to delete', 'error') }))]} /> },
  ];
  const TRF_COLS: TableColumn<InternalTransfer>[] = [
    { id: 'transfer_date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'from_account_name', label: 'From' }, { id: 'to_account_name', label: 'To' }, { id: 'reference', label: 'Reference' },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    { id: 'amount', label: 'Amount', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={[commonActions.delete(() => delTrf.mutate(row.id, { onSuccess: () => notify('Transfer deleted'), onError: () => notify('Failed to delete', 'error') }))]} /> },
  ];
  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Total Balance" value={formatCurrency(accounts.reduce((s, a) => s + (a.balance ?? 0), 0))} trend="up" color="#2E7D32" loading={accLoading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Bank Accounts" value={accounts.length} trend="neutral" color="#1565C0" loading={accLoading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Transactions" value={txns.length} trend="neutral" color="#F57C00" loading={txnLoading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Transfers" value={transfers.length} trend="neutral" color="#7B1FA2" loading={trfLoading} /></Grid>
      </Grid>
      {isAccounts && <DataTable columns={ACC_COLS} rows={accounts} loading={accLoading} total={accounts.length} page={page} pageSize={25} onPageChange={setPage} onSearch={() => {}} searchPlaceholder="Search accounts..." getRowId={r => r.id} emptyMessage="No bank accounts yet." />}
      {isRecon && <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>Select an account and period to start reconciliation.</Typography>}
      {isTransfers && <DataTable columns={TRF_COLS} rows={transfers} loading={trfLoading} total={transfers.length} page={page} pageSize={25} onPageChange={setPage} onSearch={() => {}} searchPlaceholder="Search transfers..." getRowId={r => r.id} emptyMessage="No transfers yet." />}
      <BankAccountModal open={(addOpen && isAccounts) || !!editAcc} onClose={() => { setAddOpen(false); setEditAcc(null); }} record={editAcc} onSuccess={(m, s) => { notify(m, s); setAddOpen(false); setEditAcc(null); }} />
      <TransferModal open={addOpen && isTransfers} onClose={() => setAddOpen(false)} accounts={accounts} onSuccess={(m, s) => { notify(m, s); setAddOpen(false); }} />
    </>
  );
}
