import { inventoryClient } from './apiClient';

// ── Product ───────────────────────────────────────────────────────────────────
// Fields match the backend Product model exactly.
export interface Product {
  id: string;
  name: string;
  internal_reference: string;   // was "sku"
  barcode?: string;
  category_id?: string;         // FK UUID
  category_name?: string;       // read-only
  description?: string;
  list_price: number;           // was "unit_price"
  standard_price: number;       // was "cost_price"
  min_qty: number;              // was "reorder_point"
  reorder_qty: number;
  uom_id: string;               // FK UUID, was "unit_of_measure"
  uom_name?: string;            // read-only
  is_active: boolean;
  product_type?: 'storable' | 'consumable' | 'service';
  costing_method?: 'fifo' | 'avco' | 'standard';
  can_be_sold?: boolean;
  can_be_purchased?: boolean;
  tax_rate?: number;
  taxes_included?: boolean;
  weight?: number;
  volume?: number;
  track_lots?: boolean;
  track_serials?: boolean;
  created_at: string;
  // NOTE: quantity_on_hand is NOT a model field — it is calculated from stock moves
}

export interface ProductListResponse {
  results: Product[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ── Warehouse ─────────────────────────────────────────────────────────────────
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

// ── Stock Movement ────────────────────────────────────────────────────────────
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

// ── Stock Level ───────────────────────────────────────────────────────────────
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

// ── Category ──────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: string;  // parent category ID
  parent_name?: string;  // read-only
  description?: string;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryListResponse {
  results?: Category[];
  data?: Category[];  // Backend might return 'data' instead of 'results'
  count?: number;
}

// ── Unit of Measure ───────────────────────────────────────────────────────────
export interface UnitOfMeasure {
  id: string;
  category_id: string;
  name: string;
  symbol: string;
  factor: string;
  rounding: 'UP' | 'DOWN' | 'HALF_UP';
  is_base: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UnitOfMeasureListResponse {
  results?: UnitOfMeasure[];
  data?: UnitOfMeasure[];
  count?: number;
}

// ── Summary ───────────────────────────────────────────────────────────────────
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

// ── Integration ───────────────────────────────────────────────────────────────
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
  removed_from?: string[];
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

// ── Service ───────────────────────────────────────────────────────────────────
const inventoryService = {
  // ── Products (integrated) ─────────────────────────────────────────────────

  getProducts: (params?: Record<string, unknown>) =>
    inventoryClient.get<ProductListResponse>('/api/inventory/products/integrated/list/', { params }),

  getProduct: (id: string) =>
    inventoryClient.get<{ success: boolean; product: Product; integration_status: IntegrationStatus['services'] }>(
      `/api/inventory/products/integrated/${id}/`
    ),

  createProduct: (data: Omit<Product, 'id' | 'created_at' | 'category_name' | 'uom_name'>) => {
    // Backend expects decimal fields as strings
    const payload = {
      ...data,
      list_price: String(data.list_price),
      standard_price: String(data.standard_price),
      min_qty: String(data.min_qty),
      reorder_qty: String(data.reorder_qty),
      tax_rate: data.tax_rate != null ? String(data.tax_rate) : '16.00',
      weight: data.weight != null ? String(data.weight) : '0',
      volume: data.volume != null ? String(data.volume) : '0',
    };
    return inventoryClient.post<ProductCreateResponse>('/api/inventory/products/integrated/', payload);
  },

  updateProduct: (id: string, data: Partial<Product>) => {
    const { category_name, uom_name, ...rest } = data;
    const payload: Record<string, unknown> = {};
    const decimalFields = ['list_price', 'standard_price', 'min_qty', 'reorder_qty', 'tax_rate', 'weight', 'volume'];
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined) payload[k] = decimalFields.includes(k) ? String(v) : v;
    });
    return inventoryClient.put<ProductCreateResponse>(`/api/inventory/products/integrated/${id}/update/`, payload);
  },

  deleteProduct: (id: string) =>
    inventoryClient.delete<{ success: boolean; message: string; integration: IntegrationResult }>(
      `/api/inventory/products/integrated/${id}/delete/`
    ),

  bulkSyncProducts: (productIds: string[]) =>
    inventoryClient.post('/api/inventory/products/integrated/bulk-sync/', { product_ids: productIds }),

  // ── Stock Movements (integrated) ──────────────────────────────────────────

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

  getStockMovements: (params?: Record<string, unknown>) =>
    inventoryClient.get<StockMovementListResponse>('/api/inventory/stock/moves/integrated/list/', { params }),

  getStockMovement: (id: string) =>
    inventoryClient.get<{ success: boolean; stock_move: StockMovement }>(
      `/api/inventory/stock/moves/integrated/${id}/`
    ),

  checkAvailability: (data: { product_id: string; variant_id?: string; quantity: number; location_id: string }) =>
    inventoryClient.post<{
      success: boolean;
      available: boolean;
      available_quantity: string;
      requested_quantity: string;
      shortage: string;
    }>('/api/inventory/stock/check-availability/', data),

  adjustStock: (data: {
    product_id: string;
    variant_id?: string;
    location_id: string;
    quantity: number;
    reason: string;
    unit_cost?: number;
  }) =>
    inventoryClient.post<{
      success: boolean;
      message: string;
      adjustment: { reference: string; product: string; quantity_change: string; new_quantity: string };
      integration: IntegrationResult;
    }>('/api/inventory/stock/adjust/', data),

  getStockLevels: (params?: Record<string, unknown>) =>
    inventoryClient.get<{ success: boolean; total: number; stock_levels: StockLevel[] }>(
      '/api/inventory/stock/levels/', { params }
    ),

  // ── Integration health ────────────────────────────────────────────────────

  checkIntegrationHealth: () =>
    inventoryClient.get<IntegrationStatus>('/api/inventory/products/integrated/health/'),

  // ── Warehouses ────────────────────────────────────────────────────────────

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

  // ── Summary ───────────────────────────────────────────────────────────────

  getSummary: () =>
    inventoryClient.get<InventorySummary>('/api/inventory/products/summary/'),

  // ── Categories ────────────────────────────────────────────────────────────

  getCategories: (params?: Record<string, unknown>) =>
    inventoryClient.get<CategoryListResponse>('/api/inventory/products/categories/', { params }),

  getCategory: (id: string) =>
    inventoryClient.get<{ success?: boolean; data?: Category }>(`/api/inventory/products/categories/${id}/`),

  createCategory: (data: { name: string; slug: string; parent_id?: string; description?: string; is_active?: boolean }) =>
    inventoryClient.post<{ success?: boolean; data?: Category; message?: string }>('/api/inventory/products/categories/', data),

  updateCategory: (id: string, data: Partial<Category>) =>
    inventoryClient.put<{ success?: boolean; data?: Category; message?: string }>(`/api/inventory/products/categories/${id}/`, data),

  deleteCategory: (id: string) =>
    inventoryClient.delete<{ success?: boolean; message?: string }>(`/api/inventory/products/categories/${id}/`),

  // ── Units of Measure ──────────────────────────────────────────────────────

  getUnitsOfMeasure: (params?: Record<string, unknown>) =>
    inventoryClient.get<UnitOfMeasureListResponse>('/api/inventory/products/uom/', { params }),

  getUnitOfMeasure: (id: string) =>
    inventoryClient.get<{ success?: boolean; data?: UnitOfMeasure }>(`/api/inventory/products/uom/${id}/`),

  createUnitOfMeasure: (data: {
    category_id: string;
    name: string;
    symbol: string;
    factor?: string;
    rounding?: 'UP' | 'DOWN' | 'HALF_UP';
    is_base?: boolean;
    is_active?: boolean;
  }) =>
    inventoryClient.post<{ success?: boolean; data?: UnitOfMeasure; message?: string }>('/api/inventory/products/uom/', data),

  updateUnitOfMeasure: (id: string, data: Partial<UnitOfMeasure>) =>
    inventoryClient.put<{ success?: boolean; data?: UnitOfMeasure; message?: string }>(`/api/inventory/products/uom/${id}/`, data),

  deleteUnitOfMeasure: (id: string) =>
    inventoryClient.delete<{ success?: boolean; message?: string }>(`/api/inventory/products/uom/${id}/`),

  // ── Legacy (backward compat) ──────────────────────────────────────────────

  validateMove: (id: string) =>
    inventoryClient.post(`/api/inventory/stock/moves/${id}/validate/`),

  cancelMove: (id: string) =>
    inventoryClient.post(`/api/inventory/stock/moves/${id}/cancel/`),

  getStockSummary: (productId: string) =>
    inventoryClient.get(`/api/inventory/stock/summary/${productId}/`),
};

export default inventoryService;
