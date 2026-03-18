'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Paper, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/ui/PageHeader';
import StatusChip from '@/components/ui/StatusChip';
import { useInvoice } from '@/hooks/useAccounting';
import { formatCurrency, formatDate } from '@/utils/formatters';
import ReceiptIcon from '@mui/icons-material/Receipt';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : null;
  const { data: invoice, isLoading, error } = useInvoice(id);

  if (!id) {
    return (
      <Box>
        <Typography color="error">Invalid invoice ID.</Typography>
      </Box>
    );
  }

  if (error || (!isLoading && !invoice)) {
    return (
      <Box>
        <PageHeader
          title="Invoice"
          breadcrumbs={[{ label: 'Accounting', href: '/accounting' }, { label: 'Invoices', href: '/accounting/invoices' }, { label: 'Detail' }]}
        />
        <Typography color="text.secondary">Invoice not found or you don&apos;t have access.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/accounting/invoices')} sx={{ mt: 2 }}>
          Back to Invoices
        </Button>
      </Box>
    );
  }

  if (isLoading || !invoice) {
    return (
      <Box>
        <PageHeader title="Invoice" breadcrumbs={[{ label: 'Accounting', href: '/accounting' }, { label: 'Invoices', href: '/accounting/invoices' }, { label: '...' }]} />
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Invoice ${invoice.number}`}
        subtitle={`Due ${formatDate(invoice.due_date)}`}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Invoices', href: '/accounting/invoices' },
          { label: invoice.number },
        ]}
        icon={<ReceiptIcon sx={{ fontSize: 26 }} />}
        color="#2E7D32"
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/accounting/invoices')}>
            Back to list
          </Button>
        }
      />
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">#{invoice.number}</Typography>
          <StatusChip status={invoice.status} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Date: {formatDate(invoice.date)} · Due: {formatDate(invoice.due_date)}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>Customer: {invoice.customer}</Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>Sub total: {formatCurrency(invoice.sub_total)}</Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>Tax: {formatCurrency(invoice.tax_total)}</Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>Total: {formatCurrency(invoice.total)}</Typography>
        {invoice.lines?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Lines</Typography>
            {invoice.lines.map((line) => (
              <Box key={line.id} sx={{ py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
                {line.description} · Qty {line.quantity} × {formatCurrency(line.unit_price)} = {formatCurrency(line.total)}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
