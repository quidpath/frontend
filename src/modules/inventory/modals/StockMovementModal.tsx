'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { StockMovement } from '@/services/inventoryService';
import inventoryService from '@/services/inventoryService';

interface StockMovementModalProps {
  open: boolean;
  onClose: () => void;
  movement?: StockMovement | null;
  onSuccess: () => void;
}

const MOVEMENT_TYPES = ['in', 'out', 'adjustment', 'transfer'];

export default function StockMovementModal({ open, onClose, movement, onSuccess }: StockMovementModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    movement_type: 'in' as any,
    quantity: '',
    reference: '',
    notes: '',
    date: '',
  });

  useEffect(() => {
    if (movement) {
      setFormData({
        product_id: movement.product_id || '',
        warehouse_id: movement.warehouse_id || '',
        movement_type: movement.movement_type || 'in',
        quantity: String(movement.quantity || ''),
        reference: movement.reference || '',
        notes: movement.notes || '',
        date: movement.date || '',
      });
    } else {
      setFormData({
        product_id: '',
        warehouse_id: '',
        movement_type: 'in',
        quantity: '',
        reference: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [movement, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
      };
      await inventoryService.createStockMovement(payload as any);
      onSuccess();
    } catch (error) {
      console.error('Error recording stock movement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title="Record Stock Movement"
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            Record Movement
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField fullWidth label="Product ID" value={formData.product_id} onChange={(e) => setFormData({ ...formData, product_id: e.target.value })} required />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Warehouse ID" value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })} required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select label="Movement Type" value={formData.movement_type} onChange={(e) => setFormData({ ...formData, movement_type: e.target.value as any })}>
            {MOVEMENT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Reference" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} multiline rows={2} />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
