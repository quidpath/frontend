import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import crmService, {
  Contact,
  ContactListResponse,
  Deal,
  DealListResponse,
  Campaign,
  CampaignListResponse,
  Activity,
  ActivityListResponse,
  CRMSummary,
} from '@/services/crmService';

export const CRM_KEYS = {
  all: ['crm'] as const,
  contacts: (params?: Record<string, unknown>) =>
    ['crm', 'contacts', params] as const,
  contact: (id: string) => ['crm', 'contact', id] as const,
  deals: (params?: Record<string, unknown>) =>
    ['crm', 'deals', params] as const,
  deal: (id: string) => ['crm', 'deal', id] as const,
  campaigns: (params?: Record<string, unknown>) =>
    ['crm', 'campaigns', params] as const,
  campaign: (id: string) => ['crm', 'campaign', id] as const,
  activities: (params?: Record<string, unknown>) =>
    ['crm', 'activities', params] as const,
  activity: (id: string) => ['crm', 'activity', id] as const,
  summary: () => ['crm', 'summary'] as const,
};

// Contacts
export function useContacts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: CRM_KEYS.contacts(params),
    queryFn: async () => {
      const { data } = await crmService.getContacts(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useContact(id: string | null) {
  return useQuery({
    queryKey: CRM_KEYS.contact(id ?? ''),
    queryFn: async () => {
      const { data } = await crmService.getContact(id!);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.all });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) =>
      crmService.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.all });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmService.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.all });
    },
  });
}

// Deals
export function useDeals(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: CRM_KEYS.deals(params),
    queryFn: async () => {
      const { data } = await crmService.getDeals(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useDeal(id: string | null) {
  return useQuery({
    queryKey: CRM_KEYS.deal(id ?? ''),
    queryFn: async () => {
      const { data } = await crmService.getDeal(id!);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmService.createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.all });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deal> }) =>
      crmService.updateDeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.all });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmService.deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.all });
    },
  });
}

// Campaigns
export function useCampaigns(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: CRM_KEYS.campaigns(params),
    queryFn: async () => {
      const { data } = await crmService.getCampaigns(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmService.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.all });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) =>
      crmService.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.all });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmService.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.all });
    },
  });
}

// Activities
export function useActivities(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: CRM_KEYS.activities(params),
    queryFn: async () => {
      const { data } = await crmService.getActivities(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmService.createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.all });
    },
  });
}

// Summary
export function useCRMSummary() {
  return useQuery({
    queryKey: CRM_KEYS.summary(),
    queryFn: async () => {
      const { data } = await crmService.getSummary();
      return data;
    },
    staleTime: 60_000,
  });
}

// Pipeline Stages
export function usePipelineStages(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['crm', 'pipeline-stages', params],
    queryFn: async () => {
      const { data } = await crmService.getPipelineStages(params);
      return data;
    },
    staleTime: 60_000,
  });
}
