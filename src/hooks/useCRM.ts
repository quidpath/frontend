/**
 * QuidPath ERP - CRM Hooks
 * React Query hooks for CRM module
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import crmService from '@/services/crmService';

export const CRM_KEYS = {
  all: ['crm'] as const,
  leads: () => ['crm', 'leads'] as const,
  lead: (id: string) => ['crm', 'leads', id] as const,
  opportunities: () => ['crm', 'opportunities'] as const,
};

// Leads
export const useLeads = (params?: any) => {
  return useQuery({
    queryKey: [...CRM_KEYS.leads(), params],
    queryFn: () => crmService.leads.list(params),
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: CRM_KEYS.lead(id),
    queryFn: () => crmService.leads.get(id),
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmService.leads.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.leads() });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      crmService.leads.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.leads() });
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.lead(variables.id) });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmService.leads.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.leads() });
    },
  });
};

export const useConvertLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) =>
      crmService.leads.convert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.leads() });
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.opportunities() });
    },
  });
};

// Opportunities
export const useOpportunities = (params?: any) => {
  return useQuery({
    queryKey: [...CRM_KEYS.opportunities(), params],
    queryFn: () => crmService.opportunities.list(params),
  });
};

export const useUpdateOpportunityStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      crmService.opportunities.updateStage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_KEYS.opportunities() });
    },
  });
};
