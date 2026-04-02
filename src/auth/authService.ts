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
  /** POST /api/auth/login/ */
  login: (username: string, password: string) =>
    gatewayClient.post<LoginResponse>('/api/auth/login/', { username, password }),

  /** POST /api/auth/verify-otp/ */
  verifyOtp: (code: string) =>
    gatewayClient.post<LoginResponse>('/api/auth/verify-otp/', { otp: code }),

  /** POST /api/auth/resend-activation/ */
  resendActivation: (email: string) =>
    gatewayClient.post<{ message: string }>('/api/auth/resend-activation/', { email }),

  refresh: (refresh: string) =>
    gatewayClient.post<{ access: string }>('/api/auth/token/refresh/', { refresh }),

  /** GET /api/auth/get_profile/ */
  getProfile: () => gatewayClient.get<GetProfileResponse>('/api/auth/get_profile/'),

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

  /** POST /api/auth/register/ */
  register: (username: string, email: string, password: string) =>
    gatewayClient.post<{ message: string; otp_required?: boolean }>('/api/auth/register/', {
      username,
      email,
      password,
    }),

  /** POST /api/auth/register-individual/ */
  registerIndividual: (payload: {
    username: string;
    email: string;
    password: string;
    plan_tier?: string;
    plan_id?: string;
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
    }>('/api/auth/register-individual/', payload),

  /** POST /api/orgauth/corporate/create */
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
    gatewayClient.post<{ message: string; id?: string }>('/api/orgauth/corporate/create', payload),
};

export default authService;
