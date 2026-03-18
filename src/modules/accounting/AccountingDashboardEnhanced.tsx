'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions, ActionMenuItem } from '@/components/ui/ActionMenu';
import ContextAwareButton from '@/components/ui/ContextAwareButton';
import { useInvoices, useAccountingSummary, useJournalEntries, useExpenses } from '@/hooks/useAccounting';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { Invoice, JournalEntry, Expense } from '@/services/accountingService';
import Link from 'next/link';
import InvoiceModal from './modals/InvoiceModal';
import ExpenseModal from './modals/ExpenseModal';
import JournalModal from './modals/JournalModal';

export default function AccountingDashboardEnhanced() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Invoice | Expense | JournalEntry | null>(null);

  const { data: summary, isLoading: summaryLoading } = useAccountingSummary();
  const { data: invoicesData, isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoices();
  const { data: expensesData, isLoading: expensesLoading, refetch: refetchExpenses } = useExpenses();
  const { data: journalsData, isLoading: journalsLoading, refetch: refetchJournals } = useJournalEntries();

  // Context-aware button configuration
  const buttonContexts = {
    0: { // Invoices tab
      label: 'New Invoice',
      onClick: () => {
        setSelectedItem(null);
        setInvoiceModalOpen(true);
      },
    },
    1: { // Expenses tab
      label: 'New Expense',
      onClick: () => {
        setSelectedItem(null);
        setExpenseModalOpen(true);
      },
    },
    2: { // Journal Entries tab
      label: 'New Journal Entry',
      onClick: () => {
        setSelectedItem(null);
        setJournalModalOpen(true);
      },
    },
    3: { // Reports tab
      label: 'Generate Report',
      onClick: () => {
        // Open report generation modal
      },
    },
  };

  // Invoice actions
  const getInvoiceActions = (invoice: Invoice): ActionMenuItem[] => [
    commonActions.view(() => {
      // Navigate to invoice detail page
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
        // Send invoice logic
      },
      disabled: invoice.status === 'paid',
    },
    commonActions.duplicate(() => {
      // Duplicate invoice logic
    }),
    commonActions.delete(() => {
      // Delete invoice logic with confirmation
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
      // Delete expense logic
    }),
  ];

  // Journal actions
  const getJournalActions = (journal: JournalEntry): ActionMenuItem[] => [
    commonActions.view(() => {
      setSelectedItem(journal);
      setJournalModalOpen(true);
    }),
    commonActions.edit(() => {
      setSelectedItem(journal);
      setJournalModalOpen(true);
    }),
    {
      label: journal.is_posted ? 'Unpost' : 'Post',
      icon: <SendIcon fontSize="small" />,
      onClick: () => {
        // Post/unpost journal logic
      },
    },
    commonActions.duplicate(() => {
      // Duplicate journal logic
    }),
    commonActions.delete(() => {
      // Delete journal logic
    }),
  ];

  // Table columns with actions
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
            value={summary ? formatCurrency(summary.total_revenue) : '—'}
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
            value={summary ? formatCurrency(summary.total_outstanding) : '—'}
            trend="neutral"
            color="#1565C0"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Overdue"
            value={summary ? formatCurrency(summary.total_overdue) : '—'}
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
            value={summary ? formatCurrency(summary.paid_this_month) : '—'}
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
        <Tab label="Expenses" />
        <Tab label="Journal Entries" />
        <Tab label="Reports" />
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
            <>
              <Button size="small" variant="text" sx={{ fontSize: '0.8125rem' }}>
                All
              </Button>
              {['Draft', 'Sent', 'Paid', 'Overdue'].map((s) => (
                <Button key={s} size="small" variant="text" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                  {s}
                </Button>
              ))}
            </>
          }
        />
      )}

      {/* Expenses Tab */}
      {tab === 1 && (
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
      {tab === 2 && (
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

      {/* Reports Tab */}
      {tab === 3 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Financial reports and analytics coming soon.
          </Typography>
        </Box>
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
        }}
      />
    </Box>
  );
}
