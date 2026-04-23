/**
 * Fetches live exchange rates from backend proxy endpoint.
 * The backend fetches from Frankfurter API server-side, avoiding CORS issues.
 * Rates are cached for 1 hour.
 */
import { useEffect, useCallback } from 'react';
import { useCurrencyStore, CurrencyCode, convertAmount, SUPPORTED_CURRENCIES } from '@/store/currencyStore';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Use backend proxy endpoint instead of calling external API directly
const getCurrencyRatesUrl = (baseCurrency: string) => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.quidpath.com';
  return `${backendUrl}/api/utils/currency/rates/?from=${baseCurrency}`;
};

export function useCurrencyRates() {
  const { baseCurrency, setRates, ratesFetchedAt, rates } = useCurrencyStore();

  useEffect(() => {
    const now = Date.now();
    const stale = !ratesFetchedAt || now - ratesFetchedAt > CACHE_TTL_MS;
    
    // Always fetch if we don't have rates or they're stale
    if (!stale && Object.keys(rates).length > 0) return;

    console.log(`Fetching currency rates for base: ${baseCurrency}`);

    // Fetch from backend proxy endpoint (no CORS issues)
    fetch(getCurrencyRatesUrl(baseCurrency))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data?.rates) {
          // Backend already includes base currency as 1:1
          console.log(`Successfully fetched ${Object.keys(data.rates).length} currency rates`);
          setRates(data.rates, Date.now());
        } else if (data?.error) {
          // Backend returned error with fallback rates
          console.warn('Currency rates unavailable:', data.message);
          setRates(data.rates || { [baseCurrency]: 1 }, Date.now());
        }
      })
      .catch((error) => {
        // Fail gracefully — amounts will display in base currency
        console.warn('Failed to fetch currency rates:', error.message);
        setRates({ [baseCurrency]: 1 }, Date.now());
      });
  }, [baseCurrency, ratesFetchedAt, rates, setRates]);
}

/** Hook to format a monetary value in the currently selected display currency. */
export function useCurrency() {
  const { currency, baseCurrency, rates, setCurrency } = useCurrencyStore();

  // Get currency symbol
  const getCurrencySymbol = useCallback((code: CurrencyCode): string => {
    const curr = SUPPORTED_CURRENCIES.find(c => c.code === code);
    return curr?.symbol || code;
  }, []);

  const format = useCallback(
    (amount: number | string | null | undefined, fromCurrency?: CurrencyCode): string => {
      const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
      if (isNaN(num)) return '—';

      const from = fromCurrency ?? baseCurrency;
      const converted = convertAmount(num, rates, from, currency);

      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(converted);
      } catch {
        // Fallback for currencies Intl doesn't know
        const symbol = getCurrencySymbol(currency);
        return `${symbol} ${converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
      }
    },
    [currency, baseCurrency, rates, getCurrencySymbol]
  );

  // Format without conversion (display in original currency)
  const formatRaw = useCallback(
    (amount: number | string | null | undefined, currencyCode?: CurrencyCode): string => {
      const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
      if (isNaN(num)) return '—';

      const code = currencyCode || currency;

      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num);
      } catch {
        const symbol = getCurrencySymbol(code);
        return `${symbol} ${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
      }
    },
    [currency, getCurrencySymbol]
  );

  // Convert amount between currencies
  const convert = useCallback(
    (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
      return convertAmount(amount, rates, from, to);
    },
    [rates]
  );

  return { 
    currency, 
    baseCurrency, 
    rates, 
    setCurrency, 
    format, 
    formatRaw,
    convert,
    getCurrencySymbol,
  };
}
