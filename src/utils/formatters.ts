import { useCurrencyStore, convertAmount, CurrencyCode } from '@/store/currencyStore';

export function formatCurrency(
  value: number | string,
  currency?: string,
  locale = 'en-US'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';

  // If no currency override, read from the persisted store
  const store = useCurrencyStore.getState();
  const displayCurrency = (currency as CurrencyCode) ?? store.currency;
  const baseCurrency = store.baseCurrency;
  const rates = store.rates;

  const converted = currency
    ? num // caller passed explicit currency — no conversion
    : convertAmount(num, rates, baseCurrency, displayCurrency);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: displayCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  } catch {
    return `${displayCurrency} ${converted.toFixed(2)}`;
  }
}

export function formatNumber(value: number | string, locale = 'en-US'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat(locale).format(num);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function truncate(str: string, length = 40): string {
  if (!str) return '';
  return str.length > length ? `${str.slice(0, length)}…` : str;
}

export function initials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}
