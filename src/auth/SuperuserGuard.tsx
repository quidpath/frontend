'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

/**
 * Renders children only if the current user is a superuser (system owner).
 * Otherwise redirects to /dashboard. Use for /system-admin/* routes.
 */
export default function SuperuserGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const isSuperuser = user?.is_superuser === true;

  useEffect(() => {
    if (user === null) return;
    if (!isSuperuser) router.replace('/dashboard');
  }, [user, isSuperuser, router]);

  if (user === null) return null;
  if (!isSuperuser) return null;
  return <>{children}</>;
}
