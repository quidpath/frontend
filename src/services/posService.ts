import { posClient } from './apiClient';

export interface POSOrder {
  id: string;
  order_number: string;
  customer_name?: string;
  items: POSOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface POSOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface POSOrderListResponse {
  results: POSOrder[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface POSSession {
  id: string;
  terminal_id: string;
  terminal_name: string;
  opened_by: string;
  opened_at: string;
  closed_at?: string;
  opening_cash: number;
  closing_cash?: number;
  total_sales: number;
  status: 'open' | 'closed';
}

export interface POSSessionListResponse {
  results: POSSession[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface POSStore {
  id: string;
  name: string;
  code: string;
  address?: string;
  is_active: boolean;
}

export interface POSStoreListResponse {
  results: POSStore[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface POSSummary {
  todays_sales: number;
  transactions_today: number;
  average_order_value: number;
  refunds_today: number;
}

// Purchases (from /api/purchases/)
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
}

export interface PurchaseOrder {
  id: string;
  order_number?: string;
  supplier: string;
  supplier_id: string;
  total: number;
  status: 'draft' | 'approved' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery?: string;
}

export interface PurchaseOrderListResponse {
  results: PurchaseOrder[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface Requisition {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface RequisitionListResponse {
  results: Requisition[];
  count: number;
  next: string | null;
  previous: string | null;
}

const posService = {
  // Stores — /api/pos/stores/
  getStores: (params?: Record<string, unknown>) =>
    posClient.get<POSStoreListResponse>('/api/pos/stores/', { params }),

  getStore: (id: string) =>
    posClient.get<POSStore>(`/api/pos/stores/${id}/`),

  createStore: (data: Omit<POSStore, 'id'>) =>
    posClient.post<POSStore>('/api/pos/stores/', data),

  updateStore: (id: string, data: Partial<POSStore>) =>
    posClient.put<POSStore>(`/api/pos/stores/${id}/`, data),

  deleteStore: (id: string) =>
    posClient.delete(`/api/pos/stores/${id}/`),

  // Sessions — /api/pos/sessions/
  getSessions: (params?: Record<string, unknown>) =>
    posClient.get<POSSessionListResponse>('/api/pos/sessions/', { params }),

  openSession: (terminalId: string, data: { opening_cash: number }) =>
    posClient.post<POSSession>(`/api/pos/terminals/${terminalId}/sessions/open/`, data),

  closeSession: (id: string, closing_cash: number) =>
    posClient.post<POSSession>(`/api/pos/sessions/${id}/close/`, { closing_cash }),

  // Orders — /api/pos/orders/
  getOrders: (params?: Record<string, unknown>) =>
    posClient.get<POSOrderListResponse>('/api/pos/orders/', { params }),

  getOrder: (id: string) =>
    posClient.get<POSOrder>(`/api/pos/orders/${id}/`),

  createOrder: (data: Omit<POSOrder, 'id' | 'created_at' | 'order_number'>) =>
    posClient.post<POSOrder>('/api/pos/orders/', data),

  addOrderLine: (orderId: string, data: Record<string, unknown>) =>
    posClient.post(`/api/pos/orders/${orderId}/lines/`, data),

  removeOrderLine: (orderId: string, lineId: string) =>
    posClient.delete(`/api/pos/orders/${orderId}/lines/${lineId}/`),

  processPayment: (orderId: string, data: Record<string, unknown>) =>
    posClient.post(`/api/pos/orders/${orderId}/pay/`, data),

  processReturn: (orderId: string, data: Record<string, unknown>) =>
    posClient.post(`/api/pos/orders/${orderId}/return/`, data),

  // Promotions — /api/pos/promotions/
  getPromotions: (params?: Record<string, unknown>) =>
    posClient.get('/api/pos/promotions/', { params }),

  // Loyalty — /api/pos/loyalty/
  getLoyaltyPrograms: () =>
    posClient.get('/api/pos/loyalty/programs/'),

  lookupLoyaltyCard: (data: Record<string, unknown>) =>
    posClient.post('/api/pos/loyalty/cards/lookup/', data),

  // Suppliers — /api/purchases/suppliers/
  getSuppliers: (params?: Record<string, unknown>) =>
    posClient.get<{ results: Supplier[]; count: number }>('/api/purchases/suppliers/', { params }),

  getSupplier: (id: string) =>
    posClient.get<Supplier>(`/api/purchases/suppliers/${id}/`),

  createSupplier: (data: Omit<Supplier, 'id'>) =>
    posClient.post<Supplier>('/api/purchases/suppliers/', data),

  updateSupplier: (id: string, data: Partial<Supplier>) =>
    posClient.put<Supplier>(`/api/purchases/suppliers/${id}/`, data),

  deleteSupplier: (id: string) =>
    posClient.delete(`/api/purchases/suppliers/${id}/`),

  // Purchase Orders — /api/purchases/orders/
  getPurchaseOrders: (params?: Record<string, unknown>) =>
    posClient.get<PurchaseOrderListResponse>('/api/purchases/orders/', { params }),

  getPurchaseOrder: (id: string) =>
    posClient.get<PurchaseOrder>(`/api/purchases/orders/${id}/`),

  createPurchaseOrder: (data: Omit<PurchaseOrder, 'id'>) =>
    posClient.post<PurchaseOrder>('/api/purchases/orders/', data),

  updatePurchaseOrder: (id: string, data: Partial<PurchaseOrder>) =>
    posClient.put<PurchaseOrder>(`/api/purchases/orders/${id}/`, data),

  approvePurchaseOrder: (id: string) =>
    posClient.post(`/api/purchases/orders/${id}/approve/`),

  // Requisitions — /api/purchases/requisitions/
  getRequisitions: (params?: Record<string, unknown>) =>
    posClient.get<RequisitionListResponse>('/api/purchases/requisitions/', { params }),

  getRequisition: (id: string) =>
    posClient.get<Requisition>(`/api/purchases/requisitions/${id}/`),

  createRequisition: (data: Record<string, unknown>) =>
    posClient.post<Requisition>('/api/purchases/requisitions/', data),

  updateRequisition: (id: string, data: Record<string, unknown>) =>
    posClient.put<Requisition>(`/api/purchases/requisitions/${id}/`, data),

  approveRequisition: (id: string) =>
    posClient.post(`/api/purchases/requisitions/${id}/approve/`),

  deleteRequisition: (id: string) =>
    posClient.delete(`/api/purchases/requisitions/${id}/`),

  // GRN (Goods Received Notes) — /api/purchases/receipts/
  getGRNs: (params?: Record<string, unknown>) =>
    posClient.get('/api/purchases/receipts/', { params }),

  validateGRN: (id: string) =>
    posClient.post(`/api/purchases/receipts/${id}/validate/`),

  // Bills — /api/purchases/bills/
  getBills: (params?: Record<string, unknown>) =>
    posClient.get('/api/purchases/bills/', { params }),

  getBill: (id: string) =>
    posClient.get(`/api/purchases/bills/${id}/`),
};

export default posService;
