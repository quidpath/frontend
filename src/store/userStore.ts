import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoredUserProfile {
  id: string;
  username: string;
  email: string;
  role: { id: number; name: string } | null;
  corporate: { id: string | null; name: string; logo?: string; [key: string]: unknown };
  organisation_id: string | null;
  /** System owner; only they see System Admin (organisations, all users). */
  is_superuser?: boolean;
}

interface UserState {
  user: StoredUserProfile | null;
  setUser: (user: StoredUserProfile | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'quidpath-user',
      partialize: (state) => ({ user: state.user }),
    }
  )
)