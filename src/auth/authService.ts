import { gatewayClient } from '@/services/apiClient';
import type {
  GetProfileResponse,
  LoginResponse,
  UserProfile,
} from '@/types/auth';
import type { StoredUserProfile } from '@/store/userStore';

/** Map backend get_profile response to store shape. */
export function profileToStoredUser(res: GetProfileResponse): StoredUserProfile {
  const u = res.user;
  const corp = u.corporate ?? { id: null, name: '' };
  return {
    id: String(u.id),
    username: u.username ?? '',
    email: u.email ?? '',
    role: u.role ?? null,
    corporate: { ...corp, id: corp.id != null ? String(corp.id) : null },
    organisation_id: corp.id != null ? String(corp.id) : null,
    is_superuser: !!u.is_superuser,
  };
}

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export interface AuthTokens {
  access: string;
  refresh: string;
}



const authService = {
  /** POST /login/ with username + password. Returns tokens; may include otp_required. */
  login: (username: string, password: string) =>
    gatewayClient.post<LoginResponse>('/login/', { username, password }),

  /** POST /verify-otp/ with OTP code when backend returned otp_required. */
  verifyOtp: (code: string) =>
    gatewayClient.post<LoginResponse>('/verify-otp/', { otp: code }),

  refresh: (refresh: string) =>
    gatewayClient.post<{ access: string }>('/token/refresh/', { refresh }),

  /** GET /get_profile/ with Bearer. Returns full user + menu. */
  getProfile: () => gatewayClient.get<GetProfileResponse>('/get_profile/'),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(ACCESS_KEY);
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_KEY);
  },

  setTokens: (access: string, refresh: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
    }
  },

  /** POST /register/ — username, email, password. Returns message, otp_required. */
  register: (username: string, email: string, password: string) =>
    gatewayClient.post<{ message: string; otp_required?: boolean }>('/register/', {
      username,
      email,
      password,
    }),

  /** POST /register-individual/ — creates user + org (SUPERADMIN). plan_tier optional. */
  registerIndividual: (payload: {
    username: string;
    email: string;
    password: string;
    plan_tier?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
  }) =>
    gatewayClient.post<{
      message: string;
      otp_required?: boolean;
      corporate_id?: string;
      subscription_required?: boolean;
    }>('/register-individual/', payload),

  /** POST corporate/create — create organisation (pending approval). */
  createCorporate: (payload: {
    name: string;
    email: string;
    phone?: string;
    industry?: string;
    company_size?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    description?: string;
  }) =>
    gatewayClient.post<{ message: string; id?: string }>('/corporate/create', payload),
};

export default authService;
