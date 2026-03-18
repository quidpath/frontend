'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService, { profileToStoredUser } from '@/auth/authService';
import { useUserStore } from '@/store/userStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = authService.getToken();
    if (!token) {
      clearUser();
      authService.logout();
      router.replace('/login');
      return;
    }

    const hydrate = async () => {
      if (user) {
        setReady(true);
        return;
      }
      try {
        const { data } = await authService.getProfile();
        setUser(profileToStoredUser(data));
      } catch {
        clearUser();
        authService.logout();
        router.replace('/login');
        return;
      }
      setReady(true);
    };

    hydrate();
  }, [user, setUser, clearUser, router]);

  if (!ready || !useUserStore.getState().user) return null;

  return <>{children}</>;
}
