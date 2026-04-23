'use client';

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import { useCurrencyStore, SUPPORTED_CURRENCIES, CurrencyCode } from '@/store/currencyStore';
import { useCurrencyRates } from '@/hooks/useCurrency';

interface CurrencySelectorProps {
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'standard' | 'filled';
  label?: string;
  showSymbol?: boolean;
}

export default function CurrencySelector({ 
  size = 'small', 
  variant = 'outlined',
  label = 'Display Currency',
  showSymbol = true,
}: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrencyStore();
  
  // Ensure rates are fetched
  useCurrencyRates();

  const handleChange = (event: any) => {
    setCurrency(event.target.value as CurrencyCode);
  };

  return (
    <FormControl size={size} variant={variant} sx={{ minWidth: 150 }}>
      <InputLabel id="currency-selector-label">{label}</InputLabel>
      <Select
        labelId="currency-selector-label"
        id="currency-selector"
        value={currency}
        label={label}
        onChange={handleChange}
      >
        {SUPPORTED_CURRENCIES.map((curr) => (
          <MenuItem key={curr.code} value={curr.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showSymbol && (
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 30 }}>
                  {curr.symbol}
                </Typography>
              )}
              <Typography variant="body2">
                {curr.code} - {curr.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
