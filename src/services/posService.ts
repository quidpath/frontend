/**
 * QuidPath ERP - POS Service
 * Complete POS module API client
 */
import { gatewayClient } from './apiClient';

const BASE_URL = '/api/v1/pos';

// ============================================================================
// ORDERS
// ============================================================================
export const orderService = {
  create: (data: any) => gatewayClient.post(`${BASE_URL}/orders/create/`, data),
};

// Default export
const posService = {
  orders: orderService,
};

export default posService;
