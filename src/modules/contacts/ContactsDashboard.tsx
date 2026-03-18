'use client';

import React, { useState } from 'react';
import { Box, Button, Grid, Chip } from '@mui/material';
import ContactsIcon from '@mui/icons-material/Contacts';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions, ActionMenuItem } from '@/components/ui/ActionMenu';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';
import { useContacts as useUniversalContacts } from '@/hooks/useContacts';
import { formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { UniversalContact } from '@/services/contactsService';
import contactsService from '@/services/contactsService';
import UniversalContactModal from './modals/UniversalContactModal';

export default function ContactsDashboard() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<UniversalContact | null>(null);
  
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

  const contactParams = typeFilter !== 'all' ? { type: typeFilter } : undefined;
  const { data: contactsData, isLoading: contactsLoading, refetch: refetchContacts } = useUniversalContacts(contactParams);

  const handleDeleteContact = async (id: string) => {
    try {
      await contactsService.deleteContact(id);
      showSuccess('Contact deleted successfully');
      refetchContacts();
    } catch (error) {
      showError('Failed to delete contact');
    }
  };

  const getContactActions = (contact: UniversalContact): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedContact(contact); setContactModalOpen(true); }),
    commonActions.edit(() => { setSelectedContact(contact); setContactModalOpen(true); }),
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

  const CONTACT_COLUMNS: TableColumn<UniversalContact>[] = [
    { id: 'name', label: 'Name', sortable: true, minWidth: 160 },
    { id: 'email', label: 'Email', sortable: true, minWidth: 180 },
    { id: 'phone', label: 'Phone', minWidth: 130 },
    { id: 'company', label: 'Company', sortable: true, minWidth: 150 },
    { id: 'type', label: 'Type', format: (val) => <StatusChip status={val as string} /> },
    { id: 'city', label: 'City', minWidth: 120 },
    { id: 'country', label: 'Country', minWidth: 120 },
    { id: 'is_active', label: 'Status', format: (val) => <StatusChip status={val ? 'active' : 'inactive'} /> },
    { id: 'created_at', label: 'Created', format: (val) => formatDate(val as string) },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getContactActions(row)} /> },
  ];

  const contactFilters = ['all', 'customer', 'vendor', 'supplier', 'employee', 'other'];
  const totalContacts = contactsData?.count || 0;
  const activeContacts = contactsData?.results.filter(c => c.is_active).length || 0;
  const customerCount = contactsData?.results.filter(c => c.type === 'customer').length || 0;
  const vendorCount = contactsData?.results.filter(c => c.type === 'vendor').length || 0;

  return (
    <Box>
      <PageHeader
        title="Contacts"
        subtitle="Universal contact management for customers, vendors, suppliers, and employees"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Contacts' }]}
        icon={<ContactsIcon sx={{ fontSize: 26 }} />}
        color="#9C27B0"
        actions={
          <>
            <Button startIcon={<DownloadIcon />} variant="outlined" size="small">Export</Button>
            <Button variant="contained" onClick={() => { setSelectedContact(null); setContactModalOpen(true); }}>
              New Contact
            </Button>
          </>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Contacts" value={totalContacts} trend="up" color="#9C27B0" loading={contactsLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Active Contacts" value={activeContacts} trend="up" color="#2E7D32" loading={contactsLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Customers" value={customerCount} trend="up" color="#1976D2" loading={contactsLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Vendors" value={vendorCount} trend="up" color="#F2A40E" loading={contactsLoading} />
        </Grid>
      </Grid>

      <DataTable
        columns={CONTACT_COLUMNS}
        rows={contactsData?.results ?? []}
        loading={contactsLoading}
        total={contactsData?.count ?? 0}
        page={page}
        pageSize={25}
        onPageChange={setPage}
        onSearch={setSearch}
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
                onClick={() => setTypeFilter(filter)}
                color={typeFilter === filter ? 'primary' : 'default'}
                variant={typeFilter === filter ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        }
      />

      <UniversalContactModal
        open={contactModalOpen}
        onClose={() => { setContactModalOpen(false); setSelectedContact(null); }}
        contact={selectedContact}
        onSuccess={() => {
          refetchContacts();
          setContactModalOpen(false);
          setSelectedContact(null);
          showSuccess(selectedContact ? 'Contact updated successfully' : 'Contact created successfully');
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
