'use client';

import React, { useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, CircularProgress,
  Grid, MenuItem, TextField, Typography,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import PageHeader from '@/components/ui/PageHeader';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';
import ReportViewModal from '@/modules/analytics/modals/ReportViewModal';
import analyticsService from '@/services/analyticsService';
import { downloadBlob, getExportFilename } from '@/utils/downloadBlob';

type ReportType = 'profit-loss' | 'balance-sheet' | 'cash-flow';

const REPORTS = [
  { id: 'profit-loss', name: 'Profit & Loss', category: 'Financial' },
  { id: 'balance-sheet', name: 'Balance Sheet', category: 'Financial' },
  { id: 'cash-flow', name: 'Cash Flow Statement', category: 'Financial' },
  { id: 'invoices', name: 'Invoices', category: 'Sales' },
  { id: 'quotations', name: 'Quotations', category: 'Sales' },
  { id: 'vendor-bills', name: 'Vendor Bills', category: 'Purchases' },
  { id: 'purchase-orders', name: 'Purchase Orders', category: 'Purchases' },
  { id: 'expenses', name: 'Expenses', category: 'Expenses' },
  { id: 'journal-entries', name: 'Journal Entries', category: 'Accounting' },
];

const FINANCIAL_REPORTS = new Set(['profit-loss', 'balance-sheet', 'cash-flow']);

export default function ReportsDashboard() {
  const [reportType, setReportType] = useState('profit-loss');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const handleView = () => {
    if (!FINANCIAL_REPORTS.has(reportType)) {
      showError('View is only available for financial reports. Use Download to export data reports.');
      return;
    }
    setViewModalOpen(true);
  };

  const handleDownload = async (format: 'excel' | 'csv') => {
    setExporting(format);
    try {
      const params = { format, start_date: startDate, end_date: endDate };
      const exportMap: Record<string, () => Promise<any>> = {
        'invoices': () => analyticsService.exportInvoices(params),
        'vendor-bills': () => analyticsService.exportVendorBills(params),
        'expenses': () => analyticsService.exportExpenses(params),
        'quotations': () => analyticsService.exportQuotations(params),
        'purchase-orders': () => analyticsService.exportPurchaseOrders(params),
        'journal-entries': () => analyticsService.exportJournalEntries(params),
      };

      if (exportMap[reportType]) {
        const res = await exportMap[reportType]();
        downloadBlob(res.data, getExportFilename(reportType, format, endDate));
        showSuccess(`${REPORTS.find(r => r.id === reportType)?.name} exported as ${format.toUpperCase()}`);
      } else if (FINANCIAL_REPORTS.has(reportType)) {
        // For financial reports, open view modal first
        setViewModalOpen(true);
        showSuccess('Open the report view and use the Download button to export');
      }
    } catch {
      showError('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Generate and download business reports"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports' }]}
        icon={<AssessmentIcon sx={{ fontSize: 26 }} />}
        color="#FF6B6B"
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Report Parameters
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  select
                  label="Report Type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  {REPORTS.map((report) => (
                    <MenuItem key={report.id} value={report.id}>
                      {report.name}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({report.category})
                      </Typography>
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <Button fullWidth variant="contained" size="large" onClick={handleView}>
                  {FINANCIAL_REPORTS.has(reportType) ? 'View Report' : 'Preview'}
                </Button>

                <Typography variant="caption" color="text.secondary">
                  Download As:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={exporting === 'excel' ? <CircularProgress size={14} /> : <TableChartIcon />}
                    onClick={() => handleDownload('excel')}
                    disabled={exporting !== null}
                  >
                    Excel
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={exporting === 'csv' ? <CircularProgress size={14} /> : <DownloadIcon />}
                    onClick={() => handleDownload('csv')}
                    disabled={exporting !== null}
                  >
                    CSV
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ minHeight: 500 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Report Preview
              </Typography>
              <Box
                sx={{
                  height: 450,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <AssessmentIcon sx={{ fontSize: 64, color: 'grey.300' }} />
                <Typography color="text.secondary" textAlign="center">
                  {FINANCIAL_REPORTS.has(reportType)
                    ? 'Click "View Report" to see the full report with data'
                    : 'Click "Excel" or "CSV" to download this report'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {REPORTS.find(r => r.id === reportType)?.name} · {startDate} to {endDate}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleView}
                >
                  {FINANCIAL_REPORTS.has(reportType) ? 'View Report' : 'Download Excel'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {viewModalOpen && FINANCIAL_REPORTS.has(reportType) && (
        <ReportViewModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          reportType={reportType as ReportType}
          startDate={startDate}
          endDate={endDate}
        />
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
