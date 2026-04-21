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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import inventoryService, { Category } from '@/services/inventoryService';

interface CategoryDropdownProps {
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

export default function CategoryDropdown({
  value,
  onChange,
  label = 'Category',
  required = false,
  disabled = false,
  error = false,
  helperText,
  onManageClick,
  showManageButton = true,
}: CategoryDropdownProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCategories = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await inventoryService.getCategories();
      const data = response.data.data || response.data.results || [];
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleRefresh = () => {
    loadCategories(false);
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
                  <Tooltip title="Refresh categories">
                    <IconButton
                      size="small"
                      onClick={handleRefresh}
                      disabled={disabled}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {showManageButton && onManageClick && (
                    <Tooltip title="Manage categories">
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
        <em>Select Category</em>
      </MenuItem>
      {categories.map((category) => (
        <MenuItem key={category.id} value={category.id}>
          {category.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
