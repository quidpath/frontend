'use client';

import { useState } from 'react';
import { Box, Grid, Tab, Tabs, Button } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DownloadIcon from '@mui/icons-material/Download';
import { useSearchParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import ContextAwareButton from '@/components/ui/ContextAwareButton';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';
import { useSalesSummary, usePurchasesSummary, useExpensesSummary } from '@/hooks/useFinance';
import { formatCurrency } from '@/utils/formatters';
import { PRIMARY_TABS, SECONDARY_TABS, type PrimaryTab } from './_constants';
import OverviewSection from './_sections/OverviewSection';
import SalesSection from './_sections/SalesSection';
import PurchasesSection from './_sections/PurchasesSection';
import BankingSection from './_sections/BankingSection';
import ExpensesSection from './_sections/ExpensesSection';
import PettyCashSection from './_sections/PettyCashSection';
import TaxSection from './_sections/TaxSection';

// Per sub-tab action button config
const SUB_ACTION: Record<string, { label: string }> = {
  transactions: { label: 'New Journal Entry' },
  'chart-of-accounts': { label: 'New Account' },
  'balance-sheet': { label: 'Generate Report' },
  'profit-loss': { label: 'Generate Report' },
  invoices: { label: 'New Invoice' },
  quotes: { label: 'New Quote' },
  customers: { label: 'New Customer' },
  bills: { label: 'New Bill' },
  'purchase-orders': { label: 'New Purchase Order' },
  suppliers: { label: 'New Supplier' },
  'bank-accounts': { label: 'Add Bank Account' },
  reconciliation: { label: 'Start Reconciliation' },
  transfers: { label: 'New Transfer' },
  'all-expenses': { label: 'Log Expense' },
  'pending-approval': { label: 'Log Expense' },
  reimbursements: { label: 'Log Expense' },
  'cash-log': { label: 'Add Entry' },
  receipts: { label: 'Upload Receipt' },
  reconcile: { label: 'Reconcile' },
  'sales-tax-report': { label: 'Generate Report' },
  'filing-history': { label: 'File Return' },
};

export default function FinancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const rawTab = searchParams.get('tab') as PrimaryTab | null;
  const primaryTab: PrimaryTab = PRIMARY_TABS.find(t => t.id === rawTab) ? rawTab! : 'overview';
  const subTabs = SECONDARY_TABS[primaryTab];
  const rawSub = searchParams.get('sub') ?? '';
  const subTab = subTabs.find(s => s.id === rawSub)?.id ?? subTabs[0]?.id ?? '';

  const [addOpen, setAddOpen] = useState(false);

  const { data: sales, isLoading: salesLoading } = useSalesSummary();
  const { data: purchases, isLoading: purchasesLoading } = usePurchasesSummary();
  const { data: expenses, isLoading: expensesLoading } = useExpensesSummary();

  function setPrimary(tab: PrimaryTab) {
    router.push(`/finance?tab=${tab}&sub=${SECONDARY_TABS[tab][0]?.id ?? ''}`);
  }
  function setSub(sub: string) {
    router.push(`/finance?tab=${primaryTab}&sub=${sub}`);
  }

  const actionCfg = SUB_ACTION[subTab] ?? { label: 'New' };
  const buttonContexts = { current: { label: actionCfg.label, onClick: () => setAddOpen(true) } };
  const notify = (msg: string, sev: 'success' | 'error' = 'success') =>
    sev === 'success' ? showSuccess(msg) : showError(msg);
  const sectionProps = { subTab, notify, addOpen, setAddOpen };

  return (
    <Box>
      <PageHeader
        title="Finance"
        subtitle="Financial management — invoices, banking, expenses, and reporting"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Finance' }]}
        icon={<AccountBalanceIcon sx={{ fontSize: 26 }} />}
        color="#2E7D32"
        actions={
          <>
            <Button startIcon={<DownloadIcon />} variant="outlined" size="small">Export</Button>
            <ContextAwareButton contexts={buttonContexts} currentContext="current" />
          </>
        }
      />

      {/* ── KPI Metric Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total Invoiced"
            value={sales ? formatCurrency(sales.total_invoiced ?? 0) : '—'}
            trend="up" color="#2E7D32" loading={salesLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total Paid"
            value={sales ? formatCurrency(sales.total_paid ?? 0) : '—'}
            trend="up" color="#1565C0" loading={salesLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total Expenses"
            value={expenses ? formatCurrency(expenses.total_expenses ?? 0) : '—'}
            trend="down" color="#F57C00" loading={expensesLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Outstanding Bills"
            value={purchases ? formatCurrency(purchases.total_unpaid ?? 0) : '—'}
            trend="neutral" color="#C62828" loading={purchasesLoading}
          />
        </Grid>
      </Grid>

      {/* ── Primary horizontal nav ── */}
      <Tabs
        value={primaryTab}
        onChange={(_, v) => setPrimary(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 0, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {PRIMARY_TABS.map(t => <Tab key={t.id} value={t.id} label={t.label} />)}
      </Tabs>

      {/* ── Secondary sub-nav ── */}
      <Tabs
        value={subTab}
        onChange={(_, v) => setSub(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2.5,
          '& .MuiTab-root': { fontSize: 12, minHeight: 36, py: 0, textTransform: 'none', color: 'text.secondary' },
          '& .Mui-selected': { color: 'primary.main', fontWeight: 600 },
          '& .MuiTabs-indicator': { height: 2 },
        }}
      >
        {subTabs.map(s => <Tab key={s.id} value={s.id} label={s.label} />)}
      </Tabs>

      {/* ── Section content ── */}
      {primaryTab === 'overview'  && <OverviewSection  {...sectionProps} />}
      {primaryTab === 'sales'     && <SalesSection     {...sectionProps} />}
      {primaryTab === 'purchases' && <PurchasesSection {...sectionProps} />}
      {primaryTab === 'banking'   && <BankingSection   {...sectionProps} />}
      {primaryTab === 'expenses'  && <ExpensesSection  {...sectionProps} />}
      {primaryTab === 'pettycash' && <PettyCashSection {...sectionProps} />}
      {primaryTab === 'tax'       && <TaxSection       {...sectionProps} />}

      <NotificationToast
        open={notification.open}
        onClose={hideNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
}
