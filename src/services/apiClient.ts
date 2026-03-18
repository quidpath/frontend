import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getGatewayUrl, getBillingUrl, getInventoryUrl, getCrmUrl, getHrmUrl, getPosUrl, getProjectsUrl } from '@/config/env';

const GATEWAY_URL = getGatewayUrl();

// Helper function to get corporate ID from localStorage
function getCorporateId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('quidpath-user');
    if (!userStr) return null;
    
    const userData = JSON.parse(userStr);
    const corporateId = userData?.state?.user?.corporate?.id;
    
    return corporateId || null;
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
  '/plans/', // Public endpoint
  '/validate-promotion/', // Public endpoint
];

// Check if endpoint should be excluded from auto-injection
function shouldExcludeEndpoint(url: string): boolean {
  return EXCLUDED_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

function createServiceClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        // Add authentication token
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add corporate_id to requests that need it
        const corporateId = getCorporateId();
        
        if (corporateId && config.url && !shouldExcludeEndpoint(config.url)) {
          // For POST/PUT requests, add to body
          if (config.method === 'post' || config.method === 'put') {
            if (config.data && typeof config.data === 'object') {
              // Check if corporate or corporate_id already exists
              if (!config.data.corporate_id && !config.data.corporate) {
                // Create new object with corporate field
                config.data = {
                  ...config.data,
                  corporate: corporateId,
                  corporate_id: corporateId, // Add both for compatibility
                };
              }
            } else if (!config.data) {
              // If no data, create object with corporate_id
              config.data = {
                corporate: corporateId,
                corporate_id: corporateId,
              };
            }
          }
          
          // For GET/DELETE requests, add to query params if not present
          if (config.method === 'get' || config.method === 'delete') {
            if (!config.params) {
              config.params = {};
            }
            // Only add if not already present
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
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      return Promise.reject(error);
    }
  );

  return client;
}

const gatewayClientInstance = createServiceClient(GATEWAY_URL);
gatewayClientInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        window.location.href = '/unauthorized';
      }
    }
    return Promise.reject(error);
  }
);

export const gatewayClient = gatewayClientInstance;

export const billingClient = createServiceClient(getBillingUrl());

export const inventoryClient = createServiceClient(getInventoryUrl());

export const crmClient = createServiceClient(getCrmUrl());

export const hrmClient = createServiceClient(getHrmUrl());

export const posClient = createServiceClient(getPosUrl());

export const projectsClient = createServiceClient(getProjectsUrl());

export type { AxiosError };
