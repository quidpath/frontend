/**
 * Fetches live exchange rates from Frankfurter (https://api.frankfurter.app).
 * Free, no API key, open-source. Rates are cached for 1 hour.
 */
import { useEffect, useCallback } from 'react';
import { useCurrencyStore, CurrencyCode, convertAmount } from '@/store/currencyStore';

const FRANKFURTER_BASE = 'https://api.frankfurter.app';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function useCurrencyRates() {
  const { baseCurrency, setRates, ratesFetchedAt, rates } = useCurrencyStore();

  useEffect(() => {
    const now = Date.now();
    const stale = !ratesFetchedAt || now - ratesFetchedAt > CACHE_TTL_MS;
    if (!stale && Object.keys(rates).length > 0) return;

    fetch(`${FRANKFURTER_BASE}/latest?from=${baseCurrency}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.rates) {
          // Include the base itself as 1:1
          setRates({ ...data.rates, [baseCurrency]: 1 }, Date.now());
        }
      })
      .catch(() => {
        // Fail silently — amounts will display in base currency
      });
  }, [baseCurrency, ratesFetchedAt, rates, setRates]);
}

/** Hook to format a monetary value in the currently selected display currency. */
export function useCurrency() {
  const { currency, baseCurrency, rates, setCurrency } = useCurrencyStore();

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
        return `${currency} ${converted.toFixed(2)}`;
      }
    },
    [currency, baseCurrency, rates]
  );

  return { currency, baseCurrency, rates, setCurrency, format };
}
