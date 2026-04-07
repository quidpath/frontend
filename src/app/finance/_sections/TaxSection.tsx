'use client';

import { useEffect, useState } from 'react';
import { Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, CircularProgress, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import { formatCurrency } from '@/utils/formatters';
import { TableColumn } from '@/types';
import financeService from '@/services/financeService';
import type { SectionProps } from './_shared';

interface TaxRate {
  id: string; name: string; rate: number; description: string;
  is_active: boolean; created_at: string;
}

type SalesSummaryData = { total_invoiced?: number; total_paid?: number; total_overdue?: number; quotes_pending?: number };

function TaxRateModal({ open, onClose, record, onSuccess }: { open: boolean; onClose: () => void; record?: TaxRate | null; onSuccess: (m: string, s?: 'success' | 'error') => void }) {
  const [form, setForm] = useState({ name: '', rate: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({ name: record.name, rate: String(record.rate), description: record.description });
    } else {
      setForm({ name: '', rate: '', description: '' });
    }
  }, [record, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form, rate: Number(form.rate) };
      if (record) {
        await financeService.updateTaxRate({ id: record.id, ...data });
        onSuccess('Tax rate updated');
      } else {
        await financeService.createTaxRate(data);
        onSuccess('Tax rate created');
      }
      onClose();
    } catch { onSuccess('Failed to save tax rate', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>{record ? 'Edit Tax Rate' : 'Create Tax Rate'}<IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton></DialogTitle>
      <DialogContent dividers><Stack spacing={2}>
        <TextField label="Name" size="small" fullWidth value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., VAT, Sales Tax" />
        <TextField label="Rate (%)" size="small" type="number" fullWidth value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} inputProps={{ step: '0.01', min: '0', max: '100' }} />
        <TextField label="Description" size="small" fullWidth multiline rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}>Save</Button></DialogActions>
    </Dialog>
  );
}

export default function TaxSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [editRate, setEditRate] = useState<TaxRate | null>(null);
  const [data, setData] = useState<SalesSummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      financeService.getTaxRates().then(r => setTaxRates(r.data?.tax_rates ?? [])),
      financeService.getSalesSummary().then(r => setData(r.data as SalesSummaryData))
    ]).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await financeService.deleteTaxRate(id);
      notify('Tax rate deleted');
      financeService.getTaxRates().then(r => setTaxRates(r.data?.tax_rates ?? []));
    } catch { notify('Failed to delete', 'error'); }
  };

  const TAX_RATE_COLS: TableColumn<TaxRate>[] = [
    { id: 'name', label: 'Name', sortable: true, minWidth: 160 },
    { id: 'rate', label: 'Rate', align: 'right', format: v => `${Number(v).toFixed(2)}%` },
    { id: 'description', label: 'Description', minWidth: 200 },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
      <ActionMenu actions={[
        commonActions.edit(() => setEditRate(row)),
        commonActions.delete(() => handleDelete(row.id))
      ]} />
    )},
  ];

  const REPORT_COLS: TableColumn<{ metric: string; value: string }>[] = [
    { id: 'metric', label: 'Metric', minWidth: 200 },
    { id: 'value', label: 'Value', align: 'right' },
  ];

  const reportRows = data
    ? Object.entries(data).map(([k, v]) => ({ metric: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: typeof v === 'number' ? formatCurrency(v) : String(v ?? '—') }))
    : [];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Total Invoiced" value={data ? formatCurrency(data.total_invoiced ?? 0) : '—'} trend="up" color="#2E7D32" loading={loading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Total Paid" value={data ? formatCurrency(data.total_paid ?? 0) : '—'} trend="up" color="#1565C0" loading={loading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Total Overdue" value={data ? formatCurrency(data.total_overdue ?? 0) : '—'} trend="down" color="#C62828" loading={loading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Tax Rates" value={taxRates.length} trend="neutral" color="#F57C00" loading={loading} /></Grid>
      </Grid>
      {subTab === 'tax-rates' && (
        <DataTable columns={TAX_RATE_COLS} rows={taxRates} loading={loading} total={taxRates.length} page={0} pageSize={25} onSearch={() => {}} searchPlaceholder="Search tax rates..." getRowId={r => r.id} emptyMessage="No tax rates configured yet." />
      )}
      {subTab === 'sales-tax-report' && (
        <DataTable columns={REPORT_COLS} rows={reportRows} total={reportRows.length} page={0} pageSize={25} getRowId={r => r.metric} emptyMessage="No tax report data available." />
      )}
      {subTab === 'filing-history' && (
        <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>Tax filing history — records of submitted tax returns.</Typography>
      )}
      <TaxRateModal open={(addOpen && subTab === 'tax-rates') || !!editRate} onClose={() => { setAddOpen(false); setEditRate(null); }} record={editRate} onSuccess={(m, s) => { notify(m, s); setAddOpen(false); setEditRate(null); financeService.getTaxRates().then(r => setTaxRates(r.data?.tax_rates ?? [])); }} />
    </>
  );
}
