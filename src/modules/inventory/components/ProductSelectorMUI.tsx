'use client';

import React, { useState, useCallback } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip, CircularProgress } from '@mui/material';
import { debounce } from 'lodash';
import inventoryService, { Product } from '@/services/inventoryService';

interface ProductSelectorMUIProps {
  value: string;
  onChange: (value: string, product?: Product) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  showStock?: boolean;
  showPrice?: boolean;
  filterSaleable?: boolean;
}

export default function ProductSelectorMUI({
  value,
  onChange,
  label = 'Product',
  placeholder = 'Search products...',
  disabled = false,
  required = false,
  error = false,
  helperText,
  showStock = true,
  showPrice = true,
  filterSaleable = false,
}: ProductSelectorMUIProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        const response = await inventoryService.searchProducts(query);
        let filteredProducts = response.data.products || [];

        // Filter for saleable products if needed
        if (filterSaleable) {
          filteredProducts = filteredProducts.filter((p: Product) => p.can_be_sold);
        }

        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error searching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [filterSaleable]
  );

  const handleInputChange = (_: any, newInputValue: string) => {
    setInputValue(newInputValue);
    debouncedSearch(newInputValue);
  };

  const handleChange = (_: any, newValue: Product | null) => {
    setSelectedProduct(newValue);
    onChange(newValue?.id || '', newValue || undefined);
  };

  return (
    <Autocomplete
      value={selectedProduct}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={products}
      getOptionLabel={(option) => option.name || ''}
      loading={loading}
      disabled={disabled}
      noOptionsText={
        inputValue.length < 2
          ? 'Type at least 2 characters to search'
          : 'No products found'
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.internal_reference && `SKU: ${option.internal_reference}`}
                {option.barcode && ` | Barcode: ${option.barcode}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
              {showPrice && (
                <Chip
                  label={`KES ${Number(option.list_price).toLocaleString()}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Box>
      )}
    />
  );
}
