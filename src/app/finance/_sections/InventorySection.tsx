'use client';

import { useState, useEffect } from 'react';
import {
  Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, CircularProgress, Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { inventoryService } from '@/services/accountingService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SectionProps } from './_shared';
import type { InventoryItem, Warehouse, StockMovement } from '@/types/accounting';

// Warehouse Modal
function WarehouseModal({ open, onClose, record, onSuccess }: {
  open: boolean; onClose: () => void; record?: Warehouse | null;
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: inventoryService.createWarehouse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => inventoryService.updateWarehouse(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  });

  const [form, setForm] = useState({
    name: '', code: '', address: '', city: '', state: '', country: '', is_default: false
  });

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        name: record.name,
        code: record.code ?? '',
        address: record.address ?? '',
        city: record.city ?? '',
        state: record.state ?? '',
        country: record.country ?? '',
        is_default: record.is_default ?? false,
      });
    } else {
      setForm({ name: '', code: '', address: '', city: '', state: '', country: '', is_default: false });
    }
  }, [record, open]);

  const handleSave = async () => {
    try {
      if (record) {
        await update.mutateAsync({ id: record.id, data: form });
        onSuccess('Warehouse updated');
      } else {
        await create.mutateAsync(form);
        onSuccess('Warehouse created');
      }
      onClose();
    } catch (error) {
      onSuccess('Failed to save warehouse', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {record ? 'Edit Warehouse' : 'New Warehouse'}
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Warehouse Name"
                size="small"
                fullWidth
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Code"
                size="small"
                fullWidth
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
              />
            </Grid>
          </Grid>
          <TextField
            label="Address"
            size="small"
            fullWidth
            value={form.address}
            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="City"
                size="small"
                fullWidth
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="State"
                size="small"
                fullWidth
                value={form.state}
                onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
              />
            </Grid>
          </Grid>
          <TextField
            label="Country"
            size="small"
            fullWidth
            value={form.country}
            onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={create.isPending || update.isPending}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Inventory Item Modal
function ItemModal({ open, onClose, record, warehouses, onSuccess }: {
  open: boolean; onClose: () => void; record?: InventoryItem | null;
  warehouses: Warehouse[]; onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: inventoryService.createItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory-items'] }),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => inventoryService.updateItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory-items'] }),
  });

  const [form, setForm] = useState({
    name: '', sku: '', barcode: '', description: '', category: '',
    unit_cost: 0, selling_price: 0, reorder_point: 0
  });

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        name: record.name,
        sku: record.sku,
        barcode: record.barcode ?? '',
        description: record.description ?? '',
        category: record.category ?? '',
        unit_cost: record.unit_cost,
        selling_price: record.selling_price,
        reorder_point: record.reorder_point,
      });
    } else {
      setForm({
        name: '', sku: `SKU-${Date.now()}`, barcode: '', description: '', category: '',
        unit_cost: 0, selling_price: 0, reorder_point: 0
      });
    }
  }, [record, open]);

  const handleSave = async () => {
    try {
      if (record) {
        await update.mutateAsync({ id: record.id, data: form });
        onSuccess('Item updated');
      } else {
        await create.mutateAsync(form);
        onSuccess('Item created');
      }
      onClose();
    } catch (error) {
      onSuccess('Failed to save item', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {record ? 'Edit Item' : 'New Item'}
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Item Name"
            size="small"
            fullWidth
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="SKU"
                size="small"
                fullWidth
                value={form.sku}
                onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Barcode"
                size="small"
                fullWidth
                value={form.barcode}
                onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))}
              />
            </Grid>
          </Grid>
          <TextField
            label="Description"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          />
          <TextField
            label="Category"
            size="small"
            fullWidth
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Unit Cost"
                size="small"
                type="number"
                fullWidth
                value={form.unit_cost}
                onChange={e => setForm(p => ({ ...p, unit_cost: Number(e.target.value) }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Selling Price"
                size="small"
                type="number"
                fullWidth
                value={form.selling_price}
                onChange={e => setForm(p => ({ ...p, selling_price: Number(e.target.value) }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Reorder Point"
                size="small"
                type="number"
                fullWidth
                value={form.reorder_point}
                onChange={e => setForm(p => ({ ...p, reorder_point: Number(e.target.value) }))}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={create.isPending || update.isPending}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Stock Movement Modal
function MovementModal({ open, onClose, warehouses, items, onSuccess }: {
  open: boolean; onClose: () => void;
  warehouses: Warehouse[]; items: InventoryItem[];
  onSuccess: (m: string, s?: 'success' | 'error') => void;
}) {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: inventoryService.createMovement,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock-movements'] }),
  });

  const [form, setForm] = useState({
    warehouse: '', item: '', movement_type: 'purchase' as const,
    quantity: 0, unit_cost: 0, movement_date: new Date().toISOString().slice(0, 10),
    reference_number: '', notes: ''
  });

  const handleSave = async () => {
    try {
      await create.mutateAsync({
        ...form,
        total_cost: form.quantity * form.unit_cost,
      });
      onSuccess('Stock movement created');
      onClose();
    } catch (error) {
      onSuccess('Failed to create movement', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        New Stock Movement
        <IconButton size="small" sx={{ ml: 'auto' }} onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Warehouse</InputLabel>
            <Select value={form.warehouse} label="Warehouse" onChange={e => setForm(p => ({ ...p, warehouse: e.target.value }))}>
              {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Item</InputLabel>
            <Select value={form.item} label="Item" onChange={e => setForm(p => ({ ...p, item: e.target.value }))}>
              {items.map(i => <MenuItem key={i.id} value={i.id}>{i.name} ({i.sku})</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Movement Type</InputLabel>
            <Select value={form.movement_type} label="Movement Type" onChange={e => setForm(p => ({ ...p, movement_type: e.target.value as any }))}>
              <MenuItem value="purchase">Purchase</MenuItem>
              <MenuItem value="sale">Sale</MenuItem>
              <MenuItem value="adjustment">Adjustment</MenuItem>
              <MenuItem value="transfer">Transfer</MenuItem>
              <MenuItem value="return">Return</MenuItem>
              <MenuItem value="damage">Damage</MenuItem>
              <MenuItem value="loss">Loss</MenuItem>
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Quantity"
                size="small"
                type="number"
                fullWidth
                value={form.quantity}
                onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Unit Cost"
                size="small"
                type="number"
                fullWidth
                value={form.unit_cost}
                onChange={e => setForm(p => ({ ...p, unit_cost: Number(e.target.value) }))}
              />
            </Grid>
          </Grid>
          <TextField
            label="Movement Date"
            type="date"
            size="small"
            fullWidth
            value={form.movement_date}
            onChange={e => setForm(p => ({ ...p, movement_date: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Reference Number"
            size="small"
            fullWidth
            value={form.reference_number}
            onChange={e => setForm(p => ({ ...p, reference_number: e.target.value }))}
          />
          <TextField
            label="Notes"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={create.isPending}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function InventorySection({ subTab, notify, addOpen, setAddOpen }: SectionProps) {
  const [page, setPage] = useState(0);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const { data: warehousesData, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => inventoryService.listWarehouses(),
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => inventoryService.listItems(),
  });

  const { data: movementsData, isLoading: movementsLoading } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: () => inventoryService.listMovements(),
  });

  const queryClient = useQueryClient();
  const deleteWarehouse = useMutation({
    mutationFn: inventoryService.deleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      notify('Warehouse deleted');
    },
    onError: () => notify('Failed to delete warehouse', 'error'),
  });

  const deleteItem = useMutation({
    mutationFn: inventoryService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      notify('Item deleted');
    },
    onError: () => notify('Failed to delete item', 'error'),
  });

  const warehouses = warehousesData?.data?.warehouses ?? [];
  const items = itemsData?.data?.items ?? [];
  const movements = movementsData?.data?.movements ?? [];

  const isWarehouses = subTab === 'warehouses';
  const isItems = subTab === 'items';
  const isMovements = subTab === 'movements';

  const WAREHOUSE_COLS: TableColumn<Warehouse>[] = [
    { id: 'name', label: 'Name', sortable: true, minWidth: 160 },
    { id: 'code', label: 'Code', sortable: true },
    { id: 'city', label: 'City' },
    { id: 'country', label: 'Country' },
    { id: 'is_active', label: 'Status', format: v => <StatusChip status={v ? 'active' : 'inactive'} /> },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          commonActions.edit(() => setEditWarehouse(row)),
          commonActions.delete(() => deleteWarehouse.mutate(row.id)),
        ]} />
      )
    },
  ];

  const ITEM_COLS: TableColumn<InventoryItem>[] = [
    { id: 'name', label: 'Name', sortable: true, minWidth: 160 },
    { id: 'sku', label: 'SKU', sortable: true },
    { id: 'category', label: 'Category' },
    { id: 'unit_cost', label: 'Cost', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'selling_price', label: 'Price', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'quantity_on_hand', label: 'On Hand', align: 'right' },
    { id: 'is_active', label: 'Status', format: v => <StatusChip status={v ? 'active' : 'inactive'} /> },
    {
      id: 'actions', label: 'Actions', align: 'right', format: (_, row) => (
        <ActionMenu actions={[
          commonActions.edit(() => setEditItem(row)),
          commonActions.delete(() => deleteItem.mutate(row.id)),
        ]} />
      )
    },
  ];

  const MOVEMENT_COLS: TableColumn<StockMovement>[] = [
    { id: 'movement_date', label: 'Date', sortable: true, format: v => formatDate(v as string) },
    { id: 'item', label: 'Item', minWidth: 160 },
    { id: 'warehouse', label: 'Warehouse' },
    { id: 'movement_type', label: 'Type', format: v => <StatusChip status={v as string} /> },
    { id: 'quantity', label: 'Quantity', align: 'right' },
    { id: 'total_cost', label: 'Total Cost', align: 'right', format: v => formatCurrency(Number(v)) },
    { id: 'status', label: 'Status', format: v => <StatusChip status={v as string} /> },
  ];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total Items"
            value={items.length}
            trend="neutral"
            color="#2E7D32"
            loading={itemsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total Value"
            value={formatCurrency(items.reduce((s: number, i: InventoryItem) => s + (i.quantity_on_hand * i.unit_cost), 0))}
            trend="up"
            color="#1565C0"
            loading={itemsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Warehouses"
            value={warehouses.length}
            trend="neutral"
            color="#F57C00"
            loading={warehousesLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Low Stock Items"
            value={items.filter((i: InventoryItem) => i.quantity_on_hand <= i.reorder_point).length}
            trend="down"
            color="#C62828"
            loading={itemsLoading}
          />
        </Grid>
      </Grid>

      {isWarehouses && (
        <DataTable
          columns={WAREHOUSE_COLS}
          rows={warehouses}
          loading={warehousesLoading}
          total={warehouses.length}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          getRowId={row => String(row.id)}
          emptyMessage="No warehouses found. Create your first warehouse to get started."
        />
      )}

      {isItems && (
        <DataTable
          columns={ITEM_COLS}
          rows={items}
          loading={itemsLoading}
          total={items.length}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          getRowId={row => String(row.id)}
          emptyMessage="No items found. Add your first inventory item to get started."
        />
      )}

      {isMovements && (
        <DataTable
          columns={MOVEMENT_COLS}
          rows={movements}
          loading={movementsLoading}
          total={movements.length}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          getRowId={row => String(row.id)}
          emptyMessage="No stock movements found."
        />
      )}

      {/* Modals */}
      {isWarehouses && (
        <WarehouseModal
          open={addOpen || !!editWarehouse}
          onClose={() => { setAddOpen(false); setEditWarehouse(null); }}
          record={editWarehouse}
          onSuccess={notify}
        />
      )}

      {isItems && (
        <ItemModal
          open={addOpen || !!editItem}
          onClose={() => { setAddOpen(false); setEditItem(null); }}
          record={editItem}
          warehouses={warehouses}
          onSuccess={notify}
        />
      )}

      {isMovements && (
        <MovementModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          warehouses={warehouses}
          items={items}
          onSuccess={notify}
        />
      )}
    </>
  );
}
