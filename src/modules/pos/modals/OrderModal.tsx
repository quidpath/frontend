'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, IconButton, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UniversalModal from '@/components/ui/UniversalModal';
import { POSOrder, POSOrderItem } from '@/services/posService';
import posService from '@/services/posService';

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  order?: POSOrder | null;
  onSuccess: () => void;
}

const PAYMENT_METHODS = ['Cash', 'Card', 'Mobile Money', 'Bank Transfer'];

export default function OrderModal({ open, onClose, order, onSuccess }: OrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    customer_name: '',
    payment_method: 'Cash',
    discount: 0,
    items: [] as POSOrderItem[],
  });

  useEffect(() => {
    if (order) {
      setFormData({
        customer_name: order.customer_name || '',
        payment_method: order.payment_method || 'Cash',
        discount: order.discount || 0,
        items: order.items || [],
      });
    } else {
      setFormData({
        customer_name: '',
        payment_method: 'Cash',
        discount: 0,
        items: [{ id: '', product_id: '', product_name: '', quantity: 1, unit_price: 0, total: 0 }],
      });
    }
    setErrors({});
  }, [order, open]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleItemChange = (index: number, field: keyof POSOrderItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { id: '', product_id: '', product_name: '', quantity: 1, unit_price: 0, total: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.16; // 16% VAT
    const total = subtotal + tax - formData.discount;
    return { subtotal, tax, total };
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    if (formData.items.some(item => !item.product_name || item.quantity <= 0 || item.unit_price <= 0)) {
      newErrors.items = 'All items must have valid product, quantity, and price';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { subtotal, tax, total } = calculateTotals();
      const orderData = {
        customer_name: formData.customer_name,
        items: formData.items,
        subtotal,
        tax,
        discount: formData.discount,
        total,
        payment_method: formData.payment_method,
        status: 'completed' as const,
      };

      await posService.createOrder(orderData);
      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving order:', error);
      setErrors({ submit: 'Failed to save order. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title="New Order"
      subtitle="Create a new POS order"
      maxWidth="lg"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            Complete Order
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Customer Name"
            value={formData.customer_name}
            onChange={(e) => handleChange('customer_name', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Payment Method"
            value={formData.payment_method}
            onChange={(e) => handleChange('payment_method', e.target.value)}
          >
            {PAYMENT_METHODS.map((method) => (
              <MenuItem key={method} value={method}>{method}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Order Items</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addItem}>Add Item</Button>
          </Box>
          {formData.items.map((item, index) => (
            <Grid container spacing={1.5} key={index} sx={{ mb: 1.5 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Product Name"
                  value={item.product_name}
                  onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Unit Price"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={3} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Total"
                  value={item.total.toFixed(2)}
                  disabled
                />
              </Grid>
              <Grid item xs={1} sm={2}>
                <IconButton size="small" color="error" onClick={() => removeItem(index)} disabled={formData.items.length === 1}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          {errors.items && <Typography color="error" variant="caption">{errors.items}</Typography>}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}><Typography>Subtotal:</Typography></Grid>
              <Grid item xs={6}><Typography align="right">{subtotal.toFixed(2)}</Typography></Grid>
              <Grid item xs={6}><Typography>Tax (16%):</Typography></Grid>
              <Grid item xs={6}><Typography align="right">{tax.toFixed(2)}</Typography></Grid>
              <Grid item xs={6}>
                <TextField
                  size="small"
                  type="number"
                  label="Discount"
                  value={formData.discount}
                  onChange={(e) => handleChange('discount', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={6}><Typography align="right">-{formData.discount.toFixed(2)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="h6">Total:</Typography></Grid>
              <Grid item xs={6}><Typography variant="h6" align="right">{total.toFixed(2)}</Typography></Grid>
            </Grid>
          </Box>
        </Grid>

        {errors.submit && (
          <Grid item xs={12}>
            <Typography color="error" variant="body2">{errors.submit}</Typography>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
