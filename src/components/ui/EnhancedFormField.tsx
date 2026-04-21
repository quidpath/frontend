'use client';

import React from 'react';
import {
  TextField,
  MenuItem,
  CircularProgress,
  InputAdornment,
  Tooltip,
  IconButton,
  TextFieldProps,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';

interface EnhancedFormFieldProps extends Omit<TextFieldProps, 'onChange'> {
  value: string | number;
  onChange: (value: string) => void;
  loading?: boolean;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  tooltip?: string;
  onRefresh?: () => void;
  showRefresh?: boolean;
  emptyMessage?: string;
}

/**
 * Enhanced form field with loading states, tooltips, and refresh capability
 * Provides consistent UX across all modals
 */
export default function EnhancedFormField({
  value,
  onChange,
  loading = false,
  options,
  tooltip,
  onRefresh,
  showRefresh = false,
  emptyMessage = 'No options available',
  select,
  ...textFieldProps
}: EnhancedFormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const endAdornment = (
    <>
      {loading && <CircularProgress size={20} />}
      {tooltip && !loading && (
        <Tooltip title={tooltip} arrow>
          <IconButton size="small" edge="end">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showRefresh && onRefresh && !loading && (
        <Tooltip title="Refresh options" arrow>
          <IconButton size="small" edge="end" onClick={onRefresh}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  if (select && options) {
    return (
      <TextField
        {...textFieldProps}
        select
        value={value}
        onChange={handleChange}
        disabled={textFieldProps.disabled || loading}
        InputProps={{
          ...textFieldProps.InputProps,
          endAdornment,
        }}
      >
        {options.length === 0 && !loading ? (
          <MenuItem disabled value="">
            {emptyMessage}
          </MenuItem>
        ) : (
          options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))
        )}
      </TextField>
    );
  }

  return (
    <TextField
      {...textFieldProps}
      value={value}
      onChange={handleChange}
      disabled={textFieldProps.disabled || loading}
      InputProps={{
        ...textFieldProps.InputProps,
        endAdornment: textFieldProps.InputProps?.endAdornment || endAdornment,
      }}
    />
  );
}
