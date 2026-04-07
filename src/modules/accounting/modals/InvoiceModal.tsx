'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UniversalModal from '@/components/ui/UniversalModal';
import { Invoice, InvoiceLine } from '@/services/accountingService';
import accountingService from '@/services/accountingService';
import { useTaxRates } from '@/hooks/useTax';
import { useCustomers } from '@/hooks/useFinance';
import { formatCurrency } from '@/utils/formatters';

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  onSuccess: () => void;
}

const PAYMENT_TERMS = [
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
  { value: 'due_on_receipt', label: 'Due on Receipt' },
];

export default function InvoiceModal({
  open,
  onClose,
  invoice,
  onSuccess,
}: InvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: taxRatesData } = useTaxRates();
  const { data: customersData } = useCustomers();
  const taxRates = (taxRatesData as any)?.results ?? (taxRatesData as any)?.tax_rates ?? [];
  const customers = (customersData as any)?.customers ?? [];
  const [formData, setFormData] = useState({
    customer: '',
    customer_id: '',
    date: '',
    due_date: '',
    terms: 'net_30',
    purchase_order: '',
    comments: '',
  });
  const [lines, setLines] = useState<Partial<InvoiceLine>[]>([
    { description: '', quantity: 1, unit_price: 0, tax_amount: 0, discount: 0 },
  ]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        customer: invoice.customer || '',
        customer_id: invoice.customer || '',
        date: invoice.date || '',
        due_date: invoice.due_date || '',
        terms: invoice.terms || 'net_30',
        purchase_order: invoice.purchase_order || '',
        comments: invoice.comments || '',
      });
      setLines(invoice.lines || [{ description: '', quantity: 1, unit_price: 0, tax_amount: 0, discount: 0 }]);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setFormData({
        customer: '',
        customer_id: '',
        date: today,
        due_date: dueDate.toISOString().split('T')[0],
        terms: 'net_30',
        purchase_order: '',
        comments: '',
      });
      setLines([{ description: '', quantity: 1, unit_price: 0, tax_amount: 0, discount: 0 }]);
    }
    setErrors({});
  }, [invoice, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLineChange = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Calculate line totals
    const line = newLines[index];
    const quantity = Number(line.quantity) || 0;
    const unitPrice = Number(line.unit_price) || 0;
    const discount = Number(line.discount) || 0;
    const taxRate = Number(line.tax_amount) || 0;
    
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;
    
    newLines[index] = {
      ...line,
      amount: subtotal,
      sub_total: afterDiscount,
      total: total,
    };
    
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { description: '', quantity: 1, unit_price: 0, tax_amount: 0, discount: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    const totalDiscount = lines.reduce((sum, line) => {
      const amount = Number(line.amount) || 0;
      const discount = Number(line.discount) || 0;
      return sum + (amount * discount / 100);
    }, 0);
    const taxTotal = lines.reduce((sum, line) => {
      const subtotal = Number(line.sub_total) || 0;
      const taxRate = Number(line.tax_amount) || 0;
      return sum + (subtotal * taxRate / 100);
    }, 0);
    const total = subtotal - totalDiscount + taxTotal;
    
    return { subtotal, totalDiscount, taxTotal, total };
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customer) newErrors.customer = 'Customer is required';
    if (!formData.date) newErrors.date = 'Invoice date is required';
    if (!formData.due_date) newErrors.due_date = 'Due date is required';
    
    const hasValidLines = lines.some(line => 
      line.description && Number(line.quantity) > 0 && Number(line.unit_price) > 0
    );
    if (!hasValidLines) newErrors.lines = 'At least one valid line item is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const totals = calculateTotals();
      const processedLines = lines
        .filter(line => line.description && Number(line.quantity) > 0)
        .map(line => {
          const qty = Number(line.quantity) || 0;
          const price = Number(line.unit_price) || 0;
          const discountPct = Number(line.discount) || 0;
          const taxPct = Number(line.tax_amount) || 0;
          const amount = qty * price;
          const discountAmt = amount * (discountPct / 100);
          const afterDiscount = amount - discountAmt;
          const taxAmt = afterDiscount * (taxPct / 100);
          const total = afterDiscount + taxAmt;
          return {
            description: line.description,
            quantity: qty,
            unit_price: price,
            amount,
            discount: discountAmt,
            tax_amount: taxAmt,
            sub_total: afterDiscount,
            total,
          };
        });

      const payload = {
        customer: formData.customer_id || formData.customer,
        date: formData.date,
        due_date: formData.due_date,
        number: invoice?.number || `INV-${Date.now()}`,
        terms: formData.terms,
        purchase_order: formData.purchase_order,
        comments: formData.comments,
        lines: processedLines,
      };

      if (invoice) {
        await accountingService.updateInvoice(invoice.id, payload);
      } else {
        await accountingService.createInvoice(payload);
      }

      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving invoice:', error);
      setErrors({ submit: 'Failed to save invoice. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={invoice ? 'Edit Invoice' : 'New Invoice'}
      subtitle={invoice ? `Editing invoice ${invoice.number}` : 'Create a new invoice'}
      maxWidth="lg"
      loading={loading}
      disableBackdropClick={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {invoice ? 'Update' : 'Create'} Invoice
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        {/* Header Information */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            select
            label="Customer"
            value={formData.customer_id || formData.customer}
            onChange={(e) => {
              const customer = customers.find((c: any) => c.id === e.target.value);
              handleChange('customer_id', e.target.value);
              handleChange('customer', customer?.name ?? e.target.value);
            }}
            error={!!errors.customer}
            helperText={errors.customer}
            required
          >
            {customers.length === 0
              ? <MenuItem disabled value="">No customers found</MenuItem>
              : customers.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)
            }
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Purchase Order #"
            value={formData.purchase_order}
            onChange={(e) => handleChange('purchase_order', e.target.value)}
            placeholder="Optional PO number"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Invoice Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            error={!!errors.date}
            helperText={errors.date}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange('due_date', e.target.value)}
            error={!!errors.due_date}
            helperText={errors.due_date}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            select
            label="Payment Terms"
            value={formData.terms}
            onChange={(e) => handleChange('terms', e.target.value)}
          >
            {PAYMENT_TERMS.map((term) => (
              <MenuItem key={term.value} value={term.value}>
                {term.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Line Items */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Line Items
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addLine}>
              Add Line
            </Button>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell width={100}>Qty</TableCell>
                  <TableCell width={120}>Unit Price</TableCell>
                  <TableCell width={100}>Discount %</TableCell>
                  <TableCell width={100}>Tax %</TableCell>
                  <TableCell width={120} align="right">Total</TableCell>
                  <TableCell width={50}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={line.description || ''}
                        onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={line.quantity || ''}
                        onChange={(e) => handleLineChange(index, 'quantity', Number(e.target.value))}
                        inputProps={{ min: 0, step: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={line.unit_price || ''}
                        onChange={(e) => handleLineChange(index, 'unit_price', Number(e.target.value))}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={line.discount || ''}
                        onChange={(e) => handleLineChange(index, 'discount', Number(e.target.value))}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        value={line.tax_amount || '0'}
                        onChange={(e) => handleLineChange(index, 'tax_amount', Number(e.target.value))}
                      >
                        <MenuItem value="0">No Tax (0%)</MenuItem>
                        {taxRates.length === 0
                          ? null
                          : taxRates.map((r: any) => (
                              <MenuItem key={r.id} value={String(r.rate)}>
                                {r.name} ({r.rate}%)
                              </MenuItem>
                            ))
                        }
                      </TextField>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(line.total || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeLine(index)}
                        disabled={lines.length === 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {errors.lines && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {errors.lines}
            </Typography>
          )}
        </Grid>

        {/* Totals */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ minWidth: 300 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">{formatCurrency(totals.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Discount:</Typography>
                <Typography variant="body2" color="error.main">
                  -{formatCurrency(totals.totalDiscount)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Tax:</Typography>
                <Typography variant="body2">{formatCurrency(totals.taxTotal)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={700}>Total:</Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatCurrency(totals.total)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Comments */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Comments / Notes"
            value={formData.comments}
            onChange={(e) => handleChange('comments', e.target.value)}
            placeholder="Additional notes for the customer"
            multiline
            rows={2}
          />
        </Grid>

        {errors.submit && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" color="error">
              {errors.submit}
            </Typography>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
