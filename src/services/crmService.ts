import { crmClient } from './apiClient';

// ── Contact ──────────────────────────────────────────────────────────────────
// Fields match the backend Contact model exactly.
export interface Contact {
  id: string;
  corporate_id?: string;
  company?: string;          // FK UUID to Company
  company_name?: string;     // read-only
  salutation?: string;
  first_name: string;
  last_name: string;
  full_name?: string;        // read-only computed
  email: string;
  phone?: string;
  mobile?: string;
  job_title?: string;
  department?: string;
  address?: string;
  city?: string;
  country?: string;
  linkedin?: string;
  twitter?: string;
  description?: string;      // was "notes" in old frontend
  tags?: string[];
  assigned_to?: string;
  is_active: boolean;        // was "status" enum in old frontend
  created_at: string;
  updated_at?: string;
}

export interface ContactListResponse {
  results: Contact[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ── Deal (Opportunity) ────────────────────────────────────────────────────────
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

// ── Pipeline Stage ────────────────────────────────────────────────────────────
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

// ── Campaign ──────────────────────────────────────────────────────────────────
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

// ── Activity ──────────────────────────────────────────────────────────────────
// Backend model uses activity_type, not type.
export interface Activity {
  id: string;
  activity_type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'demo' | 'follow_up';
  status: 'planned' | 'done' | 'cancelled';
  subject: string;
  description?: string;
  contact?: string;          // FK UUID
  company?: string;          // FK UUID
  scheduled_at?: string;
  done_at?: string;
  duration_minutes?: number;
  assigned_to?: string;
  created_at: string;
}

export interface ActivityListResponse {
  results: Activity[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ── Summary ───────────────────────────────────────────────────────────────────
export interface CRMSummary {
  total_contacts: number;
  total_contacts_previous?: number;
  total_contacts_change?: number;
  total_contacts_trend?: 'up' | 'down' | 'neutral';
  total_deals: number;
  total_deals_previous?: number;
  total_deals_change?: number;
  total_deals_trend?: 'up' | 'down' | 'neutral';
  pipeline_value: number;
  pipeline_value_previous?: number;
  pipeline_value_change?: number;
  pipeline_value_trend?: 'up' | 'down' | 'neutral';
  won_deals_this_month: number;
  conversion_rate: number;
  conversion_rate_previous?: number;
  conversion_rate_change?: number;
  conversion_rate_trend?: 'up' | 'down' | 'neutral';
  active_campaigns: number;
}

// ── Service ───────────────────────────────────────────────────────────────────
const crmService = {
  // Contacts — /api/crm/contacts/
  getContacts: (params?: Record<string, unknown>) =>
    crmClient.get<ContactListResponse>('/api/crm/contacts/', { params }),

  getContact: (id: string) =>
    crmClient.get<Contact>(`/api/crm/contacts/${id}/`),

  createContact: (data: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'full_name' | 'company_name'>) =>
    crmClient.post<Contact>('/api/crm/contacts/', data),

  updateContact: (id: string, data: Partial<Contact>) => {
    // Strip read-only fields before sending
    const { full_name, company_name, ...payload } = data;
    return crmClient.put<Contact>(`/api/crm/contacts/${id}/`, payload);
  },

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

  // Convert contact to customer
  convertContact: (id: string, data?: Record<string, unknown>) =>
    crmClient.post(`/api/crm/contacts/${id}/convert/`, data ?? {}),

  // Mark deal as won
  winDeal: (id: string, data?: Record<string, unknown>) =>
    crmClient.post(`/api/crm/pipeline/opportunities/${id}/win/`, data ?? {}),

  // Summary
  getSummary: () =>
    crmClient.get<CRMSummary>('/api/crm/pipeline/overview/'),
};

export default crmService;
