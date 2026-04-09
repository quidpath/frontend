/**
 * Refactored Vendor Bill Modal with Draft/Post functionality
 */
'use client';

import { useState, useEffect } from 'react';
import {
  Stack, Typography, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Grid, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatCurrency } from '@/utils/formatters';
import type { VendorBill, Vendor } from '@/services/financeService';
import DocumentModal from './DocumentModal';
import { useDocumentModal } from '@/hooks/useDocumentModal';

interface BillModalProps {
  open: boolean;
  onClose: () => void;
  record?: VendorBill | null;
  vendors: Vendor[];
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}

export default function BillModalNew({
  open,
  onClose,
  record,
  vendors,
  onSuccess,
}: BillModalProps) {
  const [form, setForm] = useState({
    vendor_id: '',
    date: '',
    due_date: '',
    number: '',
    comments: '',
    terms: '',
  });
  const [lines, setLines] = useState([
    { description: '', quantity: 1, unit_price: 0 },
  ]);

  const {
    isDirty,
    setIsDirty,
    savedDocId,
    isLoading,
    saveDraft,
    postDocument,
    autoSave,
  } = useDocumentModal({
    documentType: 'bill',
    initialData: record,
    onSuccess,
    onClose,
  });

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        vendor_id: record.vendor_id ?? '',
        date: record.date,
        due_date: record.due_date ?? '',
        number: record.number ?? `BILL-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        comments: record.comments ?? '',
        terms: record.terms ?? '',
      });
      setLines(
        record.lines?.length
          ? record.lines.map(l => ({ description: l.description, quantity: l.quantity, unit_price: l.unit_price }))
          : [{ description: '', quantity: 1, unit_price: 0 }]
      );
      setIsDirty(false);
    } else {
      setForm({
        vendor_id: '',
        date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        number: `BILL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random()*9000)+1000)}`,
        comments: '',
        terms: 'Net 30',
      });
      setLines([{ description: '', quantity: 1, unit_price: 0 }]);
      setIsDirty(false);
    }
  }, [record, open, setIsDirty]);

  const handleFormChange = (field: string, value: any) => {
    setForm((p) => ({ ...p, [field]: value }));
    setIsDirty(true);
  };

  const setLine = (i: number, k: string, v: string | number) => {
    setLines((p) => p.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
    setIsDirty(true);
  };

  const subtotal = lines.reduce(
    (sum, line) => sum + line.quantity * line.unit_price,
    0
  );
  const taxRate = 0.16;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const preparePayload = () => ({
    vendor: form.vendor_id,
    date: form.date,
    due_date: form.due_date,
    number: form.number,
    comments: form.comments,
    terms: form.terms,
    lines: lines.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      discount: 0,
      taxable_id: 'exempt',
    })),
  });

  const handleSaveDraft = async () => {
    const payload = preparePayload();
    return await saveDraft(payload);
  };

  const handlePost = async () => {
    const payload = preparePayload();
    await postDocument(payload);
  };

  const handleAutoSave = async () => {
    const payload = preparePayload();
    await autoSave(payload);
  };

  return (
    <DocumentModal
      open={open}
      onClose={onClose}
      title={record ? 'Edit Vendor Bill' : 'New Vendor Bill'}
      onSaveDraft={handleSaveDraft}
      onPost={handlePost}
      onAutoSave={handleAutoSave}
      isDirty={isDirty}
      isLoading={isLoading}
      documentId={savedDocId}
    >
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Vendor</InputLabel>
              <Select
                value={form.vendor_id}
                label="Vendor"
                onChange={(e) => handleFormChange('vendor_id', e.target.value)}
              >
                {vendors.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Bill Number"
              size="small"
              fullWidth
              value={form.number}
              onChange={(e) => handleFormChange('number', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6 }}>
            <TextField
              label="Date"
              type="date"
              size="small"
              fullWidth
              value={form.date}
              onChange={(e) => handleFormChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6 }}>
            <TextField
              label="Due Date"
              type="date"
              size="small"
              fullWidth
              value={form.due_date}
              onChange={(e) => handleFormChange('due_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" fontWeight={600}>
          Line Items
        </Typography>
        {lines.map((l, i) => (
          <Stack key={i} direction="row" spacing={1} alignItems="center">
            <TextField
              label="Description"
              size="small"
              value={l.description}
              onChange={(e) => setLine(i, 'description', e.target.value)}
              sx={{ flex: 3 }}
            />
            <TextField
              label="Qty"
              size="small"
              type="number"
              value={l.quantity}
              onChange={(e) => setLine(i, 'quantity', Number(e.target.value))}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Unit Price"
              size="small"
              type="number"
              value={l.unit_price}
              onChange={(e) => setLine(i, 'unit_price', Number(e.target.value))}
              sx={{ flex: 1 }}
            />
            <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right' }}>
              {formatCurrency(l.quantity * l.unit_price)}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setLines((p) => p.filter((_, idx) => idx !== i));
                setIsDirty(true);
              }}
              disabled={lines.length === 1}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <Button
          size="small"
          onClick={() => {
            setLines((p) => [...p, { description: '', quantity: 1, unit_price: 0 }]);
            setIsDirty(true);
          }}
          sx={{ alignSelf: 'flex-start' }}
        >
          + Add Line
        </Button>

        <TextField
          label="Terms"
          size="small"
          fullWidth
          value={form.terms}
          onChange={(e) => handleFormChange('terms', e.target.value)}
          placeholder="e.g., Net 30"
        />

        <TextField
          label="Comments"
          size="small"
          fullWidth
          multiline
          rows={2}
          value={form.comments}
          onChange={(e) => handleFormChange('comments', e.target.value)}
        />

        <Stack
          spacing={1}
          sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatCurrency(subtotal)}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Tax (16%):</Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatCurrency(taxAmount)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Total:
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              {formatCurrency(total)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </DocumentModal>
  );
}
