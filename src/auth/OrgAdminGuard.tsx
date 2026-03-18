'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

/**
 * Renders children only if the current user has SUPERADMIN role (org admin).
 * Otherwise redirects to /dashboard. Use for /org-admin/* routes.
 */
export default function OrgAdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const isOrgAdmin = user?.role?.name === 'SUPERADMIN';

  useEffect(() => {
    if (user === null) return;
    if (!isOrgAdmin) router.replace('/dashboard');
  }, [user, isOrgAdmin, router]);

  if (user === null) return null;
  if (!isOrgAdmin) return null;
  return <>{children}</>;
}
