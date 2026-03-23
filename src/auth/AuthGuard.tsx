'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import authService, { profileToStoredUser } from '@/auth/authService';
import { useUserStore } from '@/store/userStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = authService.getToken();
    if (!token) {
      // No token at all — try refresh before giving up
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        clearUser();
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      // Let the apiClient interceptor handle the refresh on the profile call below
    }

    const hydrate = async () => {
      // If we already have user in store, we're good
      if (user) {
        setReady(true);
        return;
      }

      try {
        const { data } = await authService.getProfile();
        setUser(profileToStoredUser(data));
        setReady(true);
      } catch (err: unknown) {
        // Profile fetch failed even after interceptor attempted refresh
        // Only redirect if we truly have no token left
        const stillHasToken = authService.getToken();
        if (!stillHasToken) {
          clearUser();
          authService.logout();
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        } else {
          // Token exists but profile failed for another reason (e.g. 500)
          // Don't log out — just mark ready so the user isn't stuck
          setReady(true);
        }
      }
    };

    hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
