'use client';

import { useState, useEffect } from 'react';
import {
  Box, Stack, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Grid, Typography, Divider, Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import UniversalModal from '@/components/ui/UniversalModal';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { useJournalEntries } from '@/hooks/useAccounting';
import { useCreateJournalEntry, useDeleteJournalEntry } from '@/hooks/useAccountingMutations';
import { useAccounts } from '@/hooks/useFinance';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import financeService from '@/services/financeService';
import type { Account } from '@/services/financeService';
import type { SectionProps } from '../_shared';

function AccountModal({ open, onClose, record, onSuccess }: {
  open: boolean; onClose: () => void; record?: Account | null;
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
  const create = useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.createAccount(d), onSuccess: inv });
  const update = useMutation({ mutationFn: (d: Record<string, unknown>) => financeService.updateAccount(d), onSuccess: inv });
  const saving = create.isPending || update.isPending;
  
  // Fetch account types from backend
  const { data: accountTypesData, isLoading: loadingTypes, refetch: refetchTypes } = useQuery({
    queryKey: ['account-types'],
    queryFn: () => financeService.getAccountTypes(),
  });
  const accountTypes = (accountTypesData?.data?.account_types ?? []) as Array<{ id: string; name: string; description: string }>;

  // Auto-seed default accounts (which also creates AccountTypes) if none exist
  const [seeding, setSeeding] = useState(false);
  useEffect(() => {
    if (!loadingTypes && accountTypes.length === 0 && !seeding) {
      setSeeding(true);
      financeService.seedDefaultAccounts()
        .catch(() => {})
        .finally(() => { setSeeding(false); refetchTypes(); });
    }
  }, [loadingTypes, accountTypes.length]);
  
  const [form, setForm] = useState({ code: '', name: '', account_type_id: '', account_sub_type: '', description: '', is_active: true });

  useEffect(() => {
    if (!open) return;
    if (record) {
      // For edit mode, we need to find the account_type_id from the account_type name
      const accountTypeId = accountTypes.find(t => t.name === record.account_type)?.id ?? '';
      setForm({ 
        code: record.code, 
        name: record.name, 
        account_type_id: accountTypeId, 
        account_sub_type: record.account_sub_type ?? '', 
        description: record.description ?? '', 
        is_active: record.is_active 
      });
    } else {
      setForm({ code: '', name: '', account_type_id: '', account_sub_type: '', description: '', is_active: true });
    }
  }, [record, open, accountTypes]);

  const handleSave = async () => {
    try {
      if (record) await update.mutateAsync({ id: record.id, ...form });
      else await create.mutateAsync(form as Record<string, unknown>);
      onSuccess(record ? 'Account updated' : 'Account created'); onClose();
    } catch { onSuccess('Failed to save account', 'error'); }
  };

  return (
    <UniversalModal open={open} onClose={onClose} maxWidth="sm"
      title={record ? 'Edit Account' : 'New Account'} subtitle="Chart of Accounts entry"
      actions={<><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}>Save</Button></>}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Stack direction="row" spacing={2}>
          <TextField label="Code (auto-generated if blank)" size="small" fullWidth value={form.code}
            onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
            helperText="Leave blank to auto-generate" />
          <TextField label="Name" size="small" fullWidth value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select 
              value={form.account_type_id} 
              label="Type" 
              onChange={e => setForm(p => ({ ...p, account_type_id: e.target.value }))}
              disabled={loadingTypes || seeding}
            >
              {accountTypes.length > 0
                ? accountTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)
                : ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].map(n => (
                    <MenuItem key={n} value={n} disabled>{n} (loading...)</MenuItem>
                  ))
              }
            </Select>
          </FormControl>
          <FormControl fullWidth size="small"><InputLabel>Status</InputLabel>
            <Select value={form.is_active ? 'active' : 'inactive'} label="Status" onChange={e => setForm(p => ({ ...p, is_active: e.target.value === 'active' }))}>
              <MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <TextField label="Description" size="small" fullWidth multiline rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </Stack>
    </UniversalModal>
  );
}

function JournalModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const { data: accs } = useAccounts();
  const accounts = accs?.accounts ?? [];
  const create = useCreateJournalEntry();
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), reference: '', description: '' });
  const [lines, setLines] = useState([{ account_id: '', debit: '', credit: '', description: '' }]);
  const setLine = (i: number, k: string, v: string) => setLines(p => p.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSave = async () => {
    if (!balanced) { onSuccess('Debits and credits must balance', 'error'); return; }
    try { await create.mutateAsync({ ...form, lines }); onSuccess('Journal entry created'); onClose(); }
    catch { onSuccess('Failed to create journal entry', 'error'); }
  };

  return (
    <UniversalModal open={open} onClose={onClose} maxWidth="md"
      title="New Journal Entry" subtitle="Manual double-entry bookkeeping"
      actions={<><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={create.isPending || !balanced} startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}>Post Entry</Button></>}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Stack direction="row" spacing={2}>
          <TextField label="Date" type="date" size="small" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
          <TextField label="Reference" size="small" value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} fullWidth />
        </Stack>
        <TextField label="Description" size="small" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} fullWidth />
        <Typography variant="subtitle2" fontWeight={600}>Journal Lines</Typography>
        {lines.map((l, i) => (
          <Stack key={i} direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ flex: 2 }}><InputLabel>Account</InputLabel>
              <Select value={l.account_id} label="Account" onChange={e => setLine(i, 'account_id', e.target.value)}>
                {accounts.map(a => <MenuItem key={a.id} value={a.id}>{a.code} – {a.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Debit" size="small" type="number" value={l.debit} onChange={e => setLine(i, 'debit', e.target.value)} sx={{ flex: 1 }} />
            <TextField label="Credit" size="small" type="number" value={l.credit} onChange={e => setLine(i, 'credit', e.target.value)} sx={{ flex: 1 }} />
            <TextField label="Note" size="small" value={l.description} onChange={e => setLine(i, 'description', e.target.value)} sx={{ flex: 2 }} />
            <Button size="small" color="error" onClick={() => setLines(p => p.filter((_, idx) => idx !== i))} disabled={lines.length === 1} sx={{ minWidth: 32 }}>✕</Button>
          </Stack>
        ))}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button size="small" onClick={() => setLines(p => [...p, { account_id: '', debit: '', credit: '', description: '' }])}>+ Add Line</Button>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" color="text.secondary">Debit: <strong>{formatCurrency(totalDebit)}</strong></Typography>
            <Typography variant="caption" color="text.secondary">Credit: <strong>{formatCurrency(totalCredit)}</strong></Typography>
            <Chip size="small" label={balanced ? 'Balanced' : 'Unbalanced'} color={balanced ? 'success' : 'error'} />
          </Stack>
        </Stack>
      </Stack>
    </UniversalModal>
  );
}

function ReportRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5, px: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
      <Typography variant="body2" fontWeight={bold ? 700 : 400}>{label}</Typography>
      <Typography variant="body2" fontWeight={bold ? 700 : 500}>{formatCurrency(value)}</Typography>
    </Stack>
  );
}

function ReportBlock({ title, items }: { title: string; items: { name: string; amount: number }[] }) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" color="text.secondary" fontWeight={700}>{title}</Typography>
      {items.map((item, i) => <ReportRow key={i} label={item.name} value={item.amount} />)}
      <Divider sx={{ my: 0.5 }} />
      <ReportRow label={`Total ${title}`} value={total} bold />
    </Box>
  );
}

function FlatReport({ data, title }: { data: Record<string, unknown>; title: string }) {
  const rows = Object.entries(data).map(([k, v]) => ({ key: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: typeof v === 'number' ? formatCurrency(v) : String(v ?? '—') }));
  return (
    <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{title}</Typography>
      {rows.map(r => (
        <Stack key={r.key} direction="row" justifyContent="space-between" sx={{ py: 0.75, px: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">{r.key}</Typography>
          <Typography variant="body2" fontWeight={600}>{r.value}</Typography>
        </Stack>
      ))}
    </Box>
  );
}

function BalanceSheet() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    financeService.getBalanceSheet().then(r => setData(r.data as Record<string, unknown>)).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);
  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>;
  if (!data) return <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>No balance sheet data available.</Typography>;
  const assets = (data.assets as { name: string; amount: number }[]) ?? [];
  const liabilities = (data.liabilities as { name: string; amount: number }[]) ?? [];
  const equity = (data.equity as { name: string; amount: number }[]) ?? [];
  if (!assets.length && !liabilities.length && !equity.length) return <FlatReport data={data} title="Balance Sheet" />;
  return (
    <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Balance Sheet</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}><ReportBlock title="Assets" items={assets} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><ReportBlock title="Liabilities" items={liabilities} /><ReportBlock title="Equity" items={equity} /></Grid>
      </Grid>
    </Box>
  );
}

function ProfitLoss() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    financeService.getProfitAndLoss().then(r => setData(r.data as Record<string, unknown>)).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);
  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>;
  if (!data) return <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>No P&L data available.</Typography>;
  const revenue = (data.revenue as { name: string; amount: number }[]) ?? [];
  const expenses = (data.expenses as { name: string; amount: number }[]) ?? [];
  if (!revenue.length && !expenses.length) return <FlatReport data={data} title="Profit & Loss" />;
  const totalRevenue = revenue.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, i) => s + i.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  return (
    <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Profit & Loss Statement</Typography>
      <ReportBlock title="Revenue" items={revenue} />
      <ReportBlock title="Expenses" items={expenses} />
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" justifyContent="space-between" sx={{ px: 1, py: 1.5, bgcolor: netIncome >= 0 ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)', borderRadius: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>Net Income</Typography>
        <Typography variant="subtitle1" fontWeight={700} color={netIncome >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(netIncome)}</Typography>
      </Stack>
    </Box>
  );
}

function TrialBalance({ notify }: { notify: (m: string, s?: 'success' | 'error') => void }) {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await financeService.getTrialBalance({ as_of_date: asOfDate });
      setData(response.data);
      notify('Trial balance generated successfully');
    } catch (error) {
      notify('Failed to generate trial balance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await financeService.downloadTrialBalance({ as_of_date: asOfDate });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trial_balance_${asOfDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify('Trial balance downloaded successfully');
    } catch (error) {
      notify('Failed to download trial balance', 'error');
    }
  };

  const entries = data?.entries ?? [];
  const totals = data?.totals ?? { total_debit: 0, total_credit: 0, is_balanced: false };

  type TrialBalanceEntry = { id: string; account_code: string; account_name: string; debit: string; credit: string; balance: string };
  const TB_COLS: TableColumn<TrialBalanceEntry>[] = [
    { id: 'account_code', label: 'Code', sortable: true, minWidth: 80 },
    { id: 'account_name', label: 'Account', sortable: true, minWidth: 200 },
    { id: 'debit', label: 'Debit', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'credit', label: 'Credit', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'balance', label: 'Balance', align: 'right', format: v => formatCurrency(Number(v)) },
  ];

  return (
    <Stack spacing={3}>
      <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="As Of Date"
              type="date"
              size="small"
              fullWidth
              value={asOfDate}
              onChange={e => setAsOfDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerate}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : undefined}
              >
                Generate
              </Button>
              {data && (
                <Button
                  variant="outlined"
                  onClick={handleDownload}
                  startIcon={<DownloadIcon />}
                >
                  PDF
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {data && (
        <Box>
          <DataTable
            columns={TB_COLS}
            rows={entries}
            loading={false}
            total={entries.length}
            page={0}
            pageSize={100}
            onPageChange={() => {}}
            getRowId={r => r.id}
            emptyMessage="No trial balance data available."
          />
          <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: totals.is_balanced ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Total Debit</Typography>
                <Typography variant="h6" fontWeight={700}>{formatCurrency(Number(totals.total_debit))}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Total Credit</Typography>
                <Typography variant="h6" fontWeight={700}>{formatCurrency(Number(totals.total_credit))}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label={totals.is_balanced ? 'Balanced' : 'Unbalanced'} color={totals.is_balanced ? 'success' : 'error'} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </Stack>
  );
}

function Ledger({ notify }: { notify: (m: string, s?: 'success' | 'error') => void }) {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: accData } = useAccounts();
  const accounts = accData?.accounts ?? [];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params: any = { start_date: startDate, end_date: endDate };
      if (accountId) params.account_id = accountId;
      const response = await financeService.getLedger(params);
      setData(response.data?.entries ?? []);
      notify('Ledger generated successfully');
    } catch (error) {
      notify('Failed to generate ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const params: any = { start_date: startDate, end_date: endDate };
      if (accountId) params.account_id = accountId;
      const response = await financeService.downloadLedger(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ledger_${startDate}_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify('Ledger downloaded successfully');
    } catch (error) {
      notify('Failed to download ledger', 'error');
    }
  };

  type LedgerEntry = { id: string; date: string; account_code: string; account_name: string; journal_entry_reference: string; description: string; debit: string; credit: string; balance: string; status: string };
  const LEDGER_COLS: TableColumn<LedgerEntry>[] = [
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'account_code', label: 'Code', minWidth: 80 },
    { id: 'account_name', label: 'Account', minWidth: 160 },
    { id: 'journal_entry_reference', label: 'Reference', minWidth: 100 },
    { id: 'description', label: 'Description', minWidth: 200 },
    { id: 'debit', label: 'Debit', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'credit', label: 'Credit', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'balance', label: 'Balance', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
  ];

  return (
    <Stack spacing={3}>
      <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Account (Optional)</InputLabel>
              <Select value={accountId} label="Account (Optional)" onChange={e => setAccountId(e.target.value)}>
                <MenuItem value="">All Accounts</MenuItem>
                {accounts.map(a => <MenuItem key={a.id} value={a.id}>{a.code} – {a.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              fullWidth
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="End Date"
              type="date"
              size="small"
              fullWidth
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerate}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : undefined}
              >
                Generate
              </Button>
              {data.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleDownload}
                  startIcon={<DownloadIcon />}
                >
                  PDF
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {data.length > 0 && (
        <DataTable
          columns={LEDGER_COLS}
          rows={data}
          loading={false}
          total={data.length}
          page={0}
          pageSize={100}
          onPageChange={() => {}}
          getRowId={r => r.id}
          emptyMessage="No ledger entries found."
        />
      )}
    </Stack>
  );
}

export default function OverviewSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const { data: journalData, isLoading: journalLoading } = useJournalEntries();
  const { data: accData, isLoading: accLoading } = useAccounts();
  const delJournal = useDeleteJournalEntry();
  const qc = useQueryClient();
  const delAccount = useMutation({
    mutationFn: (id: string) => financeService.deleteAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'accounts'] }),
  });
  const entries = journalData?.journal_entries ?? [];
  const accounts = accData?.accounts ?? [];

  type JournalEntry = { id: string; reference: string; date: string; description: string; is_posted: boolean };
  const JOURNAL_COLS: TableColumn<JournalEntry>[] = [
    { id: 'reference', label: 'Reference', sortable: true, minWidth: 120 },
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'description', label: 'Description', minWidth: 200 },
    { id: 'is_posted', label: 'Status', format: v => <StatusChip status={v ? 'posted' : 'draft'} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
      <ActionMenu actions={[commonActions.delete(() => delJournal.mutate(row.id, { onSuccess: () => notify('Entry deleted'), onError: () => notify('Failed to delete', 'error') }))]} />
    )},
  ];

  const ACCOUNT_COLS: TableColumn<Account>[] = [
    { id: 'code', label: 'Code', sortable: true, minWidth: 80 },
    { id: 'name', label: 'Name', sortable: true, minWidth: 200 },
    { id: 'account_type', label: 'Type' },
    { id: 'account_sub_type', label: 'Sub-Type' },
    { id: 'is_active', label: 'Status', format: v => <StatusChip status={v ? 'active' : 'inactive'} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
      <ActionMenu actions={[
        commonActions.edit(() => setEditAccount(row)),
        commonActions.delete(() => delAccount.mutate(row.id, { onSuccess: () => notify('Account deleted'), onError: () => notify('Failed to delete', 'error') })),
      ]} />
    )},
  ];

  return (
    <>
      {subTab === 'transactions' && <DataTable columns={JOURNAL_COLS} rows={entries as JournalEntry[]} loading={journalLoading} total={entries.length} page={page} pageSize={25} onPageChange={setPage} onSearch={() => {}} searchPlaceholder="Search journal entries..." getRowId={r => r.id} emptyMessage="No journal entries yet." />}
      {subTab === 'chart-of-accounts' && <DataTable columns={ACCOUNT_COLS} rows={accounts} loading={accLoading} total={accounts.length} page={page} pageSize={25} onPageChange={setPage} onSearch={() => {}} searchPlaceholder="Search accounts..." getRowId={r => r.id} emptyMessage="No accounts found."
        toolbar={
          <Button size="small" variant="outlined" onClick={() => financeService.seedDefaultAccounts().then(() => { qc.invalidateQueries({ queryKey: ['finance', 'accounts'] }); notify('Default accounts seeded'); }).catch(() => notify('Failed to seed accounts', 'error'))}>
            Seed Defaults
          </Button>
        }
      />}
      {subTab === 'trial-balance' && <TrialBalance notify={notify} />}
      {subTab === 'ledger' && <Ledger notify={notify} />}

      <JournalModal open={addOpen && subTab === 'transactions'} onClose={() => setAddOpen(false)} onSuccess={(m, s) => { notify(m, s); setAddOpen(false); }} />
      <AccountModal
        open={(addOpen && subTab === 'chart-of-accounts') || !!editAccount}
        onClose={() => { setAddOpen(false); setEditAccount(null); }}
        record={editAccount}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); setEditAccount(null); }}
      />
    </>
  );
}
