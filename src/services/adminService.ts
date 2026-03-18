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
  /** GET corporate/list — superuser only. */
  listCorporates: () =>
    gatewayClient.get<CorporatesListResponse>('/corporate/list'),

  /** POST corporate/approve — superuser only. Body: { id, approved: true|false }. */
  approveCorporate: (corporateId: string, approved: boolean) =>
    gatewayClient.post<{ message: string }>('/corporate/approve', {
      id: corporateId,
      approved,
    }),

  /** POST corporate/delete — superuser only. Body: { id }. */
  deleteCorporate: (corporateId: string) =>
    gatewayClient.post<{ message: string }>('/corporate/delete', {
      id: corporateId,
    }),

  /** POST corporate/suspend — superuser only. Body: { id }. */
  suspendCorporate: (corporateId: string) =>
    gatewayClient.post<{ message: string }>('/corporate/suspend', {
      id: corporateId,
    }),

  /** POST corporate/unsuspend — superuser only. Body: { id }. */
  unsuspendCorporate: (corporateId: string) =>
    gatewayClient.post<{ message: string }>('/corporate/unsuspend', {
      id: corporateId,
    }),

  /** POST corporate/ban — superuser only. Body: { id }. */
  banCorporate: (corporateId: string) =>
    gatewayClient.post<{ message: string }>('/corporate/ban', {
      id: corporateId,
    }),

  /** POST corporate/unban — superuser only. Body: { id }. */
  unbanCorporate: (corporateId: string) =>
    gatewayClient.post<{ message: string }>('/corporate/unban', {
      id: corporateId,
    }),
};

export default adminService;
