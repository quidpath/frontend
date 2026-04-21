'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, TextField, Grid, MenuItem, IconButton, Box, Typography, 
  Autocomplete, CircularProgress, Checkbox, FormControlLabel, Alert 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UniversalModal from '@/components/ui/UniversalModal';
import posService from '@/services/posService';
import inventoryService from '@/services/inventoryService';
import { useProducts } from '@/hooks/useInventory';

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const PAYMENT_METHODS = ['Cash', 'Card', 'Mobile Money', 'Bank Transfer'];

export default function OrderModal({ open, onClose, onSuccess }: OrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const products = (productsData as any)?.results ?? [];
  
  const [formData, setFormData] = useState({
    customer_name: '',
    payment_method: 'Cash',
    discount: 0,
    tax: 0,
    include_tax: false,
    items: [] as OrderItem[],
  });

  useEffect(() => {
    if (open) {
      setFormData({
        customer_name: '',
        payment_method: 'Cash',
        discount: 0,
        tax: 0,
        include_tax: false,
        items: [{ product_id: '', product_name: '', quantity: 1, unit_price: 0, total: 0 }],
      });
      setErrors({});
    }
  }, [open]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProductSelect = (index: number, product: any) => {
    if (!product) return;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      product_id: product.id,
      product_name: product.name,
      unit_price: product.list_price || 0,
      total: newItems[index].quantity * (product.list_price || 0),
    };
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      const qty = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const price = field === 'unit_price' ? Number(value) : newItems[index].unit_price;
      newItems[index].total = qty * price;
    }
    
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', product_name: '', quantity: 1, unit_price: 0, total: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = formData.include_tax ? formData.tax : 0;
    const total = subtotal + taxAmount - formData.discount;
    return { subtotal, taxAmount, total };
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    const invalidItems = formData.items.filter(
      item => !item.product_id || item.quantity <= 0 || item.unit_price <= 0
    );
    if (invalidItems.length > 0) {
      newErrors.items = 'All items must have valid product, quantity, and price';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      
      // Create order with items
      const orderData = {
        customer_name: formData.customer_name || 'Walk-in Customer',
        items: formData.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        })),
        subtotal,
        tax: taxAmount,
        discount: formData.discount,
        total,
        payment_method: formData.payment_method,
        status: 'completed',
      };

      await posService.createOrder(orderData as any);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to create order';
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title="New POS Order"
      subtitle="Create a new point of sale order"
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
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Customer Name"
            value={formData.customer_name}
            onChange={(e) => handleChange('customer_name', e.target.value)}
            placeholder="Walk-in Customer"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            select
            label="Payment Method"
            value={formData.payment_method}
            onChange={(e) => handleChange('payment_method', e.target.value)}
            required
          >
            {PAYMENT_METHODS.map((method) => (
              <MenuItem key={method} value={method}>{method}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Order Items</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addItem}>Add Item</Button>
          </Box>
          
          {formData.items.map((item, index) => (
            <Grid container spacing={1.5} key={index} sx={{ mb: 1.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  size="small"
                  options={products}
                  getOptionLabel={(option: any) => option.name || ''}
                  loading={productsLoading}
                  value={products.find((p: any) => p.id === item.product_id) || null}
                  onChange={(_, newValue) => handleProductSelect(index, newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Product"
                      required
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {productsLoading ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 4, sm: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                  inputProps={{ min: 1, step: 1 }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 4, sm: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Unit Price"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 3, sm: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Total"
                  value={item.total.toFixed(2)}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 1, sm: 2 }}>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => removeItem(index)} 
                  disabled={formData.items.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          {errors.items && (
            <Alert severity="error" sx={{ mt: 1 }}>{errors.items}</Alert>
          )}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body1">Subtotal:</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body1" align="right" fontWeight="medium">
                  {subtotal.toFixed(2)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.include_tax}
                      onChange={(e) => handleChange('include_tax', e.target.checked)}
                    />
                  }
                  label="Include Tax"
                />
              </Grid>

              {formData.include_tax && (
                <>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      size="small"
                      type="number"
                      label="Tax Amount"
                      value={formData.tax}
                      onChange={(e) => handleChange('tax', Number(e.target.value))}
                      inputProps={{ min: 0, step: 0.01 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body1" align="right" sx={{ mt: 1 }}>
                      +{taxAmount.toFixed(2)}
                    </Typography>
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 6 }}>
                <TextField
                  size="small"
                  type="number"
                  label="Discount"
                  value={formData.discount}
                  onChange={(e) => handleChange('discount', Number(e.target.value))}
                  inputProps={{ min: 0, step: 0.01 }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body1" align="right" sx={{ mt: 1 }}>
                  -{formData.discount.toFixed(2)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ borderTop: 2, borderColor: 'primary.main', pt: 1, mt: 1 }}>
                  <Grid container>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="h6" fontWeight="bold">Total:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="h6" fontWeight="bold" align="right" color="primary">
                        {total.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {errors.submit && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{errors.submit}</Alert>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
