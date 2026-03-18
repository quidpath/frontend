'use client';

export interface SectionProps {
  subTab: string;
  notify: (msg: string, sev?: 'success' | 'error') => void;
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
}
