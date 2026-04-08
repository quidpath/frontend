/**
 * Refactored Invoice Modal with Draft/Post functionality
 */
'use client';

import { useState, useEffect } from 'react';
import {
  Stack, Typography, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Grid, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatCurrency } from '@/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import financeService from '@/services/financeService';
import type { Invoice, Customer, InvoiceLine } from '@/services/financeService';
import DocumentModal from './DocumentModal';
import { useDocumentModal } from '@/hooks/useDocumentModal';

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  record?: Invoice | null;
  customers: Customer[];
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}

export default function InvoiceModalNew({
  open,
  onClose,
  record,
  customers,
  onSuccess,
}: InvoiceModalProps) {
  const [form, setForm] = useState({
    customer_id: '',
    date: '',
    due_date: '',
    number: '',
    salesperson: '',
    comments: '',
    terms: '',
  });
  const [lines, setLines] = useState<InvoiceLine[]>([
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
    documentType: 'invoice',
    initialData: record,
    onSuccess,
    onClose,
  });

  // Fetch corporate users for salesperson dropdown
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['corporate-users'],
    queryFn: () => financeService.getCorporateUsers(),
  });
  const users = (usersData?.data?.users ?? []) as Array<{
    id: string;
    username: string;
    email: string;
    role: string;
  }>;

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        customer_id: record.customer_id ?? '',
        date: record.date,
        due_date: record.due_date,
        number: record.number,
        salesperson: record.salesperson ?? '',
        comments: record.comments ?? '',
        terms: record.terms ?? '',
      });
      setLines(
        record.lines?.length
          ? record.lines
          : [{ description: '', quantity: 1, unit_price: 0 }]
      );
      setIsDirty(false);
    } else {
      setForm({
        customer_id: '',
        date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        number: `INV-${Date.now()}`,
        salesperson: '',
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

  const setLine = (i: number, k: keyof InvoiceLine, v: string | number) => {
    setLines((p) => p.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
    setIsDirty(true);
  };

  // Calculate totals
  const subtotal = lines.reduce(
    (sum, line) => sum + line.quantity * line.unit_price,
    0
  );
  const taxRate = 0.16; // 16% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const preparePayload = () => ({
    customer: form.customer_id,
    date: form.date,
    due_date: form.due_date,
    number: form.number,
    salesperson: form.salesperson || undefined,
    comments: form.comments,
    terms: form.terms,
    lines: lines.map((l) => {
      const qty = l.quantity;
      const price = l.unit_price;
      const amount = qty * price;
      const discount = 0;
      const taxRate = 0.16;
      const taxAmount = (amount - discount) * taxRate;
      const subTotal = amount - discount;
      const total = subTotal + taxAmount;
      return {
        description: l.description,
        quantity: qty,
        unit_price: price,
        amount,
        discount,
        tax_amount: taxAmount,
        sub_total: subTotal,
        total,
      };
    }),
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
      title={record ? 'Edit Invoice' : 'New Invoice'}
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
              <InputLabel>Customer</InputLabel>
              <Select
                value={form.customer_id}
                label="Customer"
                onChange={(e) => handleFormChange('customer_id', e.target.value)}
              >
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Invoice Number"
              size="small"
              fullWidth
              value={form.number}
              onChange={(e) => handleFormChange('number', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
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
          <Grid size={{ xs: 6, sm: 4 }}>
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
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Salesperson (optional)</InputLabel>
              <Select
                value={form.salesperson}
                label="Salesperson (optional)"
                onChange={(e) => handleFormChange('salesperson', e.target.value)}
                disabled={loadingUsers}
              >
                <MenuItem value="">Auto (Current User)</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.username} ({u.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

        {/* Totals Section */}
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
