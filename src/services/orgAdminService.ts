import { gatewayClient } from './apiClient';

export interface CorporateUserRow {
  id: string;
  username: string;
  email: string;
  role: string;
  role_id?: number;
  is_active: boolean;
  is_approved?: boolean;
  is_banned?: boolean;
  created_at?: string;
}

export interface CorporateUsersListResponse {
  users: CorporateUserRow[];
}

export interface RoleOption {
  id: number;
  name: string;
}

const orgAdminService = {
  /** GET corporate-users/list — SUPERADMIN only (current org users). */
  listCorporateUsers: () =>
    gatewayClient.get<CorporateUsersListResponse>('/corporate-users/list'),

  /** GET corporate-users/get — get single user. Body: { id }. */
  getCorporateUser: (userId: string) =>
    gatewayClient.get<{ user: CorporateUserRow }>('/corporate-users/get', {
      params: { id: userId },
    }),

  /** POST corporate-users/create — create user. */
  createCorporateUser: (userData: Partial<CorporateUserRow>) =>
    gatewayClient.post<{ message: string }>('/corporate-users/create', userData),

  /** POST corporate-users/update — update user. */
  updateCorporateUser: (userId: string, userData: Partial<CorporateUserRow>) =>
    gatewayClient.post<{ message: string }>('/corporate-users/update', {
      id: userId,
      ...userData,
    }),

  /** POST corporate-users/delete — delete user. */
  deleteCorporateUser: (userId: string) =>
    gatewayClient.post<{ message: string }>('/corporate-users/delete', {
      id: userId,
    }),

  /** POST corporate-users/suspend — suspend user. */
  suspendCorporateUser: (userId: string) =>
    gatewayClient.post<{ message: string }>('/corporate-users/suspend', {
      id: userId,
    }),

  /** POST corporate-users/unsuspend — unsuspend user. */
  unsuspendCorporateUser: (userId: string) =>
    gatewayClient.post<{ message: string }>('/corporate-users/unsuspend', {
      id: userId,
    }),

  /** POST corporate-users/approve — approve user (superuser only). */
  approveCorporateUser: (userId: string, approved: boolean) =>
    gatewayClient.post<{ message: string }>('/corporate-users/approve', {
      id: userId,
      approved,
    }),

  /** POST corporate-users/ban — ban user (superuser only). */
  banCorporateUser: (userId: string) =>
    gatewayClient.post<{ message: string }>('/corporate-users/ban', {
      id: userId,
    }),

  /** POST corporate-users/unban — unban user (superuser only). */
  unbanCorporateUser: (userId: string) =>
    gatewayClient.post<{ message: string }>('/corporate-users/unban', {
      id: userId,
    }),

  /** GET roles/ — list roles for dropdown. Returns { roles: RoleOption[] }. */
  listRoles: () => gatewayClient.get<{ roles: RoleOption[] }>('/roles/'),

  /** POST logo/upload/ — body: { logo: base64DataUrl }. SUPERADMIN only. */
  uploadLogo: (logoBase64: string) =>
    gatewayClient.post<{ message?: string }>('/logo/upload/', { logo: logoBase64 }),

  /** GET logo/get/ — returns logo URL or base64. */
  getLogo: () => gatewayClient.get<{ logo?: string }>('/logo/get/'),

  /** POST logo/delete/ — remove corporate logo. */
  deleteLogo: () => gatewayClient.post<{ message?: string }>('/logo/delete/', {}),
};

export default orgAdminService;
