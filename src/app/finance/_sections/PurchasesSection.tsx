'use client';

import { useState, useEffect } from 'react';
import {
  Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, CircularProgress, Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import {
  useVendorBills, useCreateVendorBill, useUpdateVendorBill, useDeleteVendorBill,
  usePurchaseOrders, useCreatePurchaseOrder, useDeletePurchaseOrder,
  useVendors, useCreateVendor,
} from '@/hooks/useFinance';
import type { VendorBill, PurchaseOrder, Vendor } from '@/services/financeService';
import type { SectionProps } from './_shared';
import BillModalNew from '@/components/finance/BillModalNew';
import DocumentPreview from '@/components/finance/DocumentPreview';
import financeService from '@/services/financeService';

function BillModal({ open, onClose, record, vendors, onSuccess }: {
  open: boolean; onClose: () => void; record?: VendorBill | null;
  vendors: Vendor[]; onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const create = useCreateVendorBill();
  const update = useUpdateVendorBill();
  const saving = create.isPending || update.isPending;
  const [form, setForm] = useState({ vendor_id: '', date: '', due_date: '' });
  const [lines, setLines] = useState([{ description: '', quantity: 1, unit_price: 0 }]);
  
  useEffect(() => {
    if (!open) return;
    if (record) setForm({ vendor_id: record.vendor_id ?? '', date: record.date, due_date: record.due_date ?? '' });
    else { setForm({ vendor_id: '', date: new Date().toISOString().slice(0, 10), due_date: '' }); setLines([{ description: '', quantity: 1, unit_price: 0 }]); }
  }, [record, open]);
  
  const setLine = (i: number, k: string, v: string | number) => setLines(p => p.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  
  // Calculate totals
  const subtotal = lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);
  const taxRate = 0.16; // 16% tax - could be made configurable
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  
  const handleSave = async () => {
    try {
      const billPayload = {
        vendor: form.vendor_id,
        date: form.date,
        due_date: form.due_date,
        number: `BILL-${Date.now()}`,
        status: 'DRAFT',
        lines: lines.map(l => {
          const qty = l.quantity;
          const price = l.unit_price;
          const discount = 0;
          return {
            description: l.description,
            quantity: qty,
            unit_price: price,
            discount,
            taxable_id: null, // Changed from 'exempt' to null
          };
        }),
      };
      if (record) await update.mutateAsync({ id: record.id, ...billPayload });
      else await create.mutateAsync(billPayload);
      onSuccess(record ? 'Bill updated' : 'Bill created'); onClose();
    } catch { onSuccess('Failed to save bill', 'error'); }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>{record ? 'Edit Bill' : 'New Vendor Bill'}<IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton></DialogTitle>
      <DialogContent dividers><Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><FormControl fullWidth size="small"><InputLabel>Vendor</InputLabel><Select value={form.vendor_id} label="Vendor" onChange={e => setForm(p => ({ ...p, vendor_id: e.target.value }))}>{vendors.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}</Select></FormControl></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><TextField label="Date" type="date" size="small" fullWidth value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><TextField label="Due Date" type="date" size="small" fullWidth value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
        </Grid>
        <Typography variant="subtitle2" fontWeight={600}>Line Items</Typography>
        {lines.map((l, i) => (<Stack key={i} direction="row" spacing={1} alignItems="center">
          <TextField label="Description" size="small" value={l.description} onChange={e => setLine(i, 'description', e.target.value)} sx={{ flex: 3 }} />
          <TextField label="Qty" size="small" type="number" value={l.quantity} onChange={e => setLine(i, 'quantity', Number(e.target.value))} sx={{ flex: 1 }} />
          <TextField label="Unit Price" size="small" type="number" value={l.unit_price} onChange={e => setLine(i, 'unit_price', Number(e.target.value))} sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right' }}>{formatCurrency(l.quantity * l.unit_price)}</Typography>
          <IconButton size="small" onClick={() => setLines(p => p.filter((_, idx) => idx !== i))} disabled={lines.length === 1}><CloseIcon fontSize="small" /></IconButton>
        </Stack>))}
        <Button size="small" onClick={() => setLines(p => [...p, { description: '', quantity: 1, unit_price: 0 }])} sx={{ alignSelf: 'flex-start' }}>+ Add Line</Button>
        
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
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}>Save</Button></DialogActions>
    </Dialog>
  );
}

function POModal({ open, onClose, vendors, onSuccess }: {
  open: boolean; onClose: () => void; vendors: Vendor[]; onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const create = useCreatePurchaseOrder();
  const [form, setForm] = useState({ vendor_id: '', date: '', expected_delivery: '' });
  const [lines, setLines] = useState([{ description: '', quantity: 1, unit_price: 0 }]);
  
  useEffect(() => {
    if (!open) return;
    setForm({ vendor_id: '', date: new Date().toISOString().slice(0, 10), expected_delivery: '' });
    setLines([{ description: '', quantity: 1, unit_price: 0 }]);
  }, [open]);
  
  const setLine = (i: number, k: string, v: string | number) => setLines(p => p.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  
  // Calculate totals
  const subtotal = lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);
  const taxRate = 0.16;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  
  const handleSave = async () => {
    try {
      const poPayload = {
        vendor: form.vendor_id,
        date: form.date,
        expected_delivery: form.expected_delivery,
        number: `PO-${Date.now()}`,
        created_by: undefined, // will be resolved from auth token on backend
        lines: lines.map(l => {
          const qty = l.quantity;
          const price = l.unit_price;
          const discount = 0;
          return {
            description: l.description,
            quantity: qty,
            unit_price: price,
            discount,
            taxable_id: null, // Changed from 'exempt' to null
          };
        }),
      };
      await create.mutateAsync(poPayload); onSuccess('Purchase order created'); onClose();
    } catch { onSuccess('Failed to create PO', 'error'); }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>New Purchase Order<IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton></DialogTitle>
      <DialogContent dividers><Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><FormControl fullWidth size="small"><InputLabel>Vendor</InputLabel><Select value={form.vendor_id} label="Vendor" onChange={e => setForm(p => ({ ...p, vendor_id: e.target.value }))}>{vendors.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}</Select></FormControl></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><TextField label="Date" type="date" size="small" fullWidth value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><TextField label="Expected Delivery" type="date" size="small" fullWidth value={form.expected_delivery} onChange={e => setForm(p => ({ ...p, expected_delivery: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
        </Grid>
        <Typography variant="subtitle2" fontWeight={600}>Line Items</Typography>
        {lines.map((l, i) => (<Stack key={i} direction="row" spacing={1} alignItems="center">
          <TextField label="Description" size="small" value={l.description} onChange={e => setLine(i, 'description', e.target.value)} sx={{ flex: 3 }} />
          <TextField label="Qty" size="small" type="number" value={l.quantity} onChange={e => setLine(i, 'quantity', Number(e.target.value))} sx={{ flex: 1 }} />
          <TextField label="Unit Price" size="small" type="number" value={l.unit_price} onChange={e => setLine(i, 'unit_price', Number(e.target.value))} sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right' }}>{formatCurrency(l.quantity * l.unit_price)}</Typography>
          <IconButton size="small" onClick={() => setLines(p => p.filter((_, idx) => idx !== i))} disabled={lines.length === 1}><CloseIcon fontSize="small" /></IconButton>
        </Stack>))}
        <Button size="small" onClick={() => setLines(p => [...p, { description: '', quantity: 1, unit_price: 0 }])} sx={{ alignSelf: 'flex-start' }}>+ Add Line</Button>
        
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
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={create.isPending} startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}>Save</Button></DialogActions>
    </Dialog>
  );
}

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
        <FormControl fullWidth size="small"><InputLabel>Category</InputLabel><Select value={form.category} label="Category" onChange={e => setForm(p => ({ ...p, category: e.target.value }))}><MenuItem value="individual">Individual</MenuItem><MenuItem value="company">Company</MenuItem></Select></FormControl>
        {form.category === 'company' && <TextField label="Company Name" size="small" fullWidth value={form.company_name} onChange={f('company_name')} />}
        <Stack direction="row" spacing={2}><TextField label="First Name" size="small" fullWidth value={form.first_name} onChange={f('first_name')} /><TextField label="Last Name" size="small" fullWidth value={form.last_name} onChange={f('last_name')} /></Stack>
        <TextField label="Email" size="small" fullWidth value={form.email} onChange={f('email')} />
        <TextField label="Phone" size="small" fullWidth value={form.phone} onChange={f('phone')} />
        <Stack direction="row" spacing={2}><TextField label="City" size="small" fullWidth value={form.city} onChange={f('city')} /><TextField label="Country" size="small" fullWidth value={form.country} onChange={f('country')} /></Stack>
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} variant="outlined">Cancel</Button><Button variant="contained" onClick={handleSave} disabled={create.isPending} startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}>Save</Button></DialogActions>
    </Dialog>
  );
}

export default function PurchasesSection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0);
  const [editBill, setEditBill] = useState<VendorBill | null>(null);
  const [previewBill, setPreviewBill] = useState<VendorBill | null>(null);
  const [previewPO, setPreviewPO] = useState<PurchaseOrder | null>(null);
  
  const { data: billData, isLoading: billLoading } = useVendorBills();
  const { data: poData, isLoading: poLoading } = usePurchaseOrders();
  const { data: vendData, isLoading: vendLoading } = useVendors();
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

  const handleDownloadBillPDF = async (id: string) => {
    try {
      const response = await financeService.downloadBillPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notify('Failed to download PDF', 'error');
    }
  };

  const handleDownloadPOPDF = async (id: string) => {
    try {
      const response = await financeService.downloadPOPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `po_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notify('Failed to download PDF', 'error');
    }
  };

  const BILL_COLS: TableColumn<VendorBill>[] = [
    { id: 'number', label: 'Bill #', sortable: true, minWidth: 100 },
    { id: 'vendor', label: 'Vendor', sortable: true, minWidth: 160 },
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'due_date', label: 'Due Date', format: v => formatDate(v as string) },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    { id: 'total', label: 'Total', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={[
      { label: 'View', icon: <VisibilityIcon />, onClick: () => setPreviewBill(row) },
      commonActions.edit(() => setEditBill(row)), 
      commonActions.delete(() => delBill.mutate(row.id, { onSuccess: () => notify('Bill deleted'), onError: () => notify('Failed to delete', 'error') }))
    ]} /> },
  ];
  const PO_COLS: TableColumn<PurchaseOrder>[] = [
    { id: 'number', label: 'PO #', sortable: true, minWidth: 100 },
    { id: 'vendor', label: 'Vendor', sortable: true, minWidth: 160 },
    { id: 'date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'expected_delivery', label: 'Expected Delivery', format: v => formatDate(v as string) },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
    { id: 'total', label: 'Total', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={[
      { label: 'View', icon: <VisibilityIcon />, onClick: () => setPreviewPO(row) },
      commonActions.delete(() => delPO.mutate(row.id, { onSuccess: () => notify('PO deleted'), onError: () => notify('Failed to delete', 'error') }))
    ]} /> },
  ];
  const VENDOR_COLS: TableColumn<Vendor>[] = [
    { id: 'name', label: 'Name', sortable: true, minWidth: 160 },
    { id: 'email', label: 'Email', minWidth: 180 },
    { id: 'phone', label: 'Phone' },
    { id: 'city', label: 'City' },
    { id: 'country', label: 'Country' },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={[commonActions.view(() => {}), commonActions.edit(() => {}), commonActions.delete(() => {})]} /> },
  ];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Total Bills" value={formatCurrency(bills.filter(b => b.status === 'POSTED' || b.status === 'PAID' || b.status === 'posted' || b.status === 'paid').reduce((s, b) => s + (b.total ?? 0), 0))} trend="neutral" color="#C62828" loading={billLoading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Unpaid Bills" value={formatCurrency(bills.filter(b => (b.status === 'POSTED' || b.status === 'posted') && !['PAID', 'paid'].includes(b.status as string)).reduce((s, b) => s + (b.total ?? 0), 0))} trend="down" color="#F57C00" loading={billLoading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Open POs" value={pos.filter(p => p.status !== 'completed' && p.status !== 'COMPLETED' && p.status !== 'DRAFT' && p.status !== 'draft').length} trend="neutral" color="#1565C0" loading={poLoading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Vendors" value={vendors.length} trend="up" color="#2E7D32" loading={vendLoading} /></Grid>
      </Grid>
      {isBills && <DataTable columns={BILL_COLS} rows={bills} loading={billLoading} total={bills.length} page={page} pageSize={25} onPageChange={setPage} onSearch={() => {}} searchPlaceholder="Search bills..." getRowId={r => r.id} emptyMessage="No vendor bills yet." />}
      {isPO && <DataTable columns={PO_COLS} rows={pos} loading={poLoading} total={pos.length} page={page} pageSize={25} onPageChange={setPage} onSearch={() => {}} searchPlaceholder="Search purchase orders..." getRowId={r => r.id} emptyMessage="No purchase orders yet." />}
      {isVendors && <DataTable columns={VENDOR_COLS} rows={vendors} loading={vendLoading} total={vendors.length} page={page} pageSize={25} onPageChange={setPage} onSearch={() => {}} searchPlaceholder="Search vendors..." getRowId={r => r.id} emptyMessage="No vendors yet." />}
      <BillModalNew open={(addOpen && isBills) || !!editBill} onClose={() => { setAddOpen(false); setEditBill(null); }} record={editBill} vendors={vendors} onSuccess={(m, s) => { notify(m, s); setAddOpen(false); setEditBill(null); }} />
      <POModal open={addOpen && isPO} onClose={() => setAddOpen(false)} vendors={vendors} onSuccess={(m, s) => { notify(m, s); setAddOpen(false); }} />
      <VendorModal open={addOpen && isVendors} onClose={() => setAddOpen(false)} onSuccess={(m, s) => { notify(m, s); setAddOpen(false); }} />

      {/* Document Previews */}
      {previewBill && (
        <DocumentPreview
          open={!!previewBill}
          onClose={() => setPreviewBill(null)}
          document={{
            id: previewBill.id,
            number: previewBill.number ?? '',
            date: previewBill.date,
            vendor: previewBill.vendor,
            lines: previewBill.lines || [],
            sub_total: previewBill.sub_total || 0,
            tax_total: previewBill.tax_total || 0,
            total: previewBill.total || 0,
            status: previewBill.status,
            due_date: previewBill.due_date,
            comments: '',
            terms: '',
          }}
          documentType="bill"
          onDownload={() => handleDownloadBillPDF(previewBill.id)}
        />
      )}

      {previewPO && (
        <DocumentPreview
          open={!!previewPO}
          onClose={() => setPreviewPO(null)}
          document={{
            id: previewPO.id,
            number: previewPO.number ?? '',
            date: previewPO.date,
            vendor: previewPO.vendor,
            lines: previewPO.lines || [],
            sub_total: previewPO.sub_total || 0,
            tax_total: previewPO.tax_total || 0,
            total: previewPO.total || 0,
            status: previewPO.status,
            expected_delivery: previewPO.expected_delivery,
            comments: '',
            terms: '',
          }}
          documentType="po"
          onDownload={() => handleDownloadPOPDF(previewPO.id)}
        />
      )}
    </>
  );
}
