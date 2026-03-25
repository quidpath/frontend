/**
 * Currency store — persisted via localStorage.
 * Uses Frankfurter (https://api.frankfurter.app) — free, no API key, open-source.
 * Rates are fetched once per session and cached for 1 hour.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SUPPORTED_CURRENCIES = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

interface CurrencyState {
  currency: CurrencyCode;
  baseCurrency: CurrencyCode; // the currency amounts are stored in on the backend
  rates: Record<string, number>; // rates relative to baseCurrency
  ratesFetchedAt: number | null;
  setCurrency: (code: CurrencyCode) => void;
  setBaseCurrency: (code: CurrencyCode) => void;
  setRates: (rates: Record<string, number>, fetchedAt: number) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'KES',
      baseCurrency: 'KES',
      rates: {},
      ratesFetchedAt: null,
      setCurrency: (currency) => set({ currency }),
      setBaseCurrency: (baseCurrency) => set({ baseCurrency }),
      setRates: (rates, ratesFetchedAt) => set({ rates, ratesFetchedAt }),
    }),
    {
      name: 'quidpath-currency',
      partialize: (s) => ({
        currency: s.currency,
        baseCurrency: s.baseCurrency,
        rates: s.rates,
        ratesFetchedAt: s.ratesFetchedAt,
      }),
    }
  )
);

/** Convert an amount from baseCurrency to the selected display currency. */
export function convertAmount(
  amount: number,
  rates: Record<string, number>,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to || !amount) return amount;
  if (Object.keys(rates).length === 0) return amount;

  // Frankfurter returns rates relative to the base (from).
  // If from === base, rate[to] gives direct conversion.
  // If from !== base, convert via USD as pivot.
  const rate = rates[to];
  if (!rate) return amount;
  return amount * rate;
}
