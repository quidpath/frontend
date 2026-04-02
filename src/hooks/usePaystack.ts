'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Paystack v2 InlineJS types ──────────────────────────────────────────────
interface PaystackTransaction {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
}

interface PaystackNewTransactionOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  onSuccess?: (transaction: PaystackTransaction) => void;
  onLoad?: (response: unknown) => void;
  onCancel?: () => void;
  onError?: (error: { message: string }) => void;
}

interface PaystackInstance {
  newTransaction: (options: PaystackNewTransactionOptions) => void;
  resumeTransaction: (accessCode: string, callbacks?: {
    onSuccess?: (transaction: PaystackTransaction) => void;
    onLoad?: (response: unknown) => void;
    onCancel?: () => void;
    onError?: (error: { message: string }) => void;
  }) => void;
}

declare global {
  interface Window {
    // v2 inline.js exposes a constructor
    Paystack?: new () => PaystackInstance;
  }
}

// ─── Hook options ─────────────────────────────────────────────────────────────
export interface UsePaystackOptions {
  onSuccess?: (transaction: PaystackTransaction) => void;
  onCancel?: () => void;
  onError?: (message: string) => void;
}

export interface UsePaystackReturn {
  isLoaded: boolean;
  resumeTransaction: (
    accessCode: string,
    callbacks: {
      onSuccess: (transaction: PaystackTransaction) => void;
      onCancel: () => void;
      onError: (message: string) => void;
    }
  ) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePaystack(): UsePaystackReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const instanceRef = useRef<PaystackInstance | null>(null);

  useEffect(() => {
    // Already loaded
    if (window.Paystack) {
      instanceRef.current = new window.Paystack();
      setIsLoaded(true);
      return;
    }

    const existing = document.querySelector('script[src*="js.paystack.co/v2"]');
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.Paystack) {
          instanceRef.current = new window.Paystack();
          setIsLoaded(true);
        }
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onload = () => {
      if (window.Paystack) {
        instanceRef.current = new window.Paystack();
        setIsLoaded(true);
      }
    };
    document.head.appendChild(script);
  }, []);

  const resumeTransaction: UsePaystackReturn['resumeTransaction'] = (accessCode, callbacks) => {
    if (!instanceRef.current) {
      callbacks.onError('Payment system not ready. Please refresh and try again.');
      return;
    }
    instanceRef.current.resumeTransaction(accessCode, {
      onSuccess: callbacks.onSuccess,
      onCancel: callbacks.onCancel,
      onError: (err) => callbacks.onError(err.message),
    });
  };

  return { isLoaded, resumeTransaction };
}
