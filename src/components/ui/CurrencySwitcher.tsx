'use client';

import React, { useState } from 'react';
import {
  Box, Button, Menu, MenuItem, Typography, Divider,
  ListItemText, Tooltip,
} from '@mui/material';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useCurrency, useCurrencyRates } from '@/hooks/useCurrency';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '@/store/currencyStore';

export default function CurrencySwitcher() {
  useCurrencyRates(); // fetch/refresh rates silently in the background
  const { currency, setCurrency, rates } = useCurrency();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const current = SUPPORTED_CURRENCIES.find((c) => c.code === currency);

  return (
    <>
      <Tooltip title="Switch currency">
        <Button
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          endIcon={<KeyboardArrowDownIcon fontSize="small" />}
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.8rem',
            px: 1,
            py: 0.5,
            minWidth: 0,
            borderRadius: 1.5,
            '&:hover': { backgroundColor: 'grey.100' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CurrencyExchangeIcon sx={{ fontSize: 14 }} />
            {current?.code ?? currency}
          </Box>
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 0.5,
            minWidth: 220,
            maxHeight: 360,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflowY: 'auto',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
            Display Currency
          </Typography>
        </Box>
        <Divider />
        {SUPPORTED_CURRENCIES.map((c) => (
          <MenuItem
            key={c.code}
            selected={c.code === currency}
            onClick={() => { setCurrency(c.code as CurrencyCode); setAnchor(null); }}
            sx={{ gap: 1.5, py: 1 }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ minWidth: 40 }}>
              {c.symbol}
            </Typography>
            <ListItemText
              primary={c.code}
              secondary={c.name}
              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            {rates[c.code] && c.code !== currency && (
              <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
                {rates[c.code].toFixed(2)}
              </Typography>
            )}
          </MenuItem>
        ))}
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.disabled">
            Rates via Frankfurter · Updated hourly
          </Typography>
        </Box>
      </Menu>
    </>
  );
}
