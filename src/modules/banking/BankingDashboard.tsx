'use client';

import React, { useState } from 'react';
import { Box, Button, Grid, Tab, Tabs, Chip } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions, ActionMenuItem } from '@/components/ui/ActionMenu';
import ContextAwareButton from '@/components/ui/ContextAwareButton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';
import { useBankAccounts, useBankTransactions, useInternalTransfers } from '@/hooks/useBanking';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { BankAccount, BankTransaction, InternalTransfer } from '@/services/bankingService';
import bankingService from '@/services/bankingService';
import BankAccountModal from './modals/BankAccountModal';
import TransactionModal from './modals/TransactionModal';
import ReconciliationModal from './modals/ReconciliationModal';
import TransferModal from './modals/TransferModal';

export default function BankingDashboard() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [reconciliationModalOpen, setReconciliationModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BankAccount | BankTransaction | InternalTransfer | null>(null);
  
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

  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const transactionParams = statusFilter !== 'all' ? { status: statusFilter } : undefined;
  const { data: accountsData, isLoading: accountsLoading, refetch: refetchAccounts } = useBankAccounts();
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useBankTransactions(transactionParams);
  const { data: transfersData, isLoading: transfersLoading, refetch: refetchTransfers } = useInternalTransfers();

  const buttonContexts = {
    0: { label: 'New Account', onClick: () => { setSelectedItem(null); setAccountModalOpen(true); } },
    1: { label: 'New Transaction', onClick: () => { setSelectedItem(null); setTransactionModalOpen(true); } },
    2: { label: 'New Reconciliation', onClick: () => { setSelectedItem(null); setReconciliationModalOpen(true); } },
    3: { label: 'New Transfer', onClick: () => { setSelectedItem(null); setTransferModalOpen(true); } },
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await bankingService.deleteBankAccount(id);
      showSuccess('Bank account deleted successfully');
      refetchAccounts();
    } catch (error) {
      showError('Failed to delete bank account');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await bankingService.deleteTransaction(id);
      showSuccess('Transaction deleted successfully');
      refetchTransactions();
    } catch (error) {
      showError('Failed to delete transaction');
    }
  };

  const getAccountActions = (account: BankAccount): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(account); setAccountModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(account); setAccountModalOpen(true); }),
    {
      label: account.is_default ? 'Remove as Default' : 'Set as Default',
      onClick: async () => {
        try {
          await bankingService.updateBankAccount(account.id, { is_default: !account.is_default });
          showSuccess(`Account ${account.is_default ? 'removed from' : 'set as'} default`);
          refetchAccounts();
        } catch (error) {
          showError('Failed to update account');
        }
      },
    },
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Bank Account',
        message: `Are you sure you want to delete ${account.account_name}? This action cannot be undone.`,
        severity: 'error',
        onConfirm: () => handleDeleteAccount(account.id),
      });
    }),
  ];

  const getTransactionActions = (transaction: BankTransaction): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(transaction); setTransactionModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(transaction); setTransactionModalOpen(true); }),
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Transaction',
        message: 'Are you sure you want to delete this transaction?',
        severity: 'error',
        onConfirm: () => handleDeleteTransaction(transaction.id),
      });
    }),
  ];

  const ACCOUNT_COLUMNS: TableColumn<BankAccount>[] = [
    { id: 'bank_name', label: 'Bank', sortable: true, minWidth: 150 },
    { id: 'account_name', label: 'Account Name', sortable: true, minWidth: 180 },
    { id: 'account_number', label: 'Account Number', minWidth: 140 },
    { id: 'currency', label: 'Currency', minWidth: 80 },
    { id: 'balance', label: 'Balance', align: 'right', format: (val) => val ? formatCurrency(Number(val)) : '—' },
    { id: 'is_default', label: 'Default', format: (val) => val ? <StatusChip status="yes" /> : '—' },
    { id: 'is_active', label: 'Status', format: (val) => <StatusChip status={val ? 'active' : 'inactive'} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getAccountActions(row)} /> },
  ];

  const TRANSACTION_COLUMNS: TableColumn<BankTransaction>[] = [
    { id: 'transaction_date', label: 'Date', sortable: true, format: (val) => formatDate(val as string) },
    { id: 'bank_account_name', label: 'Account', sortable: true, minWidth: 150 },
    { id: 'transaction_type', label: 'Type', format: (val) => <StatusChip status={val as string} /> },
    { id: 'amount', label: 'Amount', align: 'right', sortable: true, format: (val) => formatCurrency(Number(val)) },
    { id: 'reference', label: 'Reference', minWidth: 120 },
    { id: 'narration', label: 'Narration', minWidth: 180 },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getTransactionActions(row)} /> },
  ];

  const TRANSFER_COLUMNS: TableColumn<InternalTransfer>[] = [
    { id: 'transfer_date', label: 'Date', sortable: true, format: (val) => formatDate(val as string) },
    { id: 'from_account_name', label: 'From Account', sortable: true, minWidth: 150 },
    { id: 'to_account_name', label: 'To Account', sortable: true, minWidth: 150 },
    { id: 'amount', label: 'Amount', align: 'right', format: (val) => formatCurrency(Number(val)) },
    { id: 'reference', label: 'Reference', minWidth: 120 },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
  ];

  const transactionFilters = ['all', 'pending', 'confirmed', 'reversed'];
  const totalBalance = accountsData?.results.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
  const activeAccounts = accountsData?.results.filter(acc => acc.is_active).length || 0;

  return (
    <Box>
      <PageHeader
        title="Banking"
        subtitle="Manage bank accounts, transactions, and reconciliations"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Banking' }]}
        icon={<AccountBalanceIcon sx={{ fontSize: 26 }} />}
        color="#2E7D32"
        actions={
          <>
            <Button startIcon={<DownloadIcon />} variant="outlined" size="small">Export</Button>
            <ContextAwareButton contexts={buttonContexts} currentContext={String(tab)} />
          </>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Balance" value={formatCurrency(totalBalance)} trend="up" color="#2E7D32" loading={accountsLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Active Accounts" value={activeAccounts} trend="up" color="#1976D2" loading={accountsLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Transactions" value={transactionsData?.count ?? 0} trend="up" color="#F2A40E" loading={transactionsLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Transfers" value={transfersData?.results.length ?? 0} trend="up" color="#9C27B0" loading={transfersLoading} />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="Accounts" />
        <Tab label="Transactions" />
        <Tab label="Reconciliation" />
        <Tab label="Transfers" />
      </Tabs>

      {tab === 0 && (
        <DataTable
          columns={ACCOUNT_COLUMNS}
          rows={accountsData?.results ?? []}
          loading={accountsLoading}
          total={accountsData?.count ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={setSearch}
          searchPlaceholder="Search accounts..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No bank accounts found. Add your first account to get started."
        />
      )}

      {tab === 1 && (
        <DataTable
          columns={TRANSACTION_COLUMNS}
          rows={transactionsData?.results ?? []}
          loading={transactionsLoading}
          total={transactionsData?.count ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={setSearch}
          searchPlaceholder="Search transactions..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No transactions found."
          toolbar={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {transactionFilters.map((filter) => (
                <Chip
                  key={filter}
                  label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                  size="small"
                  onClick={() => setStatusFilter(filter)}
                  color={statusFilter === filter ? 'primary' : 'default'}
                  variant={statusFilter === filter ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          }
        />
      )}

      {tab === 2 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Button variant="contained" onClick={() => setReconciliationModalOpen(true)}>
            Start Reconciliation
          </Button>
        </Box>
      )}

      {tab === 3 && (
        <DataTable
          columns={TRANSFER_COLUMNS}
          rows={transfersData?.results ?? []}
          loading={transfersLoading}
          total={transfersData?.results.length ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          getRowId={(row) => String(row.id)}
          emptyMessage="No transfers found."
        />
      )}

      <BankAccountModal
        open={accountModalOpen}
        onClose={() => { setAccountModalOpen(false); setSelectedItem(null); }}
        account={selectedItem as BankAccount}
        onSuccess={() => {
          refetchAccounts();
          setAccountModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Account updated successfully' : 'Account created successfully');
        }}
      />

      <TransactionModal
        open={transactionModalOpen}
        onClose={() => { setTransactionModalOpen(false); setSelectedItem(null); }}
        transaction={selectedItem as BankTransaction}
        onSuccess={() => {
          refetchTransactions();
          setTransactionModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Transaction updated successfully' : 'Transaction created successfully');
        }}
      />

      <ReconciliationModal
        open={reconciliationModalOpen}
        onClose={() => { setReconciliationModalOpen(false); }}
        onSuccess={() => {
          setReconciliationModalOpen(false);
          showSuccess('Reconciliation completed successfully');
        }}
      />

      <TransferModal
        open={transferModalOpen}
        onClose={() => { setTransferModalOpen(false); setSelectedItem(null); }}
        transfer={selectedItem as InternalTransfer}
        onSuccess={() => {
          refetchTransfers();
          setTransferModalOpen(false);
          setSelectedItem(null);
          showSuccess('Transfer created successfully');
        }}
      />

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

      <NotificationToast
        open={notification.open}
        onClose={hideNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
}
