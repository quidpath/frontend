import { gatewayClient } from './apiClient';

/** Corporate from backend list (snake_case or mixed). */
export interface CorporateRow {
  id: string;
  name: string;
  email?: string;
  is_approved?: boolean;
  is_disapproved?: boolean;
  is_active?: boolean;
  is_seen?: boolean;
  is_banned?: boolean;
  [key: string]: unknown;
}

export interface CorporatesListResponse {
  corporates: CorporateRow[];
}

const adminService = {
  listCorporates: () =>
    gatewayClient.get<CorporatesListResponse>('/api/orgauth/corporate/list'),

  approveCorporate: (corporateId: string, approved: boolean) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate/approve', {
      id: corporateId,
      approved,
    }),

  deleteCorporate: (corporateId: string) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate/delete', {
      id: corporateId,
    }),

  suspendCorporate: (corporateId: string) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate/suspend', {
      id: corporateId,
    }),

  unsuspendCorporate: (corporateId: string) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate/unsuspend', {
      id: corporateId,
    }),

  banCorporate: (corporateId: string) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate/ban', {
      id: corporateId,
    }),

  unbanCorporate: (corporateId: string) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate/unban', {
      id: corporateId,
    }),
};

export default adminService;
