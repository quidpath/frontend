'use client';

import React, { useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle,
  Divider, IconButton, MenuItem, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useQuery } from '@tanstack/react-query';
import { gatewayClient } from '@/services/apiClient';
import analyticsService from '@/services/analyticsService';
import { downloadBlob, getExportFilename } from '@/utils/downloadBlob';
import { formatCurrency } from '@/utils/formatters';

type ReportType = 'profit-loss' | 'balance-sheet' | 'cash-flow';

interface ReportViewModalProps {
  open: boolean;
  onClose: () => void;
  reportType: ReportType;
  startDate: string;
  endDate: string;
}

const REPORT_ENDPOINTS: Record<ReportType, string> = {
  'profit-loss': '/reports/profit-and-loss/',
  'balance-sheet': '/reports/balance-sheet/',
  'cash-flow': '/reports/cash-flow-statement/',
};

const REPORT_LABELS: Record<ReportType, string> = {
  'profit-loss': 'Profit & Loss',
  'balance-sheet': 'Balance Sheet',
  'cash-flow': 'Cash Flow Statement',
};

export default function ReportViewModal({
  open, onClose, reportType, startDate, endDate,
}: ReportViewModalProps) {
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [exporting, setExporting] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['report-view', reportType, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = { start_date: startDate, end_date: endDate };
      if (reportType === 'balance-sheet') {
        params.as_of_date = endDate;
      }
      const res = await gatewayClient.get(REPORT_ENDPOINTS[reportType], { params });
      const d = (res.data as any)?.data;
      // Also generate a stored report for download
      try {
        const genEndpoints: Record<ReportType, string> = {
          'profit-loss': '/generate-pl/',
          'balance-sheet': '/generate-bs/',
          'cash-flow': '/generate-cash-flow/',
        };
        const genRes = await gatewayClient.post(genEndpoints[reportType], params);
        const rid = (genRes.data as any)?.data?.report_id;
        if (rid) setReportId(rid);
      } catch {}
      return d;
    },
    enabled: open,
    staleTime: 30_000,
  });

  const handleExport = async () => {
    if (!reportId) return;
    setExporting(true);
    try {
      const res = await analyticsService.exportFinancialReport({ report_id: reportId, format: exportFormat });
      downloadBlob(res.data, getExportFilename(reportType, exportFormat, endDate));
    } catch {
      // silently fail
    } finally {
      setExporting(false);
    }
  };

  const renderPL = (d: any) => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>Section</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow sx={{ bgcolor: 'grey.50' }}>
          <TableCell colSpan={3} sx={{ fontWeight: 700 }}>REVENUES</TableCell>
        </TableRow>
        {Object.entries(d?.revenues?.subtypes || d?.revenues || {}).map(([k, v]: any) => (
          <TableRow key={k}>
            <TableCell />
            <TableCell>{k}</TableCell>
            <TableCell align="right">{formatCurrency(parseFloat(v))}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell />
          <TableCell sx={{ fontWeight: 600 }}>Total Revenues</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>
            {formatCurrency(parseFloat(d?.revenues?.total || d?.total_revenues || 0))}
          </TableCell>
        </TableRow>
        <TableRow sx={{ bgcolor: 'grey.50' }}>
          <TableCell colSpan={3} sx={{ fontWeight: 700 }}>EXPENSES</TableCell>
        </TableRow>
        {Object.entries(d?.expenses?.subtypes || d?.expenses || {}).map(([k, v]: any) => (
          <TableRow key={k}>
            <TableCell />
            <TableCell>{k}</TableCell>
            <TableCell align="right">{formatCurrency(parseFloat(v))}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell />
          <TableCell sx={{ fontWeight: 600 }}>Total Expenses</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>
            {formatCurrency(parseFloat(d?.expenses?.total || d?.total_expenses || 0))}
          </TableCell>
        </TableRow>
        <TableRow sx={{ bgcolor: 'primary.50' }}>
          <TableCell colSpan={2} sx={{ fontWeight: 700 }}>NET PROFIT / (LOSS)</TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>
            {formatCurrency(parseFloat(d?.net_income || d?.net_profit || 0))}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

  const renderBS = (d: any) => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>Section</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(['assets', 'liabilities', 'equity'] as const).map((section) => (
          <React.Fragment key={section}>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell colSpan={3} sx={{ fontWeight: 700 }}>{section.toUpperCase()}</TableCell>
            </TableRow>
            {Object.entries(d?.[section]?.subtypes || {}).map(([k, v]: any) => (
              <TableRow key={k}>
                <TableCell />
                <TableCell>{k}</TableCell>
                <TableCell align="right">{formatCurrency(parseFloat(v))}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell />
              <TableCell sx={{ fontWeight: 600 }}>Total {section.charAt(0).toUpperCase() + section.slice(1)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency(parseFloat(d?.[section]?.total || 0))}
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );

  const renderCF = (d: any) => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          ['Operating Cash Flow', d?.operating_cash_flow],
          ['Investing Cash Flow', d?.investing_cash_flow],
          ['Financing Cash Flow', d?.financing_cash_flow],
          ['Net Cash Change', d?.net_cash_change || d?.net_change_in_cash],
          ['Beginning Cash', d?.beginning_cash],
          ['Ending Cash', d?.ending_cash],
        ].map(([label, val]) => (
          <TableRow key={label as string}>
            <TableCell sx={{ fontWeight: label?.toString().startsWith('Net') ? 700 : 400 }}>
              {label}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: label?.toString().startsWith('Net') ? 700 : 400 }}>
              {val != null ? formatCurrency(parseFloat(String(val))) : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>{REPORT_LABELS[reportType]}</Typography>
          <Typography variant="caption" color="text.secondary">
            {startDate} to {endDate}
          </Typography>
        </Box>
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
          <Button
            variant="contained"
            size="small"
            startIcon={exporting ? <CircularProgress size={14} /> : <DownloadIcon />}
            onClick={handleExport}
            disabled={exporting || !reportId}
          >
            Download
          </Button>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Failed to load report. Please try again.</Alert>
        ) : data ? (
          <Box sx={{ overflowX: 'auto' }}>
            {reportType === 'profit-loss' && renderPL(data)}
            {reportType === 'balance-sheet' && renderBS(data)}
            {reportType === 'cash-flow' && renderCF(data)}
          </Box>
        ) : (
          <Alert severity="info">No data available for the selected period.</Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
