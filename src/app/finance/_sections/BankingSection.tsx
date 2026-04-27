'use client';

import { useState, useEffect } from 'react';
import {
  Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  CircularProgress, Grid, Typography, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import {
  useBankAccounts, useDeleteBankAccount,
  useTransactions, useCreateTransaction, useDeleteTransaction,
  useInternalTransfers, useCreateTransfer, useDeleteTransfer,
} from '@/hooks/useFinance';
import financeService from '@/services/financeService';
import type { BankAccount, BankTransaction, InternalTransfer, BankReconciliation } from '@/services/financeService';
import type { SectionProps } from './_shared';
import BankAccountModalEnhanced from '@/modules/banking/modals/BankAccountModal';

// ─── Bank Account Modal ───────────────────────────────────────────────────────
function BankAccountModal({ open, onClose, record, onSuccess }: {
  open: boolean; onClose: () => void; record?: BankAccount | null;
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const handleSuccess = () => {
    onSuccess(record ? 'Account updated' : 'Account added');
    onClose();
  };

  return (
    <BankAccountModalEnhanced
      open={open}
      onClose={onClose}
      account={record}
      onSuccess={handleSuccess}
    />
  );
}

// ─── Transaction Modal (Deposit / Withdrawal) ─────────────────────────────────
function TransactionModal({ open, onClose, accounts, onSuccess }: {
  open: boolean; onClose: () => void; accounts: BankAccount[];
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const create = useCreateTransaction();
  const [form, setForm] = useState({
    bank_account_id: '', transaction_type: 'deposit', amount: '',
    reference: '', narration: '', transaction_date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      bank_account_id: accounts[0]?.id ?? '',
      transaction_type: 'deposit', amount: '', reference: '', narration: '',
      transaction_date: new Date().toISOString().slice(0, 10),
    });
    setError('');
  }, [open, accounts]);

  const handleSave = async () => {
    if (!form.bank_account_id) { setError('Select a bank account'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError('Amount must be greater than 0'); return; }
    setError('');
    try {
      await create.mutateAsync({
        bank_account_id: form.bank_account_id,
        transaction_type: form.transaction_type,
        amount: Number(form.amount),
        reference: form.reference,
        narration: form.narration,
        transaction_date: form.transaction_date,
      } as Record<string, unknown>);
      onSuccess(`${form.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal'} recorded`);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to record transaction');
    }
  };

  const selectedAccount = accounts.find(a => a.id === form.bank_account_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Record Transaction
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormControl fullWidth size="small">
            <InputLabel>Bank Account</InputLabel>
            <Select value={form.bank_account_id} label="Bank Account"
              onChange={e => setForm(p => ({ ...p, bank_account_id: e.target.value }))}>
              {accounts.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  {a.account_name} — {a.bank_name} ({a.currency} {formatCurrency(a.balance ?? 0)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Transaction Type</InputLabel>
            <Select value={form.transaction_type} label="Transaction Type"
              onChange={e => setForm(p => ({ ...p, transaction_type: e.target.value }))}>
              <MenuItem value="deposit">Deposit (Money In)</MenuItem>
              <MenuItem value="withdrawal">Withdrawal (Money Out)</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Amount" size="small" type="number" fullWidth value={form.amount}
            onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
            inputProps={{ min: 0.01, step: 0.01 }} />
          <TextField label="Date" type="date" size="small" fullWidth value={form.transaction_date}
            onChange={e => setForm(p => ({ ...p, transaction_date: e.target.value }))}
            InputLabelProps={{ shrink: true }} />
          <TextField label="Reference (optional)" size="small" fullWidth value={form.reference}
            onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
          <TextField label="Narration / Description (optional)" size="small" fullWidth value={form.narration}
            onChange={e => setForm(p => ({ ...p, narration: e.target.value }))} />
          {selectedAccount && form.amount && (
            <Typography variant="caption" color={form.transaction_type === 'deposit' ? 'success.main' : 'error.main'}>
              New balance will be: {formatCurrency(
                (selectedAccount.balance ?? 0) + (form.transaction_type === 'deposit' ? Number(form.amount) : -Number(form.amount))
              )}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={create.isPending}
          startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}>
          Record
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Transfer Modal ───────────────────────────────────────────────────────────
function TransferModal({ open, onClose, accounts, onSuccess }: {
  open: boolean; onClose: () => void; accounts: BankAccount[];
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const create = useCreateTransfer();
  const [form, setForm] = useState({
    from_account_id: '', to_account_id: '', amount: '', reference: '', reason: '',
    transfer_date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({ from_account_id: '', to_account_id: '', amount: '', reference: '', reason: '', transfer_date: new Date().toISOString().slice(0, 10) });
    setError('');
  }, [open]);

  const handleSave = async () => {
    if (form.from_account_id === form.to_account_id) { setError('Source and destination must be different'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError('Amount must be greater than 0'); return; }
    setError('');
    try {
      await create.mutateAsync(form as Record<string, unknown>);
      onSuccess('Transfer created');
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create transfer');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Internal Transfer
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormControl fullWidth size="small">
            <InputLabel>From Account</InputLabel>
            <Select value={form.from_account_id} label="From Account"
              onChange={e => setForm(p => ({ ...p, from_account_id: e.target.value }))}>
              {accounts.map(a => <MenuItem key={a.id} value={a.id}>{a.account_name} — {a.bank_name} (Bal: {formatCurrency(a.balance ?? 0)})</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>To Account</InputLabel>
            <Select value={form.to_account_id} label="To Account"
              onChange={e => setForm(p => ({ ...p, to_account_id: e.target.value }))}>
              {accounts.filter(a => a.id !== form.from_account_id).map(a => <MenuItem key={a.id} value={a.id}>{a.account_name} — {a.bank_name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Amount" size="small" type="number" fullWidth value={form.amount}
            onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} inputProps={{ min: 0.01, step: 0.01 }} />
          <TextField label="Transfer Date" type="date" size="small" fullWidth value={form.transfer_date}
            onChange={e => setForm(p => ({ ...p, transfer_date: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField label="Reference (optional)" size="small" fullWidth value={form.reference}
            onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
          <TextField label="Reason (optional)" size="small" fullWidth value={form.reason}
            onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={create.isPending}
          startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}>
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Reconciliation Modal ─────────────────────────────────────────────────────
function ReconciliationModal({ open, onClose, accounts, onSuccess }: {
  open: boolean; onClose: () => void; accounts: BankAccount[];
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const [form, setForm] = useState({ bank_account_id: '', period_start: '', period_end: '', opening_balance: '', closing_balance: '', statement_balance: '', book_balance: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    setForm({ bank_account_id: accounts[0]?.id ?? '', period_start: firstDay, period_end: lastDay, opening_balance: '', closing_balance: '', statement_balance: '', book_balance: '' });
  }, [open, accounts]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await financeService.createBankReconciliation({
        bank_account_id: form.bank_account_id,
        period_start: form.period_start,
        period_end: form.period_end,
        opening_balance: Number(form.opening_balance),
        closing_balance: Number(form.closing_balance),
        statement_balance: Number(form.statement_balance),
        book_balance: Number(form.book_balance),
      });
      onSuccess('Reconciliation created');
      onClose();
    } catch { onSuccess('Failed to create reconciliation', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        New Bank Reconciliation
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Bank Account</InputLabel>
            <Select value={form.bank_account_id} label="Bank Account"
              onChange={e => setForm(p => ({ ...p, bank_account_id: e.target.value }))}>
              {accounts.map(a => <MenuItem key={a.id} value={a.id}>{a.account_name} — {a.bank_name}</MenuItem>)}
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid size={6}><TextField label="Period Start" type="date" size="small" fullWidth value={form.period_start} onChange={e => setForm(p => ({ ...p, period_start: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid size={6}><TextField label="Period End" type="date" size="small" fullWidth value={form.period_end} onChange={e => setForm(p => ({ ...p, period_end: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={6}><TextField label="Opening Balance" size="small" type="number" fullWidth value={form.opening_balance} onChange={e => setForm(p => ({ ...p, opening_balance: e.target.value }))} /></Grid>
            <Grid size={6}><TextField label="Closing Balance" size="small" type="number" fullWidth value={form.closing_balance} onChange={e => setForm(p => ({ ...p, closing_balance: e.target.value }))} /></Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={6}><TextField label="Statement Balance" size="small" type="number" fullWidth value={form.statement_balance} onChange={e => setForm(p => ({ ...p, statement_balance: e.target.value }))} /></Grid>
            <Grid size={6}><TextField label="Book Balance" size="small" type="number" fullWidth value={form.book_balance} onChange={e => setForm(p => ({ ...p, book_balance: e.target.value }))} /></Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function BankingSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0);
  const [editAcc, setEditAcc] = useState<BankAccount | null>(null);
  const [txnOpen, setTxnOpen] = useState(false);
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);

  const { data: accData, isLoading: accLoading } = useBankAccounts();
  const { data: txnData, isLoading: txnLoading } = useTransactions();
  const { data: trfData, isLoading: trfLoading } = useInternalTransfers();
  const delAcc = useDeleteBankAccount();
  const delTxn = useDeleteTransaction();
  const delTrf = useDeleteTransfer();

  const accounts = accData?.results ?? [];
  const txns = txnData?.results ?? [];
  const transfers = trfData?.results ?? [];

  const isAccounts = subTab === 'bank-accounts';
  const isTransactions = subTab === 'transactions';
  const isTransfers = subTab === 'transfers';
  const isRecon = subTab === 'reconciliation';

  useEffect(() => {
    if (isRecon) {
      financeService.getBankReconciliations()
        .then(r => setReconciliations(r.data?.reconciliations ?? []))
        .catch(() => setReconciliations([]));
    }
  }, [isRecon]);

  const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0);

  const handleDeleteRecon = async (id: string) => {
    try {
      await financeService.deleteBankReconciliation(id);
      notify('Reconciliation deleted');
      financeService.getBankReconciliations().then(r => setReconciliations(r.data?.reconciliations ?? []));
    } catch { notify('Failed to delete', 'error'); }
  };

  const handleCompleteRecon = async (id: string) => {
    try {
      await financeService.completeBankReconciliation(id);
      notify('Reconciliation completed');
      financeService.getBankReconciliations().then(r => setReconciliations(r.data?.reconciliations ?? []));
    } catch { notify('Failed to complete', 'error'); }
  };

  const ACC_COLS: TableColumn<BankAccount>[] = [
    { id: 'account_name', label: 'Account Name', sortable: true, minWidth: 160 },
    { id: 'bank_name', label: 'Bank', sortable: true },
    { id: 'account_number', label: 'Account #' },
    { id: 'currency', label: 'Currency' },
    {
      id: 'balance', label: 'Balance', align: 'right',
      format: v => (
        <Typography variant="body2" fontWeight={600} color={(v as number) >= 0 ? 'success.main' : 'error.main'}>
          {formatCurrency(Number(v ?? 0))}
        </Typography>
      ),
    },
    { id: 'is_default', label: 'Default', format: v => <StatusChip status={v ? 'active' : 'inactive'} label={v ? 'Default' : 'Secondary'} /> },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          commonActions.edit(() => setEditAcc(row)),
          commonActions.delete(() => delAcc.mutate(row.id, {
            onSuccess: () => notify('Account deleted'),
            onError: () => notify('Failed to delete', 'error'),
          })),
        ]} />
      ),
    },
  ];

  const TXN_COLS: TableColumn<BankTransaction>[] = [
    { id: 'transaction_date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'bank_account_name', label: 'Account', minWidth: 140 },
    {
      id: 'transaction_type', label: 'Type', format: v => {
        const t = String(v);
        const color = ['deposit', 'transfer_in'].includes(t) ? 'success' : 'error';
        const label = t === 'deposit' ? '↑ Deposit' : t === 'withdrawal' ? '↓ Withdrawal' : t === 'transfer_in' ? '↑ Transfer In' : t === 'transfer_out' ? '↓ Transfer Out' : t;
        return <StatusChip status={color} label={label} />;
      },
    },
    { id: 'reference', label: 'Reference' },
    { id: 'narration', label: 'Narration', minWidth: 160 },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    {
      id: 'amount', label: 'Amount', align: 'right', format: (v, row) => {
        const isIn = ['deposit', 'transfer_in'].includes(String((row as any).transaction_type));
        return (
          <Typography variant="body2" fontWeight={600} color={isIn ? 'success.main' : 'error.main'}>
            {isIn ? '+' : '-'}{formatCurrency(Number(v))}
          </Typography>
        );
      },
    },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          commonActions.delete(() => delTxn.mutate(row.id, {
            onSuccess: () => notify('Transaction deleted'),
            onError: () => notify('Failed to delete', 'error'),
          })),
        ]} />
      ),
    },
  ];

  const TRF_COLS: TableColumn<InternalTransfer>[] = [
    { id: 'transfer_date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'from_account_name', label: 'From' },
    { id: 'to_account_name', label: 'To' },
    { id: 'reference', label: 'Reference' },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    { id: 'amount', label: 'Amount', align: 'right', format: v => formatCurrency(Number(v)) },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          commonActions.delete(() => delTrf.mutate(row.id, {
            onSuccess: () => notify('Transfer deleted'),
            onError: () => notify('Failed to delete', 'error'),
          })),
        ]} />
      ),
    },
  ];

  const RECON_COLS: TableColumn<BankReconciliation>[] = [
    { id: 'period_start', label: 'Period Start', sortable: true, format: v => formatDate(v as string) },
    { id: 'period_end', label: 'Period End', format: v => formatDate(v as string) },
    { id: 'opening_balance', label: 'Opening', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'closing_balance', label: 'Closing', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          ...(row.status === 'open' ? [{ label: 'Complete', onClick: () => handleCompleteRecon(row.id) }] : []),
          commonActions.delete(() => handleDeleteRecon(row.id)),
        ]} />
      ),
    },
  ];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Balance" value={formatCurrency(totalBalance)} trend="up" color="#2E7D32" loading={accLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Bank Accounts" value={accounts.length} trend="neutral" color="#1565C0" loading={accLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Transactions" value={txns.length} trend="neutral" color="#F57C00" loading={txnLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Transfers" value={transfers.length} trend="neutral" color="#7B1FA2" loading={trfLoading} />
        </Grid>
      </Grid>

      {isAccounts && (
        <DataTable
          columns={ACC_COLS} rows={accounts} loading={accLoading}
          total={accounts.length} page={page} pageSize={25} onPageChange={setPage}
          onSearch={() => {}} searchPlaceholder="Search accounts..."
          getRowId={r => r.id} emptyMessage="No bank accounts yet."
          toolbar={
            <Button size="small" variant="outlined" startIcon={<AddIcon />}
              onClick={() => setTxnOpen(true)} disabled={accounts.length === 0}>
              Record Transaction
            </Button>
          }
        />
      )}

      {isTransactions && (
        <DataTable
          columns={TXN_COLS} rows={txns} loading={txnLoading}
          total={txns.length} page={page} pageSize={25} onPageChange={setPage}
          onSearch={() => {}} searchPlaceholder="Search transactions..."
          getRowId={r => r.id} emptyMessage="No transactions yet."
          toolbar={
            <Button size="small" variant="outlined" startIcon={<AddIcon />}
              onClick={() => setTxnOpen(true)} disabled={accounts.length === 0}>
              Record Transaction
            </Button>
          }
        />
      )}

      {isTransfers && (
        <DataTable
          columns={TRF_COLS} rows={transfers} loading={trfLoading}
          total={transfers.length} page={page} pageSize={25} onPageChange={setPage}
          onSearch={() => {}} searchPlaceholder="Search transfers..."
          getRowId={r => r.id} emptyMessage="No transfers yet."
        />
      )}

      {isRecon && (
        <DataTable
          columns={RECON_COLS} rows={reconciliations} loading={false}
          total={reconciliations.length} page={page} pageSize={25} onPageChange={setPage}
          onSearch={() => {}} searchPlaceholder="Search reconciliations..."
          getRowId={r => r.id} emptyMessage="No reconciliations yet."
        />
      )}

      <BankAccountModal
        open={(addOpen && isAccounts) || !!editAcc}
        onClose={() => { setAddOpen(false); setEditAcc(null); }}
        record={editAcc}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); setEditAcc(null); }}
      />

      <TransactionModal
        open={txnOpen || (addOpen && isTransactions)}
        onClose={() => { setTxnOpen(false); setAddOpen(false); }}
        accounts={accounts}
        onSuccess={(m, s) => { notify(m, s); setTxnOpen(false); setAddOpen(false); }}
      />

      <TransferModal
        open={addOpen && isTransfers}
        onClose={() => setAddOpen(false)}
        accounts={accounts}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); }}
      />

      <ReconciliationModal
        open={addOpen && isRecon}
        onClose={() => setAddOpen(false)}
        accounts={accounts}
        onSuccess={(m, s) => {
          notify(m, s);
          setAddOpen(false);
          financeService.getBankReconciliations().then(r => setReconciliations(r.data?.reconciliations ?? []));
        }}
      />
    </>
  );
}
