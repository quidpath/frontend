'use client';

import React, { useState } from 'react';
import { Box, Button, Grid, Tab, Tabs } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
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
import { useTaxRates, useTaxReports } from '@/hooks/useTax';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { TaxRate, TaxReport } from '@/services/taxService';
import taxService from '@/services/taxService';
import TaxRateModal from './modals/TaxRateModal';
import TaxReportModal from './modals/TaxReportModal';

export default function TaxDashboard() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaxRate | TaxReport | null>(null);
  
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

  const { data: ratesData, isLoading: ratesLoading, refetch: refetchRates } = useTaxRates();
  const { data: reportsData, isLoading: reportsLoading, refetch: refetchReports } = useTaxReports();

  const buttonContexts = {
    0: { label: 'New Tax Rate', onClick: () => { setSelectedItem(null); setRateModalOpen(true); } },
    1: { label: 'Generate Report', onClick: () => { setSelectedItem(null); setReportModalOpen(true); } },
  };

  const handleDeleteRate = async (id: string) => {
    try {
      await taxService.deleteTaxRate(id);
      showSuccess('Tax rate deleted successfully');
      refetchRates();
    } catch (error) {
      showError('Failed to delete tax rate');
    }
  };

  const getRateActions = (rate: TaxRate): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(rate); setRateModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(rate); setRateModalOpen(true); }),
    {
      label: rate.is_active ? 'Deactivate' : 'Activate',
      onClick: async () => {
        try {
          await taxService.updateTaxRate(rate.id, { is_active: !rate.is_active });
          showSuccess(`Tax rate ${rate.is_active ? 'deactivated' : 'activated'}`);
          refetchRates();
        } catch (error) {
          showError('Failed to update tax rate');
        }
      },
    },
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Tax Rate',
        message: `Are you sure you want to delete ${rate.name}?`,
        severity: 'error',
        onConfirm: () => handleDeleteRate(rate.id),
      });
    }),
  ];

  const getReportActions = (report: TaxReport): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(report); setReportModalOpen(true); }),
    { label: 'Download PDF', onClick: () => console.log('Download PDF', report.id) },
  ];

  const RATE_COLUMNS: TableColumn<TaxRate>[] = [
    { id: 'name', label: 'Tax Name', sortable: true, minWidth: 180 },
    { id: 'type', label: 'Type', format: (val) => <StatusChip status={val as string} /> },
    { id: 'rate', label: 'Rate', format: (val) => `${val}%` },
    { id: 'description', label: 'Description', minWidth: 200 },
    { id: 'is_active', label: 'Status', format: (val) => <StatusChip status={val ? 'active' : 'inactive'} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getRateActions(row)} /> },
  ];

  const REPORT_COLUMNS: TableColumn<TaxReport>[] = [
    { id: 'period_start', label: 'Period Start', sortable: true, format: (val) => formatDate(val as string) },
    { id: 'period_end', label: 'Period End', sortable: true, format: (val) => formatDate(val as string) },
    { id: 'total_sales', label: 'Total Sales', align: 'right', format: (val) => formatCurrency(Number(val)) },
    { id: 'tax_collected', label: 'Tax Collected', align: 'right', format: (val) => formatCurrency(Number(val)) },
    { id: 'tax_paid', label: 'Tax Paid', align: 'right', format: (val) => formatCurrency(Number(val)) },
    { id: 'net_tax', label: 'Net Tax', align: 'right', format: (val) => formatCurrency(Number(val)) },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getReportActions(row)} /> },
  ];

  const activeRates = ratesData?.results.filter(rate => rate.is_active).length || 0;
  const totalTaxCollected = reportsData?.results.reduce((sum, report) => sum + report.tax_collected, 0) || 0;
  const totalTaxPaid = reportsData?.results.reduce((sum, report) => sum + report.tax_paid, 0) || 0;
  const netTax = totalTaxCollected - totalTaxPaid;

  return (
    <Box>
      <PageHeader
        title="Tax Management"
        subtitle="Manage tax rates and generate tax reports"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Tax' }]}
        icon={<ReceiptIcon sx={{ fontSize: 26 }} />}
        color="#D32F2F"
        actions={
          <>
            <Button startIcon={<DownloadIcon />} variant="outlined" size="small">Export</Button>
            <ContextAwareButton contexts={buttonContexts} currentContext={String(tab)} />
          </>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Active Tax Rates" value={activeRates} trend="up" color="#D32F2F" loading={ratesLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Tax Collected" value={formatCurrency(totalTaxCollected)} trend="up" color="#2E7D32" loading={reportsLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Tax Paid" value={formatCurrency(totalTaxPaid)} trend="down" color="#F2A40E" loading={reportsLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Net Tax" value={formatCurrency(netTax)} trend={netTax >= 0 ? 'up' : 'down'} color="#1976D2" loading={reportsLoading} />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="Tax Rates" />
        <Tab label="Tax Reports" />
      </Tabs>

      {tab === 0 && (
        <DataTable
          columns={RATE_COLUMNS}
          rows={ratesData?.results ?? []}
          loading={ratesLoading}
          total={ratesData?.results.length ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={setSearch}
          searchPlaceholder="Search tax rates..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No tax rates found. Add your first tax rate to get started."
        />
      )}

      {tab === 1 && (
        <DataTable
          columns={REPORT_COLUMNS}
          rows={reportsData?.results ?? []}
          loading={reportsLoading}
          total={reportsData?.results.length ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          getRowId={(row) => String(row.id)}
          emptyMessage="No tax reports found. Generate your first report to get started."
        />
      )}

      <TaxRateModal
        open={rateModalOpen}
        onClose={() => { setRateModalOpen(false); setSelectedItem(null); }}
        rate={selectedItem as TaxRate}
        onSuccess={() => {
          refetchRates();
          setRateModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Tax rate updated successfully' : 'Tax rate created successfully');
        }}
      />

      <TaxReportModal
        open={reportModalOpen}
        onClose={() => { setReportModalOpen(false); setSelectedItem(null); }}
        report={selectedItem as TaxReport}
        onSuccess={() => {
          refetchReports();
          setReportModalOpen(false);
          setSelectedItem(null);
          showSuccess('Tax report generated successfully');
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
