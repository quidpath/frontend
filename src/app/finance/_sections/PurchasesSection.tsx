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
  useVendorBills, useDeleteVendorBill,
  usePurchaseOrders, useDeletePurchaseOrder,
  useVendors, useCreateVendor,
  useRecordBillPayment, useConvertPOToBill,
  useBankAccounts, usePurchasesSummary,
} from '@/hooks/useFinance';
import type { VendorBill, PurchaseOrder, Vendor } from '@/services/financeService';
import type { SectionProps } from './_shared';
import BillModalNew from '@/components/finance/BillModalNew';
import DocumentPreview from '@/components/finance/DocumentPreview';
import financeService from '@/services/financeService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genNumber(prefix: string) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${ymd}-${seq}`;
}

// ─── Bill Payment Modal ───────────────────────────────────────────────────────
interface BillPayItem { bill_id: string; number: string; total: number; selected: boolean; amount: string }

function BillPaymentModal({ open, onClose, bills, onSuccess }: {
  open: boolean; onClose: () => void;
  bills: VendorBill[]; onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const { data: bankData } = useBankAccounts();
  const bankAccounts = bankData?.results ?? [];
  const recordPayment = useRecordBillPayment();

  const payableBills = bills.filter(b =>
    ['POSTED', 'PARTIALLY_PAID', 'OVERDUE'].includes((b.status ?? '').toUpperCase())
  );

  const [items, setItems] = useState<BillPayItem[]>([]);
  const [form, setForm] = useState({ payment_date: new Date().toISOString().slice(0, 10), payment_method: 'bank_transfer', account_id: '', reference: '', notes: '' });
  const [error, setError] = useState('');

  // Populate items whenever the modal opens or the bill list changes
  useEffect(() => {
    if (open) {
      setItems(payableBills.map(b => ({
        bill_id: b.id, number: b.number ?? '', total: b.total ?? 0,
        selected: false, amount: String(b.total ?? 0),
      })));
      setError('');
    }
  }, [open, bills.length]);

  const toggle = (id: string) => setItems(p => p.map(i => i.bill_id === id ? { ...i, selected: !i.selected } : i));
  const setAmt = (id: string, v: string) => setItems(p => p.map(i => i.bill_id === id ? { ...i, amount: v } : i));
  const selected = items.filter(i => i.selected);
  const totalSelected = selected.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const handleSave = async () => {
    if (!selected.length) { setError('Select at least one bill'); return; }
    if (!form.payment_date) { setError('Payment date is required'); return; }
    setError('');
    try {
      await recordPayment.mutateAsync({
        ...form,
        payments: selected.map(i => ({ bill_id: i.bill_id, amount: parseFloat(i.amount) || 0 })),
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
        Record Bill Payment
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
                <InputLabel>Payment Account</InputLabel>
                <Select value={form.account_id} label="Payment Account" onChange={e => setForm(p => ({ ...p, account_id: e.target.value }))}>
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

          <Typography variant="subtitle2" fontWeight={600}>Select Bills to Pay</Typography>
          {payableBills.length === 0 && (
            <Typography variant="body2" color="text.secondary">No payable bills (must be POSTED, PARTIALLY PAID, or OVERDUE)</Typography>
          )}
          {items.map(item => (
            <Stack key={item.bill_id} direction="row" alignItems="center" spacing={2}
              sx={{ p: 1.5, border: '1px solid', borderColor: item.selected ? 'primary.main' : 'divider', borderRadius: 1 }}>
              <Checkbox checked={item.selected} onChange={() => toggle(item.bill_id)} size="small" />
              <Typography variant="body2" sx={{ flex: 1 }}>{item.number}</Typography>
              <Typography variant="body2" color="text.secondary">Total: {formatCurrency(item.total)}</Typography>
              <TextField
                label="Amount to Pay" size="small" type="number" value={item.amount}
                onChange={e => setAmt(item.bill_id, e.target.value)}
                disabled={!item.selected} sx={{ width: 140 }}
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

// ─── Convert PO to Bill Modal ─────────────────────────────────────────────────
function ConvertPOModal({ open, onClose, po, vendors, onSuccess }: {
  open: boolean; onClose: () => void; po: PurchaseOrder | null; vendors: Vendor[];
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const convert = useConvertPOToBill();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    number: '',
    vendor_id: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && po) {
      // Pre-fill vendor from PO if available
      const poVendorId = (po as any).vendor_id ?? '';
      setForm({
        date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        number: genNumber('BILL'),
        vendor_id: poVendorId,
      });
      setError('');
    }
  }, [open, po?.id]);

  const handleConvert = async () => {
    if (!po) return;
    if (!form.vendor_id) { setError('Vendor is required'); return; }
    if (!form.date || !form.due_date) { setError('Date and due date are required'); return; }
    setError('');
    try {
      // Backend requires: purchase_order_id, vendor_id, date, number, due_date, created_by
      // created_by is resolved from auth token on backend via corporate_users lookup
      await convert.mutateAsync({
        purchase_order_id: po.id,
        vendor_id: form.vendor_id,
        date: form.date,
        number: form.number,
        due_date: form.due_date,
      });
      onSuccess('Purchase order converted to bill');
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Conversion failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Convert PO to Vendor Bill
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {po && <Typography variant="body2" color="text.secondary">Converting: <strong>{po.number}</strong></Typography>}
          <FormControl fullWidth size="small">
            <InputLabel>Vendor</InputLabel>
            <Select value={form.vendor_id} label="Vendor" onChange={e => setForm(p => ({ ...p, vendor_id: e.target.value }))}>
              {vendors.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Bill Number" size="small" fullWidth value={form.number}
            onChange={e => setForm(p => ({ ...p, number: e.target.value }))} />
          <TextField label="Bill Date" type="date" size="small" fullWidth value={form.date}
            onChange={e => setForm(p => ({ ...p, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField label="Due Date" type="date" size="small" fullWidth value={form.due_date}
            onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} InputLabelProps={{ shrink: true }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleConvert} disabled={convert.isPending}
          startIcon={convert.isPending ? <CircularProgress size={14} color="inherit" /> : <SwapHorizIcon />}>
          Convert to Bill
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Vendor Modal ─────────────────────────────────────────────────────────────
function VendorModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (m: string, s?: 'success' | 'error') => void }) {
  const create = useCreateVendor();
  const [form, setForm] = useState({ category: 'company', first_name: '', last_name: '', company_name: '', email: '', phone: '', city: '', country: '' });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const handleSave = async () => {
    try { await create.mutateAsync(form as Record<string, unknown>); onSuccess('Vendor created'); onClose(); }
    catch { onSuccess('Failed to create vendor', 'error'); }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>New Vendor<IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton></DialogTitle>
      <DialogContent dividers><Stack spacing={2}>
        <FormControl fullWidth size="small"><InputLabel>Category</InputLabel>
          <Select value={form.category} label="Category" onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
            <MenuItem value="individual">Individual</MenuItem><MenuItem value="company">Company</MenuItem>
          </Select></FormControl>
        {form.category === 'company' && <TextField label="Company Name" size="small" fullWidth value={form.company_name} onChange={f('company_name')} />}
        <Stack direction="row" spacing={2}><TextField label="First Name" size="small" fullWidth value={form.first_name} onChange={f('first_name')} /><TextField label="Last Name" size="small" fullWidth value={form.last_name} onChange={f('last_name')} /></Stack>
        <TextField label="Email" size="small" fullWidth value={form.email} onChange={f('email')} />
        <TextField label="Phone" size="small" fullWidth value={form.phone} onChange={f('phone')} />
        <Stack direction="row" spacing={2}><TextField label="City" size="small" fullWidth value={form.city} onChange={f('city')} /><TextField label="Country" size="small" fullWidth value={form.country} onChange={f('country')} /></Stack>
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={create.isPending} startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function PurchasesSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0);
  const [editBill, setEditBill] = useState<VendorBill | null>(null);
  const [previewBill, setPreviewBill] = useState<VendorBill | null>(null);
  const [previewPO, setPreviewPO] = useState<PurchaseOrder | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payBill, setPayBill] = useState<VendorBill | null>(null);
  const [convertPO, setConvertPO] = useState<PurchaseOrder | null>(null);

  const { data: billData, isLoading: billLoading } = useVendorBills();
  const { data: poData, isLoading: poLoading } = usePurchaseOrders();
  const { data: vendData, isLoading: vendLoading } = useVendors();
  const { data: purchasesSummary } = usePurchasesSummary();
  const delBill = useDeleteVendorBill();
  const delPO = useDeletePurchaseOrder();

  const bills = billData?.vendor_bills ?? [];
  const pos = poData?.purchase_orders ?? [];
  const vendors = (vendData?.vendors ?? []).map(v => ({
    ...v,
    name: v.name ?? (v.company_name || `${v.first_name ?? ''} ${v.last_name ?? ''}`.trim()),
  }));

  const isBills = subTab === 'bills';
  const isPO = subTab === 'purchase-orders';
  const isVendors = subTab === 'suppliers';

  // Stat card values — all from summary API for consistency
  const totalBills = purchasesSummary?.total_bills ?? 0;
  const totalPaid = purchasesSummary?.total_paid ?? 0;
  const totalUnpaid = purchasesSummary?.total_unpaid ?? 0;
  const openPOs = purchasesSummary?.purchase_orders_open ?? 0;

  const handleDownloadBillPDF = async (id: string) => {
    try {
      const response = await financeService.downloadBillPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `bill_${id}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { notify('Failed to download PDF', 'error'); }
  };

  const handleDownloadPOPDF = async (id: string) => {
    try {
      const response = await financeService.downloadPOPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `po_${id}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { notify('Failed to download PDF', 'error'); }
  };

  const BILL_COLS: TableColumn<VendorBill>[] = [
    { id: 'number', label: 'Bill #', sortable: true, minWidth: 100 },
    { id: 'vendor', label: 'Vendor', sortable: true, minWidth: 160 },
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'due_date', label: 'Due Date', format: v => formatDate(v as string) },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    { id: 'total', label: 'Total', align: 'right', format: v => formatCurrency(Number(v)) },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          { label: 'View', icon: <VisibilityIcon />, onClick: () => setPreviewBill(row) },
          {
            label: 'Record Payment', icon: <PaymentIcon />,
            onClick: () => { setPayBill(row); setPaymentOpen(true); },
            disabled: !['POSTED', 'PARTIALLY_PAID', 'OVERDUE'].includes((row.status ?? '').toUpperCase()),
          },
          commonActions.edit(() => setEditBill(row)),
          commonActions.delete(() => delBill.mutate(row.id, {
            onSuccess: () => notify('Bill deleted'), onError: () => notify('Failed to delete', 'error'),
          })),
        ]} />
      ),
    },
  ];

  const PO_COLS: TableColumn<PurchaseOrder>[] = [
    { id: 'number', label: 'PO #', sortable: true, minWidth: 100 },
    { id: 'vendor', label: 'Vendor', sortable: true, minWidth: 160 },
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'expected_delivery', label: 'Expected Delivery', format: v => formatDate(v as string) },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    { id: 'total', label: 'Total', align: 'right', format: v => formatCurrency(Number(v)) },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          { label: 'View', icon: <VisibilityIcon />, onClick: () => setPreviewPO(row) },
          {
            label: 'Convert to Bill', icon: <SwapHorizIcon />,
            onClick: () => setConvertPO(row),
            disabled: row.status === 'INVOICED',
          },
          commonActions.delete(() => delPO.mutate(row.id, {
            onSuccess: () => notify('PO deleted'), onError: () => notify('Failed to delete', 'error'),
          })),
        ]} />
      ),
    },
  ];

  const VENDOR_COLS: TableColumn<Vendor>[] = [
    { id: 'name', label: 'Name', sortable: true, minWidth: 160 },
    { id: 'email', label: 'Email', minWidth: 180 },
    { id: 'phone', label: 'Phone' },
    { id: 'city', label: 'City' },
    { id: 'country', label: 'Country' },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={[commonActions.view(() => {}), commonActions.edit(() => {}), commonActions.delete(() => {})]} /> },
  ];

  const payableBills = payBill
    ? [payBill]
    : bills.filter(b => ['POSTED', 'PARTIALLY_PAID', 'OVERDUE'].includes((b.status ?? '').toUpperCase()));

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Bills" value={formatCurrency(totalBills)} trend="neutral" color="#C62828" loading={billLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Paid" value={formatCurrency(totalPaid)} trend="up" color="#2E7D32" loading={billLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Unpaid Bills" value={formatCurrency(totalUnpaid)} trend="down" color="#F57C00" loading={billLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Open POs" value={openPOs} trend="neutral" color="#1565C0" loading={poLoading} />
        </Grid>
      </Grid>

      {isBills && (
        <DataTable
          columns={BILL_COLS} rows={bills} loading={billLoading}
          total={bills.length} page={page} pageSize={25} onPageChange={setPage}
          onSearch={() => {}} searchPlaceholder="Search bills..."
          getRowId={r => r.id} emptyMessage="No vendor bills yet."
          toolbar={
            <Button size="small" variant="outlined" startIcon={<PaymentIcon />}
              onClick={() => { setPayBill(null); setPaymentOpen(true); }}
              disabled={!bills.some(b => ['POSTED', 'PARTIALLY_PAID', 'OVERDUE'].includes((b.status ?? '').toUpperCase()))}>
              Bulk Payment
            </Button>
          }
        />
      )}
      {isPO && (
        <DataTable
          columns={PO_COLS} rows={pos} loading={poLoading}
          total={pos.length} page={page} pageSize={25} onPageChange={setPage}
          onSearch={() => {}} searchPlaceholder="Search purchase orders..."
          getRowId={r => r.id} emptyMessage="No purchase orders yet."
        />
      )}
      {isVendors && (
        <DataTable
          columns={VENDOR_COLS} rows={vendors} loading={vendLoading}
          total={vendors.length} page={page} pageSize={25} onPageChange={setPage}
          onSearch={() => {}} searchPlaceholder="Search vendors..."
          getRowId={r => r.id} emptyMessage="No vendors yet."
        />
      )}

      <BillModalNew
        open={(addOpen && isBills) || !!editBill}
        onClose={() => { setAddOpen(false); setEditBill(null); }}
        record={editBill} vendors={vendors}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); setEditBill(null); }}
      />

      <VendorModal
        open={addOpen && isVendors}
        onClose={() => setAddOpen(false)}
        onSuccess={(m, s) => { notify(m, s); setAddOpen(false); }}
      />

      {/* Bill Payment Modal */}
      <BillPaymentModal
        open={paymentOpen}
        onClose={() => { setPaymentOpen(false); setPayBill(null); }}
        bills={payableBills}
        onSuccess={(m, s) => { notify(m, s); setPaymentOpen(false); setPayBill(null); }}
      />

      {/* Convert PO to Bill */}
      <ConvertPOModal
        open={!!convertPO}
        onClose={() => setConvertPO(null)}
        po={convertPO}
        vendors={vendors}
        onSuccess={(m, s) => { notify(m, s); setConvertPO(null); }}
      />

      {/* Document Previews */}
      {previewBill && (
        <DocumentPreview
          open={!!previewBill} onClose={() => setPreviewBill(null)}
          document={{
            id: previewBill.id, number: previewBill.number ?? '', date: previewBill.date,
            vendor: previewBill.vendor, lines: previewBill.lines || [],
            sub_total: previewBill.sub_total || 0, tax_total: previewBill.tax_total || 0,
            total: previewBill.total || 0, status: previewBill.status,
            due_date: previewBill.due_date, comments: '', terms: '',
          }}
          documentType="bill"
          onDownload={() => handleDownloadBillPDF(previewBill.id)}
        />
      )}

      {previewPO && (
        <DocumentPreview
          open={!!previewPO} onClose={() => setPreviewPO(null)}
          document={{
            id: previewPO.id, number: previewPO.number ?? '', date: previewPO.date,
            vendor: previewPO.vendor, lines: previewPO.lines || [],
            sub_total: previewPO.sub_total || 0, tax_total: previewPO.tax_total || 0,
            total: previewPO.total || 0, status: previewPO.status,
            expected_delivery: previewPO.expected_delivery, comments: '', terms: '',
          }}
          documentType="po"
          onDownload={() => handleDownloadPOPDF(previewPO.id)}
        />
      )}
    </>
  );
}
