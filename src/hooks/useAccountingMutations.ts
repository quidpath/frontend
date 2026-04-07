import { useMutation, useQueryClient } from '@tanstack/react-query';
import accountingService, { Invoice, InvoiceLine, JournalEntry } from '@/services/accountingService';
import { BILLING_KEYS } from './useBilling';

export const INVOICE_MUTATION_KEYS = {
  create: ['invoice', 'create'],
  update: ['invoice', 'update'],
  delete: ['invoice', 'delete'],
  send: ['invoice', 'send'],
  void: ['invoice', 'void'],
};

export const JOURNAL_MUTATION_KEYS = {
  create: ['journal', 'create'],
  update: ['journal', 'update'],
  delete: ['journal', 'delete'],
  post: ['journal', 'post'],
};

/** Create new invoice */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      customer: string;
      customer_id?: string;
      lines: Omit<InvoiceLine, 'id'>[];
      date: string;
      due_date: string;
      number?: string;
      terms?: string;
      notes?: string;
      comments?: string;
      purchase_order?: string;
    }) =>
      accountingService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'summary'] });
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.invoices() });
    },
  });
}

/** Update invoice */
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; [key: string]: unknown }) =>
      accountingService.updateInvoice(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'invoice'] });
    },
  });
}

/** Delete invoice */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      accountingService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'summary'] });
    },
  });
}

/** Send invoice */
export function useSendInvoice() {
  return useMutation({
    mutationFn: (id: string) =>
      accountingService.sendInvoice(id),
  });
}

/** Create journal entry */
export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      date: string;
      reference: string;
      description: string;
      lines: { account_id: string; debit: string; credit: string; description?: string }[];
    }) =>
      accountingService.createJournalEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journals'] });
    },
  });
}

/** Update journal entry */
export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; [key: string]: unknown }) =>
      accountingService.updateJournalEntry(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journals'] });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal'] });
    },
  });
}

/** Delete journal entry */
export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      accountingService.deleteJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journals'] });
    },
  });
}

/** Post journal entry */
export function usePostJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      accountingService.postJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journals'] });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal'] });
    },
  });
}
