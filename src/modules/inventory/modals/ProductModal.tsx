'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, InputAdornment, FormControlLabel, Checkbox, Alert, Chip, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UniversalModal from '@/components/ui/UniversalModal';
import { Product } from '@/services/inventoryService';
import inventoryService from '@/services/inventoryService';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: (syncedServices?: string[]) => void;
}

export default function ProductModal({ open, onClose, product, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    synced: string[];
    errors: string[];
  } | null>(null);
  
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
    product_type: 'storable' as 'storable' | 'consumable' | 'service',
    costing_method: 'avco' as 'fifo' | 'avco' | 'standard',
    can_be_sold: true,
    can_be_purchased: true,
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
        product_type: product.product_type || 'storable',
        costing_method: product.costing_method || 'avco',
        can_be_sold: product.can_be_sold ?? true,
        can_be_purchased: product.can_be_purchased ?? true,
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
        product_type: 'storable',
        costing_method: 'avco',
        can_be_sold: true,
        can_be_purchased: true,
      });
    }
    setSyncStatus(null);
  }, [product, open]);

  const handleSubmit = async () => {
    setLoading(true);
    setSyncStatus(null);
    
    try {
      const payload = {
        ...formData,
        unit_price: Number(formData.unit_price),
        cost_price: Number(formData.cost_price),
        reorder_point: Number(formData.reorder_point),
      };
      
      if (product) {
        const response = await inventoryService.updateProduct(product.id, payload);
        setSyncStatus({
          synced: response.data.integration?.synced_services || [],
          errors: response.data.integration?.errors || [],
        });
        setTimeout(() => {
          onSuccess(response.data.integration?.synced_services);
        }, 1500);
      } else {
        const response = await inventoryService.createProduct(payload as any);
        setSyncStatus({
          synced: response.data.integration?.synced_services || [],
          errors: response.data.integration?.errors || [],
        });
        setTimeout(() => {
          onSuccess(response.data.integration?.synced_services);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      setSyncStatus({
        synced: [],
        errors: [error.response?.data?.message || 'Failed to save product'],
      });
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={product ? 'Edit Product' : 'New Product'}
      subtitle={product ? 'Update product and sync to all services' : 'Create product and sync to all services'}
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
        {/* Sync Status */}
        {syncStatus && (
          <Grid size={{ xs: 12 }}>
            {syncStatus.synced.length > 0 && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Successfully synced to {syncStatus.synced.length} services:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                  {syncStatus.synced.map((service) => (
                    <Chip key={service} label={service} size="small" color="success" />
                  ))}
                </Box>
              </Alert>
            )}
            {syncStatus.errors.length > 0 && (
              <Alert severity="warning" sx={{ mt: syncStatus.synced.length > 0 ? 1 : 0 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Some services failed to sync:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {syncStatus.errors.map((error, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      • {error}
                    </Typography>
                  ))}
                </Box>
              </Alert>
            )}
          </Grid>
        )}

        {/* Basic Information */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Basic Information
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField 
            fullWidth 
            label="Product Name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            required 
            disabled={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField 
            fullWidth 
            label="SKU" 
            value={formData.sku} 
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
            required 
            disabled={loading}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            label="Barcode" 
            value={formData.barcode} 
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} 
            disabled={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            label="Category" 
            value={formData.category} 
            onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
            disabled={loading}
          />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <TextField 
            fullWidth 
            label="Description" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            multiline 
            rows={2} 
            disabled={loading}
          />
        </Grid>

        {/* Pricing */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
            Pricing & Inventory
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField 
            fullWidth 
            label="Unit Price" 
            type="number" 
            value={formData.unit_price} 
            onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })} 
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
            required 
            disabled={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField 
            fullWidth 
            label="Cost Price" 
            type="number" 
            value={formData.cost_price} 
            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })} 
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
            required 
            disabled={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField 
            fullWidth 
            label="Reorder Point" 
            type="number" 
            value={formData.reorder_point} 
            onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })} 
            disabled={loading}
          />
        </Grid>

        {/* Settings */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
            Settings
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            label="Unit of Measure" 
            value={formData.unit_of_measure} 
            onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })} 
            disabled={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            label="Product Type" 
            select 
            SelectProps={{ native: true }}
            value={formData.product_type} 
            onChange={(e) => setFormData({ ...formData, product_type: e.target.value as any })} 
            disabled={loading}
          >
            <option value="storable">Storable Product</option>
            <option value="consumable">Consumable</option>
            <option value="service">Service</option>
          </TextField>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            label="Costing Method" 
            select 
            SelectProps={{ native: true }}
            value={formData.costing_method} 
            onChange={(e) => setFormData({ ...formData, costing_method: e.target.value as any })} 
            disabled={loading}
          >
            <option value="avco">Average Cost (AVCO)</option>
            <option value="fifo">First In First Out (FIFO)</option>
            <option value="standard">Standard Price</option>
          </TextField>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.can_be_sold} 
                  onChange={(e) => setFormData({ ...formData, can_be_sold: e.target.checked })} 
                  disabled={loading}
                />
              }
              label="Can be sold"
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.can_be_purchased} 
                  onChange={(e) => setFormData({ ...formData, can_be_purchased: e.target.checked })} 
                  disabled={loading}
                />
              }
              label="Can be purchased"
            />
          </Box>
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={formData.is_active} 
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} 
                disabled={loading}
              />
            }
            label="Active"
          />
        </Grid>

        {/* Integration Info */}
        {!syncStatus && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              This product will be automatically synced to: Accounting, POS, Projects, CRM, and HRM.
            </Alert>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
