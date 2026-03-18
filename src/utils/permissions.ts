/**
 * Role-based access control utilities for frontend
 */

export type UserRole = 'superadmin' | 'admin' | 'corporate_admin' | 'manager' | 'user' | null;

export interface User {
  id: string;
  role: { id: number; name: string } | null;
  is_superuser?: boolean;
}

/**
 * Check if user has required role or higher
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  if (!requiredRole) return true;
  
  const roleHierarchy: Record<string, number> = {
    superadmin: 4,
    admin: 3,
    corporate_admin: 3,
    manager: 2,
    user: 1,
  };
  
  const userRoleName = user.role?.name?.toLowerCase() || 'user';
  const userLevel = roleHierarchy[userRoleName] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Check if user can access settings
 */
export function canAccessSettings(user: User | null): boolean {
  if (!user) return false;
  return user.is_superuser || hasRole(user, 'admin');
}

/**
 * Check if user can access analytics
 */
export function canAccessAnalytics(user: User | null): boolean {
  if (!user) return false;
  return user.is_superuser || hasRole(user, 'manager');
}

/**
 * Check if user can perform CRUD operations
 */
export function canCreate(user: User | null): boolean {
  return hasRole(user, 'user');
}

export function canEdit(user: User | null): boolean {
  return hasRole(user, 'user');
}

export function canDelete(user: User | null): boolean {
  return hasRole(user, 'manager');
}

export function canApprove(user: User | null): boolean {
  return hasRole(user, 'manager');
}
