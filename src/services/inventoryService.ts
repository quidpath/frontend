import { inventoryClient } from './apiClient';

// ==================== TYPES ====================

export interface Product {
  id: string;
  name: string;
  sku: string; // Maps to internal_reference in backend
  barcode?: string;
  category?: string;
  description?: string;
  unit_price: number; // Maps to list_price in backend
  cost_price: number; // Maps to standard_price in backend
  quantity_on_hand: number;
  reorder_point: number; // Maps to min_qty in backend
  unit_of_measure: string; // Maps to uom_id in backend
  is_active: boolean;
  product_type?: 'storable' | 'consumable' | 'service';
  costing_method?: 'fifo' | 'avco' | 'standard';
  can_be_sold?: boolean;
  can_be_purchased?: boolean;
  created_at: string;
}

export interface ProductListResponse {
  results: Product[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  is_active: boolean;
  capacity?: number;
  manager?: string;
  created_at: string;
}

export interface WarehouseListResponse {
  results: Warehouse[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  movement_type: 'receipt' | 'delivery' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost?: number;
  reference?: string;
  notes?: string;
  date: string;
  state?: 'draft' | 'confirmed' | 'assigned' | 'done' | 'cancelled';
  created_at: string;
}

export interface StockMovementListResponse {
  results: StockMovement[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface StockLevel {
  id: string;
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
}

export interface StockLevelListResponse {
  results: StockLevel[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface InventorySummary {
  total_products: number;
  total_products_previous?: number;
  total_products_change?: number;
  total_products_trend?: 'up' | 'down' | 'neutral';
  
  total_value: number;
  total_value_previous?: number;
  total_value_change?: number;
  total_value_trend?: 'up' | 'down' | 'neutral';
  
  low_stock_items: number;
  low_stock_items_previous?: number;
  low_stock_items_change?: number;
  low_stock_items_trend?: 'up' | 'down' | 'neutral';
  
  out_of_stock_items?: number;
  warehouses_count: number;
  movements_this_month?: number;
}

export interface IntegrationStatus {
  success: boolean;
  all_services_online: boolean;
  services: {
    [key: string]: {
      status: 'online' | 'offline' | 'error';
      response_time?: number;
      error?: string;
    };
  };
}

export interface IntegrationResult {
  synced_services: string[];
  removed_from?: string[]; // For delete operations
  errors: string[];
  accounting_entry_created?: boolean;
}

export interface ProductCreateResponse {
  success: boolean;
  message: string;
  product: Product;
  integration: IntegrationResult;
}

export interface StockMoveCreateResponse {
  success: boolean;
  message: string;
  stock_move: {
    id: string;
    reference: string;
    move_type: string;
    product: string;
    quantity: string;
    state: string;
  };
  integration: IntegrationResult;
}

// ==================== SERVICE ====================

const inventoryService = {
  // ==================== INTEGRATED PRODUCT CRUD ====================
  
  /**
   * Get all products with pagination and search
   * Uses integrated endpoint for full sync status
   */
  getProducts: (params?: Record<string, unknown>) =>
    inventoryClient.get<ProductListResponse>('/api/inventory/products/integrated/list/', { params }),

  /**
   * Get single product with integration status
   */
  getProduct: (id: string) =>
    inventoryClient.get<{
      success: boolean;
      product: Product;
      integration_status: IntegrationStatus['services'];
    }>(`/api/inventory/products/integrated/${id}/`),

  /**
   * Create product with automatic sync to all services
   * Syncs to: Accounting, POS, Projects, CRM, HRM
   */
  createProduct: (data: Omit<Product, 'id' | 'created_at' | 'quantity_on_hand'>) => {
    // Map frontend fields to backend model fields
    const backendData = {
      name: data.name,
      internal_reference: data.sku, // Map sku to internal_reference
      barcode: data.barcode || '',
      category_id: data.category || null, // Assuming category is a UUID
      description: data.description || '',
      list_price: String(data.unit_price), // Map unit_price to list_price
      standard_price: String(data.cost_price), // Map cost_price to standard_price
      min_qty: String(data.reorder_point), // Map reorder_point to min_qty
      reorder_qty: String(data.reorder_point), // Use same value for reorder_qty
      uom_id: data.unit_of_measure, // Map unit_of_measure to uom_id
      is_active: data.is_active,
      product_type: data.product_type || 'storable', // Default product type
      costing_method: data.costing_method || 'avco', // Default costing method
      can_be_sold: data.can_be_sold !== undefined ? data.can_be_sold : true,
      can_be_purchased: data.can_be_purchased !== undefined ? data.can_be_purchased : true,
      tax_rate: '16.00', // Default VAT rate
    };
    return inventoryClient.post<ProductCreateResponse>('/api/inventory/products/integrated/', backendData);
  },

  /**
   * Update product with automatic sync to all services
   */
  updateProduct: (id: string, data: Partial<Product>) => {
    // Map frontend fields to backend model fields for update
    const backendData: Record<string, unknown> = {};
    if (data.name !== undefined) backendData.name = data.name;
    if (data.sku !== undefined) backendData.internal_reference = data.sku;
    if (data.barcode !== undefined) backendData.barcode = data.barcode;
    if (data.category !== undefined) backendData.category_id = data.category;
    if (data.description !== undefined) backendData.description = data.description;
    if (data.unit_price !== undefined) backendData.list_price = String(data.unit_price);
    if (data.cost_price !== undefined) backendData.standard_price = String(data.cost_price);
    if (data.reorder_point !== undefined) {
      backendData.min_qty = String(data.reorder_point);
      backendData.reorder_qty = String(data.reorder_point);
    }
    if (data.unit_of_measure !== undefined) backendData.uom_id = data.unit_of_measure;
    if (data.is_active !== undefined) backendData.is_active = data.is_active;
    if (data.product_type !== undefined) backendData.product_type = data.product_type;
    if (data.costing_method !== undefined) backendData.costing_method = data.costing_method;
    if (data.can_be_sold !== undefined) backendData.can_be_sold = data.can_be_sold;
    if (data.can_be_purchased !== undefined) backendData.can_be_purchased = data.can_be_purchased;
    
    return inventoryClient.put<ProductCreateResponse>(`/api/inventory/products/integrated/${id}/update/`, backendData);
  },

  /**
   * Delete product with automatic removal from all services
   */
  deleteProduct: (id: string) =>
    inventoryClient.delete<{
      success: boolean;
      message: string;
      integration: IntegrationResult;
    }>(`/api/inventory/products/integrated/${id}/delete/`),

  /**
   * Bulk sync products to all services
   */
  bulkSyncProducts: (productIds: string[]) =>
    inventoryClient.post('/api/inventory/products/integrated/bulk-sync/', { product_ids: productIds }),

  // ==================== INTEGRATED STOCK OPERATIONS ====================

  /**
   * Create stock movement with automatic sync
   * Automatically creates accounting entries and updates POS stock
   */
  createStockMovement: (data: {
    reference?: string;
    move_type: 'receipt' | 'delivery' | 'adjustment' | 'transfer';
    product_id: string;
    variant_id?: string;
    quantity: number;
    uom_id: string;
    unit_cost?: number;
    location_from_id?: string;
    location_to_id?: string;
    lot_id?: string;
    notes?: string;
    project_id?: string;
    is_asset?: boolean;
  }) =>
    inventoryClient.post<StockMoveCreateResponse>('/api/inventory/stock/moves/integrated/', data),

  /**
   * Get stock movements with filters
   */
  getStockMovements: (params?: Record<string, unknown>) =>
    inventoryClient.get<StockMovementListResponse>('/api/inventory/stock/moves/integrated/list/', { params }),

  /**
   * Get single stock movement
   */
  getStockMovement: (id: string) =>
    inventoryClient.get<{
      success: boolean;
      stock_move: StockMovement;
    }>(`/api/inventory/stock/moves/integrated/${id}/`),

  /**
   * Check stock availability
   */
  checkAvailability: (data: {
    product_id: string;
    variant_id?: string;
    quantity: number;
    location_id: string;
  }) =>
    inventoryClient.post<{
      success: boolean;
      available: boolean;
      available_quantity: string;
      requested_quantity: string;
      shortage: string;
    }>('/api/inventory/stock/check-availability/', data),

  /**
   * Adjust stock quantity
   */
  adjustStock: (data: {
    product_id: string;
    variant_id?: string;
    location_id: string;
    quantity: number; // positive for increase, negative for decrease
    reason: string;
    unit_cost?: number;
  }) =>
    inventoryClient.post<{
      success: boolean;
      message: string;
      adjustment: {
        reference: string;
        product: string;
        quantity_change: string;
        new_quantity: string;
      };
      integration: IntegrationResult;
    }>('/api/inventory/stock/adjust/', data),

  /**
   * Get stock levels
   */
  getStockLevels: (params?: Record<string, unknown>) =>
    inventoryClient.get<{
      success: boolean;
      total: number;
      stock_levels: StockLevel[];
    }>('/api/inventory/stock/levels/', { params }),

  // ==================== INTEGRATION HEALTH ====================

  /**
   * Check integration health for all services
   */
  checkIntegrationHealth: () =>
    inventoryClient.get<IntegrationStatus>('/api/inventory/products/integrated/health/'),

  // ==================== WAREHOUSES (Non-integrated) ====================

  getWarehouses: (params?: Record<string, unknown>) =>
    inventoryClient.get<WarehouseListResponse>('/api/inventory/warehouse/', { params }),

  getWarehouse: (id: string) =>
    inventoryClient.get<Warehouse>(`/api/inventory/warehouse/${id}/`),

  createWarehouse: (data: Omit<Warehouse, 'id' | 'created_at'>) =>
    inventoryClient.post<Warehouse>('/api/inventory/warehouse/', data),

  updateWarehouse: (id: string, data: Partial<Warehouse>) =>
    inventoryClient.put<Warehouse>(`/api/inventory/warehouse/${id}/`, data),

  deleteWarehouse: (id: string) =>
    inventoryClient.delete(`/api/inventory/warehouse/${id}/`),

  // ==================== SUMMARY ====================

  getSummary: () =>
    inventoryClient.get<InventorySummary>('/api/inventory/products/summary/'),

  // ==================== LEGACY ENDPOINTS (Deprecated) ====================
  // These are kept for backward compatibility but should be migrated to integrated endpoints

  validateMove: (id: string) =>
    inventoryClient.post(`/api/inventory/stock/moves/${id}/validate/`),

  cancelMove: (id: string) =>
    inventoryClient.post(`/api/inventory/stock/moves/${id}/cancel/`),

  getStockSummary: (productId: string) =>
    inventoryClient.get(`/api/inventory/stock/summary/${productId}/`),
};

export default inventoryService;
