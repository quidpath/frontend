'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem, Alert, Chip, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import UniversalModal from '@/components/ui/UniversalModal';
import { StockMovement } from '@/services/inventoryService';
import inventoryService from '@/services/inventoryService';

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
    quantity: '',
    unit_cost: '',
    location_from_id: '',
    location_to_id: '',
    notes: '',
    uom_id: 'pcs',
  });

  useEffect(() => {
    if (movement) {
      setFormData({
        reference: movement.reference || '',
        move_type: movement.movement_type,
        product_id: movement.product_id || '',
        quantity: String(movement.quantity || ''),
        unit_cost: String(movement.unit_cost || ''),
        location_from_id: '',
        location_to_id: movement.warehouse_id || '',
        notes: movement.notes || '',
        uom_id: 'pcs',
      });
    } else {
      setFormData({
        reference: '',
        move_type: 'receipt',
        product_id: '',
        quantity: '',
        unit_cost: '',
        location_from_id: '',
        location_to_id: '',
        notes: '',
        uom_id: 'pcs',
      });
    }
    setSyncStatus(null);
  }, [movement, open]);

  const handleSubmit = async () => {
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
        errors: [error.response?.data?.message || 'Failed to save stock movement'],
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

        {/* Movement Type */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Movement Type"
            select
            value={formData.move_type}
            onChange={(e) => setFormData({ ...formData, move_type: e.target.value as any })}
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

        {/* Product */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Product ID"
            value={formData.product_id}
            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
            disabled={loading || !!movement}
            required
            placeholder="Product UUID"
          />
        </Grid>

        {/* Quantity and Cost */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            disabled={loading || !!movement}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Unit Cost"
            type="number"
            value={formData.unit_cost}
            onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
            disabled={loading || !!movement}
            placeholder="Optional"
          />
        </Grid>

        {/* Locations */}
        {(formData.move_type === 'delivery' || formData.move_type === 'transfer') && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="From Location"
              value={formData.location_from_id}
              onChange={(e) => setFormData({ ...formData, location_from_id: e.target.value })}
              disabled={loading || !!movement}
              placeholder="Location UUID"
            />
          </Grid>
        )}

        {(formData.move_type === 'receipt' || formData.move_type === 'transfer' || formData.move_type === 'adjustment') && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="To Location"
              value={formData.location_to_id}
              onChange={(e) => setFormData({ ...formData, location_to_id: e.target.value })}
              disabled={loading || !!movement}
              placeholder="Location UUID"
            />
          </Grid>
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
