import { gatewayClient } from './apiClient';

export interface Permission {
  id: number;
  codename: string;
  name: string;
  module_slug: string;
  path?: string;
  icon_slug?: string;
  sort_order?: number;
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  description: string;
  corporate_id: string | null;
  corporate_name: string;
  permissions: Permission[];
}

export interface CorporateOption {
  id: string;
  name: string;
}

const roleService = {
  // List roles — SUPERADMIN gets their corporate's roles; SUPERUSER can pass ?corporate_id=
  listAllRoles: (corporateId?: string) =>
    gatewayClient.get<{ roles: RoleWithPermissions[] }>(
      '/api/auth/roles/list-all/',
      corporateId ? { params: { corporate_id: corporateId } } : undefined
    ),

  listAllPermissions: () =>
    gatewayClient.get<{ permissions: Permission[] }>('/api/auth/roles/permissions/'),

  // SUPERUSER only — list all corporates for the dropdown
  listCorporates: () =>
    gatewayClient.get<{ corporates: CorporateOption[] }>('/api/auth/roles/corporates/'),

  // SUPERADMIN: no corporate_id needed (scoped automatically)
  // SUPERUSER: must supply corporate_id
  createRole: (data: { name: string; description: string; permission_ids: number[]; corporate_id?: string }) =>
    gatewayClient.post<{ message: string; role: RoleWithPermissions }>('/api/auth/roles/create/', data),

  updateRole: (data: { role_id: number; name?: string; description?: string; permission_ids?: number[] }) =>
    gatewayClient.post<{ message: string; role: RoleWithPermissions }>('/api/auth/roles/update/', data),

  deleteRole: (roleId: number) =>
    gatewayClient.post<{ message: string }>('/api/auth/roles/delete/', { role_id: roleId }),

  addPermission: (roleId: number, permissionId: number) =>
    gatewayClient.post<{ message: string }>('/api/auth/roles/add-permission/', {
      role_id: roleId,
      permission_id: permissionId,
    }),

  removePermission: (roleId: number, permissionId: number) =>
    gatewayClient.post<{ message: string }>('/api/auth/roles/remove-permission/', {
      role_id: roleId,
      permission_id: permissionId,
    }),
};

export default roleService;
