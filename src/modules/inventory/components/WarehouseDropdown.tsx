'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import inventoryService, { Warehouse } from '@/services/inventoryService';

interface WarehouseDropdownProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  onManageClick?: () => void;
  showManageButton?: boolean;
}

export default function WarehouseDropdown({
  value,
  onChange,
  label = 'Warehouse',
  required = false,
  disabled = false,
  error = false,
  helperText,
  onManageClick,
  showManageButton = true,
}: WarehouseDropdownProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWarehouses = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await inventoryService.getWarehouses();
      const data = response.data.results || [];
      setWarehouses(data);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleRefresh = () => {
    loadWarehouses(false);
  };

  return (
    <TextField
      fullWidth
      select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled || loading}
      error={error}
      helperText={helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Box sx={{ display: 'flex', gap: 0.5, mr: -1 }}>
              {loading || refreshing ? (
                <CircularProgress size={20} />
              ) : (
                <>
                  <Tooltip title="Refresh warehouses">
                    <IconButton
                      size="small"
                      onClick={handleRefresh}
                      disabled={disabled}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {showManageButton && onManageClick && (
                    <Tooltip title="Manage warehouses">
                      <IconButton
                        size="small"
                        onClick={onManageClick}
                        disabled={disabled}
                        color="primary"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              )}
            </Box>
          </InputAdornment>
        ),
      }}
    >
      <MenuItem value="">
        <em>Select Warehouse</em>
      </MenuItem>
      {warehouses.map((warehouse) => (
        <MenuItem key={warehouse.id} value={warehouse.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{warehouse.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              ({warehouse.short_name})
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </TextField>
  );
}
