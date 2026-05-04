/**
 * QuidPath ERP - Inventory Service
 * Complete inventory module API client
 */
import { gatewayClient } from './apiClient';

const BASE_URL = '/api/v1/inventory';

// ============================================================================
// PRODUCTS
// ============================================================================
export const productService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/products/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/products/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/products/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/products/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/products/${id}/delete/`),
};

// ============================================================================
// WAREHOUSES
// ============================================================================
export const warehouseService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/warehouses/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/warehouses/create/`, data),
};

// ============================================================================
// STOCK
// ============================================================================
export const stockService = {
  move: (data: any) => gatewayClient.post(`${BASE_URL}/stock/move/`, data),
  getLevels: (productId: string, params?: any) => gatewayClient.get(`${BASE_URL}/stock/${productId}/levels/`, { params }),
};

// Default export
const inventoryService = {
  products: productService,
  warehouses: warehouseService,
  stock: stockService,
};

export default inventoryService;
