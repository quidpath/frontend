'use client';

import React from 'react';
import { Tooltip } from '@mui/material';
import { usePermissions } from '@/hooks/usePermissions';
import type { UserRole } from '@/utils/permissions';

interface ProtectedActionProps {
  children: React.ReactElement;
  requiredRole?: UserRole;
  requireSuperuser?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
  disableTooltip?: boolean;
}

/**
 * Wrapper component that conditionally renders children based on user permissions
 */
export default function ProtectedAction({
  children,
  requiredRole,
  requireSuperuser,
  requireAdmin,
  fallback = null,
  disableTooltip = false,
}: ProtectedActionProps) {
  const { hasRole, isSuperuser, isAdmin } = usePermissions();

  let hasPermission = true;
  let reason = '';

  if (requireSuperuser && !isSuperuser) {
    hasPermission = false;
    reason = 'Superuser access required';
  } else if (requireAdmin && !isAdmin) {
    hasPermission = false;
    reason = 'Administrator access required';
  } else if (requiredRole && !hasRole(requiredRole)) {
    hasPermission = false;
    reason = `${requiredRole} role or higher required`;
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (disableTooltip) {
      return React.cloneElement(children, { disabled: true });
    }

    return (
      <Tooltip title={reason} arrow>
        <span>
          {React.cloneElement(children, { disabled: true })}
        </span>
      </Tooltip>
    );
  }

  return children;
}
