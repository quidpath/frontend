'use client';

import { useState } from 'react';
import {
  Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, CircularProgress, Grid, Box, Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions } from '@/components/ui/ActionMenu';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { reportService } from '@/services/accountingService';
import { useQuery } from '@tanstack/react-query';
import type { SectionProps } from './_shared';

// Financial Reports Sub-tab
function FinancialReportsTab({ notify }: { notify: (m: string, s?: 'success' | 'error') => void }) {
  const [reportType, setReportType] = useState<'balance-sheet' | 'income-statement' | 'profit-loss' | 'cash-flow'>('balance-sheet');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let response;
      const params = { start_date: startDate, end_date: endDate };
      
      switch (reportType) {
        case 'balance-sheet':
          response = await reportService.getBalanceSheet(params);
          break;
        case 'income-statement':
          response = await reportService.getIncomeStatement(params);
          break;
        case 'profit-loss':
          response = await reportService.getProfitAndLoss(params);
          break;
        case 'cash-flow':
          response = await reportService.getCashFlowStatement(params);
          break;
      }
      
      setReportData(response.data);
      notify('Report generated successfully');
    } catch (error) {
      notify('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await reportService.downloadReport(reportData?.report_id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_${startDate}_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify('Report downloaded successfully');
    } catch (error) {
      notify('Failed to download report', 'error');
    }
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Report Type</InputLabel>
              <Select value={reportType} label="Report Type" onChange={e => setReportType(e.target.value as any)}>
                <MenuItem value="balance-sheet">Balance Sheet</MenuItem>
                <MenuItem value="income-statement">Income Statement</MenuItem>
                <MenuItem value="profit-loss">Profit & Loss</MenuItem>
                <MenuItem value="cash-flow">Cash Flow Statement</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              fullWidth
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="End Date"
              type="date"
              size="small"
              fullWidth
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerate}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
            >
              Generate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {reportData && (
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Report Preview</Typography>
            <Button startIcon={<DownloadIcon />} onClick={handleDownload} size="small">
              Download PDF
            </Button>
          </Stack>
          <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </Box>
        </Paper>
      )}
    </Stack>
  );
}

// Aging Reports Sub-tab
function AgingReportsTab({ notify }: { notify: (m: string, s?: 'success' | 'error') => void }) {
  const [reportType, setReportType] = useState<'aging' | 'aged-invoices'>('aging');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = { as_of_date: asOfDate };
      const response = reportType === 'aging' 
        ? await reportService.getAgingReport(params)
        : await reportService.getAgedInvoices(params);
      
      setReportData(response.data);
      notify('Aging report generated successfully');
    } catch (error) {
      notify('Failed to generate aging report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const params = { as_of_date: asOfDate };
      const response = reportType === 'aging'
        ? await reportService.downloadAgingReport(params)
        : await reportService.downloadAgedInvoices(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_${asOfDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify('Report downloaded successfully');
    } catch (error) {
      notify('Failed to download report', 'error');
    }
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Report Type</InputLabel>
              <Select value={reportType} label="Report Type" onChange={e => setReportType(e.target.value as any)}>
                <MenuItem value="aging">Aging Report</MenuItem>
                <MenuItem value="aged-invoices">Aged Invoices</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="As Of Date"
              type="date"
              size="small"
              fullWidth
              value={asOfDate}
              onChange={e => setAsOfDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerate}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
            >
              Generate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {reportData && (
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Aging Report</Typography>
            <Button startIcon={<DownloadIcon />} onClick={handleDownload} size="small">
              Download PDF
            </Button>
          </Stack>
          <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </Box>
        </Paper>
      )}
    </Stack>
  );
}

// Summary Reports Sub-tab
function SummaryReportsTab({ notify }: { notify: (m: string, s?: 'success' | 'error') => void }) {
  const [reportType, setReportType] = useState<'sales' | 'purchases' | 'expenses'>('sales');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      let response;
      
      switch (reportType) {
        case 'sales':
          response = await reportService.getSalesSummary(params);
          break;
        case 'purchases':
          response = await reportService.getPurchasesSummary(params);
          break;
        case 'expenses':
          response = await reportService.getExpensesSummary(params);
          break;
      }
      
      setReportData(response.data);
      notify('Summary report generated successfully');
    } catch (error) {
      notify('Failed to generate summary report', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Report Type</InputLabel>
              <Select value={reportType} label="Report Type" onChange={e => setReportType(e.target.value as any)}>
                <MenuItem value="sales">Sales Summary</MenuItem>
                <MenuItem value="purchases">Purchases Summary</MenuItem>
                <MenuItem value="expenses">Expenses Summary</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              fullWidth
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="End Date"
              type="date"
              size="small"
              fullWidth
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerate}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
            >
              Generate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {reportData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Summary Report</Typography>
          <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </Box>
        </Paper>
      )}
    </Stack>
  );
}

export default function ReportsSection({ subTab, notify }: SectionProps) {
  if (subTab === 'financial') return <FinancialReportsTab notify={notify} />;
  if (subTab === 'aging') return <AgingReportsTab notify={notify} />;
  if (subTab === 'summary') return <SummaryReportsTab notify={notify} />;
  return null;
}
