/**
 * QuidPath ERP - CRM Service
 * Complete CRM module API client
 */
import { gatewayClient } from './apiClient';

const BASE_URL = '/api/v1/crm';

// ============================================================================
// LEADS
// ============================================================================
export const leadService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/leads/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/leads/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/leads/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/leads/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/leads/${id}/delete/`),
  convert: (id: string, data?: any) => gatewayClient.post(`${BASE_URL}/leads/${id}/convert/`, data),
};

// ============================================================================
// OPPORTUNITIES
// ============================================================================
export const opportunityService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/opportunities/`, { params }),
  updateStage: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/opportunities/${id}/stage/`, data),
};

// Default export
const crmService = {
  leads: leadService,
  opportunities: opportunityService,
};

export default crmService;
