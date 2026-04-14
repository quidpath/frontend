'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Tab, Tabs, Typography, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
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
import { useContacts, useDeals, useCampaigns, useActivities, useCRMSummary } from '@/hooks/useCRM';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { Contact, Deal, Campaign, Activity } from '@/services/crmService';
import crmService from '@/services/crmService';
import ContactModal from './modals/ContactModal';
import DealModal from './modals/DealModal';
import CampaignModal from './modals/CampaignModal';
import ActivityModal from './modals/ActivityModal';

export default function CRMDashboard() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(0); }, [searchDebounced, statusFilter, tab]);

  const contactParams = {
    page: String(page + 1), page_size: String(pageSize),
    ...(searchDebounced ? { search: searchDebounced } : {}),
    ...(statusFilter !== 'all' ? { type: statusFilter } : {}),
  };
  const dealParams = { page: String(page + 1), page_size: String(pageSize), ...(searchDebounced ? { search: searchDebounced } : {}) };
  const campaignParams = { page: String(page + 1), page_size: String(pageSize), ...(searchDebounced ? { search: searchDebounced } : {}) };
  const activityParams = { page: String(page + 1), page_size: String(pageSize) };
  
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Contact | Deal | Campaign | Activity | null>(null);
  
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

  const { data: summary, isLoading: summaryLoading } = useCRMSummary();
  const { data: contactsData, isLoading: contactsLoading, refetch: refetchContacts } = useContacts(contactParams);
  const { data: dealsData, isLoading: dealsLoading, refetch: refetchDeals } = useDeals(dealParams);
  const { data: campaignsData, isLoading: campaignsLoading, refetch: refetchCampaigns } = useCampaigns(campaignParams);
  const { data: activitiesData, isLoading: activitiesLoading, refetch: refetchActivities } = useActivities(activityParams);

  const buttonContexts = {
    0: { label: 'New Contact', onClick: () => { setSelectedItem(null); setContactModalOpen(true); } },
    1: { label: 'New Deal', onClick: () => { setSelectedItem(null); setDealModalOpen(true); } },
    2: { label: 'New Campaign', onClick: () => { setSelectedItem(null); setCampaignModalOpen(true); } },
    3: { label: 'New Activity', onClick: () => { setSelectedItem(null); setActivityModalOpen(true); } },
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await crmService.deleteContact(id);
      showSuccess('Contact deleted successfully');
      refetchContacts();
    } catch (error) {
      showError('Failed to delete contact');
    }
  };

  const handleDeleteDeal = async (id: string) => {
    try {
      await crmService.deleteDeal(id);
      showSuccess('Deal deleted successfully');
      refetchDeals();
    } catch (error) {
      showError('Failed to delete deal');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await crmService.deleteCampaign(id);
      showSuccess('Campaign deleted successfully');
      refetchCampaigns();
    } catch (error) {
      showError('Failed to delete campaign');
    }
  };

  const getContactActions = (contact: Contact): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(contact); setContactModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(contact); setContactModalOpen(true); }),
    {
      label: contact.type === 'lead' ? 'Convert to Prospect' : 'Convert to Customer',
      onClick: () => {
        setConfirmDialog({
          open: true,
          title: 'Convert Contact',
          message: `Convert ${contact.name} to ${contact.type === 'lead' ? 'prospect' : 'customer'}?`,
          severity: 'info',
          onConfirm: async () => {
            try {
              await crmService.convertContact(contact.id, { type: contact.type === 'lead' ? 'prospect' : 'customer' });
              showSuccess('Contact converted successfully');
              refetchContacts();
            } catch (error) {
              showError('Failed to convert contact');
            }
          },
        });
      },
      disabled: contact.type === 'customer',
    },
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Contact',
        message: `Are you sure you want to delete ${contact.name}? This action cannot be undone.`,
        severity: 'error',
        onConfirm: () => handleDeleteContact(contact.id),
      });
    }),
  ];

  const getDealActions = (deal: Deal): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(deal); setDealModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(deal); setDealModalOpen(true); }),
    {
      label: 'Mark as Won',
      onClick: () => {
        setConfirmDialog({
          open: true,
          title: 'Win Deal',
          message: `Mark "${deal.title}" as won?`,
          severity: 'info',
          onConfirm: async () => {
            try {
              await crmService.winDeal(deal.id);
              showSuccess('Deal marked as won');
              refetchDeals();
            } catch (error) {
              showError('Failed to update deal');
            }
          },
        });
      },
      disabled: deal.status !== 'open',
    },
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Deal',
        message: `Are you sure you want to delete "${deal.title}"?`,
        severity: 'error',
        onConfirm: () => handleDeleteDeal(deal.id),
      });
    }),
  ];

  const getCampaignActions = (campaign: Campaign): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(campaign); setCampaignModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(campaign); setCampaignModalOpen(true); }),
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Campaign',
        message: `Are you sure you want to delete "${campaign.name}"?`,
        severity: 'error',
        onConfirm: () => handleDeleteCampaign(campaign.id),
      });
    }),
  ];

  const CONTACT_COLUMNS: TableColumn<Contact>[] = [
    { id: 'name', label: 'Name', sortable: true, minWidth: 160 },
    { id: 'email', label: 'Email', sortable: true, minWidth: 180 },
    { id: 'phone', label: 'Phone', minWidth: 130 },
    { id: 'company', label: 'Company', sortable: true, minWidth: 150 },
    { id: 'type', label: 'Type', format: (val) => <StatusChip status={val as string} /> },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getContactActions(row)} /> },
  ];

  const DEAL_COLUMNS: TableColumn<Deal>[] = [
    { id: 'title', label: 'Deal', sortable: true, minWidth: 180 },
    { id: 'contact_name', label: 'Contact', sortable: true, minWidth: 150 },
    { id: 'stage', label: 'Stage', format: (val) => <StatusChip status={val as string} /> },
    { id: 'value', label: 'Value', align: 'right', sortable: true, format: (val) => formatCurrency(Number(val)) },
    { id: 'probability', label: 'Probability', format: (val) => `${val}%` },
    { id: 'expected_close', label: 'Expected Close', format: (val) => formatDate(val as string) },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getDealActions(row)} /> },
  ];

  const CAMPAIGN_COLUMNS: TableColumn<Campaign>[] = [
    { id: 'name', label: 'Campaign', sortable: true, minWidth: 180 },
    { id: 'type', label: 'Type', format: (val) => <StatusChip status={val as string} /> },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'budget', label: 'Budget', align: 'right', format: (val) => formatCurrency(Number(val)) },
    { id: 'reach', label: 'Reach', align: 'right' },
    { id: 'conversions', label: 'Conversions', align: 'right' },
    { id: 'start_date', label: 'Start Date', format: (val) => formatDate(val as string) },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getCampaignActions(row)} /> },
  ];

  const ACTIVITY_COLUMNS: TableColumn<Activity>[] = [
    { id: 'type', label: 'Type', format: (val) => <StatusChip status={val as string} /> },
    { id: 'subject', label: 'Subject', sortable: true, minWidth: 200 },
    { id: 'due_date', label: 'Due Date', format: (val) => val ? formatDate(val as string) : '—' },
    { id: 'completed', label: 'Status', format: (val) => <StatusChip status={val ? 'completed' : 'pending'} /> },
    { id: 'created_at', label: 'Created', format: (val) => formatDate(val as string) },
  ];

  const contactFilters = ['all', 'lead', 'prospect', 'customer'];

  return (
    <Box>
      <PageHeader
        title="CRM"
        subtitle="Customer Relationship Management - Contacts, Deals, and Campaigns"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'CRM' }]}
        icon={<PeopleIcon sx={{ fontSize: 26 }} />}
        color="#1976D2"
        actions={
          <>
            <Button startIcon={<DownloadIcon />} variant="outlined" size="small">Export</Button>
            <ContextAwareButton contexts={buttonContexts} currentContext={String(tab)} />
          </>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard 
            label="Total Contacts" 
            value={summary?.total_contacts ?? 0} 
            change={summary?.total_contacts_change}
            changeLabel="vs last month"
            trend={summary?.total_contacts_trend || 'neutral'} 
            color="#1976D2" 
            loading={summaryLoading} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard 
            label="Active Deals" 
            value={summary?.total_deals ?? 0} 
            change={summary?.total_deals_change}
            changeLabel="vs last month"
            trend={summary?.total_deals_trend || 'neutral'} 
            color="#2E7D32" 
            loading={summaryLoading} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard 
            label="Pipeline Value" 
            value={summary ? formatCurrency(summary.pipeline_value ?? 0) : '—'} 
            change={summary?.pipeline_value_change}
            changeLabel="vs last month"
            trend={summary?.pipeline_value_trend || 'neutral'} 
            color="#F2A40E" 
            loading={summaryLoading} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard 
            label="Conversion Rate" 
            value={summary ? `${summary.conversion_rate}%` : '—'} 
            change={summary?.conversion_rate_change}
            changeLabel="vs last month"
            trend={summary?.conversion_rate_trend || 'neutral'} 
            color="#9C27B0" 
            loading={summaryLoading} 
          />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="Contacts" />
        <Tab label="Deals" />
        <Tab label="Campaigns" />
        <Tab label="Activities" />
      </Tabs>

      {tab === 0 && (
        <DataTable
          columns={CONTACT_COLUMNS}
          rows={contactsData?.results ?? []}
          loading={contactsLoading}
          total={contactsData?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          onSearch={(q) => setSearch(q)}
          searchPlaceholder="Search contacts..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No contacts found. Add your first contact to get started."
          toolbar={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {contactFilters.map((filter) => (
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

      {tab === 1 && (
        <DataTable
          columns={DEAL_COLUMNS}
          rows={dealsData?.results ?? []}
          loading={dealsLoading}
          total={dealsData?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          onSearch={(q) => setSearch(q)}
          searchPlaceholder="Search deals..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No deals found. Create your first deal to get started."
        />
      )}

      {tab === 2 && (
        <DataTable
          columns={CAMPAIGN_COLUMNS}
          rows={campaignsData?.results ?? []}
          loading={campaignsLoading}
          total={campaignsData?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          onSearch={(q) => setSearch(q)}
          searchPlaceholder="Search campaigns..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No campaigns found. Launch your first campaign to get started."
        />
      )}

      {tab === 3 && (
        <DataTable
          columns={ACTIVITY_COLUMNS}
          rows={activitiesData?.results ?? []}
          loading={activitiesLoading}
          total={activitiesData?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          getRowId={(row) => String(row.id)}
          emptyMessage="No activities found."
        />
      )}

      <ContactModal
        open={contactModalOpen}
        onClose={() => { setContactModalOpen(false); setSelectedItem(null); }}
        contact={selectedItem as Contact}
        onSuccess={() => {
          refetchContacts();
          setContactModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Contact updated successfully' : 'Contact created successfully');
        }}
      />

      <DealModal
        open={dealModalOpen}
        onClose={() => { setDealModalOpen(false); setSelectedItem(null); }}
        deal={selectedItem as Deal}
        onSuccess={() => {
          refetchDeals();
          setDealModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Deal updated successfully' : 'Deal created successfully');
        }}
      />

      <CampaignModal
        open={campaignModalOpen}
        onClose={() => { setCampaignModalOpen(false); setSelectedItem(null); }}
        campaign={selectedItem as Campaign}
        onSuccess={() => {
          refetchCampaigns();
          setCampaignModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Campaign updated successfully' : 'Campaign created successfully');
        }}
      />

      <ActivityModal
        open={activityModalOpen}
        onClose={() => { setActivityModalOpen(false); setSelectedItem(null); }}
        activity={selectedItem as Activity}
        onSuccess={() => {
          refetchActivities();
          setActivityModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Activity updated successfully' : 'Activity created successfully');
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
