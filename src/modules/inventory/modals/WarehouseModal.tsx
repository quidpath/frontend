'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, FormControlLabel, Checkbox, Typography } from '@mui/material';
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
    short_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    country: 'Kenya',
    phone: '',
    email: '',
    is_active: true,
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        short_name: warehouse.short_name || '',
        address_line1: warehouse.address_line1 || '',
        address_line2: warehouse.address_line2 || '',
        city: warehouse.city || '',
        country: warehouse.country || 'Kenya',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
        is_active: warehouse.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        short_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        country: 'Kenya',
        phone: '',
        email: '',
        is_active: true,
      });
    }
  }, [warehouse, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (warehouse) {
        await inventoryService.updateWarehouse(warehouse.id, formData);
      } else {
        await inventoryService.createWarehouse(formData as any);
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
      subtitle={warehouse ? 'Update warehouse details' : 'Create a new warehouse location'}
      maxWidth="md"
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
        {/* Basic Information */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Basic Information
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField 
            fullWidth 
            label="Warehouse Name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            required 
            disabled={loading}
            placeholder="e.g., Main Warehouse, Central Distribution Center"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField 
            fullWidth 
            label="Short Code" 
            value={formData.short_name} 
            onChange={(e) => setFormData({ ...formData, short_name: e.target.value })} 
            required 
            disabled={loading}
            placeholder="e.g., WH1, CDC"
            helperText="Used as prefix for location codes"
          />
        </Grid>

        {/* Address Information */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
            Address Information
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <TextField 
            fullWidth 
            label="Address Line 1" 
            value={formData.address_line1} 
            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })} 
            disabled={loading}
            placeholder="Street address, P.O. Box, etc."
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField 
            fullWidth 
            label="Address Line 2" 
            value={formData.address_line2} 
            onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })} 
            disabled={loading}
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            label="City" 
            value={formData.city} 
            onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
            disabled={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            label="Country" 
            value={formData.country} 
            onChange={(e) => setFormData({ ...formData, country: e.target.value })} 
            disabled={loading}
          />
        </Grid>

        {/* Contact Information */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
            Contact Information
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            label="Phone" 
            value={formData.phone} 
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
            disabled={loading}
            placeholder="+254 700 000 000"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField 
            fullWidth 
            label="Email" 
            type="email"
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            disabled={loading}
            placeholder="warehouse@company.com"
          />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={<Checkbox checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} disabled={loading} />}
            label="Active"
          />
        </Grid>
      </Grid>
    </UniversalModal>
  );
}
