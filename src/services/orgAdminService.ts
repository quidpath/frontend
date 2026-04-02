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
  listCorporateUsers: () =>
    gatewayClient.get<CorporateUsersListResponse>('/api/orgauth/corporate-users/list'),

  getCorporateUser: (userId: string) =>
    gatewayClient.get<{ user: CorporateUserRow }>('/api/orgauth/corporate-users/get', {
      params: { id: userId },
    }),

  createCorporateUser: (userData: Partial<CorporateUserRow>) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate-users/create', userData),

  updateCorporateUser: (userId: string, userData: Partial<CorporateUserRow>) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate-users/update', {
      id: userId,
      ...userData,
    }),

  deleteCorporateUser: (userId: string) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate-users/delete', {
      id: userId,
    }),

  suspendCorporateUser: (userId: string) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate-users/suspend', {
      id: userId,
    }),

  unsuspendCorporateUser: (userId: string) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate-users/unsuspend', {
      id: userId,
    }),

  approveCorporateUser: (userId: string, approved: boolean) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate-users/approve', {
      id: userId,
      approved,
    }),

  banCorporateUser: (userId: string) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate-users/ban', {
      id: userId,
    }),

  unbanCorporateUser: (userId: string) =>
    gatewayClient.post<{ message: string }>('/api/orgauth/corporate-users/unban', {
      id: userId,
    }),

  listRoles: () =>
    gatewayClient.get<{ roles: RoleOption[] }>('/api/orgauth/roles/'),

  uploadLogo: (logoBase64: string) =>
    gatewayClient.post<{ message?: string }>('/api/auth/logo/upload/', { logo: logoBase64 }),

  getLogo: () =>
    gatewayClient.get<{ logo?: string }>('/api/auth/logo/get/'),

  deleteLogo: () =>
    gatewayClient.post<{ message?: string }>('/api/auth/logo/delete/', {}),
};

export default orgAdminService;
