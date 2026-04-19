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
import inventoryService, { UnitOfMeasure } from '@/services/inventoryService';

interface UomDropdownProps {
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

export default function UomDropdown({
  value,
  onChange,
  label = 'Unit of Measure',
  required = false,
  disabled = false,
  error = false,
  helperText,
  onManageClick,
  showManageButton = true,
}: UomDropdownProps) {
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUoms = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await inventoryService.getUnitsOfMeasure();
      const data = response.data.data || response.data.results || [];
      setUoms(data);
    } catch (err) {
      console.error('Failed to load units of measure:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUoms();
  }, []);

  const handleRefresh = () => {
    loadUoms(false);
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
                  <Tooltip title="Refresh units">
                    <IconButton
                      size="small"
                      onClick={handleRefresh}
                      disabled={disabled}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {showManageButton && onManageClick && (
                    <Tooltip title="Manage units">
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
        <em>Select Unit</em>
      </MenuItem>
      {uoms.map((uom) => (
        <MenuItem key={uom.id} value={uom.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{uom.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              ({uom.symbol})
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </TextField>
  );
}
