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
  permissions: Permission[];
}

const roleService = {
  listAllRoles: () =>
    gatewayClient.get<{ roles: RoleWithPermissions[] }>('/api/auth/roles/list-all/'),

  listAllPermissions: () =>
    gatewayClient.get<{ permissions: Permission[] }>('/api/auth/roles/permissions/'),

  createRole: (data: { name: string; description: string; permission_ids: number[] }) =>
    gatewayClient.post('/api/auth/roles/create/', data),

  updateRole: (data: { role_id: number; name: string; description: string; permission_ids: number[] }) =>
    gatewayClient.post('/api/auth/roles/update/', data),

  deleteRole: (roleId: number) =>
    gatewayClient.post('/api/auth/roles/delete/', { role_id: roleId }),

  addPermission: (roleId: number, permissionId: number) =>
    gatewayClient.post('/api/auth/roles/add-permission/', { role_id: roleId, permission_id: permissionId }),

  removePermission: (roleId: number, permissionId: number) =>
    gatewayClient.post('/api/auth/roles/remove-permission/', { role_id: roleId, permission_id: permissionId }),
};

export default roleService;
