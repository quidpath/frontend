'use client';

import { useState, useEffect } from 'react';
import {
  Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  CircularProgress, Grid, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import {
  useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense,
  useVendors, useAccounts,
} from '@/hooks/useFinance';
import financeService from '@/services/financeService';
import type { Expense } from '@/services/financeService';
import type { SectionProps } from './_shared';

const CATEGORIES = ['OPERATING', 'ADMINISTRATIVE', 'SELLING', 'FINANCIAL', 'OTHER'];

function ExpenseModal({ open, onClose, record, onSuccess }: {
  open: boolean; onClose: () => void; record?: Expense | null;
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const { data: vendData } = useVendors();
  const { data: accData } = useAccounts();
  const vendors = vendData?.vendors ?? [];
  const allAccounts = accData?.accounts ?? [];
  const expenseAccounts = allAccounts.filter(a =>
    String(a.account_type ?? '').toUpperCase() === 'EXPENSE'
  );
  const paymentAccounts = allAccounts.filter(a =>
    String(a.account_type ?? '').toUpperCase() === 'ASSET'
  );
  const saving = create.isPending || update.isPending;

  const [form, setForm] = useState({
    date: '', vendor_id: '', category: 'OPERATING', description: '',
    amount: '', expense_account_id: '', payment_account_id: '',
  });

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        date: record.date,
        vendor_id: record.vendor_id ?? '',
        category: record.category,
        description: record.description,
        amount: String(record.amount),
        expense_account_id: (record as any).expense_account_id ?? '',
        payment_account_id: (record as any).payment_account_id ?? '',
      });
    } else {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        vendor_id: '', category: 'OPERATING', description: '', amount: '',
        expense_account_id: '', payment_account_id: '',
      });
    }
  }, [record, open]);

  useEffect(() => {
    if (open && allAccounts.length === 0) {
      financeService.seedDefaultAccounts().catch(() => {});
    }
  }, [open, allAccounts.length]);

  const handleSave = async () => {
    try {
      const payload: Record<string, unknown> = {
        date: form.date,
        vendor_id: form.vendor_id || undefined,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
      };
      if (form.expense_account_id) payload.expense_account_id = form.expense_account_id;
      if (form.payment_account_id) payload.payment_account_id = form.payment_account_id;
      if (record) await update.mutateAsync({ id: record.id, ...payload });
      else await create.mutateAsync(payload);
      onSuccess(record ? 'Expense updated' : 'Expense logged');
      onClose();
    } catch (e: any) {
      onSuccess(e?.response?.data?.message || 'Failed to save expense', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {record ? 'Edit Expense' : 'Log Expense'}
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField label="Date" type="date" size="small" fullWidth value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
            <TextField label="Amount" size="small" type="number" fullWidth value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
          </Stack>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select value={form.category} label="Category" onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Vendor (optional)</InputLabel>
            <Select value={form.vendor_id} label="Vendor (optional)" onChange={e => setForm(p => ({ ...p, vendor_id: e.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {vendors.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Description" size="small" fullWidth multiline rows={2} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <Typography variant="caption" color="text.secondary">
            Accounts are auto-assigned. Override below if needed.
          </Typography>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Expense Account (auto)</InputLabel>
              <Select value={form.expense_account_id} label="Expense Account (auto)"
                onChange={e => setForm(p => ({ ...p, expense_account_id: e.target.value }))}>
                <MenuItem value="">Auto-assign</MenuItem>
                {(expenseAccounts.length > 0 ? expenseAccounts : allAccounts).map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.code} – {a.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Account (auto)</InputLabel>
              <Select value={form.payment_account_id} label="Payment Account (auto)"
                onChange={e => setForm(p => ({ ...p, payment_account_id: e.target.value }))}>
                <MenuItem value="">Auto-assign</MenuItem>
                {(paymentAccounts.length > 0 ? paymentAccounts : allAccounts).map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.code} – {a.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ExpensesSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0);
  const [editExp, setEditExp] = useState<Expense | null>(null);
  const { data, isLoading } = useExpenses();
  const del = useDeleteExpense();
  const allExpenses = data?.expenses ?? [];
  const expenses = subTab === 'pending-approval'
    ? allExpenses.filter(e => e.status === 'PENDING' || e.status === 'pending')
    : subTab === 'reimbursements'
    ? allExpenses.filter(e => e.status === 'APPROVED' || e.status === 'approved')
    : allExpenses;

  const COLS: TableColumn<Expense>[] = [
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'reference', label: 'Reference', minWidth: 120 },
    { id: 'category', label: 'Category', sortable: true },
    { id: 'description', label: 'Description', minWidth: 180 },
    { id: 'vendor', label: 'Vendor' },
    { id: 'amount', label: 'Amount', align: 'right', format: v => formatCurrency(Number(v)) },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          commonActions.edit(() => setEditExp(row)),
          commonActions.delete(() => del.mutate(row.id, {
            onSuccess: () => notify('Expense deleted'),
            onError: () => notify('Failed to delete', 'error'),
          })),
        ]} />
      ),
    },
  ];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Expenses" value={formatCurrency(expenses.reduce((s, e) => s + (e.amount ?? 0), 0))} trend="down" color="#C62828" loading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="This Month" value={formatCurrency(allExpenses.filter(e => e.date?.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, e) => s + (e.amount ?? 0), 0))} trend="neutral" color="#F57C00" loading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Categories" value={new Set(allExpenses.map(e => e.category)).size} trend="neutral" color="#2E7D32" loading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Count" value={expenses.length} trend="neutral" color="#1565C0" loading={isLoading} />
        </Grid>
      </Grid>
      <DataTable
        columns={COLS} rows={expenses} loading={isLoading} total={expenses.length}
        page={page} pageSize={25} onPageChange={setPage}
        onSearch={() => {}} searchPlaceholder="Search expenses..."
        getRowId={r => r.id} emptyMessage="No expenses yet."
      />
      <ExpenseModal
        open={addOpen || !!editExp}
        onClose={() => { setAddOpen(false); setEditExp(null); }}
        record={editExp}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); setEditExp(null); }}
      />
    </>
  );
}
