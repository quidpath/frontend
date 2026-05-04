/**
 * QuidPath ERP - Purchasing Service
 * Complete purchasing module API client
 */
import { gatewayClient } from './apiClient';

const BASE_URL = '/api/v1/purchasing';

// ============================================================================
// VENDORS
// ============================================================================
export const vendorService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/vendors/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/vendors/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/vendors/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/vendors/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/vendors/${id}/delete/`),
};

// ============================================================================
// PURCHASE ORDERS
// ============================================================================
export const purchaseOrderService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/purchase-orders/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/purchase-orders/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/purchase-orders/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/purchase-orders/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/purchase-orders/${id}/delete/`),
};

// Default export
const purchasingService = {
  vendors: vendorService,
  purchaseOrders: purchaseOrderService,
};

export default purchasingService;
