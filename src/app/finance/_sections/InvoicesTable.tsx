'use client';

import React, { useState } from 'react';
import { Box, Chip } from '@mui/material';
import EnhancedDataTable, { TableColumn, TableAction } from '@/components/tables/EnhancedDataTable';
import ViewModal from '@/components/ui/ViewModal';
import { Invoice } from '@/services/accountingService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { printElement, downloadAsPDF } from '@/utils/print';

interface InvoicesTableProps {
  invoices: Invoice[];
  loading?: boolean;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onRefresh: () => void;
}

export default function InvoicesTable({
  invoices,
  loading,
  onEdit,
  onDelete,
  onRefresh,
}: InvoicesTableProps) {
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const columns: TableColumn<Invoice>[] = [
    {
      id: 'number',
      label: 'Invoice #',
      sortable: true,
      width: 120,
    },
    {
      id: 'customer',
      label: 'Customer',
      sortable: true,
    },
    {
      id: 'date',
      label: 'Date',
      sortable: true,
      render: (row) => formatDate(row.date),
      width: 120,
    },
    {
      id: 'due_date',
      label: 'Due Date',
      sortable: true,
      render: (row) => formatDate(row.due_date),
      width: 120,
    },
    {
      id: 'total',
      label: 'Amount',
      sortable: true,
      render: (row) => formatCurrency(row.total),
      width: 120,
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          color={
            row.status === 'paid' ? 'success' :
            row.status === 'overdue' ? 'error' :
            row.status === 'draft' ? 'default' : 'warning'
          }
        />
      ),
      width: 100,
    },
  ];

  const actions: TableAction<Invoice>[] = [
    {
      type: 'view',
      onClick: (invoice) => setViewInvoice(invoice),
    },
    {
      type: 'edit',
      onClick: onEdit,
      show: (invoice) => invoice.status === 'draft',
    },
    {
      type: 'print',
      onClick: (invoice) => {
        setViewInvoice(invoice);
        setTimeout(() => printElement('invoice-view', `Invoice ${invoice.number}`), 500);
      },
    },
    {
      type: 'download',
      onClick: async (invoice) => {
        try {
          await downloadAsPDF(
            `/api/accounting/invoice/download/`,
            `invoice-${invoice.number}.pdf`,
            { id: invoice.id }
          );
        } catch (error) {
          console.error('Download failed:', error);
        }
      },
    },
    {
      type: 'delete',
      onClick: onDelete,
      show: (invoice) => invoice.status === 'draft',
    },
  ];

  return (
    <>
      <EnhancedDataTable
        columns={columns}
        rows={invoices}
        actions={actions}
        loading={loading}
        onSearch={(query) => console.log('Search:', query)}
        searchPlaceholder="Search invoices..."
        selectable
        onSelectionChange={(selected) => console.log('Selected:', selected)}
      />

      {viewInvoice && (
        <ViewModal
          open={!!viewInvoice}
          onClose={() => setViewInvoice(null)}
          title={`Invoice ${viewInvoice.number}`}
          onPrint={() => printElement('invoice-view', `Invoice ${viewInvoice.number}`)}
          onDownload={async () => {
            try {
              await downloadAsPDF(
                `/api/accounting/invoice/download/`,
                `invoice-${viewInvoice.number}.pdf`,
                { id: viewInvoice.id }
              );
            } catch (error) {
              console.error('Download failed:', error);
            }
          }}
        >
          <Box id="invoice-view">
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Box sx={{ fontSize: 24, fontWeight: 600, mb: 1 }}>
                    Invoice {viewInvoice.number}
                  </Box>
                  <Box sx={{ color: 'text.secondary' }}>
                    Date: {formatDate(viewInvoice.date)}
                  </Box>
                  <Box sx={{ color: 'text.secondary' }}>
                    Due: {formatDate(viewInvoice.due_date)}
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    label={viewInvoice.status}
                    color={
                      viewInvoice.status === 'paid' ? 'success' :
                      viewInvoice.status === 'overdue' ? 'error' : 'warning'
                    }
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ fontWeight: 600, mb: 0.5 }}>Customer</Box>
                <Box>{viewInvoice.customer}</Box>
              </Box>

              {viewInvoice.salesperson && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ fontWeight: 600, mb: 0.5 }}>Salesperson</Box>
                  <Box>{viewInvoice.salesperson}</Box>
                </Box>
              )}

              <Box sx={{ mt: 3, mb: 2, fontWeight: 600 }}>Line Items</Box>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {viewInvoice.lines.map((line, idx) => (
                  <Box
                    key={line.id}
                    sx={{
                      p: 1.5,
                      borderBottom: idx < viewInvoice.lines.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Box sx={{ fontWeight: 500 }}>{line.description}</Box>
                        <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                          Qty: {line.quantity} × {formatCurrency(line.unit_price)}
                        </Box>
                      </Box>
                      <Box sx={{ fontWeight: 600 }}>{formatCurrency(line.total)}</Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                  <Box sx={{ width: 120, textAlign: 'left' }}>Subtotal:</Box>
                  <Box sx={{ width: 100 }}>{formatCurrency(viewInvoice.sub_total)}</Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                  <Box sx={{ width: 120, textAlign: 'left' }}>Tax:</Box>
                  <Box sx={{ width: 100 }}>{formatCurrency(viewInvoice.tax_total)}</Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', fontWeight: 600, fontSize: 18 }}>
                  <Box sx={{ width: 120, textAlign: 'left' }}>Total:</Box>
                  <Box sx={{ width: 100 }}>{formatCurrency(viewInvoice.total)}</Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </ViewModal>
      )}
    </>
  );
}
