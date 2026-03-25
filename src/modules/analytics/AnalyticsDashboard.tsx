'use client';

import React, { useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, CircularProgress,
  Divider, Grid, MenuItem, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LockIcon from '@mui/icons-material/Lock';
import TableChartIcon from '@mui/icons-material/TableChart';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import { formatCurrency } from '@/utils/formatters';
import { useAccountingSummary } from '@/hooks/useAccounting';
import { usePermissions } from '@/hooks/usePermissions';
import { useNotification } from '@/hooks/useNotification';
import NotificationToast from '@/components/ui/NotificationToast';
import analyticsService from '@/services/analyticsService';
import { downloadBlob, getExportFilename } from '@/utils/downloadBlob';
import ImportModal from './modals/ImportModal';
import ReportViewModal from './modals/ReportViewModal';

const CHART_COLORS = ['#43A047', '#1ABC9C', '#2196F3', '#FF9800', '#E91E63',
                      '#9C27B0', '#00BCD4', '#FF5722', '#607D8B', '#795548'];

export default function AnalyticsDashboard() {
  const [tab, setTab] = useState(0);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'profit-loss' | 'balance-sheet' | 'cash-flow'>('profit-loss');
  const [exporting, setExporting] = useState<string | null>(null);

  const { canAccessAnalytics } = usePermissions();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const { data: summary, isLoading: summaryLoading } = useAccountingSummary();

  const { data: analyticsData, isLoading: analyticsLoading, refetch } = useQuery({
    queryKey: ['analytics-overview', startDate, endDate],
    queryFn: async () => {
      const res = await analyticsService.getOverview({ start_date: startDate, end_date: endDate });
      return (res.data as any)?.data;
    },
    staleTime: 60_000,
  });

  if (!canAccessAnalytics()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" icon={<LockIcon />}>
          Access Denied. Only managers and above can access analytics.
        </Alert>
      </Box>
    );
  }

  const kpis = analyticsData?.kpis;
  const revenueTrend = analyticsData?.revenue_trend ?? [];
  const expenseBreakdown = analyticsData?.expense_breakdown ?? [];
  const topCustomers = analyticsData?.top_customers ?? [];
  const invoiceStatus = analyticsData?.invoice_status ?? [];
  const isLoading = summaryLoading || analyticsLoading;

  const handleExport = async (entity: string, exportFn: () => Promise<any>, filename: string) => {
    setExporting(entity);
    try {
      const res = await exportFn();
      downloadBlob(res.data, filename);
      showSuccess(`${entity} exported successfully`);
    } catch {
      showError(`Failed to export ${entity}`);
    } finally {
      setExporting(null);
    }
  };

  const exportButtons = [
    { label: 'Invoices', fn: () => analyticsService.exportInvoices({ format: exportFormat, start_date: startDate, end_date: endDate }), filename: getExportFilename('invoices', exportFormat) },
    { label: 'Vendor Bills', fn: () => analyticsService.exportVendorBills({ format: exportFormat, start_date: startDate, end_date: endDate }), filename: getExportFilename('vendor_bills', exportFormat) },
    { label: 'Expenses', fn: () => analyticsService.exportExpenses({ format: exportFormat, start_date: startDate, end_date: endDate }), filename: getExportFilename('expenses', exportFormat) },
    { label: 'Quotations', fn: () => analyticsService.exportQuotations({ format: exportFormat, start_date: startDate, end_date: endDate }), filename: getExportFilename('quotations', exportFormat) },
    { label: 'Purchase Orders', fn: () => analyticsService.exportPurchaseOrders({ format: exportFormat, start_date: startDate, end_date: endDate }), filename: getExportFilename('purchase_orders', exportFormat) },
    { label: 'Journal Entries', fn: () => analyticsService.exportJournalEntries({ format: exportFormat, start_date: startDate, end_date: endDate }), filename: getExportFilename('journal_entries', exportFormat) },
  ];

  const renderReportCard = (title: string, description: string, type: 'profit-loss' | 'balance-sheet' | 'cash-flow') => (
    <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" fullWidth onClick={() => { setReportType(type); setReportModalOpen(true); }}>
            View Report
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={exporting === title ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
            disabled={exporting !== null}
            onClick={(e) => {
              e.stopPropagation();
              handleExport(title, () => analyticsService.exportFinancialReport({ report_id: type, format: exportFormat }), getExportFilename(type, exportFormat));
            }}
          >
            {exportFormat === 'excel' ? 'Excel' : 'CSV'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <PageHeader
        title="Analytics & Reports"
        subtitle="Business intelligence, financial reports, and performance metrics"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Analytics' }]}
        icon={<AnalyticsIcon sx={{ fontSize: 26 }} />}
        color="#FF6B6B"
        actions={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              select
              size="small"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv')}
              sx={{ width: 110 }}
            >
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </TextField>
            <Button variant="outlined" size="small" startIcon={<FileUploadIcon />} onClick={() => setImportModalOpen(true)}>
              Import
            </Button>
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={() => setTab(0)}>
              Export All
            </Button>
          </Box>
        }
      />

      {/* Date range + KPI cards — same as original but now real data */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total Revenue"
            value={kpis ? formatCurrency(kpis.total_revenue) : formatCurrency(summary?.total_revenue ?? 0)}
            trend="up"
            color="#2E7D32"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total Expenses"
            value={kpis ? formatCurrency(kpis.total_expenses) : '—'}
            trend="down"
            color="#D32F2F"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Net Profit"
            value={kpis ? formatCurrency(kpis.net_profit) : '—'}
            trend={(kpis?.net_profit ?? 0) >= 0 ? 'up' : 'down'}
            color="#1976D2"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Profit Margin"
            value={kpis ? `${kpis.profit_margin.toFixed(1)}%` : '—'}
            trend="up"
            color="#9C27B0"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Original 4 tabs — restored exactly */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="Financial Reports" />
        <Tab label="Business Health" />
        <Tab label="Cash Flow" />
        <Tab label="Visualizations" />
      </Tabs>

      {/* ── Tab 1: Business Health (original) ───────────────────────────────── */}
      {tab === 1 && (
        <Grid container spacing={2.5}>
          {[
            { title: 'Business Health Scorecard', description: 'Overall business performance metrics', reportType: 'profit-loss' as const },
            { title: 'KPI Dashboard', description: 'Key performance indicators tracking', reportType: 'profit-loss' as const },
            { title: 'Financial Ratios', description: 'Liquidity, profitability, and efficiency ratios', reportType: 'balance-sheet' as const },
            { title: 'Budget vs Actual', description: 'Compare planned vs actual performance', reportType: 'profit-loss' as const },
            { title: 'Trend Analysis', description: 'Historical performance trends', reportType: 'profit-loss' as const },
            { title: 'Forecast Report', description: 'Projected financial performance', reportType: 'cash-flow' as const },
          ].map((r) => (
            <Grid key={r.title} size={{ xs: 12, md: 6, lg: 4 }}>
              {renderReportCard(r.title, r.description, r.reportType)}
            </Grid>
          ))}

          {/* Live KPI summary */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Live Business KPIs</Typography>
                <Divider sx={{ mb: 2 }} />
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
                ) : kpis ? (
                  <Grid container spacing={2}>
                    {[
                      { label: 'Total Revenue', value: formatCurrency(kpis.total_revenue) },
                      { label: 'Total Expenses', value: formatCurrency(kpis.total_expenses) },
                      { label: 'Net Profit', value: formatCurrency(kpis.net_profit) },
                      { label: 'Profit Margin', value: `${kpis.profit_margin.toFixed(1)}%` },
                      { label: 'Outstanding', value: formatCurrency(kpis.total_outstanding) },
                      { label: 'Overdue', value: formatCurrency(kpis.total_overdue) },
                      { label: 'Total Bills', value: formatCurrency(kpis.total_bills) },
                      { label: 'Revenue Growth', value: `${kpis.revenue_growth > 0 ? '+' : ''}${kpis.revenue_growth.toFixed(1)}%` },
                    ].map((item) => (
                      <Grid key={item.label} size={{ xs: 6, sm: 4, md: 3 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block">{item.label}</Typography>
                          <Typography variant="subtitle1" fontWeight={600}>{item.value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary">No data available for selected period</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── Tab 2: Cash Flow (original) ──────────────────────────────────────── */}
      {tab === 2 && (
        <Grid container spacing={2.5}>
          {[
            { title: 'Cash Flow Manager', description: 'Monitor cash inflows and outflows', reportType: 'cash-flow' as const },
            { title: 'Cash Position', description: 'Current cash and bank balances', reportType: 'balance-sheet' as const },
            { title: 'Cash Flow Forecast', description: 'Projected cash position', reportType: 'cash-flow' as const },
            { title: 'Working Capital', description: 'Current assets vs current liabilities', reportType: 'balance-sheet' as const },
            { title: 'Burn Rate', description: 'Monthly cash consumption rate', reportType: 'cash-flow' as const },
            { title: 'Runway Analysis', description: 'Months of operation remaining', reportType: 'cash-flow' as const },
          ].map((r) => (
            <Grid key={r.title} size={{ xs: 12, md: 6, lg: 4 }}>
              {renderReportCard(r.title, r.description, r.reportType)}
            </Grid>
          ))}

          {/* Live cash flow chart */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cash Flow Trend</Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : revenueTrend.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography color="text.secondary">No cash flow data for selected period</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="cfRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#43A047" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#43A047" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="cfExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E53E3E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#E53E3E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                      <RTooltip formatter={(v: any) => formatCurrency(Number(v))} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Cash In" stroke="#43A047" fill="url(#cfRevenue)" strokeWidth={2} />
                      <Area type="monotone" dataKey="expenses" name="Cash Out" stroke="#E53E3E" fill="url(#cfExpenses)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── Tab 3: Visualizations (original — now with real charts) ─────────── */}
      {tab === 3 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Revenue Trends</Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : revenueTrend.length === 0 ? (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                    <Typography color="text.secondary">No data for selected period</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="vizRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#43A047" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#43A047" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="vizExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E53E3E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#E53E3E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                      <RTooltip formatter={(v: any) => formatCurrency(Number(v))} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#43A047" fill="url(#vizRevenue)" strokeWidth={2} />
                      <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#E53E3E" fill="url(#vizExpenses)" strokeWidth={2} />
                      <Area type="monotone" dataKey="profit" name="Profit" stroke="#2196F3" strokeWidth={2} fill="none" strokeDasharray="4 2" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Expense Breakdown</Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : expenseBreakdown.length === 0 ? (
                  <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                    <Typography color="text.secondary">No expense data for selected period</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ category, percent }: any) => `${category} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {expenseBreakdown.map((_: any, i: number) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RTooltip formatter={(v: any) => formatCurrency(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sales by Category</Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : invoiceStatus.length === 0 ? (
                  <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                    <Typography color="text.secondary">No invoice data for selected period</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={invoiceStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RTooltip />
                      <Bar dataKey="count" name="Invoices" radius={[4, 4, 0, 0]}>
                        {invoiceStatus.map((_: any, i: number) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top customers bar chart */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Top Customers by Revenue</Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : topCustomers.length === 0 ? (
                  <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                    <Typography color="text.secondary">No customer data for selected period</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topCustomers.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="customer" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                      <RTooltip formatter={(v: any) => formatCurrency(Number(v))} />
                      <Bar dataKey="revenue" name="Revenue" fill="#43A047" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      {tab === 0 && (
        <Grid container spacing={2.5}>
          {/* Date range filter row */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Period:</Typography>
                  <TextField type="date" size="small" label="From" value={startDate} onChange={(e) => setStartDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
                  <TextField type="date" size="small" label="To" value={endDate} onChange={(e) => setEndDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
                  <Button size="small" variant="outlined" onClick={() => refetch()}>Apply</Button>
                  {isLoading && <CircularProgress size={20} />}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Profit & Loss', 'Income statement showing revenue and expenses', 'profit-loss')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Balance Sheet', 'Assets, liabilities, and equity overview', 'balance-sheet')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Cash Flow Statement', 'Operating, investing, and financing activities', 'cash-flow')}
          </Grid>

          {/* Data exports */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Export Data</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Download records for the selected period as {exportFormat === 'excel' ? 'Excel' : 'CSV'}
                </Typography>
                <Grid container spacing={1.5}>
                  {exportButtons.map((btn) => (
                    <Grid key={btn.label} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={exporting === btn.label ? <CircularProgress size={14} /> : <DownloadIcon />}
                        disabled={exporting !== null}
                        onClick={() => handleExport(btn.label, btn.fn, btn.filename)}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {btn.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional reports */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sales Tax Report</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Tax collected and payable summary</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" fullWidth onClick={() => { setReportType('profit-loss'); setReportModalOpen(true); }}>View Report</Button>
                  <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => handleExport('Sales Tax', () => analyticsService.exportInvoices({ format: exportFormat, start_date: startDate, end_date: endDate }), getExportFilename('sales_tax', exportFormat))}>
                    {exportFormat === 'excel' ? 'Excel' : 'CSV'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sales Report</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Revenue breakdown by product and customer</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" fullWidth onClick={() => { setReportType('profit-loss'); setReportModalOpen(true); }}>View Report</Button>
                  <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => handleExport('Sales', () => analyticsService.exportInvoices({ format: exportFormat, start_date: startDate, end_date: endDate }), getExportFilename('sales', exportFormat))}>
                    {exportFormat === 'excel' ? 'Excel' : 'CSV'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Accounting Transactions</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Detailed transaction ledger</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" fullWidth>View Report</Button>
                  <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => handleExport('Journal Entries', () => analyticsService.exportJournalEntries({ format: exportFormat, start_date: startDate, end_date: endDate }), getExportFilename('journal_entries', exportFormat))}>
                    {exportFormat === 'excel' ? 'Excel' : 'CSV'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Aged Receivables</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Outstanding customer invoices</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" fullWidth>View Report</Button>
                  <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => handleExport('Invoices', () => analyticsService.exportInvoices({ format: exportFormat, start_date: startDate, end_date: endDate }), getExportFilename('aged_receivables', exportFormat))}>
                    {exportFormat === 'excel' ? 'Excel' : 'CSV'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Aged Payables</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Outstanding vendor bills</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" fullWidth>View Report</Button>
                  <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => handleExport('Vendor Bills', () => analyticsService.exportVendorBills({ format: exportFormat, start_date: startDate, end_date: endDate }), getExportFilename('aged_payables', exportFormat))}>
                    {exportFormat === 'excel' ? 'Excel' : 'CSV'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Bank Reconciliation</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Match bank statements with records</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" fullWidth>View Report</Button>
                  <Button size="small" variant="contained" startIcon={<DownloadIcon />}>
                    {exportFormat === 'excel' ? 'Excel' : 'CSV'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Modals */}
      <ImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />
      <ReportViewModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportType={reportType}
        startDate={startDate}
        endDate={endDate}
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

