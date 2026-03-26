'use client';

import React, { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle,
  Divider, IconButton, MenuItem, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { useQuery } from '@tanstack/react-query';
import { gatewayClient } from '@/services/apiClient';
import { downloadBlob, getExportFilename } from '@/utils/downloadBlob';
import { formatCurrency } from '@/utils/formatters';

export type ReportType = 'profit-loss' | 'balance-sheet' | 'cash-flow';

interface ReportViewModalProps {
  open: boolean;
  onClose: () => void;
  reportType: ReportType;
  startDate: string;
  endDate: string;
}

const REPORT_FETCH_ENDPOINTS: Record<ReportType, string> = {
  'profit-loss': '/reports/profit-and-loss/',
  'balance-sheet': '/reports/balance-sheet/',
  'cash-flow': '/reports/cash-flow-statement/',
};

// Direct export endpoints — no stored report_id needed
const REPORT_EXPORT_ENDPOINTS: Record<ReportType, string> = {
  'profit-loss': '/export/invoices/',      // fallback: use invoice export for P&L
  'balance-sheet': '/export/invoices/',
  'cash-flow': '/export/journal-entries/',
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
  const [exportError, setExportError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['report-view', reportType, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = { start_date: startDate, end_date: endDate };
      if (reportType === 'balance-sheet') {
        params.as_of_date = endDate;
      }
      const res = await gatewayClient.get(REPORT_FETCH_ENDPOINTS[reportType], { params });
      // Backend wraps as { code, message, data: { ... } }
      return (res.data as any)?.data ?? res.data;
    },
    enabled: open,
    staleTime: 30_000,
  });

  const handleExport = async () => {
    setExporting(true);
    setExportError('');
    try {
      // Try to generate a stored report first, then export it
      const genEndpoints: Record<ReportType, string> = {
        'profit-loss': '/generate-pl/',
        'balance-sheet': '/generate-bs/',
        'cash-flow': '/generate-cash-flow/',
      };
      const params = { start_date: startDate, end_date: endDate };

      let reportId: string | null = null;
      try {
        const genRes = await gatewayClient.post(genEndpoints[reportType], params);
        reportId = (genRes.data as any)?.data?.report_id ?? null;
      } catch {
        // generate failed — fall through to direct export
      }

      if (reportId) {
        const res = await gatewayClient.get('/export/financial-report/', {
          params: { report_id: reportId, format: exportFormat },
          responseType: 'blob',
        });
        downloadBlob(res.data as Blob, getExportFilename(reportType, exportFormat, endDate), res.headers as any);
      } else {
        // Fallback: export raw data as the closest matching entity
        const fallbackEndpoints: Record<ReportType, string> = {
          'profit-loss': '/export/invoices/',
          'balance-sheet': '/export/invoices/',
          'cash-flow': '/export/journal-entries/',
        };
        const res = await gatewayClient.get(fallbackEndpoints[reportType], {
          params: { format: exportFormat, start_date: startDate, end_date: endDate },
          responseType: 'blob',
        });
        downloadBlob(res.data as Blob, getExportFilename(reportType, exportFormat, endDate), res.headers as any);
      }
    } catch (e: any) {
      setExportError(e?.response?.data?.message ?? 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ── Renderers ─────────────────────────────────────────────────────────────
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
        {Object.entries(d?.revenues?.subtypes ?? d?.revenues ?? {}).map(([k, v]: any) =>
          typeof v !== 'object' ? (
            <TableRow key={k}>
              <TableCell />
              <TableCell>{k}</TableCell>
              <TableCell align="right">{formatCurrency(parseFloat(v))}</TableCell>
            </TableRow>
          ) : null
        )}
        <TableRow>
          <TableCell />
          <TableCell sx={{ fontWeight: 600 }}>Total Revenues</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>
            {formatCurrency(parseFloat(d?.revenues?.total ?? d?.total_revenues ?? 0))}
          </TableCell>
        </TableRow>
        <TableRow sx={{ bgcolor: 'grey.50' }}>
          <TableCell colSpan={3} sx={{ fontWeight: 700 }}>EXPENSES</TableCell>
        </TableRow>
        {Object.entries(d?.expenses?.subtypes ?? d?.expenses ?? {}).map(([k, v]: any) =>
          typeof v !== 'object' ? (
            <TableRow key={k}>
              <TableCell />
              <TableCell>{k}</TableCell>
              <TableCell align="right">{formatCurrency(parseFloat(v))}</TableCell>
            </TableRow>
          ) : null
        )}
        <TableRow>
          <TableCell />
          <TableCell sx={{ fontWeight: 600 }}>Total Expenses</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>
            {formatCurrency(parseFloat(d?.expenses?.total ?? d?.total_expenses ?? 0))}
          </TableCell>
        </TableRow>
        <TableRow sx={{ bgcolor: 'primary.50' }}>
          <TableCell colSpan={2} sx={{ fontWeight: 700 }}>NET PROFIT / (LOSS)</TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>
            {formatCurrency(parseFloat(d?.net_income ?? d?.net_profit ?? 0))}
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
            {Object.entries(d?.[section]?.subtypes ?? {}).map(([k, v]: any) => (
              <TableRow key={k}>
                <TableCell />
                <TableCell>{k}</TableCell>
                <TableCell align="right">{formatCurrency(parseFloat(v))}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell />
              <TableCell sx={{ fontWeight: 600 }}>
                Total {section.charAt(0).toUpperCase() + section.slice(1)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency(parseFloat(d?.[section]?.total ?? 0))}
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
          ['Net Cash Change', d?.net_cash_change ?? d?.net_change_in_cash],
          ['Beginning Cash', d?.beginning_cash],
          ['Ending Cash', d?.ending_cash],
        ].filter(([, v]) => v != null).map(([label, val]) => (
          <TableRow key={label as string}>
            <TableCell sx={{ fontWeight: String(label).startsWith('Net') ? 700 : 400 }}>
              {label}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: String(label).startsWith('Net') ? 700 : 400 }}>
              {formatCurrency(parseFloat(String(val)))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>{REPORT_LABELS[reportType]}</Typography>
          <Typography variant="caption" color="text.secondary">
            {startDate} — {endDate}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            select size="small" value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv')}
            sx={{ width: 110 }}
          >
            <MenuItem value="excel">Excel</MenuItem>
            <MenuItem value="csv">CSV</MenuItem>
          </TextField>
          <Button
            variant="contained" size="small"
            startIcon={exporting ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
            onClick={handleExport}
            disabled={exporting}
          >
            Download
          </Button>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {exportError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setExportError('')}>
            {exportError}
          </Alert>
        )}
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
