'use client';

import { useState, useEffect } from 'react';
import {
  Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, CircularProgress, Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import {
  useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice,
  useQuotations, useCreateQuotation, useUpdateQuotation, useDeleteQuotation,
  useCustomers, useCreateCustomer, useDeleteCustomer,
} from '@/hooks/useFinance';
import type { Invoice, Quotation, Customer, InvoiceLine } from '@/services/financeService';
import type { SectionProps } from './_shared';

function InvoiceModal({ open, onClose, record, customers, onSuccess }: {
  open: boolean; onClose: () => void; record?: Invoice | null;
  customers: Customer[]; onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const create = useCreateInvoice();
  const update = useUpdateInvoice();
  const saving = create.isPending || update.isPending;
  const [form, setForm] = useState({ customer_id: '', date: '', due_date: '', number: '', salesperson: '' });
  const [lines, setLines] = useState<InvoiceLine[]>([{ description: '', quantity: 1, unit_price: 0 }]);

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        customer_id: record.customer_id ?? '',
        date: record.date,
        due_date: record.due_date,
        number: record.number,
        salesperson: record.salesperson ?? ''
      });
      setLines(record.lines?.length ? record.lines : [{ description: '', quantity: 1, unit_price: 0 }]);
    } else {
      setForm({
        customer_id: '',
        date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        number: `INV-${Date.now()}`,
        salesperson: ''
      });
      setLines([{ description: '', quantity: 1, unit_price: 0 }]);
    }
  }, [record, open]);

  const setLine = (i: number, k: keyof InvoiceLine, v: string | number) =>
    setLines(p => p.map((l, idx) => idx === i ? { ...l, [k]: v } : l));

  // Calculate totals
  const subtotal = lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);
  const taxRate = 0.16; // 16% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        customer: form.customer_id,
        lines: lines.map(l => ({
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
      };
      if (record) await update.mutateAsync({ id: record.id, ...payload });
      else await create.mutateAsync(payload);
      onSuccess(record ? 'Invoice updated' : 'Invoice created');
      onClose();
    } catch (error) {
      console.error('Invoice save error:', error);
      onSuccess('Failed to save invoice', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {record ? 'Edit Invoice' : 'New Invoice'}
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Customer</InputLabel>
                <Select
                  value={form.customer_id}
                  label="Customer"
                  onChange={e => setForm(p => ({ ...p, customer_id: e.target.value }))}
                >
                  {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Invoice Number"
                size="small"
                fullWidth
                value={form.number}
                onChange={e => setForm(p => ({ ...p, number: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="Date"
                type="date"
                size="small"
                fullWidth
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="Due Date"
                type="date"
                size="small"
                fullWidth
                value={form.due_date}
                onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Salesperson"
                size="small"
                fullWidth
                value={form.salesperson}
                onChange={e => setForm(p => ({ ...p, salesperson: e.target.value }))}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" fontWeight={600}>Line Items</Typography>
          {lines.map((l, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <TextField
                label="Description"
                size="small"
                value={l.description}
                onChange={e => setLine(i, 'description', e.target.value)}
                sx={{ flex: 3 }}
              />
              <TextField
                label="Qty"
                size="small"
                type="number"
                value={l.quantity}
                onChange={e => setLine(i, 'quantity', Number(e.target.value))}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Unit Price"
                size="small"
                type="number"
                value={l.unit_price}
                onChange={e => setLine(i, 'unit_price', Number(e.target.value))}
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right' }}>
                {formatCurrency(l.quantity * l.unit_price)}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setLines(p => p.filter((_, idx) => idx !== i))}
                disabled={lines.length === 1}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button
            size="small"
            onClick={() => setLines(p => [...p, { description: '', quantity: 1, unit_price: 0 }])}
            sx={{ alignSelf: 'flex-start' }}
          >
            + Add Line
          </Button>

          {/* Totals Section */}
          <Stack spacing={1} sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2" fontWeight={500}>{formatCurrency(subtotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Tax (16%):</Typography>
              <Typography variant="body2" fontWeight={500}>{formatCurrency(taxAmount)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={600}>Total:</Typography>
              <Typography variant="subtitle1" fontWeight={600} color="primary">{formatCurrency(total)}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function QuoteModal({ open, onClose, record, customers, onSuccess }: {
  open: boolean; onClose: () => void; record?: Quotation | null;
  customers: Customer[]; onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const create = useCreateQuotation();
  const update = useUpdateQuotation();
  const saving = create.isPending || update.isPending;
  const [form, setForm] = useState({ customer_id: '', date: '', valid_until: '', number: '', salesperson: '' });
  const [lines, setLines] = useState<InvoiceLine[]>([{ description: '', quantity: 1, unit_price: 0 }]);

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        customer_id: record.customer_id ?? '',
        date: record.date,
        valid_until: record.valid_until,
        number: record.number,
        salesperson: record.salesperson ?? ''
      });
      setLines(record.lines?.length ? record.lines : [{ description: '', quantity: 1, unit_price: 0 }]);
    } else {
      setForm({
        customer_id: '',
        date: new Date().toISOString().slice(0, 10),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        number: `QT-${Date.now()}`,
        salesperson: ''
      });
      setLines([{ description: '', quantity: 1, unit_price: 0 }]);
    }
  }, [record, open]);

  const setLine = (i: number, k: keyof InvoiceLine, v: string | number) =>
    setLines(p => p.map((l, idx) => idx === i ? { ...l, [k]: v } : l));

  // Calculate totals
  const subtotal = lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);
  const taxRate = 0.16;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        customer: form.customer_id,
        lines: lines.map(l => ({
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
      };
      if (record) await update.mutateAsync({ id: record.id, ...payload });
      else await create.mutateAsync(payload);
      onSuccess(record ? 'Quote updated' : 'Quote created');
      onClose();
    } catch (error) {
      console.error('Quote save error:', error);
      onSuccess('Failed to save quote', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {record ? 'Edit Quote' : 'New Quote'}
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Customer</InputLabel>
                <Select
                  value={form.customer_id}
                  label="Customer"
                  onChange={e => setForm(p => ({ ...p, customer_id: e.target.value }))}
                >
                  {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Quote Number"
                size="small"
                fullWidth
                value={form.number}
                onChange={e => setForm(p => ({ ...p, number: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="Date"
                type="date"
                size="small"
                fullWidth
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="Valid Until"
                type="date"
                size="small"
                fullWidth
                value={form.valid_until}
                onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Salesperson"
                size="small"
                fullWidth
                value={form.salesperson}
                onChange={e => setForm(p => ({ ...p, salesperson: e.target.value }))}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" fontWeight={600}>Line Items</Typography>
          {lines.map((l, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <TextField
                label="Description"
                size="small"
                value={l.description}
                onChange={e => setLine(i, 'description', e.target.value)}
                sx={{ flex: 3 }}
              />
              <TextField
                label="Qty"
                size="small"
                type="number"
                value={l.quantity}
                onChange={e => setLine(i, 'quantity', Number(e.target.value))}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Unit Price"
                size="small"
                type="number"
                value={l.unit_price}
                onChange={e => setLine(i, 'unit_price', Number(e.target.value))}
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right' }}>
                {formatCurrency(l.quantity * l.unit_price)}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setLines(p => p.filter((_, idx) => idx !== i))}
                disabled={lines.length === 1}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button
            size="small"
            onClick={() => setLines(p => [...p, { description: '', quantity: 1, unit_price: 0 }])}
            sx={{ alignSelf: 'flex-start' }}
          >
            + Add Line
          </Button>

          {/* Totals Section */}
          <Stack spacing={1} sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2" fontWeight={500}>{formatCurrency(subtotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Tax (16%):</Typography>
              <Typography variant="body2" fontWeight={500}>{formatCurrency(taxAmount)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={600}>Total:</Typography>
              <Typography variant="subtitle1" fontWeight={600} color="primary">{formatCurrency(total)}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CustomerModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const create = useCreateCustomer();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', country: '', tax_id: '' });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    try {
      await create.mutateAsync(form as Record<string, unknown>);
      onSuccess('Customer created');
      onClose();
    } catch {
      onSuccess('Failed to create customer', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        New Customer
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField label="Name" size="small" fullWidth value={form.name} onChange={f('name')} />
          <TextField label="Email" size="small" fullWidth value={form.email} onChange={f('email')} />
          <TextField label="Phone" size="small" fullWidth value={form.phone} onChange={f('phone')} />
          <TextField label="Address" size="small" fullWidth value={form.address} onChange={f('address')} />
          <Stack direction="row" spacing={2}>
            <TextField label="City" size="small" fullWidth value={form.city} onChange={f('city')} />
            <TextField label="Country" size="small" fullWidth value={form.country} onChange={f('country')} />
          </Stack>
          <TextField label="Tax ID" size="small" fullWidth value={form.tax_id} onChange={f('tax_id')} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={create.isPending}
          startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function SalesSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [editQuote, setEditQuote] = useState<Quotation | null>(null);

  const { data: invoiceData, isLoading: invoiceLoading } = useInvoices();
  const { data: quoteData, isLoading: quoteLoading } = useQuotations();
  const { data: customerData, isLoading: customerLoading } = useCustomers();
  const delInvoice = useDeleteInvoice();
  const delQuote = useDeleteQuotation();
  const delCustomer = useDeleteCustomer();

  const invoices = invoiceData?.invoices ?? [];
  const quotes = quoteData?.quotations ?? [];
  const customers = customerData?.customers ?? [];

  const isInvoices = subTab === 'invoices';
  const isQuotes = subTab === 'quotes';
  const isCustomers = subTab === 'customers';

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
          commonActions.edit(() => setEditInvoice(row)),
          commonActions.delete(() => delInvoice.mutate(row.id, {
            onSuccess: () => notify('Invoice deleted'),
            onError: () => notify('Failed to delete', 'error')
          }))
        ]} />
      )
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
          commonActions.edit(() => setEditQuote(row)),
          commonActions.delete(() => delQuote.mutate(row.id, {
            onSuccess: () => notify('Quote deleted'),
            onError: () => notify('Failed to delete', 'error')
          }))
        ]} />
      )
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
          commonActions.view(() => {}),
          commonActions.edit(() => {}),
          commonActions.delete(() => delCustomer.mutate(row.id, {
            onSuccess: () => notify('Customer deleted'),
            onError: () => notify('Failed to delete', 'error')
          }))
        ]} />
      )
    },
  ];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total Invoiced"
            value={formatCurrency(invoices.reduce((s, i) => s + (i.total ?? 0), 0))}
            trend="up"
            color="#2E7D32"
            loading={invoiceLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Pending Invoices"
            value={invoices.filter(i => i.status === 'PENDING' || i.status === 'pending').length}
            trend="neutral"
            color="#F57C00"
            loading={invoiceLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Active Quotes"
            value={quotes.filter(q => q.status !== 'EXPIRED' && q.status !== 'expired').length}
            trend="neutral"
            color="#1565C0"
            loading={quoteLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Customers"
            value={customers.length}
            trend="up"
            color="#7B1FA2"
            loading={customerLoading}
          />
        </Grid>
      </Grid>

      {isInvoices && (
        <DataTable
          columns={INVOICE_COLS}
          rows={invoices}
          loading={invoiceLoading}
          total={invoices.length}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={() => {}}
          searchPlaceholder="Search invoices..."
          getRowId={r => r.id}
          emptyMessage="No invoices yet."
        />
      )}

      {isQuotes && (
        <DataTable
          columns={QUOTE_COLS}
          rows={quotes}
          loading={quoteLoading}
          total={quotes.length}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={() => {}}
          searchPlaceholder="Search quotes..."
          getRowId={r => r.id}
          emptyMessage="No quotes yet."
        />
      )}

      {isCustomers && (
        <DataTable
          columns={CUSTOMER_COLS}
          rows={customers}
          loading={customerLoading}
          total={customers.length}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={() => {}}
          searchPlaceholder="Search customers..."
          getRowId={r => r.id}
          emptyMessage="No customers yet."
        />
      )}

      <InvoiceModal
        open={(addOpen && isInvoices) || !!editInvoice}
        onClose={() => { setAddOpen(false); setEditInvoice(null); }}
        record={editInvoice}
        customers={customers}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); setEditInvoice(null); }}
      />

      <QuoteModal
        open={(addOpen && isQuotes) || !!editQuote}
        onClose={() => { setAddOpen(false); setEditQuote(null); }}
        record={editQuote}
        customers={customers}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); setEditQuote(null); }}
      />

      <CustomerModal
        open={addOpen && isCustomers}
        onClose={() => setAddOpen(false)}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); }}
      />
    </>
  );
}
