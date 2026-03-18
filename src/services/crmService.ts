import { crmClient } from './apiClient';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: 'lead' | 'prospect' | 'customer';
  status: 'active' | 'inactive';
  source?: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ContactListResponse {
  results: Contact[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Deals map to "opportunities" in the backend pipeline
export interface Deal {
  id: string;
  title: string;
  contact_id: string;
  contact_name: string;
  stage: string;
  value: number;
  probability: number;
  expected_close: string;
  status: 'open' | 'won' | 'lost';
  description?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
}

export interface DealListResponse {
  results: Deal[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
}

export interface PipelineStageListResponse {
  results: PipelineStage[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'social' | 'event';
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date: string;
  end_date?: string;
  budget: number;
  reach: number;
  conversions: number;
  description?: string;
  created_at: string;
}

export interface CampaignListResponse {
  results: Campaign[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Activities live under /api/crm/contacts/activities/
export interface Activity {
  id: string;
  type: 'call' | 'meeting' | 'email' | 'task' | 'note';
  subject: string;
  description?: string;
  contact_id?: string;
  deal_id?: string;
  due_date?: string;
  completed: boolean;
  assigned_to?: string;
  created_at: string;
}

export interface ActivityListResponse {
  results: Activity[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface CRMSummary {
  total_contacts: number;
  total_deals: number;
  pipeline_value: number;
  won_deals_this_month: number;
  conversion_rate: number;
  active_campaigns: number;
}

const crmService = {
  // Contacts — /api/crm/contacts/
  getContacts: (params?: Record<string, unknown>) =>
    crmClient.get<ContactListResponse>('/api/crm/contacts/', { params }),

  getContact: (id: string) =>
    crmClient.get<Contact>(`/api/crm/contacts/${id}/`),

  createContact: (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) =>
    crmClient.post<Contact>('/api/crm/contacts/', data),

  updateContact: (id: string, data: Partial<Contact>) =>
    crmClient.put<Contact>(`/api/crm/contacts/${id}/`, data),

  deleteContact: (id: string) =>
    crmClient.delete(`/api/crm/contacts/${id}/`),

  // Activities — /api/crm/contacts/activities/
  getActivities: (params?: Record<string, unknown>) =>
    crmClient.get<ActivityListResponse>('/api/crm/contacts/activities/', { params }),

  getContactActivities: (contactId: string, params?: Record<string, unknown>) =>
    crmClient.get<ActivityListResponse>(`/api/crm/contacts/${contactId}/activities/`, { params }),

  getActivity: (id: string) =>
    crmClient.get<Activity>(`/api/crm/contacts/activities/${id}/`),

  createActivity: (data: Omit<Activity, 'id' | 'created_at'>) =>
    crmClient.post<Activity>('/api/crm/contacts/activities/', data),

  updateActivity: (id: string, data: Partial<Activity>) =>
    crmClient.put<Activity>(`/api/crm/contacts/activities/${id}/`, data),

  deleteActivity: (id: string) =>
    crmClient.delete(`/api/crm/contacts/activities/${id}/`),

  // Pipeline Stages — /api/crm/pipeline/stages/
  getPipelineStages: (params?: Record<string, unknown>) =>
    crmClient.get<PipelineStageListResponse>('/api/crm/pipeline/stages/', { params }),

  // Deals (Opportunities) — /api/crm/pipeline/opportunities/
  getDeals: (params?: Record<string, unknown>) =>
    crmClient.get<DealListResponse>('/api/crm/pipeline/opportunities/', { params }),

  getDeal: (id: string) =>
    crmClient.get<Deal>(`/api/crm/pipeline/opportunities/${id}/`),

  createDeal: (data: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) =>
    crmClient.post<Deal>('/api/crm/pipeline/opportunities/', data),

  updateDeal: (id: string, data: Partial<Deal>) =>
    crmClient.put<Deal>(`/api/crm/pipeline/opportunities/${id}/`, data),

  deleteDeal: (id: string) =>
    crmClient.delete(`/api/crm/pipeline/opportunities/${id}/`),

  // Leads — /api/crm/pipeline/leads/
  getLeads: (params?: Record<string, unknown>) =>
    crmClient.get('/api/crm/pipeline/leads/', { params }),

  getLead: (id: string) =>
    crmClient.get(`/api/crm/pipeline/leads/${id}/`),

  createLead: (data: Record<string, unknown>) =>
    crmClient.post('/api/crm/pipeline/leads/', data),

  updateLead: (id: string, data: Record<string, unknown>) =>
    crmClient.put(`/api/crm/pipeline/leads/${id}/`, data),

  deleteLead: (id: string) =>
    crmClient.delete(`/api/crm/pipeline/leads/${id}/`),

  getPipelineOverview: () =>
    crmClient.get('/api/crm/pipeline/overview/'),

  // Campaigns — /api/crm/campaigns/
  getCampaigns: (params?: Record<string, unknown>) =>
    crmClient.get<CampaignListResponse>('/api/crm/campaigns/', { params }),

  getCampaign: (id: string) =>
    crmClient.get<Campaign>(`/api/crm/campaigns/${id}/`),

  createCampaign: (data: Omit<Campaign, 'id' | 'created_at' | 'reach' | 'conversions'>) =>
    crmClient.post<Campaign>('/api/crm/campaigns/', data),

  updateCampaign: (id: string, data: Partial<Campaign>) =>
    crmClient.put<Campaign>(`/api/crm/campaigns/${id}/`, data),

  deleteCampaign: (id: string) =>
    crmClient.delete(`/api/crm/campaigns/${id}/`),

  addCampaignMember: (id: string, data: Record<string, unknown>) =>
    crmClient.post(`/api/crm/campaigns/${id}/members/`, data),

  // Companies — /api/crm/contacts/companies/
  getCompanies: (params?: Record<string, unknown>) =>
    crmClient.get('/api/crm/contacts/companies/', { params }),

  getCompany: (id: string) =>
    crmClient.get(`/api/crm/contacts/companies/${id}/`),

  createCompany: (data: Record<string, unknown>) =>
    crmClient.post('/api/crm/contacts/companies/', data),

  updateCompany: (id: string, data: Record<string, unknown>) =>
    crmClient.put(`/api/crm/contacts/companies/${id}/`, data),

  deleteCompany: (id: string) =>
    crmClient.delete(`/api/crm/contacts/companies/${id}/`),

  // Tags — /api/crm/contacts/tags/
  getTags: () =>
    crmClient.get('/api/crm/contacts/tags/'),

  // Convert contact to customer — /api/crm/contacts/{id}/convert/
  convertContact: (id: string, data?: Record<string, unknown>) =>
    crmClient.post(`/api/crm/contacts/${id}/convert/`, data ?? {}),

  // Mark deal as won — /api/crm/pipeline/opportunities/{id}/win/
  winDeal: (id: string, data?: Record<string, unknown>) =>
    crmClient.post(`/api/crm/pipeline/opportunities/${id}/win/`, data ?? {}),

  // Summary
  getSummary: () =>
    crmClient.get<CRMSummary>('/api/crm/pipeline/overview/'),
};

export default crmService;
