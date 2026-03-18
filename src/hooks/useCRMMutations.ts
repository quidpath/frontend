import { useMutation, useQueryClient } from '@tanstack/react-query';
import crmService, { Contact, Deal, Campaign } from '@/services/crmService';

export const CONTACT_MUTATION_KEYS = {
  create: ['contact', 'create'],
  update: ['contact', 'update'],
  delete: ['contact', 'delete'],
};

export const DEAL_MUTATION_KEYS = {
  create: ['deal', 'create'],
  update: ['deal', 'update'],
  delete: ['deal', 'delete'],
  move: ['deal', 'move'],
};

export const CAMPAIGN_MUTATION_KEYS = {
  create: ['campaign', 'create'],
  update: ['campaign', 'update'],
  delete: ['campaign', 'delete'],
};

/** Create contact */
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Contact, 'id' | 'created_at'>) =>
      crmService.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'summary'] });
    },
  });
}

/** Update contact */
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      crmService.updateContact(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'contact'] });
    },
  });
}

/** Delete contact */
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      crmService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'summary'] });
    },
  });
}

/** Create deal */
export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Deal, 'id'>) =>
      crmService.createDeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'summary'] });
    },
  });
}

/** Update deal */
export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      crmService.updateDeal(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline'] });
    },
  });
}

/** Delete deal */
export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      crmService.deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'summary'] });
    },
  });
}

/** Move deal to different stage */
export function useMoveDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; stage: string }) =>
      crmService.moveDeal(data.id, data.stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline'] });
    },
  });
}

/** Create campaign */
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Campaign, 'id'>) =>
      crmService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'campaigns'] });
    },
  });
}

/** Update campaign */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      crmService.updateCampaign(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'campaigns'] });
    },
  });
}

/** Delete campaign */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      crmService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'campaigns'] });
    },
  });
}
