'use client';

import { useState } from 'react';
import { Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { useExpenses, useCreateExpense } from '@/hooks/useFinance';
import type { Expense } from '@/services/financeService';
import type { SectionProps } from './_shared';

function CashLogModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (m: string, s?: 'success' | 'error') => void }) {
  const create = useCreateExpense();
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), description: '', amount: '', reference: '' });
  const handleSave = async () => {
    try {
      await create.mutateAsync({ ...form, amount: Number(form.amount), category: 'OPERATING', payment_method: 'cash' } as Record<string, unknown>);
      onSuccess('Entry added'); onClose();
    } catch { onSuccess('Failed to add entry', 'error'); }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>Add Cash Entry<IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton></DialogTitle>
      <DialogContent dividers><Stack spacing={2}>
        <TextField label="Date" type="date" size="small" fullWidth value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
        <TextField label="Description" size="small" fullWidth value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        <TextField label="Amount" size="small" type="number" fullWidth value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
        <TextField label="Reference" size="small" fullWidth value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={create.isPending} startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}>Save</Button></DialogActions>
    </Dialog>
  );
}

export default function PettyCashSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useExpenses({ payment_method: 'cash' });
  const entries = data?.expenses ?? [];
  const total = entries.reduce((s, e) => s + (e.amount ?? 0), 0);

  const COLS: TableColumn<Expense>[] = [
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'description', label: 'Description', minWidth: 200 },
    { id: 'reference', label: 'Reference' },
    { id: 'amount', label: 'Amount', align: 'right', format: v => formatCurrency(Number(v)) },
  ];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Total Cash Out" value={formatCurrency(total)} trend="down" color="#C62828" loading={isLoading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Entries" value={entries.length} trend="neutral" color="#1565C0" loading={isLoading} /></Grid>
      </Grid>
      {subTab === 'cash-log' && (
        <DataTable columns={COLS} rows={entries} loading={isLoading} total={entries.length} page={page} pageSize={25} onPageChange={setPage} onSearch={() => {}} searchPlaceholder="Search cash log..." getRowId={r => r.id} emptyMessage="No petty cash entries yet." />
      )}
      {subTab === 'receipts' && <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>Receipts — attach and manage petty cash receipts.</Typography>}
      {subTab === 'reconcile' && <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>Reconcile petty cash against physical count.</Typography>}
      <CashLogModal open={addOpen && subTab === 'cash-log'} onClose={() => setAddOpen(false)} onSuccess={(m, s) => { notify(m, s); setAddOpen(false); }} />
    </>
  );
}
