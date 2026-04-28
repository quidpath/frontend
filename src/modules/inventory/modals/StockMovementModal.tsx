'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, Alert, Chip, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import UniversalModal from '@/components/ui/UniversalModal';
import { StockMovement } from '@/services/inventoryService';
import inventoryService from '@/services/inventoryService';
import WarehouseDropdown from '../components/WarehouseDropdown';
import StorageLocationDropdown from '../components/StorageLocationDropdown';
import UomDropdown from '../components/UomDropdown';
import ProductSelectorMUI from '../components/ProductSelectorMUI';

interface StockMovementModalProps {
  open: boolean;
  onClose: () => void;
  movement?: StockMovement | null;
  onSuccess: (syncedServices?: string[], accountingCreated?: boolean) => void;
}

export default function StockMovementModal({ open, onClose, movement, onSuccess }: StockMovementModalProps) {
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    synced: string[];
    errors: string[];
    accountingCreated: boolean;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    reference: '',
    move_type: 'receipt' as 'receipt' | 'delivery' | 'adjustment' | 'transfer',
    product_id: '',
    product_name: '',
    quantity: '',
    unit_cost: '',
    warehouse_from_id: '',
    location_from_id: '',
    warehouse_to_id: '',
    location_to_id: '',
    notes: '',
    uom_id: '',
  });

  useEffect(() => {
    if (movement) {
      setFormData({
        reference: movement.reference || '',
        move_type: movement.movement_type,
        product_id: movement.product_id || '',
        product_name: movement.product_name || '',
        quantity: String(movement.quantity || ''),
        unit_cost: String(movement.unit_cost || ''),
        warehouse_from_id: '',
        location_from_id: '',
        warehouse_to_id: movement.warehouse_id || '',
        location_to_id: '',
        notes: movement.notes || '',
        uom_id: '',
      });
    } else {
      setFormData({
        reference: '',
        move_type: 'receipt',
        product_id: '',
        product_name: '',
        quantity: '',
        unit_cost: '',
        warehouse_from_id: '',
        location_from_id: '',
        warehouse_to_id: '',
        location_to_id: '',
        notes: '',
        uom_id: '',
      });
    }
    setSyncStatus(null);
  }, [movement, open]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.product_id) {
      alert('Please select a product');
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    if (!formData.uom_id) {
      alert('Please select a unit of measure');
      return;
    }

    // Validate locations based on move type
    if (formData.move_type === 'receipt' || formData.move_type === 'adjustment') {
      if (!formData.location_to_id) {
        alert('Please select a destination location');
        return;
      }
    }
    if (formData.move_type === 'delivery') {
      if (!formData.location_from_id) {
        alert('Please select a source location');
        return;
      }
    }
    if (formData.move_type === 'transfer') {
      if (!formData.location_from_id || !formData.location_to_id) {
        alert('Please select both source and destination locations');
        return;
      }
    }
    
    setLoading(true);
    setSyncStatus(null);
    
    try {
      const payload = {
        reference: formData.reference,
        move_type: formData.move_type,
        product_id: formData.product_id,
        quantity: Number(formData.quantity),
        unit_cost: formData.unit_cost ? Number(formData.unit_cost) : undefined,
        location_from_id: formData.location_from_id || undefined,
        location_to_id: formData.location_to_id || undefined,
        notes: formData.notes,
        uom_id: formData.uom_id,
      };
      
      const response = await inventoryService.createStockMovement(payload);
      
      setSyncStatus({
        synced: response.data.integration?.synced_services || [],
        errors: response.data.integration?.errors || [],
        accountingCreated: response.data.integration?.accounting_entry_created || false,
      });
      
      setTimeout(() => {
        onSuccess(
          response.data.integration?.synced_services,
          response.data.integration?.accounting_entry_created
        );
      }, 1500);
    } catch (error: any) {
      console.error('Error saving stock movement:', error);
      setSyncStatus({
        synced: [],
        errors: [error.response?.data?.error || error.response?.data?.message || 'Failed to save stock movement'],
        accountingCreated: false,
      });
      setLoading(false);
    }
  };

  const getMoveTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      receipt: 'Receiving stock from vendor (creates Dr: Inventory, Cr: AP)',
      delivery: 'Delivering to customer (creates Dr: COGS, Cr: Inventory)',
      adjustment: 'Physical count adjustment (creates adjustment entry)',
      transfer: 'Internal location transfer (updates asset locations)',
    };
    return descriptions[type] || '';
  };

  const showFromLocation = formData.move_type === 'delivery' || formData.move_type === 'transfer';
  const showToLocation = formData.move_type === 'receipt' || formData.move_type === 'transfer' || formData.move_type === 'adjustment';

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={movement ? 'View Stock Movement' : 'Record Stock Movement'}
      subtitle="Record stock movement and sync to all services"
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          {!movement && (
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              Record Movement
            </Button>
          )}
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
                {syncStatus.accountingCreated && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccountBalanceIcon fontSize="small" />
                    <Typography variant="body2">
                      Accounting entry created automatically
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}
            {syncStatus.errors.length > 0 && (
              <Alert severity="error" sx={{ mt: syncStatus.synced.length > 0 ? 1 : 0 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Errors occurred:
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

        {/* Movement Type */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Movement Details
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Movement Type"
            select
            value={formData.move_type}
            onChange={(e) => setFormData({ ...formData, move_type: e.target.value as any, location_from_id: '', location_to_id: '', warehouse_from_id: '', warehouse_to_id: '' })}
            disabled={loading || !!movement}
            required
          >
            <MenuItem value="receipt">Receipt from Vendor</MenuItem>
            <MenuItem value="delivery">Delivery to Customer</MenuItem>
            <MenuItem value="adjustment">Inventory Adjustment</MenuItem>
            <MenuItem value="transfer">Internal Transfer</MenuItem>
          </TextField>
          {formData.move_type && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {getMoveTypeDescription(formData.move_type)}
            </Typography>
          )}
        </Grid>

        {/* Reference */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Reference"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            disabled={loading || !!movement}
            placeholder="PO-001, SO-001, etc."
          />
        </Grid>

        {/* Product Selection */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
            Product & Quantity
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <ProductSelectorMUI
            value={formData.product_id}
            onChange={(value, product) => {
              setFormData({ 
                ...formData, 
                product_id: value, 
                product_name: product?.name || '',
                uom_id: product?.uom_id || '',
                unit_cost: product ? String(product.standard_price) : ''
              });
            }}
            disabled={loading || !!movement}
            required
          />
        </Grid>

        {/* Quantity and Cost */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            disabled={loading || !!movement}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Unit Cost"
            type="number"
            value={formData.unit_cost}
            onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
            disabled={loading || !!movement}
            placeholder="Optional"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <UomDropdown
            value={formData.uom_id}
            onChange={(value) => setFormData({ ...formData, uom_id: value })}
            disabled={loading || !!movement || !formData.product_id}
            required
            showManageButton={false}
          />
        </Grid>

        {/* Locations */}
        {(showFromLocation || showToLocation) && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
              Storage Locations
            </Typography>
          </Grid>
        )}
        
        {showFromLocation && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <WarehouseDropdown
                value={formData.warehouse_from_id}
                onChange={(value) => setFormData({ ...formData, warehouse_from_id: value, location_from_id: '' })}
                label="From Warehouse"
                disabled={loading || !!movement}
                required
                showManageButton={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StorageLocationDropdown
                warehouseId={formData.warehouse_from_id}
                value={formData.location_from_id}
                onChange={(value) => setFormData({ ...formData, location_from_id: value })}
                label="From Location"
                disabled={loading || !!movement || !formData.warehouse_from_id}
                required
                showManageButton={false}
              />
            </Grid>
          </>
        )}

        {showToLocation && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <WarehouseDropdown
                value={formData.warehouse_to_id}
                onChange={(value) => setFormData({ ...formData, warehouse_to_id: value, location_to_id: '' })}
                label="To Warehouse"
                disabled={loading || !!movement}
                required
                showManageButton={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StorageLocationDropdown
                warehouseId={formData.warehouse_to_id}
                value={formData.location_to_id}
                onChange={(value) => setFormData({ ...formData, location_to_id: value })}
                label="To Location"
                disabled={loading || !!movement || !formData.warehouse_to_id}
                required
                showManageButton={false}
              />
            </Grid>
          </>
        )}

        {/* Notes */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            disabled={loading || !!movement}
            multiline
            rows={2}
          />
        </Grid>

        {/* Integration Info */}
        {!syncStatus && !movement && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              <Typography variant="body2" gutterBottom>
                This stock movement will automatically:
              </Typography>
              <Typography variant="caption" component="div">
                • Update stock levels in inventory<br />
                • Create accounting entry (COGS/Inventory valuation)<br />
                • Update POS stock availability<br />
                • Track project materials (if linked)<br />
                • Update HRM asset locations (if applicable)
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
