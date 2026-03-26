import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getGatewayUrl, getBillingUrl, getInventoryUrl, getCrmUrl, getHrmUrl, getPosUrl, getProjectsUrl } from '@/config/env';

const GATEWAY_URL = getGatewayUrl();

// ─── Token refresh lock ───────────────────────────────────────────────────────
// Ensures only one refresh call is in-flight at a time; all concurrent 401s
// wait on the same promise instead of each triggering their own refresh.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (!refresh) return null;

      const res = await axios.post<{ access: string }>(
        `${GATEWAY_URL}/token/refresh/`,
        { refresh },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const newAccess = res.data.access;
      localStorage.setItem('access_token', newAccess);
      return newAccess;
    } catch {
      // Refresh failed — clear tokens and redirect once
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Helper function to get corporate ID from localStorage
function getCorporateId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('quidpath-user');
    if (!userStr) return null;
    const userData = JSON.parse(userStr);
    return userData?.state?.user?.corporate?.id ?? null;
  } catch (e) {
    console.error('[API Client] Error getting corporate ID:', e);
    return null;
  }
}

// List of endpoints that should NOT have corporate_id auto-injected
const EXCLUDED_ENDPOINTS = [
  '/login/',
  '/register/',
  '/register-individual/',
  '/register-individual-email/',
  '/activate-account/',
  '/resend-activation/',
  '/token/refresh/',
  '/logout/',
  '/password-forgot/',
  '/verify-pass-otp/',
  '/reset-password/',
  '/verify-otp/',
  '/health/',
  '/get_profile/',
  '/menu/',
  '/plans/',
  '/validate-promotion/',
];

function shouldExcludeEndpoint(url: string): boolean {
  return EXCLUDED_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

function createServiceClient(baseURL: string, isGateway = false): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 60000, // 60s for large exports
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't override Content-Type for multipart/form-data — let axios set the boundary
        const isMultipart = config.data instanceof FormData;
        if (isMultipart) {
          delete config.headers['Content-Type'];
        }

        const corporateId = getCorporateId();
        if (corporateId && config.url && !shouldExcludeEndpoint(config.url)) {
          if ((config.method === 'post' || config.method === 'put') && !isMultipart) {
            if (config.data && typeof config.data === 'object') {
              if (!config.data.corporate_id && !config.data.corporate) {
                config.data = { ...config.data, corporate: corporateId, corporate_id: corporateId };
              }
            } else if (!config.data) {
              config.data = { corporate: corporateId, corporate_id: corporateId };
            }
          }
          if (config.method === 'get' || config.method === 'delete') {
            if (!config.params) config.params = {};
            if (!config.params.corporate_id && !config.params.corporate) {
              config.params.corporate_id = corporateId;
            }
          }
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (
        error.response?.status === 401 &&
        typeof window !== 'undefined' &&
        !originalRequest._retry &&
        originalRequest.url &&
        !originalRequest.url.includes('/token/refresh/') &&
        !originalRequest.url.includes('/login/')
      ) {
        originalRequest._retry = true;
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        }
        return Promise.reject(error);
      }

      if (isGateway && error.response?.status === 403 && typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }

      // 402 = billing middleware blocked — parse JSON even if responseType was blob
      if (error.response?.status === 402 && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/billing-setup') && !currentPath.startsWith('/payment-required')) {
          let payload: Record<string, unknown> = {};
          try {
            const raw = error.response.data;
            if (raw instanceof Blob) {
              const text = await raw.text();
              payload = JSON.parse(text);
            } else {
              payload = raw as Record<string, unknown>;
            }
          } catch {}
          if (payload?.requires_phone) {
            window.location.href = '/billing-setup';
          } else if (payload?.requires_payment) {
            window.location.href = '/payment-required';
          } else {
            window.location.href = '/billing-setup';
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

export const gatewayClient = createServiceClient(GATEWAY_URL, true);
export const billingClient = createServiceClient(getBillingUrl());
export const inventoryClient = createServiceClient(getInventoryUrl());
export const crmClient = createServiceClient(getCrmUrl());
export const hrmClient = createServiceClient(getHrmUrl());
export const posClient = createServiceClient(getPosUrl());
export const projectsClient = createServiceClient(getProjectsUrl());

export type { AxiosError };
