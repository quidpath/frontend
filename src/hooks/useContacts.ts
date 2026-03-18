import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import contactsService from '@/services/contactsService';

export const CONTACTS_KEYS = {
  all: ['contacts'] as const,
  list: (params?: Record<string, unknown>) => ['contacts', 'list', params] as const,
  detail: (id: string) => ['contacts', 'detail', id] as const,
};

export function useContacts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: CONTACTS_KEYS.list(params),
    queryFn: async () => {
      const { data } = await contactsService.getContacts(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: CONTACTS_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await contactsService.getContact(id);
      return data;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contactsService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEYS.all });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<unknown> }) =>
      contactsService.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEYS.all });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contactsService.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEYS.all });
    },
  });
}

export function useSearchContacts(query: string, type?: string) {
  return useQuery({
    queryKey: ['contacts', 'search', query, type],
    queryFn: async () => {
      const { data } = await contactsService.searchContacts(query, type);
      return data;
    },
    enabled: query.length > 0,
    staleTime: 30_000,
  });
}
