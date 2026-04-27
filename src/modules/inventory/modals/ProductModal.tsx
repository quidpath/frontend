'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, InputAdornment, FormControlLabel, Checkbox, Alert, Chip, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UniversalModal from '@/components/ui/UniversalModal';
import { Product } from '@/services/inventoryService';
import inventoryService from '@/services/inventoryService';
import CategoryDropdown from '../components/CategoryDropdown';
import UomDropdown from '../components/UomDropdown';
import CategoryManagementModal from './CategoryManagementModal';
import WarehouseDropdown from '../components/WarehouseDropdown';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: (syncedServices?: string[]) => void;
}

export default function ProductModal({ open, onClose, product, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [managementModalOpen, setManagementModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    synced: string[];
    errors: string[];
  } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    internal_reference: '',   // was "sku"
    barcode: '',
    category_id: '',          // was "category"
    description: '',
    list_price: '',           // was "unit_price"
    standard_price: '',       // was "cost_price"
    min_qty: '',              // was "reorder_point"
    reorder_qty: '',
    uom_id: 'pcs',            // was "unit_of_measure"
    is_active: true,
    product_type: 'storable' as 'storable' | 'consumable' | 'service',
    costing_method: 'avco' as 'fifo' | 'avco' | 'standard',
    can_be_sold: true,
    can_be_purchased: true,
    // Initial stock fields
    initial_stock: '',
    warehouse_id: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        internal_reference: product.internal_reference || '',
        barcode: product.barcode || '',
        category_id: product.category_id || '',
        description: product.description || '',
        list_price: String(product.list_price || ''),
        standard_price: String(product.standard_price || ''),
        min_qty: String(product.min_qty || ''),
        reorder_qty: String(product.reorder_qty || ''),
        uom_id: product.uom_id || 'pcs',
        is_active: product.is_active ?? true,
        product_type: product.product_type || 'storable',
        costing_method: product.costing_method || 'avco',
        can_be_sold: product.can_be_sold ?? true,
        can_be_purchased: product.can_be_purchased ?? true,
        initial_stock: '',
        warehouse_id: '',
      });
    } else {
      setFormData({
        name: '',
        internal_reference: '',
        barcode: '',
        category_id: '',
        description: '',
        list_price: '',
        standard_price: '',
        min_qty: '10',
        reorder_qty: '50',
        uom_id: 'pcs',
        is_active: true,
        product_type: 'storable',
        costing_method: 'avco',
        can_be_sold: true,
        can_be_purchased: true,
        initial_stock: '0',
        warehouse_id: '',
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
        list_price: Number(formData.list_price),
        standard_price: Number(formData.standard_price),
        min_qty: Number(formData.min_qty),
        reorder_qty: Number(formData.reorder_qty),
      };
      
      // Remove initial stock fields from product payload
      const { initial_stock, warehouse_id, ...productPayload } = payload;
      
      if (product) {
        const response = await inventoryService.updateProduct(product.id, productPayload);
        setSyncStatus({
          synced: response.data.integration?.synced_services || [],
          errors: response.data.integration?.errors || [],
        });
        setTimeout(() => {
          onSuccess(response.data.integration?.synced_services);
        }, 1500);
      } else {
        const response = await inventoryService.createProduct(productPayload as any);
        const createdProductId = response.data.product?.id;
        
        // If initial stock is provided, create a stock adjustment
        if (Number(initial_stock) > 0 && warehouse_id && createdProductId) {
          try {
            await inventoryService.adjustStock({
              product_id: createdProductId,
              location_id: warehouse_id,
              quantity: Number(initial_stock),
              reason: 'Initial stock',
              unit_cost: Number(formData.standard_price) || 0,
            });
          } catch (stockError) {
            console.error('Failed to add initial stock:', stockError);
            // Don't fail the whole operation if stock addition fails
          }
        }
        
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
          <TextField fullWidth label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="SKU / Internal Reference" value={formData.internal_reference} onChange={(e) => setFormData({ ...formData, internal_reference: e.target.value })} required disabled={loading} />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Barcode" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} disabled={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CategoryDropdown
            value={formData.category_id}
            onChange={(value) => setFormData({ ...formData, category_id: value })}
            disabled={loading}
            onManageClick={() => setManagementModalOpen(true)}
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
          <TextField fullWidth label="Selling Price" type="number" value={formData.list_price} onChange={(e) => setFormData({ ...formData, list_price: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">KES</InputAdornment> }} required disabled={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="Cost Price" type="number" value={formData.standard_price} onChange={(e) => setFormData({ ...formData, standard_price: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">KES</InputAdornment> }} required disabled={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="Min Qty (Reorder Point)" type="number" value={formData.min_qty} onChange={(e) => setFormData({ ...formData, min_qty: e.target.value })} disabled={loading} />
        </Grid>

        {/* Initial Stock - Only for new products */}
        {!product && formData.product_type === 'storable' && (
          <>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                Initial Stock (Optional)
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth 
                label="Initial Stock Quantity" 
                type="number" 
                value={formData.initial_stock} 
                onChange={(e) => setFormData({ ...formData, initial_stock: e.target.value })} 
                disabled={loading}
                helperText="Leave as 0 if you'll add stock later"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <WarehouseDropdown
                value={formData.warehouse_id}
                onChange={(value) => setFormData({ ...formData, warehouse_id: value })}
                disabled={loading || !formData.initial_stock || Number(formData.initial_stock) <= 0}
                required={Number(formData.initial_stock) > 0}
                helperText={Number(formData.initial_stock) > 0 ? "Required when adding initial stock" : ""}
                onManageClick={() => setManagementModalOpen(true)}
              />
            </Grid>
          </>
        )}

        {/* Settings */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
            Settings
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <UomDropdown
            value={formData.uom_id}
            onChange={(value) => setFormData({ ...formData, uom_id: value })}
            disabled={loading}
            required
            onManageClick={() => setManagementModalOpen(true)}
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

      {/* Category Management Modal */}
      <CategoryManagementModal
        open={managementModalOpen}
        onClose={() => setManagementModalOpen(false)}
        onSuccess={() => {
          // Refresh dropdowns will happen automatically via their refresh buttons
        }}
      />
    </UniversalModal>
  );
}
