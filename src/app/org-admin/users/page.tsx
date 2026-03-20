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
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CancelIcon from '@mui/icons-material/Cancel';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PageHeader from '@/components/ui/PageHeader';
import EnhancedDataTable, { TableColumn, TableAction } from '@/components/tables/EnhancedDataTable';
import ViewModal from '@/components/ui/ViewModal';
import UniversalModal from '@/components/ui/UniversalModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import orgAdminService, { CorporateUserRow } from '@/services/orgAdminService';

export default function OrgAdminUsersPage() {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<CorporateUserRow | null>(null);
  const [editUser, setEditUser] = useState<CorporateUserRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<CorporateUserRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    password: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['org-admin', 'users'],
    queryFn: async () => {
      const { data: res } = await orgAdminService.listCorporateUsers();
      return res;
    },
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data: res } = await orgAdminService.listRoles();
      return res;
    },
  });

  const createMutation = useMutation({
    mutationFn: (userData: Partial<CorporateUserRow>) =>
      orgAdminService.createCorporateUser(userData).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-admin', 'users'] });
      setSuccess('User created successfully');
      setAddOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Create failed';
      setError(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CorporateUserRow> }) =>
      orgAdminService.updateCorporateUser(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-admin', 'users'] });
      setSuccess('User updated successfully');
      setEditUser(null);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Update failed';
      setError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orgAdminService.deleteCorporateUser(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-admin', 'users'] });
      setSuccess('User deleted successfully');
      setDeleteUser(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Delete failed';
      setError(msg);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => orgAdminService.suspendCorporateUser(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-admin', 'users'] });
      setSuccess('User suspended successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Suspend failed';
      setError(msg);
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: (id: string) => orgAdminService.unsuspendCorporateUser(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-admin', 'users'] });
      setSuccess('User activated successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Activate failed';
      setError(msg);
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      orgAdminService.approveCorporateUser(id, approved).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['org-admin', 'users'] });
      setSuccess(variables.approved ? 'User approved successfully' : 'User rejected successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Approval failed';
      setError(msg);
    },
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => orgAdminService.banCorporateUser(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-admin', 'users'] });
      setSuccess('User banned successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Ban failed';
      setError(msg);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => orgAdminService.unbanCorporateUser(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-admin', 'users'] });
      setSuccess('User unbanned successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Unban failed';
      setError(msg);
    },
  });

  const users = data?.users ?? [];
  const roles = rolesData?.roles ?? [];

  const resetForm = () => {
    setFormData({ username: '', email: '', role: '', password: '' });
  };

  const handleEdit = (user: CorporateUserRow) => {
    setEditUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      password: '',
    });
  };

  const handleSave = () => {
    if (editUser) {
      updateMutation.mutate({ id: editUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns: TableColumn<CorporateUserRow>[] = [
    {
      id: 'username',
      label: 'Username',
      sortable: true,
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      id: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => {
        const roleName = row.role || '—';
        return (
          <Chip
            label={roleName}
            size="small"
            color={
              roleName.toLowerCase().includes('admin') ? 'primary' :
              roleName.toLowerCase().includes('manager') ? 'secondary' : 'default'
            }
          />
        );
      },
    },
    {
      id: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row) => {
        if (row.is_banned) {
          return <Chip label="Banned" size="small" color="error" />;
        }
        if (!row.is_approved) {
          return <Chip label="Pending" size="small" color="warning" />;
        }
        return (
          <Chip
            label={row.is_active ? 'Active' : 'Suspended'}
            size="small"
            color={row.is_active ? 'success' : 'default'}
          />
        );
      },
      width: 120,
    },
  ];

  const actions: TableAction<CorporateUserRow>[] = [
    {
      type: 'view',
      onClick: (user) => setViewUser(user),
    },
    {
      type: 'edit',
      onClick: handleEdit,
      show: (user) => !user.is_banned,
    },
    {
      type: 'custom',
      label: 'Approve',
      icon: <CheckCircleIcon fontSize="small" />,
      onClick: (user) => approveMutation.mutate({ id: user.id, approved: true }),
      color: 'success',
      show: (user) => !!(!user.is_approved && !user.is_banned),
    },
    {
      type: 'custom',
      label: 'Reject',
      icon: <CancelIcon fontSize="small" />,
      onClick: (user) => approveMutation.mutate({ id: user.id, approved: false }),
      color: 'error',
      show: (user) => !!(!user.is_approved && !user.is_banned),
    },
    {
      type: 'custom',
      label: 'Suspend',
      icon: <BlockIcon fontSize="small" />,
      onClick: (user) => suspendMutation.mutate(user.id),
      color: 'warning',
      show: (user) => !!(user.is_active && user.is_approved && !user.is_banned),
    },
    {
      type: 'custom',
      label: 'Activate',
      icon: <CheckCircleIcon fontSize="small" />,
      onClick: (user) => unsuspendMutation.mutate(user.id),
      color: 'success',
      show: (user) => !!(!user.is_active && user.is_approved && !user.is_banned),
    },
    {
      type: 'custom',
      label: 'Ban',
      icon: <GavelIcon fontSize="small" />,
      onClick: (user) => banMutation.mutate(user.id),
      color: 'error',
      divider: true,
      show: (user) => !user.is_banned,
    },
    {
      type: 'custom',
      label: 'Unban',
      icon: <CheckCircleIcon fontSize="small" />,
      onClick: (user) => unbanMutation.mutate(user.id),
      color: 'success',
      show: (user) => user.is_banned === true,
    },
    {
      type: 'delete',
      onClick: (user) => setDeleteUser(user),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Organisation Users"
        subtitle="Manage users in your organisation"
        breadcrumbs={[
          { label: 'Org Admin', href: '/org-admin' },
          { label: 'Users' },
        ]}
        icon={<GroupIcon sx={{ fontSize: 26 }} />}
        color="#1565C0"
        actions={
          <Button variant="contained" onClick={() => setAddOpen(true)}>
            Add User
          </Button>
        }
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
        rows={users}
        actions={actions}
        loading={isLoading}
        onSearch={(query) => console.log('Search:', query)}
        searchPlaceholder="Search users..."
      />

      {/* View Modal */}
      {viewUser && (
        <ViewModal
          open={!!viewUser}
          onClose={() => setViewUser(null)}
          title={`User: ${viewUser.username}`}
        >
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Username
              </Typography>
              <Typography variant="body1">{viewUser.username}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{viewUser.email}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Role
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={viewUser.role || '—'}
                  size="small"
                  color={
                    viewUser.role?.toLowerCase().includes('admin') ? 'primary' :
                    viewUser.role?.toLowerCase().includes('manager') ? 'secondary' : 'default'
                  }
                />
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Approval Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={viewUser.is_approved ? 'Approved' : 'Pending Approval'}
                  size="small"
                  color={viewUser.is_approved ? 'success' : 'warning'}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Active Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={viewUser.is_active ? 'Active' : 'Suspended'}
                  size="small"
                  color={viewUser.is_active ? 'success' : 'default'}
                />
              </Box>
            </Box>

            {viewUser.is_banned && (
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

      {/* Add/Edit Modal */}
      <UniversalModal
        open={addOpen || !!editUser}
        onClose={() => {
          setAddOpen(false);
          setEditUser(null);
          resetForm();
        }}
        title={editUser ? 'Edit User' : 'Add User'}
        maxWidth="sm"
      >
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            sx={{ mb: 2 }}
            disabled={!!editUser}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            sx={{ mb: 2 }}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.name}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>

          {!editUser && (
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              onClick={() => {
                setAddOpen(false);
                setEditUser(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </UniversalModal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{deleteUser?.username}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUser(null)}>Cancel</Button>
          <Button
            onClick={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
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
