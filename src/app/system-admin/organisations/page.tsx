'use client';

import React, { useState } from 'react';
import {
  Box,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import GavelIcon from '@mui/icons-material/Gavel';
import PageHeader from '@/components/ui/PageHeader';
import EnhancedDataTable, { TableColumn, TableAction } from '@/components/tables/EnhancedDataTable';
import ViewModal from '@/components/ui/ViewModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService, { CorporateRow } from '@/services/adminService';
import { formatDate } from '@/utils/formatters';

export default function SystemAdminOrganisationsPage() {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewOrg, setViewOrg] = useState<CorporateRow | null>(null);
  const [editOrg, setEditOrg] = useState<CorporateRow | null>(null);
  const [deleteOrg, setDeleteOrg] = useState<CorporateRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['system-admin', 'corporates'],
    queryFn: async () => {
      const { data: res } = await adminService.listCorporates();
      return res;
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      adminService.approveCorporate(id, approved).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['system-admin', 'corporates'] });
      setSuccess(variables.approved ? 'Organisation approved successfully' : 'Organisation rejected successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Action failed';
      setError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCorporate(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['system-admin', 'corporates'] });
      setSuccess('Organisation deleted successfully');
      setDeleteOrg(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Delete failed';
      setError(msg);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminService.suspendCorporate(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['system-admin', 'corporates'] });
      setSuccess('Organisation suspended successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Suspend failed';
      setError(msg);
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: (id: string) => adminService.unsuspendCorporate(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['system-admin', 'corporates'] });
      setSuccess('Organisation activated successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Activate failed';
      setError(msg);
    },
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => adminService.banCorporate(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['system-admin', 'corporates'] });
      setSuccess('Organisation banned successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Ban failed';
      setError(msg);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => adminService.unbanCorporate(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['system-admin', 'corporates'] });
      setSuccess('Organisation unbanned successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Unban failed';
      setError(msg);
    },
  });

  const corporates = data?.corporates ?? [];

  const columns: TableColumn<CorporateRow>[] = [
    {
      id: 'name',
      label: 'Organisation Name',
      sortable: true,
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      render: (row) => row.email || '—',
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        if (row.is_banned) {
          return <Chip label="Banned" size="small" color="error" />;
        }
        if (row.is_approved) {
          return <Chip label="Approved" size="small" color="success" />;
        }
        if (row.is_disapproved) {
          return <Chip label="Rejected" size="small" color="error" />;
        }
        return <Chip label="Pending" size="small" color="warning" />;
      },
      width: 120,
    },
    {
      id: 'is_active',
      label: 'Active',
      render: (row) => (
        <Chip
          label={row.is_active ? 'Active' : 'Suspended'}
          size="small"
          color={row.is_active ? 'success' : 'default'}
        />
      ),
      width: 100,
    },
  ];

  const actions: TableAction<CorporateRow>[] = [
    {
      type: 'view',
      onClick: (org) => setViewOrg(org),
    },
    {
      type: 'edit',
      onClick: (org) => setEditOrg(org),
      show: (org) => !org.is_banned,
    },
    {
      type: 'custom',
      label: 'Approve',
      icon: <CheckCircleIcon fontSize="small" />,
      onClick: (org) => approveMutation.mutate({ id: String(org.id), approved: true }),
      color: 'success',
      show: (org) => !org.is_approved && !org.is_disapproved && !org.is_banned,
    },
    {
      type: 'custom',
      label: 'Reject',
      icon: <CancelIcon fontSize="small" />,
      onClick: (org) => approveMutation.mutate({ id: String(org.id), approved: false }),
      color: 'error',
      show: (org) => !org.is_approved && !org.is_disapproved && !org.is_banned,
    },
    {
      type: 'custom',
      label: 'Suspend',
      icon: <BlockIcon fontSize="small" />,
      onClick: (org) => suspendMutation.mutate(String(org.id)),
      color: 'warning',
      show: (org) => org.is_active === true && org.is_approved && !org.is_banned,
    },
    {
      type: 'custom',
      label: 'Activate',
      icon: <CheckCircleIcon fontSize="small" />,
      onClick: (org) => unsuspendMutation.mutate(String(org.id)),
      color: 'success',
      show: (org) => org.is_active === false && org.is_approved && !org.is_banned,
    },
    {
      type: 'custom',
      label: 'Ban',
      icon: <GavelIcon fontSize="small" />,
      onClick: (org) => banMutation.mutate(String(org.id)),
      color: 'error',
      divider: true,
      show: (org) => !org.is_banned,
    },
    {
      type: 'custom',
      label: 'Unban',
      icon: <CheckCircleIcon fontSize="small" />,
      onClick: (org) => unbanMutation.mutate(String(org.id)),
      color: 'success',
      show: (org) => org.is_banned === true,
    },
    {
      type: 'delete',
      onClick: (org) => setDeleteOrg(org),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Organisations"
        subtitle="Approve or reject organisation registrations"
        breadcrumbs={[
          { label: 'System Admin', href: '/system-admin' },
          { label: 'Organisations' },
        ]}
        icon={<AdminPanelSettingsIcon sx={{ fontSize: 26 }} />}
        color="#7B1FA2"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <EnhancedDataTable
        columns={columns}
        rows={corporates}
        actions={actions}
        loading={isLoading}
        onSearch={(query) => console.log('Search:', query)}
        searchPlaceholder="Search organisations..."
      />

      {/* View Modal */}
      {viewOrg && (
        <ViewModal
          open={!!viewOrg}
          onClose={() => setViewOrg(null)}
          title={`Organisation: ${viewOrg.name}`}
        >
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">{viewOrg.name}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{viewOrg.email || '—'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {viewOrg.is_approved && <Chip label="Approved" size="small" color="success" />}
                {viewOrg.is_disapproved && <Chip label="Rejected" size="small" color="error" />}
                {!viewOrg.is_approved && !viewOrg.is_disapproved && (
                  <Chip label="Pending" size="small" color="warning" />
                )}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Active Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={viewOrg.is_active ? 'Active' : 'Suspended'}
                  size="small"
                  color={viewOrg.is_active ? 'success' : 'default'}
                />
              </Box>
            </Box>

            {viewOrg.is_banned && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ban Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label="Banned" size="small" color="error" />
                </Box>
              </Box>
            )}
          </Box>
        </ViewModal>
      )}

      {/* Edit Modal */}
      {editOrg && (
        <Dialog open={!!editOrg} onClose={() => setEditOrg(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Organisation</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Editing: <strong>{editOrg.name}</strong>
            </Typography>
            <Typography variant="body2">
              Edit functionality coming soon. For now, use approve/reject, suspend/activate, or ban/unban actions.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOrg(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteOrg} onClose={() => setDeleteOrg(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Organisation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteOrg?.name}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOrg(null)}>Cancel</Button>
          <Button
            onClick={() => deleteOrg && deleteMutation.mutate(String(deleteOrg.id))}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
