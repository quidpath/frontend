'use client';

import React, { useState } from 'react';
import { Box, Button, Grid, Tab, Tabs, Card, CardContent, Typography, Alert } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import { formatCurrency } from '@/utils/formatters';
import { useAccountingSummary } from '@/hooks/useAccounting';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';
import { usePermissions } from '@/hooks/usePermissions';

export default function AnalyticsDashboard() {
  const [tab, setTab] = useState(0);
  const { data: summary, isLoading: summaryLoading } = useAccountingSummary();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const { canAccessAnalytics } = usePermissions();

  if (!canAccessAnalytics()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" icon={<LockIcon />}>
          Access Denied. Only managers and above can access analytics.
        </Alert>
      </Box>
    );
  }

  const handleDownloadReport = (reportName: string) => {
    showSuccess(`Downloading ${reportName}...`);
    // TODO: Implement actual download functionality
  };

  const renderReportCard = (title: string, description: string, reportType: string) => (
    <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" fullWidth>View Report</Button>
          <Button 
            size="small" 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadReport(title);
            }}
          >
            PDF
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
          <Button startIcon={<DownloadIcon />} variant="outlined" size="small">
            Export All
          </Button>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard 
            label="Total Revenue" 
            value={summary ? formatCurrency(summary.total_revenue) : formatCurrency(0)} 
            trend="up" 
            color="#2E7D32" 
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard 
            label="Total Expenses" 
            value={summary ? formatCurrency(summary.total_revenue * 0.36) : formatCurrency(0)} 
            trend="down" 
            color="#D32F2F" 
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard 
            label="Net Profit" 
            value={summary ? formatCurrency(summary.total_revenue * 0.64) : formatCurrency(0)} 
            trend="up" 
            color="#1976D2" 
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard 
            label="Profit Margin" 
            value="64%" 
            trend="up" 
            color="#9C27B0" 
            loading={summaryLoading}
          />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="Financial Reports" />
        <Tab label="Business Health" />
        <Tab label="Cash Flow" />
        <Tab label="Visualizations" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Profit & Loss', 'Income statement showing revenue and expenses', 'profit-loss')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Balance Sheet', 'Assets, liabilities, and equity overview', 'balance-sheet')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Cash Flow Statement', 'Operating, investing, and financing activities', 'cash-flow')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Sales Tax Report', 'Tax collected and payable summary', 'sales-tax')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Sales Report', 'Revenue breakdown by product and customer', 'sales')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Accounting Transactions', 'Detailed transaction ledger', 'transactions')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Bank Reconciliation', 'Match bank statements with records', 'bank-recon')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Aged Receivables', 'Outstanding customer invoices', 'receivables')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Aged Payables', 'Outstanding vendor bills', 'payables')}
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Business Health Scorecard', 'Overall business performance metrics', 'health')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('KPI Dashboard', 'Key performance indicators tracking', 'kpi')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Financial Ratios', 'Liquidity, profitability, and efficiency ratios', 'ratios')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Budget vs Actual', 'Compare planned vs actual performance', 'budget')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Trend Analysis', 'Historical performance trends', 'trends')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Forecast Report', 'Projected financial performance', 'forecast')}
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Cash Flow Manager', 'Monitor cash inflows and outflows', 'cashflow-mgr')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Cash Position', 'Current cash and bank balances', 'cash-position')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Cash Flow Forecast', 'Projected cash position', 'cashflow-forecast')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Working Capital', 'Current assets vs current liabilities', 'working-capital')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Burn Rate', 'Monthly cash consumption rate', 'burn-rate')}
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {renderReportCard('Runway Analysis', 'Months of operation remaining', 'runway')}
          </Grid>
        </Grid>
      )}

      {tab === 3 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Revenue Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">Chart visualization will be rendered here</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Expense Breakdown</Typography>
                <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">Pie chart will be rendered here</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sales by Category</Typography>
                <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">Bar chart will be rendered here</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      <NotificationToast
        open={notification.open}
        onClose={hideNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
}
