'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Paystack v2 inline.js types ─────────────────────────────────────────────
// The script exposes window.PaystackPop as a constructor (new PaystackPop())
interface PaystackTransaction {
  id: number;
  reference: string;
  message: string;
}

interface PaystackCallbacks {
  onSuccess?: (transaction: PaystackTransaction) => void;
  onLoad?: (response: unknown) => void;
  onCancel?: () => void;
  onError?: (error: { message: string }) => void;
}

interface PaystackPopInstance {
  newTransaction: (options: PaystackCallbacks & {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    metadata?: Record<string, unknown>;
  }) => void;
  resumeTransaction: (accessCode: string, callbacks?: PaystackCallbacks) => void;
  isLoaded: () => boolean;
}

declare global {
  interface Window {
    PaystackPop?: new () => PaystackPopInstance;
  }
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

export function usePaystack(): UsePaystackReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const instanceRef = useRef<PaystackPopInstance | null>(null);

  useEffect(() => {
    const init = () => {
      if (window.PaystackPop) {
        instanceRef.current = new window.PaystackPop();
        setIsLoaded(true);
      }
    };

    // Already available
    if (window.PaystackPop) {
      init();
      return;
    }

    // Script already in DOM but not yet executed
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.paystack.co/v2/inline.js"]'
    );
    if (existing) {
      existing.addEventListener('load', init);
      return () => existing.removeEventListener('load', init);
    }

    // Inject script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  const resumeTransaction: UsePaystackReturn['resumeTransaction'] = (accessCode, callbacks) => {
    if (!instanceRef.current) {
      callbacks.onError('Payment system not ready. Please refresh and try again.');
      return;
    }
    instanceRef.current.resumeTransaction(accessCode, {
      onSuccess: callbacks.onSuccess,
      onCancel: callbacks.onCancel,
      onError: (err) => callbacks.onError(err?.message || 'Payment failed'),
    });
  };

  return { isLoaded, resumeTransaction };
}
