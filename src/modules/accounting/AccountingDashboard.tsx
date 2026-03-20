'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Tab,
  Tabs,
  Typography,
  Chip,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions, ActionMenuItem } from '@/components/ui/ActionMenu';
import ContextAwareButton from '@/components/ui/ContextAwareButton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';
import { useInvoices, useAccountingSummary, useJournalEntries, useExpenses } from '@/hooks/useAccounting';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { Invoice, JournalEntry, Expense } from '@/services/accountingService';
import accountingService from '@/services/accountingService';
import Link from 'next/link';
import InvoiceModal from './modals/InvoiceModal';
import ExpenseModal from './modals/ExpenseModal';
import JournalModal from './modals/JournalModal';

export default function AccountingDashboard() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Invoice | Expense | JournalEntry | null>(null);
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    severity?: 'warning' | 'error' | 'info';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Notifications
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Data fetching with filters
  const invoiceParams = statusFilter !== 'all' ? { status: statusFilter } : undefined;
  const { data: summary, isLoading: summaryLoading } = useAccountingSummary();
  const { data: invoicesData, isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoices(invoiceParams);
  const { data: expensesData, isLoading: expensesLoading, refetch: refetchExpenses } = useExpenses();
  const { data: journalsData, isLoading: journalsLoading, refetch: refetchJournals } = useJournalEntries();

  // Context-aware button configuration
  const buttonContexts = {
    0: { label: 'New Invoice', onClick: () => { setSelectedItem(null); setInvoiceModalOpen(true); } },
    1: { label: 'New Quote', onClick: () => showError('Quote feature coming soon') },
    2: { label: 'New Bill', onClick: () => showError('Bill feature coming soon') },
    3: { label: 'New Purchase Order', onClick: () => showError('PO feature coming soon') },
    4: { label: 'New Expense', onClick: () => { setSelectedItem(null); setExpenseModalOpen(true); } },
    5: { label: 'New Journal Entry', onClick: () => { setSelectedItem(null); setJournalModalOpen(true); } },
  };

  // Delete handlers
  const handleDeleteInvoice = async (id: string) => {
    try {
      await accountingService.deleteInvoice(id);
      showSuccess('Invoice deleted successfully');
      refetchInvoices();
    } catch (error) {
      showError('Failed to delete invoice');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await accountingService.deleteExpense(id);
      showSuccess('Expense deleted successfully');
      refetchExpenses();
    } catch (error) {
      showError('Failed to delete expense');
    }
  };

  const handleDeleteJournal = async (id: string) => {
    try {
      await accountingService.deleteJournalEntry(id);
      showSuccess('Journal entry deleted successfully');
      refetchJournals();
    } catch (error) {
      showError('Failed to delete journal entry');
    }
  };

  // Send invoice
  const handleSendInvoice = async (id: string) => {
    try {
      await accountingService.sendInvoice(id);
      showSuccess('Invoice sent successfully');
      refetchInvoices();
    } catch (error) {
      showError('Failed to send invoice');
    }
  };

  // Post/unpost journal
  const handlePostJournal = async (id: string) => {
    try {
      await accountingService.postJournalEntry(id);
      showSuccess('Journal entry posted successfully');
      refetchJournals();
    } catch (error) {
      showError('Failed to post journal entry');
    }
  };

  // Invoice actions
  const getInvoiceActions = (invoice: Invoice): ActionMenuItem[] => [
    commonActions.view(() => {
      window.location.href = `/accounting/invoices/${invoice.id}`;
    }),
    commonActions.edit(() => {
      setSelectedItem(invoice);
      setInvoiceModalOpen(true);
    }),
    {
      label: 'Send Invoice',
      icon: <SendIcon fontSize="small" />,
      onClick: () => {
        setConfirmDialog({
          open: true,
          title: 'Send Invoice',
          message: `Send invoice ${invoice.number} to ${invoice.customer}?`,
          severity: 'info',
          onConfirm: () => handleSendInvoice(invoice.id),
        });
      },
      disabled: invoice.status === 'paid',
    },
    commonActions.duplicate(() => {
      showError('Duplicate feature coming soon');
    }),
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Invoice',
        message: `Are you sure you want to delete invoice ${invoice.number}? This action cannot be undone.`,
        severity: 'error',
        onConfirm: () => handleDeleteInvoice(invoice.id),
      });
    }),
  ];

  // Expense actions
  const getExpenseActions = (expense: Expense): ActionMenuItem[] => [
    commonActions.view(() => {
      setSelectedItem(expense);
      setExpenseModalOpen(true);
    }),
    commonActions.edit(() => {
      setSelectedItem(expense);
      setExpenseModalOpen(true);
    }),
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Expense',
        message: `Are you sure you want to delete this expense? This action cannot be undone.`,
        severity: 'error',
        onConfirm: () => handleDeleteExpense(expense.id),
      });
    }),
  ];

  // Journal actions
  const getJournalActions = (journal: JournalEntry): ActionMenuItem[] => [
    commonActions.view(() => {
      setSelectedItem(journal);
      setJournalModalOpen(true);
    }),
    commonActions.edit(() => {
      if (journal.is_posted) {
        showError('Cannot edit posted journal entries');
        return;
      }
      setSelectedItem(journal);
      setJournalModalOpen(true);
    }),
    {
      label: journal.is_posted ? 'Unpost' : 'Post',
      icon: <SendIcon fontSize="small" />,
      onClick: () => {
        setConfirmDialog({
          open: true,
          title: journal.is_posted ? 'Unpost Entry' : 'Post Entry',
          message: journal.is_posted 
            ? 'Unpost this journal entry? It will become editable again.'
            : 'Post this journal entry? It will be locked from editing.',
          severity: 'warning',
          onConfirm: () => handlePostJournal(journal.id),
        });
      },
    },
    commonActions.duplicate(() => {
      showError('Duplicate feature coming soon');
    }),
    commonActions.delete(() => {
      if (journal.is_posted) {
        showError('Cannot delete posted journal entries');
        return;
      }
      setConfirmDialog({
        open: true,
        title: 'Delete Journal Entry',
        message: 'Are you sure you want to delete this journal entry? This action cannot be undone.',
        severity: 'error',
        onConfirm: () => handleDeleteJournal(journal.id),
      });
    }),
  ];

  // Table columns
  const INVOICE_COLUMNS: TableColumn<Invoice>[] = [
    {
      id: 'number',
      label: 'Invoice #',
      sortable: true,
      format: (val, row) => (
        <Link href={`/accounting/invoices/${row.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="body2" fontWeight={600} color="primary.main">
            {val as string}
          </Typography>
        </Link>
      ),
    },
    {
      id: 'customer',
      label: 'Client',
      sortable: true,
      minWidth: 160,
    },
    {
      id: 'total',
      label: 'Amount',
      align: 'right',
      sortable: true,
      format: (val) => (
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(Number(val))}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      format: (val) => <StatusChip status={val as string} />,
    },
    {
      id: 'date',
      label: 'Issue Date',
      format: (val) => formatDate(val as string),
    },
    {
      id: 'due_date',
      label: 'Due Date',
      format: (val) => formatDate(val as string),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      format: (_, row) => <ActionMenu actions={getInvoiceActions(row)} />,
    },
  ];

  const EXPENSE_COLUMNS: TableColumn<Expense>[] = [
    {
      id: 'date',
      label: 'Date',
      sortable: true,
      format: (val) => formatDate(val as string),
    },
    {
      id: 'vendor',
      label: 'Vendor',
      sortable: true,
      minWidth: 160,
    },
    {
      id: 'category',
      label: 'Category',
      sortable: true,
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
    },
    {
      id: 'amount',
      label: 'Amount',
      align: 'right',
      sortable: true,
      format: (val) => (
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(Number(val))}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      format: (val) => <StatusChip status={val as string} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      format: (_, row) => <ActionMenu actions={getExpenseActions(row)} />,
    },
  ];

  const JOURNAL_COLUMNS: TableColumn<JournalEntry>[] = [
    { id: 'reference', label: 'Reference', sortable: true, minWidth: 120 },
    { id: 'date', label: 'Date', format: (val) => formatDate(val as string) },
    { id: 'description', label: 'Description', minWidth: 200 },
    { 
      id: 'is_posted', 
      label: 'Status', 
      format: (val) => <StatusChip status={val ? 'posted' : 'draft'} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      format: (_, row) => <ActionMenu actions={getJournalActions(row)} />,
    },
  ];

  // Status filter buttons
  const statusFilters = ['all', 'draft', 'sent', 'paid', 'overdue'];

  return (
    <Box>
      <PageHeader
        title="Accounting"
        subtitle="Financial overview, invoices, expenses, and journal entries"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Accounting' }]}
        icon={<AccountBalanceIcon sx={{ fontSize: 26 }} />}
        color="#2E7D32"
        actions={
          <>
            <Button startIcon={<DownloadIcon />} variant="outlined" size="small">
              Export
            </Button>
            <ContextAwareButton
              contexts={buttonContexts}
              currentContext={String(tab)}
            />
          </>
        }
      />

      {/* Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total Revenue"
            value={summary ? formatCurrency(summary.total_revenue ?? 0) : '—'}
            change={12.4}
            changeLabel="vs last month"
            trend="up"
            color="#2E7D32"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Outstanding"
            value={summary ? formatCurrency(summary.total_outstanding ?? 0) : '—'}
            trend="neutral"
            color="#1565C0"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Overdue"
            value={summary ? formatCurrency(summary.total_overdue ?? 0) : '—'}
            change={-18}
            changeLabel="vs last week"
            trend="down"
            color="#E53E3E"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Paid This Month"
            value={summary ? formatCurrency(summary.paid_this_month ?? 0) : '—'}
            change={8.2}
            changeLabel="vs last month"
            trend="up"
            color="#F2A40E"
            loading={summaryLoading}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="Invoices" />
        <Tab label="Quotes" />
        <Tab label="Bills" />
        <Tab label="Purchase Orders" />
        <Tab label="Expenses" />
        <Tab label="Journal Entries" />
      </Tabs>

      {/* Invoices Tab */}
      {tab === 0 && (
        <DataTable
          columns={INVOICE_COLUMNS}
          rows={invoicesData?.invoices ?? []}
          loading={invoicesLoading}
          total={invoicesData?.total ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={setSearch}
          searchPlaceholder="Search invoices..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No invoices found. Create your first invoice to get started."
          toolbar={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {statusFilters.map((status) => (
                <Chip
                  key={status}
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  size="small"
                  onClick={() => setStatusFilter(status)}
                  color={statusFilter === status ? 'primary' : 'default'}
                  variant={statusFilter === status ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          }
        />
      )}

      {/* Quotes Tab */}
      {tab === 1 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Quotes feature coming soon. Create and send quotes to customers.</Typography>
        </Box>
      )}

      {/* Bills Tab */}
      {tab === 2 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Vendor bills feature coming soon. Track bills from suppliers.</Typography>
        </Box>
      )}

      {/* Purchase Orders Tab */}
      {tab === 3 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Purchase orders feature coming soon. Manage procurement.</Typography>
        </Box>
      )}

      {/* Expenses Tab */}
      {tab === 4 && (
        <DataTable
          columns={EXPENSE_COLUMNS}
          rows={expensesData?.expenses ?? []}
          loading={expensesLoading}
          total={expensesData?.total ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={setSearch}
          searchPlaceholder="Search expenses..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No expenses found. Track your first expense to get started."
        />
      )}

      {/* Journal Entries Tab */}
      {tab === 5 && (
        <DataTable
          columns={JOURNAL_COLUMNS}
          rows={journalsData?.journal_entries ?? []}
          loading={journalsLoading}
          total={journalsData?.total ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={setSearch}
          searchPlaceholder="Search journal entries..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No journal entries found. Create your first entry to get started."
        />
      )}

      {/* Modals */}
      <InvoiceModal
        open={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setSelectedItem(null);
        }}
        invoice={selectedItem as Invoice}
        onSuccess={() => {
          refetchInvoices();
          setInvoiceModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Invoice updated successfully' : 'Invoice created successfully');
        }}
      />

      <ExpenseModal
        open={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setSelectedItem(null);
        }}
        expense={selectedItem as Expense}
        onSuccess={() => {
          refetchExpenses();
          setExpenseModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Expense updated successfully' : 'Expense created successfully');
        }}
      />

      <JournalModal
        open={journalModalOpen}
        onClose={() => {
          setJournalModalOpen(false);
          setSelectedItem(null);
        }}
        journal={selectedItem as JournalEntry}
        onSuccess={() => {
          refetchJournals();
          setJournalModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Journal entry updated successfully' : 'Journal entry created successfully');
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        severity={confirmDialog.severity}
      />

      {/* Notification Toast */}
      <NotificationToast
        open={notification.open}
        onClose={hideNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
}
