import { crmClient } from './apiClient';

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
    crmClient.get<ContactListResponse>('/api/crm/contacts/', { params }),

  getContact: (id: string) =>
    crmClient.get<UniversalContact>(`/api/crm/contacts/${id}/`),

  createContact: (data: Omit<UniversalContact, 'id' | 'created_at'>) =>
    crmClient.post<UniversalContact>('/api/crm/contacts/', data),

  updateContact: (id: string, data: Partial<UniversalContact>) =>
    crmClient.put<UniversalContact>(`/api/crm/contacts/${id}/`, data),

  deleteContact: (id: string) =>
    crmClient.delete(`/api/crm/contacts/${id}/`),

  searchContacts: (query: string, type?: string) =>
    crmClient.get<ContactListResponse>('/api/crm/contacts/', { params: { search: query, type } }),
};

export default contactsService;
