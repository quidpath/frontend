'use client';

import React, { useState } from 'react';
import { Box, Button, Grid, Card, CardContent, Typography, TextField, MenuItem } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import PageHeader from '@/components/ui/PageHeader';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';

export default function ReportsDashboard() {
  const [reportType, setReportType] = useState('profit-loss');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);
  
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const reports = [
    { id: 'profit-loss', name: 'Profit & Loss', category: 'Financial' },
    { id: 'balance-sheet', name: 'Balance Sheet', category: 'Financial' },
    { id: 'cash-flow', name: 'Cash Flow Statement', category: 'Financial' },
    { id: 'sales-report', name: 'Sales Report', category: 'Sales' },
    { id: 'sales-tax', name: 'Sales Tax Report', category: 'Tax' },
    { id: 'aged-receivables', name: 'Aged Receivables', category: 'Accounts' },
    { id: 'aged-payables', name: 'Aged Payables', category: 'Accounts' },
    { id: 'inventory-valuation', name: 'Inventory Valuation', category: 'Inventory' },
    { id: 'payroll-summary', name: 'Payroll Summary', category: 'HRM' },
    { id: 'project-profitability', name: 'Project Profitability', category: 'Projects' },
  ];

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      showError('Please select both start and end dates');
      return;
    }
    setReportGenerated(true);
    showSuccess('Report generated successfully');
  };

  const handleDownload = (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportGenerated) {
      showError('Please generate a report first');
      return;
    }
    showSuccess(`Downloading report as ${format.toUpperCase()}...`);
    // TODO: Implement actual download functionality with backend
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
              <Typography variant="h6" gutterBottom>Report Parameters</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    label="Report Type"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    {reports.map((report) => (
                      <MenuItem key={report.id} value={report.id}>
                        {report.name} ({report.category})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button fullWidth variant="contained" size="large" onClick={handleGenerateReport}>
                    Generate Report
                  </Button>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Download As:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleDownload('pdf')}
                      disabled={!reportGenerated}
                    >
                      PDF
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<TableChartIcon />}
                      onClick={() => handleDownload('excel')}
                      disabled={!reportGenerated}
                    >
                      Excel
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload('csv')}
                      disabled={!reportGenerated}
                    >
                      CSV
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ minHeight: 500 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Report Preview</Typography>
              <Box sx={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                {reportGenerated ? (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {reports.find(r => r.id === reportType)?.name}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Period: {startDate} to {endDate}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                      Report data will be displayed here once backend integration is complete.
                      You can download the report in PDF, Excel, or CSV format.
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    Select parameters and generate report to view preview
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <NotificationToast
        open={notification.open}
        onClose={hideNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
}
