import { gatewayClient } from './apiClient';

export interface UniversalContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  type: 'customer' | 'vendor' | 'supplier' | 'employee' | 'other';
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export interface ContactListResponse {
  results: UniversalContact[];
  count: number;
  next: string | null;
  previous: string | null;
}

const contactsService = {
  getContacts: (params?: Record<string, unknown>) =>
    gatewayClient.get<ContactListResponse>('/contacts/list/', { params }),

  getContact: (id: string) =>
    gatewayClient.get<UniversalContact>(`/contacts/${id}/`),

  createContact: (data: Omit<UniversalContact, 'id' | 'created_at'>) =>
    gatewayClient.post<UniversalContact>('/contacts/create/', data),

  updateContact: (id: string, data: Partial<UniversalContact>) =>
    gatewayClient.put<UniversalContact>(`/contacts/${id}/update/`, data),

  deleteContact: (id: string) =>
    gatewayClient.delete(`/contacts/${id}/delete/`),

  searchContacts: (query: string, type?: string) =>
    gatewayClient.get<ContactListResponse>('/contacts/search/', { params: { q: query, type } }),
};

export default contactsService;
