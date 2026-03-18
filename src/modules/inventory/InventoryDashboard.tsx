'use client';

import React, { useState } from 'react';
import { Box, Button, Grid, Tab, Tabs, Chip } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions, ActionMenuItem } from '@/components/ui/ActionMenu';
import ContextAwareButton from '@/components/ui/ContextAwareButton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';
import { useProducts, useWarehouses, useStockMovements, useInventorySummary } from '@/hooks/useInventory';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { Product, Warehouse, StockMovement } from '@/services/inventoryService';
import inventoryService from '@/services/inventoryService';
import ProductModal from './modals/ProductModal';
import WarehouseModal from './modals/WarehouseModal';
import StockMovementModal from './modals/StockMovementModal';

export default function InventoryDashboard() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | Warehouse | StockMovement | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    severity?: 'warning' | 'error' | 'info';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const { data: summary, isLoading: summaryLoading } = useInventorySummary();
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const { data: warehousesData, isLoading: warehousesLoading, refetch: refetchWarehouses } = useWarehouses();
  const { data: movementsData, isLoading: movementsLoading, refetch: refetchMovements } = useStockMovements();

  const buttonContexts = {
    0: { label: 'New Product', onClick: () => { setSelectedItem(null); setProductModalOpen(true); } },
    1: { label: 'New Warehouse', onClick: () => { setSelectedItem(null); setWarehouseModalOpen(true); } },
    2: { label: 'Record Movement', onClick: () => { setSelectedItem(null); setMovementModalOpen(true); } },
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await inventoryService.deleteProduct(id);
      showSuccess('Product deleted successfully');
      refetchProducts();
    } catch (error) {
      showError('Failed to delete product');
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    try {
      await inventoryService.deleteWarehouse(id);
      showSuccess('Warehouse deleted successfully');
      refetchWarehouses();
    } catch (error) {
      showError('Failed to delete warehouse');
    }
  };

  const getProductActions = (product: Product): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(product); setProductModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(product); setProductModalOpen(true); }),
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Product',
        message: `Are you sure you want to delete "${product.name}"?`,
        severity: 'error',
        onConfirm: () => handleDeleteProduct(product.id),
      });
    }),
  ];

  const getWarehouseActions = (warehouse: Warehouse): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(warehouse); setWarehouseModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(warehouse); setWarehouseModalOpen(true); }),
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Warehouse',
        message: `Are you sure you want to delete "${warehouse.name}"?`,
        severity: 'error',
        onConfirm: () => handleDeleteWarehouse(warehouse.id),
      });
    }),
  ];

  const PRODUCT_COLUMNS: TableColumn<Product>[] = [
    { id: 'sku', label: 'SKU', sortable: true, minWidth: 100 },
    { id: 'name', label: 'Product', sortable: true, minWidth: 200 },
    { id: 'category', label: 'Category', sortable: true },
    { id: 'quantity_on_hand', label: 'Stock', align: 'right', sortable: true },
    { id: 'unit_price', label: 'Price', align: 'right', format: (val) => formatCurrency(Number(val)) },
    { id: 'cost_price', label: 'Cost', align: 'right', format: (val) => formatCurrency(Number(val)) },
    { id: 'is_active', label: 'Status', format: (val) => <StatusChip status={val ? 'active' : 'inactive'} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getProductActions(row)} /> },
  ];

  const WAREHOUSE_COLUMNS: TableColumn<Warehouse>[] = [
    { id: 'code', label: 'Code', sortable: true },
    { id: 'name', label: 'Warehouse', sortable: true, minWidth: 180 },
    { id: 'location', label: 'Location', minWidth: 150 },
    { id: 'manager', label: 'Manager' },
    { id: 'is_active', label: 'Status', format: (val) => <StatusChip status={val ? 'active' : 'inactive'} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getWarehouseActions(row)} /> },
  ];

  const MOVEMENT_COLUMNS: TableColumn<StockMovement>[] = [
    { id: 'date', label: 'Date', sortable: true, format: (val) => formatDate(val as string) },
    { id: 'product_name', label: 'Product', sortable: true, minWidth: 180 },
    { id: 'warehouse_name', label: 'Warehouse', sortable: true },
    { id: 'movement_type', label: 'Type', format: (val) => <StatusChip status={val as string} /> },
    { id: 'quantity', label: 'Quantity', align: 'right' },
    { id: 'reference', label: 'Reference' },
  ];

  return (
    <Box>
      <PageHeader
        title="Inventory"
        subtitle="Product catalog, warehouses, and stock management"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Inventory' }]}
        icon={<InventoryIcon sx={{ fontSize: 26 }} />}
        color="#F57C00"
        actions={
          <>
            <Button startIcon={<DownloadIcon />} variant="outlined" size="small">Export</Button>
            <ContextAwareButton contexts={buttonContexts} currentContext={String(tab)} />
          </>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Products" value={summary?.total_products ?? 0} trend="up" color="#F57C00" loading={summaryLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Value" value={summary ? formatCurrency(summary.total_value) : '—'} trend="up" color="#2E7D32" loading={summaryLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Low Stock Items" value={summary?.low_stock_items ?? 0} trend="down" color="#F2A40E" loading={summaryLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Warehouses" value={summary?.warehouses_count ?? 0} trend="neutral" color="#1565C0" loading={summaryLoading} />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="Products" />
        <Tab label="Warehouses" />
        <Tab label="Stock Movements" />
      </Tabs>

      {tab === 0 && (
        <DataTable
          columns={PRODUCT_COLUMNS}
          rows={productsData?.results ?? []}
          loading={productsLoading}
          total={productsData?.count ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={setSearch}
          searchPlaceholder="Search products..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No products found. Add your first product to get started."
        />
      )}

      {tab === 1 && (
        <DataTable
          columns={WAREHOUSE_COLUMNS}
          rows={warehousesData?.results ?? []}
          loading={warehousesLoading}
          total={warehousesData?.count ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          getRowId={(row) => String(row.id)}
          emptyMessage="No warehouses found. Create your first warehouse to get started."
        />
      )}

      {tab === 2 && (
        <DataTable
          columns={MOVEMENT_COLUMNS}
          rows={movementsData?.results ?? []}
          loading={movementsLoading}
          total={movementsData?.count ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          getRowId={(row) => String(row.id)}
          emptyMessage="No stock movements found."
        />
      )}

      <ProductModal
        open={productModalOpen}
        onClose={() => { setProductModalOpen(false); setSelectedItem(null); }}
        product={selectedItem as Product}
        onSuccess={() => {
          refetchProducts();
          setProductModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Product updated successfully' : 'Product created successfully');
        }}
      />

      <WarehouseModal
        open={warehouseModalOpen}
        onClose={() => { setWarehouseModalOpen(false); setSelectedItem(null); }}
        warehouse={selectedItem as Warehouse}
        onSuccess={() => {
          refetchWarehouses();
          setWarehouseModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Warehouse updated successfully' : 'Warehouse created successfully');
        }}
      />

      <StockMovementModal
        open={movementModalOpen}
        onClose={() => { setMovementModalOpen(false); setSelectedItem(null); }}
        movement={selectedItem as StockMovement}
        onSuccess={() => {
          refetchMovements();
          setMovementModalOpen(false);
          setSelectedItem(null);
          showSuccess('Stock movement recorded successfully');
        }}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        severity={confirmDialog.severity}
      />

      <NotificationToast
        open={notification.open}
        onClose={hideNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
}
