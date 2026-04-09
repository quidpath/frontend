'use client';

import { useState, useEffect } from 'react';
import {
  Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, CircularProgress,
  Grid, Checkbox, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentIcon from '@mui/icons-material/Payment';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import {
  useInvoices, useDeleteInvoice,
  useQuotations, useDeleteQuotation,
  useCustomers, useCreateCustomer, useDeleteCustomer,
  useRecordInvoicePayment, useConvertQuoteToInvoice,
  useBankAccounts, useSalesSummary,
} from '@/hooks/useFinance';
import financeService from '@/services/financeService';
import type { Invoice, Quotation, Customer } from '@/services/financeService';
import type { SectionProps } from './_shared';
import InvoiceModalNew from '@/components/finance/InvoiceModalNew';
import DocumentPreview from '@/components/finance/DocumentPreview';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genNumber(prefix: string) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${ymd}-${seq}`;
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
interface PaymentItem { invoice_id: string; number: string; total: number; selected: boolean; amount: string }

function InvoicePaymentModal({ open, onClose, invoices, onSuccess }: {
  open: boolean; onClose: () => void;
  invoices: Invoice[]; onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const { data: bankData } = useBankAccounts();
  const bankAccounts = bankData?.results ?? [];
  const recordPayment = useRecordInvoicePayment();

  const payableInvoices = invoices.filter(i =>
    ['POSTED', 'PARTIALLY_PAID', 'OVERDUE'].includes((i.status ?? '').toUpperCase())
  );

  const [items, setItems] = useState<PaymentItem[]>([]);
  const [form, setForm] = useState({ payment_date: new Date().toISOString().slice(0, 10), payment_method: 'bank_transfer', account_id: '', reference: '', notes: '' });
  const [error, setError] = useState('');

  // Populate items whenever the modal opens or the invoice list changes
  useEffect(() => {
    if (open) {
      setItems(payableInvoices.map(i => ({
        invoice_id: i.id, number: i.number, total: i.total ?? 0,
        selected: false, amount: String(i.total ?? 0),
      })));
      setError('');
    }
  }, [open, invoices.length]);


  const toggle = (id: string) => setItems(p => p.map(i => i.invoice_id === id ? { ...i, selected: !i.selected } : i));
  const setAmt = (id: string, v: string) => setItems(p => p.map(i => i.invoice_id === id ? { ...i, amount: v } : i));
  const selected = items.filter(i => i.selected);
  const totalSelected = selected.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const handleSave = async () => {
    if (!selected.length) { setError('Select at least one invoice'); return; }
    if (!form.payment_date) { setError('Payment date is required'); return; }
    setError('');
    try {
      await recordPayment.mutateAsync({
        ...form,
        payments: selected.map(i => ({ invoice_id: i.invoice_id, amount: parseFloat(i.amount) || 0 })),
      });
      onSuccess('Payment recorded successfully');
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to record payment');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Record Invoice Payment
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField label="Payment Date" type="date" size="small" fullWidth value={form.payment_date}
                onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Method</InputLabel>
                <Select value={form.payment_method} label="Method" onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="mobile_money">Mobile Money</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Deposit Account</InputLabel>
                <Select value={form.account_id} label="Deposit Account" onChange={e => setForm(p => ({ ...p, account_id: e.target.value }))}>
                  <MenuItem value="">None</MenuItem>
                  {bankAccounts.map(a => <MenuItem key={a.id} value={a.id}>{a.account_name} — {a.bank_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Reference" size="small" fullWidth value={form.reference}
                onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Notes" size="small" fullWidth value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" fontWeight={600}>Select Invoices to Pay</Typography>
          {payableInvoices.length === 0 && (
            <Typography variant="body2" color="text.secondary">No payable invoices (must be POSTED, PARTIALLY PAID, or OVERDUE)</Typography>
          )}
          {items.map(item => (
            <Stack key={item.invoice_id} direction="row" alignItems="center" spacing={2}
              sx={{ p: 1.5, border: '1px solid', borderColor: item.selected ? 'primary.main' : 'divider', borderRadius: 1 }}>
              <Checkbox checked={item.selected} onChange={() => toggle(item.invoice_id)} size="small" />
              <Typography variant="body2" sx={{ flex: 1 }}>{item.number}</Typography>
              <Typography variant="body2" color="text.secondary">Total: {formatCurrency(item.total)}</Typography>
              <TextField
                label="Amount to Pay"
                size="small"
                type="number"
                value={item.amount}
                onChange={e => setAmt(item.invoice_id, e.target.value)}
                disabled={!item.selected}
                sx={{ width: 140 }}
                inputProps={{ min: 0, max: item.total, step: 0.01 }}
              />
            </Stack>
          ))}

          {selected.length > 0 && (
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Typography variant="subtitle2">Total Payment:</Typography>
              <Typography variant="subtitle2" color="primary" fontWeight={700}>{formatCurrency(totalSelected)}</Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={recordPayment.isPending}
          startIcon={recordPayment.isPending ? <CircularProgress size={14} color="inherit" /> : <PaymentIcon />}>
          Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Convert Quote to Invoice Modal ──────────────────────────────────────────
function ConvertQuoteModal({ open, onClose, quote, onSuccess }: {
  open: boolean; onClose: () => void; quote: Quotation | null;
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const convert = useConvertQuoteToInvoice();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    number: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        number: genNumber('INV'),
      });
      setError('');
    }
  }, [open]);

  const handleConvert = async () => {
    if (!quote) return;
    if (!form.date || !form.due_date) { setError('Date and due date are required'); return; }
    setError('');
    try {
      // Backend expects: quotation_id, date, number, due_date
      await convert.mutateAsync({ id: quote.id, ...form });
      onSuccess('Quotation converted to invoice');
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Conversion failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Convert Quote to Invoice
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {quote && <Typography variant="body2" color="text.secondary">Converting: <strong>{quote.number}</strong></Typography>}
          <TextField label="Invoice Number" size="small" fullWidth value={form.number}
            placeholder={`INV-${Date.now()}`}
            onChange={e => setForm(p => ({ ...p, number: e.target.value }))} />
          <TextField label="Invoice Date" type="date" size="small" fullWidth value={form.date}
            onChange={e => setForm(p => ({ ...p, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField label="Due Date" type="date" size="small" fullWidth value={form.due_date}
            onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} InputLabelProps={{ shrink: true }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleConvert} disabled={convert.isPending}
          startIcon={convert.isPending ? <CircularProgress size={14} color="inherit" /> : <SwapHorizIcon />}>
          Convert to Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Customer Modal ───────────────────────────────────────────────────────────
function CustomerModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const create = useCreateCustomer();
  const [form, setForm] = useState({
    category: 'individual', first_name: '', last_name: '', company_name: '',
    email: '', phone: '', address: '', city: '', country: '', tax_id: '',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const handleSave = async () => {
    try { await create.mutateAsync(form as Record<string, unknown>); onSuccess('Customer created'); onClose(); }
    catch { onSuccess('Failed to create customer', 'error'); }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>New Customer<IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton></DialogTitle>
      <DialogContent dividers><Stack spacing={2}>
        <FormControl fullWidth size="small"><InputLabel>Category</InputLabel>
          <Select value={form.category} label="Category" onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
            <MenuItem value="individual">Individual</MenuItem><MenuItem value="company">Company</MenuItem>
          </Select></FormControl>
        {form.category === 'company' && <TextField label="Company Name" size="small" fullWidth value={form.company_name} onChange={f('company_name')} />}
        <Stack direction="row" spacing={2}><TextField label="First Name" size="small" fullWidth value={form.first_name} onChange={f('first_name')} /><TextField label="Last Name" size="small" fullWidth value={form.last_name} onChange={f('last_name')} /></Stack>
        <TextField label="Email" size="small" fullWidth value={form.email} onChange={f('email')} />
        <TextField label="Phone" size="small" fullWidth value={form.phone} onChange={f('phone')} />
        <TextField label="Address" size="small" fullWidth value={form.address} onChange={f('address')} />
        <Stack direction="row" spacing={2}><TextField label="City" size="small" fullWidth value={form.city} onChange={f('city')} /><TextField label="Country" size="small" fullWidth value={form.country} onChange={f('country')} /></Stack>
        <TextField label="Tax ID" size="small" fullWidth value={form.tax_id} onChange={f('tax_id')} />
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={create.isPending} startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function SalesSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [editQuote, setEditQuote] = useState<Quotation | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null); // single invoice payment
  const [convertQuote, setConvertQuote] = useState<Quotation | null>(null);

  const { data: invoiceData, isLoading: invoiceLoading } = useInvoices();
  const { data: quoteData, isLoading: quoteLoading } = useQuotations();
  const { data: customerData, isLoading: customerLoading } = useCustomers();
  const { data: salesSummary } = useSalesSummary();
  const delInvoice = useDeleteInvoice();
  const delQuote = useDeleteQuotation();
  const delCustomer = useDeleteCustomer();

  const invoices = invoiceData?.invoices ?? [];
  const quotes = quoteData?.quotations ?? [];
  const customers = (customerData?.customers ?? []).map(c => ({
    ...c,
    name: c.name ?? (c.company_name || `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim()),
  }));

  const isInvoices = subTab === 'invoices';
  const isQuotes = subTab === 'quotes';
  const isCustomers = subTab === 'customers';

  // Stat card values — all from summary API for consistency
  const totalInvoiced = salesSummary?.total_invoiced ?? 0;
  const totalPaid = salesSummary?.total_paid ?? 0;
  const totalOverdue = salesSummary?.total_overdue ?? 0;
  const quotesPending = salesSummary?.quotes_pending ?? 0;

  const handleDownloadInvoicePDF = async (id: string) => {
    try {
      const response = await financeService.downloadInvoicePDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `invoice_${id}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { notify('Failed to download PDF', 'error'); }
  };

  const handleDownloadQuotePDF = async (id: string) => {
    try {
      const response = await financeService.downloadQuotationPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `quote_${id}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { notify('Failed to download PDF', 'error'); }
  };

  const INVOICE_COLS: TableColumn<Invoice>[] = [
    { id: 'number', label: 'Invoice #', sortable: true, minWidth: 100 },
    { id: 'customer', label: 'Customer', sortable: true, minWidth: 160 },
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'due_date', label: 'Due Date', format: v => formatDate(v as string) },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    { id: 'total', label: 'Total', align: 'right', format: v => formatCurrency(Number(v)) },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          { label: 'View', icon: <VisibilityIcon />, onClick: () => setPreviewInvoice(row) },
          {
            label: 'Record Payment', icon: <PaymentIcon />,
            onClick: () => { setPayInvoice(row); setPaymentOpen(true); },
            disabled: !['POSTED', 'PARTIALLY_PAID', 'OVERDUE'].includes((row.status ?? '').toUpperCase()),
          },
          commonActions.edit(() => setEditInvoice(row)),
          commonActions.delete(() => delInvoice.mutate(row.id, {
            onSuccess: () => notify('Invoice deleted'), onError: () => notify('Failed to delete', 'error'),
          })),
        ]} />
      ),
    },
  ];

  const QUOTE_COLS: TableColumn<Quotation>[] = [
    { id: 'number', label: 'Quote #', sortable: true, minWidth: 100 },
    { id: 'customer', label: 'Customer', sortable: true, minWidth: 160 },
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'valid_until', label: 'Valid Until', format: v => formatDate(v as string) },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    { id: 'total', label: 'Total', align: 'right', format: v => formatCurrency(Number(v ?? 0)) },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          { label: 'View', icon: <VisibilityIcon />, onClick: () => setPreviewQuote(row) },
          {
            label: 'Convert to Invoice', icon: <SwapHorizIcon />,
            onClick: () => setConvertQuote(row),
            disabled: row.status === 'INVOICED',
          },
          commonActions.edit(() => setEditQuote(row)),
          commonActions.delete(() => delQuote.mutate(row.id, {
            onSuccess: () => notify('Quote deleted'), onError: () => notify('Failed to delete', 'error'),
          })),
        ]} />
      ),
    },
  ];

  const CUSTOMER_COLS: TableColumn<Customer>[] = [
    { id: 'name', label: 'Name', sortable: true, minWidth: 160 },
    { id: 'email', label: 'Email', minWidth: 180 },
    { id: 'phone', label: 'Phone' },
    { id: 'city', label: 'City' },
    { id: 'country', label: 'Country' },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          commonActions.delete(() => delCustomer.mutate(row.id, {
            onSuccess: () => notify('Customer deleted'), onError: () => notify('Failed to delete', 'error'),
          })),
        ]} />
      ),
    },
  ];

  // Invoices available for bulk payment (payable ones)
  const payableInvoices = payInvoice
    ? [payInvoice]
    : invoices.filter(i => ['POSTED', 'PARTIALLY_PAID', 'OVERDUE'].includes((i.status ?? '').toUpperCase()));

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Invoiced" value={formatCurrency(totalInvoiced)} trend="up" color="#2E7D32" loading={invoiceLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Paid" value={formatCurrency(totalPaid)} trend="up" color="#1565C0" loading={invoiceLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Overdue" value={formatCurrency(totalOverdue)} trend="down" color="#C62828" loading={invoiceLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Quotes Pending" value={quotesPending} trend="neutral" color="#F57C00" loading={quoteLoading} />
        </Grid>
      </Grid>

      {isInvoices && (
        <DataTable
          columns={INVOICE_COLS} rows={invoices} loading={invoiceLoading}
          total={invoices.length} page={page} pageSize={25} onPageChange={setPage}
          onSearch={() => {}} searchPlaceholder="Search invoices..."
          getRowId={r => r.id} emptyMessage="No invoices yet."
          toolbar={
            <Button size="small" variant="outlined" startIcon={<PaymentIcon />}
              onClick={() => { setPayInvoice(null); setPaymentOpen(true); }}
              disabled={!invoices.some(i => ['POSTED', 'PARTIALLY_PAID', 'OVERDUE'].includes((i.status ?? '').toUpperCase()))}>
              Bulk Payment
            </Button>
          }
        />
      )}

      {isQuotes && (
        <DataTable
          columns={QUOTE_COLS} rows={quotes} loading={quoteLoading}
          total={quotes.length} page={page} pageSize={25} onPageChange={setPage}
          onSearch={() => {}} searchPlaceholder="Search quotes..."
          getRowId={r => r.id} emptyMessage="No quotes yet."
        />
      )}

      {isCustomers && (
        <DataTable
          columns={CUSTOMER_COLS} rows={customers} loading={customerLoading}
          total={customers.length} page={page} pageSize={25} onPageChange={setPage}
          onSearch={() => {}} searchPlaceholder="Search customers..."
          getRowId={r => r.id} emptyMessage="No customers yet."
        />
      )}

      <InvoiceModalNew
        open={(addOpen && isInvoices) || !!editInvoice}
        onClose={() => { setAddOpen(false); setEditInvoice(null); }}
        record={editInvoice} customers={customers}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); setEditInvoice(null); }}
      />

      <CustomerModal
        open={addOpen && isCustomers}
        onClose={() => setAddOpen(false)}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); }}
      />

      {/* Payment Modal */}
      <InvoicePaymentModal
        open={paymentOpen}
        onClose={() => { setPaymentOpen(false); setPayInvoice(null); }}
        invoices={payableInvoices}
        onSuccess={(m, s) => { notify(m, s); setPaymentOpen(false); setPayInvoice(null); }}
      />

      {/* Convert Quote to Invoice */}
      <ConvertQuoteModal
        open={!!convertQuote}
        onClose={() => setConvertQuote(null)}
        quote={convertQuote}
        onSuccess={(m, s) => { notify(m, s); setConvertQuote(null); }}
      />

      {/* Document Previews */}
      {previewInvoice && (
        <DocumentPreview
          open={!!previewInvoice} onClose={() => setPreviewInvoice(null)}
          document={{
            id: previewInvoice.id, number: previewInvoice.number, date: previewInvoice.date,
            customer: previewInvoice.customer, lines: previewInvoice.lines || [],
            sub_total: previewInvoice.sub_total || 0, tax_total: previewInvoice.tax_total || 0,
            total: previewInvoice.total || 0, status: previewInvoice.status,
            due_date: previewInvoice.due_date, comments: previewInvoice.comments, terms: previewInvoice.terms,
          }}
          documentType="invoice"
          onDownload={() => handleDownloadInvoicePDF(previewInvoice.id)}
        />
      )}

      {previewQuote && (
        <DocumentPreview
          open={!!previewQuote} onClose={() => setPreviewQuote(null)}
          document={{
            id: previewQuote.id, number: previewQuote.number, date: previewQuote.date,
            customer: previewQuote.customer, lines: previewQuote.lines || [],
            sub_total: previewQuote.sub_total || 0, tax_total: previewQuote.tax_total || 0,
            total: previewQuote.total || 0, status: previewQuote.status,
            valid_until: previewQuote.valid_until, comments: previewQuote.comments, terms: previewQuote.terms,
          }}
          documentType="quote"
          onDownload={() => handleDownloadQuotePDF(previewQuote.id)}
        />
      )}
    </>
  );
}
