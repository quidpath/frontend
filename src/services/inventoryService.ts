import { inventoryClient } from './apiClient';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category?: string;
  description?: string;
  unit_price: number;
  cost_price: number;
  quantity_on_hand: number;
  reorder_point: number;
  unit_of_measure: string;
  is_active: boolean;
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
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reference?: string;
  notes?: string;
  date: string;
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
  total_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
  warehouses_count: number;
}

const inventoryService = {
  // Products
  getProducts: (params?: Record<string, unknown>) =>
    inventoryClient.get<ProductListResponse>('/api/inventory/products/', { params }),

  getProduct: (id: string) =>
    inventoryClient.get<Product>(`/api/inventory/products/${id}/`),

  createProduct: (data: Omit<Product, 'id' | 'created_at' | 'quantity_on_hand'>) => {
    // Map frontend fields to backend model fields
    const backendData = {
      name: data.name,
      internal_reference: data.sku, // Map sku to internal_reference
      barcode: data.barcode,
      category_id: data.category, // Assuming category is already a UUID
      description: data.description,
      list_price: data.unit_price, // Map unit_price to list_price
      standard_price: data.cost_price, // Map cost_price to standard_price
      min_qty: data.reorder_point, // Map reorder_point to min_qty
      reorder_qty: data.reorder_point, // Use same value for reorder_qty
      uom_id: data.unit_of_measure, // Map unit_of_measure to uom_id (assuming it's a UUID)
      is_active: data.is_active,
      product_type: 'storable', // Default product type
      costing_method: 'avco', // Default costing method (Average Cost)
      can_be_sold: true, // Default to true
      can_be_purchased: true, // Default to true
    };
    return inventoryClient.post<Product>('/api/inventory/products/', backendData);
  },

  updateProduct: (id: string, data: Partial<Product>) => {
    // Map frontend fields to backend model fields for update
    const backendData: Record<string, unknown> = {};
    if (data.name !== undefined) backendData.name = data.name;
    if (data.sku !== undefined) backendData.internal_reference = data.sku;
    if (data.barcode !== undefined) backendData.barcode = data.barcode;
    if (data.category !== undefined) backendData.category_id = data.category;
    if (data.description !== undefined) backendData.description = data.description;
    if (data.unit_price !== undefined) backendData.list_price = data.unit_price;
    if (data.cost_price !== undefined) backendData.standard_price = data.cost_price;
    if (data.reorder_point !== undefined) {
      backendData.min_qty = data.reorder_point;
      backendData.reorder_qty = data.reorder_point;
    }
    if (data.unit_of_measure !== undefined) backendData.uom_id = data.unit_of_measure;
    if (data.is_active !== undefined) backendData.is_active = data.is_active;
    return inventoryClient.put<Product>(`/api/inventory/products/${id}/`, backendData);
  },

  deleteProduct: (id: string) =>
    inventoryClient.delete(`/api/inventory/products/${id}/`),

  // Warehouses — backend path is /api/inventory/warehouse/ (no trailing 's')
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

  // Stock Movements — backend path is /api/inventory/stock/moves/
  getStockMovements: (params?: Record<string, unknown>) =>
    inventoryClient.get<StockMovementListResponse>('/api/inventory/stock/moves/', { params }),

  getStockMovement: (id: string) =>
    inventoryClient.get<StockMovement>(`/api/inventory/stock/moves/${id}/`),

  createStockMovement: (data: Omit<StockMovement, 'id' | 'created_at' | 'product_name' | 'warehouse_name'>) =>
    inventoryClient.post<StockMovement>('/api/inventory/stock/moves/', data),

  validateMove: (id: string) =>
    inventoryClient.post(`/api/inventory/stock/moves/${id}/validate/`),

  cancelMove: (id: string) =>
    inventoryClient.post(`/api/inventory/stock/moves/${id}/cancel/`),

  // Stock Levels
  getStockLevels: (params?: Record<string, unknown>) =>
    inventoryClient.get<StockLevelListResponse>('/api/inventory/stock/levels/', { params }),

  getStockSummary: (productId: string) =>
    inventoryClient.get(`/api/inventory/stock/summary/${productId}/`),

  // Summary — derived from stock levels
  getSummary: () =>
    inventoryClient.get<InventorySummary>('/api/inventory/stock/levels/', { params: { summary: true } }),
};

export default inventoryService;
