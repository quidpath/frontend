'use client';

import { useEffect, useState } from 'react';

// Paystack Popup types
interface PaystackPopup {
  setup: (config: PaystackConfig) => void;
  resumeTransaction: (accessCode: string) => void;
  newTransaction: () => void;
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: Record<string, any>;
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
  message?: string;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: PaystackConfig) => PaystackPopup;
    };
  }
}

export interface UsePaystackOptions {
  publicKey: string;
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  metadata?: Record<string, any>;
  onSuccess?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

export function usePaystack(options: UsePaystackOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Paystack script is already loaded
    if (window.PaystackPop) {
      setIsLoaded(true);
      return;
    }

    // Load Paystack inline script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Paystack script');
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializePayment = () => {
    if (!isLoaded || !window.PaystackPop) {
      console.error('Paystack not loaded yet');
      return;
    }

    setIsLoading(true);

    const config: PaystackConfig = {
      key: options.publicKey,
      email: options.email,
      amount: options.amount * 100, // Convert to kobo/cents
      currency: options.currency || 'KES',
      ref: options.reference || `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      metadata: options.metadata || {},
      callback: (response: PaystackResponse) => {
        setIsLoading(false);
        if (options.onSuccess) {
          options.onSuccess(response);
        }
      },
      onClose: () => {
        setIsLoading(false);
        if (options.onClose) {
          options.onClose();
        }
      },
    };

    const handler = window.PaystackPop.setup(config);
    handler.newTransaction();
  };

  return {
    initializePayment,
    isLoaded,
    isLoading,
  };
}
