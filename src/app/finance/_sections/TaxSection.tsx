'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import { formatCurrency } from '@/utils/formatters';
import { TableColumn } from '@/types';
import financeService from '@/services/financeService';
import type { SectionProps } from './_shared';

type SalesSummaryData = { total_invoiced?: number; total_paid?: number; total_overdue?: number; quotes_pending?: number };

export default function TaxSection({ subTab }: SectionProps) {
  const [data, setData] = useState<SalesSummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    financeService.getSalesSummary()
      .then(r => setData(r.data as SalesSummaryData))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const REPORT_COLS: TableColumn<{ metric: string; value: string }>[] = [
    { id: 'metric', label: 'Metric', minWidth: 200 },
    { id: 'value', label: 'Value', align: 'right' },
  ];

  const reportRows = data
    ? Object.entries(data).map(([k, v]) => ({ metric: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: typeof v === 'number' ? formatCurrency(v) : String(v ?? '—') }))
    : [];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Total Invoiced" value={data ? formatCurrency(data.total_invoiced ?? 0) : '—'} trend="up" color="#2E7D32" loading={loading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Total Paid" value={data ? formatCurrency(data.total_paid ?? 0) : '—'} trend="up" color="#1565C0" loading={loading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Total Overdue" value={data ? formatCurrency(data.total_overdue ?? 0) : '—'} trend="down" color="#C62828" loading={loading} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><MetricCard label="Quotes Pending" value={data?.quotes_pending ?? 0} trend="neutral" color="#F57C00" loading={loading} /></Grid>
      </Grid>
      {subTab === 'sales-tax-report' && (
        loading
          ? <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>
          : <DataTable columns={REPORT_COLS} rows={reportRows} total={reportRows.length} page={0} pageSize={25} getRowId={r => r.metric} emptyMessage="No tax report data available." />
      )}
      {subTab === 'filing-history' && (
        <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>Tax filing history — records of submitted tax returns.</Typography>
      )}
    </>
  );
}
