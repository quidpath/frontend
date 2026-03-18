'use client';

import React, { useState } from 'react';
import { Box, Chip } from '@mui/material';
import EnhancedDataTable, { TableColumn, TableAction } from '@/components/tables/EnhancedDataTable';
import ViewModal from '@/components/ui/ViewModal';
import { Expense } from '@/services/accountingService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { printElement, downloadAsPDF } from '@/utils/print';

interface ExpensesTableProps {
  expenses: Expense[];
  loading?: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onRefresh: () => void;
}

export default function ExpensesTable({
  expenses,
  loading,
  onEdit,
  onDelete,
  onRefresh,
}: ExpensesTableProps) {
  const [viewExpense, setViewExpense] = useState<Expense | null>(null);

  const columns: TableColumn<Expense>[] = [
    {
      id: 'date',
      label: 'Date',
      sortable: true,
      render: (row) => formatDate(row.date),
      width: 120,
    },
    {
      id: 'vendor',
      label: 'Vendor',
      sortable: true,
    },
    {
      id: 'category',
      label: 'Category',
      sortable: true,
      width: 150,
    },
    {
      id: 'description',
      label: 'Description',
      sortable: true,
    },
    {
      id: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row) => formatCurrency(row.amount),
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
            row.status === 'approved' ? 'success' :
            row.status === 'rejected' ? 'error' :
            row.status === 'paid' ? 'info' : 'warning'
          }
        />
      ),
      width: 100,
    },
  ];

  const actions: TableAction<Expense>[] = [
    {
      type: 'view',
      onClick: (expense) => setViewExpense(expense),
    },
    {
      type: 'edit',
      onClick: onEdit,
      show: (expense) => expense.status === 'pending',
    },
    {
      type: 'print',
      onClick: (expense) => {
        setViewExpense(expense);
        setTimeout(() => printElement('expense-view', `Expense ${expense.id}`), 500);
      },
    },
    {
      type: 'download',
      onClick: async (expense) => {
        try {
          await downloadAsPDF(
            `/api/accounting/expense/download/`,
            `expense-${expense.id}.pdf`,
            { id: expense.id }
          );
        } catch (error) {
          console.error('Download failed:', error);
        }
      },
    },
    {
      type: 'delete',
      onClick: onDelete,
      show: (expense) => expense.status === 'pending',
    },
  ];

  return (
    <>
      <EnhancedDataTable
        columns={columns}
        rows={expenses}
        actions={actions}
        loading={loading}
        onSearch={(query) => console.log('Search:', query)}
        searchPlaceholder="Search expenses..."
        selectable
        onSelectionChange={(selected) => console.log('Selected:', selected)}
      />

      {viewExpense && (
        <ViewModal
          open={!!viewExpense}
          onClose={() => setViewExpense(null)}
          title="Expense Details"
          onPrint={() => printElement('expense-view', `Expense ${viewExpense.id}`)}
          onDownload={async () => {
            try {
              await downloadAsPDF(
                `/api/accounting/expense/download/`,
                `expense-${viewExpense.id}.pdf`,
                { id: viewExpense.id }
              );
            } catch (error) {
              console.error('Download failed:', error);
            }
          }}
        >
          <Box id="expense-view">
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Box sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>
                    Expense Details
                  </Box>
                  <Box sx={{ color: 'text.secondary' }}>
                    Date: {formatDate(viewExpense.date)}
                  </Box>
                </Box>
                <Box>
                  <Chip
                    label={viewExpense.status}
                    color={
                      viewExpense.status === 'approved' ? 'success' :
                      viewExpense.status === 'rejected' ? 'error' :
                      viewExpense.status === 'paid' ? 'info' : 'warning'
                    }
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Box sx={{ fontWeight: 600, mb: 0.5 }}>Vendor</Box>
                  <Box>{viewExpense.vendor}</Box>
                </Box>
                <Box>
                  <Box sx={{ fontWeight: 600, mb: 0.5 }}>Category</Box>
                  <Box>{viewExpense.category}</Box>
                </Box>
                {viewExpense.payment_method && (
                  <Box>
                    <Box sx={{ fontWeight: 600, mb: 0.5 }}>Payment Method</Box>
                    <Box>{viewExpense.payment_method}</Box>
                  </Box>
                )}
                {viewExpense.reference && (
                  <Box>
                    <Box sx={{ fontWeight: 600, mb: 0.5 }}>Reference</Box>
                    <Box>{viewExpense.reference}</Box>
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ fontWeight: 600, mb: 0.5 }}>Description</Box>
                <Box>{viewExpense.description}</Box>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>Amount:</Box>
                  <Box>{formatCurrency(viewExpense.amount)}</Box>
                </Box>
                {viewExpense.tax_amount && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>Tax:</Box>
                    <Box>{formatCurrency(viewExpense.tax_amount)}</Box>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 18, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box>Total:</Box>
                  <Box>{formatCurrency(viewExpense.amount + (viewExpense.tax_amount || 0))}</Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </ViewModal>
      )}
    </>
  );
}
