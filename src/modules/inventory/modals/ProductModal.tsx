'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, InputAdornment, FormControlLabel, Checkbox } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Product } from '@/services/inventoryService';
import inventoryService from '@/services/inventoryService';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

export default function ProductModal({ open, onClose, product, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    description: '',
    unit_price: '',
    cost_price: '',
    reorder_point: '',
    unit_of_measure: 'pcs',
    is_active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        category: product.category || '',
        description: product.description || '',
        unit_price: String(product.unit_price || ''),
        cost_price: String(product.cost_price || ''),
        reorder_point: String(product.reorder_point || ''),
        unit_of_measure: product.unit_of_measure || 'pcs',
        is_active: product.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        barcode: '',
        category: '',
        description: '',
        unit_price: '',
        cost_price: '',
        reorder_point: '10',
        unit_of_measure: 'pcs',
        is_active: true,
      });
    }
  }, [product, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        unit_price: Number(formData.unit_price),
        cost_price: Number(formData.cost_price),
        reorder_point: Number(formData.reorder_point),
      };
      if (product) {
        await inventoryService.updateProduct(product.id, payload);
      } else {
        await inventoryService.createProduct(payload as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={product ? 'Edit Product' : 'New Product'}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {product ? 'Update' : 'Create'} Product
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={8}>
          <TextField fullWidth label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="SKU" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Barcode" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={2} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Unit Price" type="number" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} required />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Cost Price" type="number" value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} required />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Reorder Point" type="number" value={formData.reorder_point} onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Unit of Measure" value={formData.unit_of_measure} onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={<Checkbox checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
            label="Active"
          />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
