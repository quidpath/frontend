'use client';

import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import inventoryService, { StorageLocation } from '@/services/inventoryService';

interface StorageLocationDropdownProps {
  warehouseId: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  showManageButton?: boolean;
  onManageClick?: () => void;
}

export default function StorageLocationDropdown({
  warehouseId,
  value,
  onChange,
  label = 'Storage Location',
  disabled = false,
  required = false,
  helperText,
  showManageButton = false,
  onManageClick,
}: StorageLocationDropdownProps) {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLocations = async () => {
    if (!warehouseId) {
      setLocations([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await inventoryService.getStorageLocations(warehouseId, { flat: 'true' });
      const data = response.data.results || response.data.data || [];
      setLocations(data.filter((loc: StorageLocation) => loc.is_active && loc.location_type === 'internal'));
    } catch (error) {
      console.error('Failed to fetch storage locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [warehouseId]);

  return (
    <TextField
      fullWidth
      select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading || !warehouseId}
      required={required}
      helperText={helperText || (!warehouseId ? 'Select a warehouse first' : '')}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {loading && <CircularProgress size={20} />}
            {!loading && (
              <IconButton size="small" onClick={fetchLocations} disabled={disabled || !warehouseId}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
    >
      {locations.length === 0 && !loading && (
        <MenuItem value="" disabled>
          {warehouseId ? 'No locations available' : 'Select a warehouse first'}
        </MenuItem>
      )}
      {locations.map((location) => (
        <MenuItem key={location.id} value={location.id}>
          {location.complete_name}
        </MenuItem>
      ))}
    </TextField>
  );
}
