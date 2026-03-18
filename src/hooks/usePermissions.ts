/**
 * Hook for checking user permissions
 */
import { useUserStore } from '@/store/userStore';
import {
  hasRole,
  canAccessSettings,
  canAccessAnalytics,
  canCreate,
  canEdit,
  canDelete,
  canApprove,
  type UserRole,
} from '@/utils/permissions';

export function usePermissions() {
  const user = useUserStore((state) => state.user);

  return {
    user,
    hasRole: (role: UserRole) => hasRole(user, role),
    canAccessSettings: () => canAccessSettings(user),
    canAccessAnalytics: () => canAccessAnalytics(user),
    canCreate: () => canCreate(user),
    canEdit: () => canEdit(user),
    canDelete: () => canDelete(user),
    canApprove: () => canApprove(user),
    isSuperuser: user?.is_superuser || false,
    isAdmin: user?.is_superuser || hasRole(user, 'admin'),
  };
}
