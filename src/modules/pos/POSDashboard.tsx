'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Tab, Tabs, Typography, Chip } from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions, ActionMenuItem } from '@/components/ui/ActionMenu';
import ContextAwareButton from '@/components/ui/ContextAwareButton';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';
import { usePOSOrders, usePOSSessions, usePOSSummary } from '@/hooks/usePOS';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { POSOrder, POSSession } from '@/services/posService';
import OrderModal from './modals/OrderModal';
import SessionModal from './modals/SessionModal';

export default function POSDashboard() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(0); }, [searchDebounced, tab]);
  
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionMode, setSessionMode] = useState<'open' | 'close'>('open');
  const [selectedItem, setSelectedItem] = useState<POSOrder | POSSession | null>(null);

  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const { data: summary, isLoading: summaryLoading, refetch } = usePOSSummary();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = usePOSOrders({ page: page + 1, page_size: pageSize, ...(searchDebounced ? { search: searchDebounced } : {}) });
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = usePOSSessions({ page: page + 1, page_size: pageSize });

  const buttonContexts = {
    0: { label: 'New Order', onClick: () => { setSelectedItem(null); setOrderModalOpen(true); } },
    1: { label: 'Open Session', onClick: () => { setSelectedItem(null); setSessionMode('open'); setSessionModalOpen(true); } },
  };

  const getOrderActions = (order: POSOrder): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(order); setOrderModalOpen(true); }),
    { label: 'Print Receipt', onClick: () => console.log('Print receipt', order.id) },
  ];

  const getSessionActions = (session: POSSession): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(session); setSessionModalOpen(true); }),
    {
      label: 'Close Session',
      onClick: () => {
        setSelectedItem(session);
        setSessionMode('close');
        setSessionModalOpen(true);
      },
      disabled: session.status === 'closed',
    },
  ];

  const ORDER_COLUMNS: TableColumn<POSOrder>[] = [
    { id: 'order_number', label: 'Order #', format: (val) => <Typography variant="body2" fontWeight={600} color="primary.dark">{(val as string) || 'N/A'}</Typography> },
    { id: 'customer_name', label: 'Customer', sortable: true, format: (val) => (val as string) || '—' },
    { id: 'total', label: 'Total', align: 'right', sortable: true, format: (val) => <Typography variant="body2" fontWeight={600}>{formatCurrency(Number(val || 0))}</Typography> },
    { id: 'payment_method', label: 'Payment', format: (val) => <Chip label={val ? (val as string).toUpperCase() : 'N/A'} size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, height: 20, borderRadius: '4px' }} /> },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'created_at', label: 'Time', format: (val) => val ? formatDate(val as string) : '—' },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getOrderActions(row)} /> },
  ];

  const SESSION_COLUMNS: TableColumn<POSSession>[] = [
    { id: 'terminal_name', label: 'Terminal', sortable: true, format: (val) => (val as string) || '—' },
    { id: 'opened_by', label: 'Opened By', sortable: true, format: (val) => (val as string) || '—' },
    { id: 'opened_at', label: 'Opened', format: (val) => val ? formatDate(val as string) : '—' },
    { id: 'closed_at', label: 'Closed', format: (val) => val ? formatDate(val as string) : '—' },
    { id: 'opening_cash', label: 'Opening Cash', align: 'right', format: (val) => formatCurrency(Number(val || 0)) },
    { id: 'total_sales', label: 'Total Sales', align: 'right', format: (val) => formatCurrency(Number(val || 0)) },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getSessionActions(row)} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Point of Sale"
        subtitle="Live sales transactions, sessions & daily summaries"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'POS' }]}
        icon={<PointOfSaleIcon sx={{ fontSize: 26 }} />}
        color="#6A1B9A"
        actions={
          <>
            <Button startIcon={<RefreshIcon />} variant="outlined" size="small" onClick={() => refetch()}>
              Refresh
            </Button>
            <ContextAwareButton contexts={buttonContexts} currentContext={String(tab)} />
          </>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard 
            label="Today's Sales" 
            value={summary ? formatCurrency(summary.todays_sales ?? 0) : '—'} 
            change={summary?.todays_sales_change} 
            changeLabel="vs yesterday" 
            trend={summary?.todays_sales_trend || 'neutral'} 
            color="#6A1B9A" 
            loading={summaryLoading} 
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard 
            label="Transactions Today" 
            value={summary?.transactions_today ?? '—'} 
            trend={summary?.transactions_today_trend || 'neutral'} 
            color="#00695C" 
            loading={summaryLoading} 
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard label="Avg. Order Value" value={summary ? formatCurrency(summary.average_order_value ?? 0) : '—'} color="#1565C0" loading={summaryLoading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard 
            label="Refunds Today" 
            value={summary?.refunds_today ?? '—'} 
            trend={summary?.refunds_today_trend || 'neutral'} 
            color="#E53E3E" 
            loading={summaryLoading} 
          />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }} sx={{ mb: 2.5 }}>
        <Tab label="Orders" />
        <Tab label="Sessions" />
      </Tabs>

      {tab === 0 && (
        <DataTable
          columns={ORDER_COLUMNS}
          rows={orders?.results ?? []}
          loading={ordersLoading}
          total={orders?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          onSearch={(q) => setSearch(q)}
          searchPlaceholder="Search orders..."
          getRowId={(r) => String(r.id)}
          emptyMessage="No orders yet today"
        />
      )}
      
      {tab === 1 && (
        <DataTable
          columns={SESSION_COLUMNS}
          rows={sessions?.results ?? []}
          loading={sessionsLoading}
          total={sessions?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          getRowId={(r) => String(r.id)}
          emptyMessage="No sessions found"
        />
      )}

      <OrderModal
        open={orderModalOpen}
        onClose={() => { setOrderModalOpen(false); setSelectedItem(null); }}
        onSuccess={() => {
          refetchOrders();
          setOrderModalOpen(false);
          setSelectedItem(null);
          showSuccess('Order created successfully');
        }}
      />

      <SessionModal
        open={sessionModalOpen}
        onClose={() => { setSessionModalOpen(false); setSelectedItem(null); }}
        session={selectedItem as POSSession}
        mode={sessionMode}
        onSuccess={() => {
          refetchSessions();
          setSessionModalOpen(false);
          setSelectedItem(null);
          showSuccess(`Session ${sessionMode === 'open' ? 'opened' : 'closed'} successfully`);
        }}
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
