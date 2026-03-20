'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, FormControlLabel, Checkbox } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Warehouse } from '@/services/inventoryService';
import inventoryService from '@/services/inventoryService';

interface WarehouseModalProps {
  open: boolean;
  onClose: () => void;
  warehouse?: Warehouse | null;
  onSuccess: () => void;
}

export default function WarehouseModal({ open, onClose, warehouse, onSuccess }: WarehouseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    capacity: '',
    manager: '',
    is_active: true,
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        code: warehouse.code || '',
        location: warehouse.location || '',
        capacity: String(warehouse.capacity || ''),
        manager: warehouse.manager || '',
        is_active: warehouse.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        location: '',
        capacity: '',
        manager: '',
        is_active: true,
      });
    }
  }, [warehouse, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? Number(formData.capacity) : undefined,
      };
      if (warehouse) {
        await inventoryService.updateWarehouse(warehouse.id, payload);
      } else {
        await inventoryService.createWarehouse(payload as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving warehouse:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={warehouse ? 'Edit Warehouse' : 'New Warehouse'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {warehouse ? 'Update' : 'Create'} Warehouse
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField fullWidth label="Warehouse Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Manager" value={formData.manager} onChange={(e) => setFormData({ ...formData, manager: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={<Checkbox checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
            label="Active"
          />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
