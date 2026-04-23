'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, TextField, Grid, MenuItem, IconButton, Box, Typography, 
  Autocomplete, CircularProgress, Checkbox, FormControlLabel, Alert,
  Divider, Chip, Card, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import UniversalModal from '@/components/ui/UniversalModal';
import posService from '@/services/posService';
import { usePaymentAccounts } from '@/hooks/useBanking';
import { useQuery } from '@tanstack/react-query';

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

interface PaymentMethod {
  method: string;
  amount: number;
  reference: string;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' }
];

export default function OrderModal({ open, onClose, onSuccess }: OrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch products from POS service (not inventory directly)
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['pos', 'products'],
    queryFn: async () => {
      const response = await posService.getProducts();
      return response.data;
    },
    staleTime: 30_000,
  });
  const products = (productsData as any)?.products ?? [];
  
  // Fetch payment accounts (bank accounts + chart of accounts)
  const { data: paymentAccounts, isLoading: paymentAccountsLoading } = usePaymentAccounts();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    discount: 0,
    tax: 0,
    include_tax: false,
    items: [] as OrderItem[],
    // Payment fields
    payment_account_id: '',
    payment_methods: [] as PaymentMethod[],
    mark_as_paid: false,
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        customer_name: '',
        discount: 0,
        tax: 0,
        include_tax: false,
        items: [{ product_id: '', product_name: '', quantity: 1, unit_price: 0, total: 0 }],
        payment_account_id: '',
        payment_methods: [{ method: 'cash', amount: 0, reference: '' }],
        mark_as_paid: false,
        notes: '',
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

  const addPaymentMethod = () => {
    setFormData((prev) => ({
      ...prev,
      payment_methods: [...prev.payment_methods, { method: 'cash', amount: 0, reference: '' }],
    }));
  };

  const removePaymentMethod = (index: number) => {
    if (formData.payment_methods.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      payment_methods: prev.payment_methods.filter((_, i) => i !== index),
    }));
  };

  const handlePaymentMethodChange = (index: number, field: keyof PaymentMethod, value: string | number) => {
    const newPaymentMethods = [...formData.payment_methods];
    newPaymentMethods[index] = { ...newPaymentMethods[index], [field]: value };
    setFormData((prev) => ({ ...prev, payment_methods: newPaymentMethods }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = formData.include_tax ? formData.tax : 0;
    const total = subtotal + taxAmount - formData.discount;
    const totalPaid = formData.payment_methods.reduce((sum, payment) => sum + payment.amount, 0);
    const change = totalPaid - total;
    return { subtotal, taxAmount, total, totalPaid, change };
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate items
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    const invalidItems = formData.items.filter(
      item => !item.product_id || item.quantity <= 0 || item.unit_price <= 0
    );
    if (invalidItems.length > 0) {
      newErrors.items = 'All items must have valid product, quantity, and price';
    }

    // Validate payment if marking as paid
    if (formData.mark_as_paid) {
      if (!formData.payment_account_id) {
        newErrors.payment_account_id = 'Payment account is required when marking as paid';
      }
      
      const { total, totalPaid } = calculateTotals();
      if (totalPaid < total) {
        newErrors.payment_methods = `Insufficient payment. Required: ${total.toFixed(2)}, Received: ${totalPaid.toFixed(2)}`;
      }
      
      const invalidPayments = formData.payment_methods.filter(
        payment => !payment.method || payment.amount <= 0
      );
      if (invalidPayments.length > 0) {
        newErrors.payment_methods = 'All payment methods must have valid method and amount';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      
      // Create complete order with items and payments in one request
      const orderData = {
        customer_name: formData.customer_name || 'Walk-in Customer',
        mark_as_paid: formData.mark_as_paid,
        payment_account_id: formData.mark_as_paid ? formData.payment_account_id : undefined,
        notes: formData.notes,
        items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: 0, // Can be enhanced later
        })),
        payments: formData.mark_as_paid ? formData.payment_methods.map(pm => ({
          method: pm.method,
          amount: pm.amount,
          reference: pm.reference || '',
        })) : undefined,
      };

      const response = await posService.createOrder(orderData as any);
      
      // Show success message with accounting sync status if applicable
      if (formData.mark_as_paid && response.data.accounting_sync) {
        const syncStatus = response.data.accounting_sync;
        if (syncStatus.success) {
          console.log(`Order created and synced to accounting. Invoice: ${syncStatus.invoice_number}`);
        } else {
          console.warn(`Order created but accounting sync failed: ${syncStatus.error}`);
        }
      }

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

  const { subtotal, taxAmount, total, totalPaid, change } = calculateTotals();

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title="New POS Order"
      subtitle="Create a new point of sale order with payment processing and accounting sync"
      maxWidth="lg"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {formData.mark_as_paid ? 'Complete Order & Payment' : 'Save as Draft'}
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
            multiline
            rows={1}
            label="Notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Order notes..."
          />
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
                  ${subtotal.toFixed(2)}
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
                      +${taxAmount.toFixed(2)}
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
                  -${formData.discount.toFixed(2)}
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
                        ${total.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Payment Section */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PaymentIcon color="primary" />
            <Typography variant="h6">Payment Information</Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.mark_as_paid}
                onChange={(e) => handleChange('mark_as_paid', e.target.checked)}
              />
            }
            label="Mark as Paid (Complete Payment Now)"
            sx={{ mb: 2 }}
          />

          {formData.mark_as_paid && (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AccountBalanceIcon fontSize="small" />
                      <Typography variant="subtitle2">Payment Account</Typography>
                    </Box>
                    <Autocomplete
                      options={paymentAccounts}
                      getOptionLabel={(option: any) => option.display_name}
                      loading={paymentAccountsLoading}
                      value={paymentAccounts.find((acc: any) => acc.id === formData.payment_account_id) || null}
                      onChange={(_, newValue) => handleChange('payment_account_id', newValue?.id || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Payment Account"
                          required
                          error={!!errors.payment_account_id}
                          helperText={errors.payment_account_id}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {paymentAccountsLoading ? <CircularProgress size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option: any) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {option.display_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">Payment Methods</Typography>
                      <Button size="small" startIcon={<AddIcon />} onClick={addPaymentMethod}>
                        Add Payment Method
                      </Button>
                    </Box>
                    
                    {formData.payment_methods.map((payment, index) => (
                      <Grid container spacing={1.5} key={index} sx={{ mb: 1.5 }}>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <TextField
                            fullWidth
                            size="small"
                            select
                            label="Method"
                            value={payment.method}
                            onChange={(e) => handlePaymentMethodChange(index, 'method', e.target.value)}
                            required
                          >
                            {PAYMENT_METHODS.map((method) => (
                              <MenuItem key={method.value} value={method.value}>
                                {method.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Amount"
                            value={payment.amount}
                            onChange={(e) => handlePaymentMethodChange(index, 'amount', Number(e.target.value))}
                            inputProps={{ min: 0, step: 0.01 }}
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 5, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Reference"
                            value={payment.reference}
                            onChange={(e) => handlePaymentMethodChange(index, 'reference', e.target.value)}
                            placeholder="Transaction ref..."
                          />
                        </Grid>
                        <Grid size={{ xs: 1, sm: 2 }}>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => removePaymentMethod(index)} 
                            disabled={formData.payment_methods.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                    
                    {errors.payment_methods && (
                      <Alert severity="error" sx={{ mt: 1 }}>{errors.payment_methods}</Alert>
                    )}
                  </Grid>

                  {/* Payment Summary */}
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2 }}>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2">Order Total:</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" align="right" fontWeight="medium">
                            ${total.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2">Total Paid:</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" align="right" fontWeight="medium" color={totalPaid >= total ? 'success.main' : 'error.main'}>
                            ${totalPaid.toFixed(2)}
                          </Typography>
                        </Grid>
                        {change > 0 && (
                          <>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="body2" fontWeight="bold">Change:</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="body2" align="right" fontWeight="bold" color="success.main">
                                ${change.toFixed(2)}
                              </Typography>
                            </Grid>
                          </>
                        )}
                        {totalPaid < total && (
                          <>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="body2" color="error">Remaining:</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="body2" align="right" color="error">
                                ${(total - totalPaid).toFixed(2)}
                              </Typography>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
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
