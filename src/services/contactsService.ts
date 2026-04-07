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

  createContact: (data: Omit<UniversalContact, 'id' | 'created_at'>) => {
    // Parse name into first_name and last_name
    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;
    
    // Map frontend fields to backend model fields
    const backendData = {
      first_name: firstName,
      last_name: lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      is_active: data.is_active,
      description: data.notes, // Map notes to description
      // Note: 'type' field may not exist in backend Contact model
      // Backend uses Company.is_customer/is_supplier instead
    };
    return crmClient.post<UniversalContact>('/api/crm/contacts/', backendData);
  },

  updateContact: (id: string, data: Partial<UniversalContact>) => {
    // Map frontend fields to backend model fields for update
    const backendData: Record<string, unknown> = {};
    
    // Handle name if provided
    if (data.name) {
      const nameParts = data.name.trim().split(' ');
      backendData.first_name = nameParts[0];
      backendData.last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];
    }
    
    if (data.email !== undefined) backendData.email = data.email;
    if (data.phone !== undefined) backendData.phone = data.phone;
    if (data.address !== undefined) backendData.address = data.address;
    if (data.city !== undefined) backendData.city = data.city;
    if (data.country !== undefined) backendData.country = data.country;
    if (data.is_active !== undefined) backendData.is_active = data.is_active;
    if (data.notes !== undefined) backendData.description = data.notes;
    
    return crmClient.put<UniversalContact>(`/api/crm/contacts/${id}/`, backendData);
  },

  deleteContact: (id: string) =>
    crmClient.delete(`/api/crm/contacts/${id}/`),

  searchContacts: (query: string, type?: string) =>
    crmClient.get<ContactListResponse>('/api/crm/contacts/', { params: { search: query, type } }),
};

export default contactsService;
