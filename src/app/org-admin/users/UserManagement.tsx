import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { useEmployees } from '@/hooks/useHRM';
import { Employee as User } from '@/services/hrmService';
import orgAdminService, { RoleOption } from '@/services/orgAdminService';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

interface CreateUserForm {
  username: string;
  email: string;
  role: string;
  phone_number?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  zip_code?: string;
}

const UserManagement: React.FC = () => {
  const { data: users, isLoading } = useEmployees();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'delete'>('view');
  const [formData, setFormData] = useState<CreateUserForm>({
    username: '',
    email: '',
    role: '',
  });
  const [formError, setFormError] = useState<string>('');

  // Fetch available roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await orgAdminService.listRoles();
      return response.data;
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserForm) => orgAdminService.createCorporateUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      handleCloseModal();
      setFormError('');
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.error || 'Failed to create user');
    },
  });

  const handleOpenModal = (type: 'create' | 'edit' | 'view' | 'delete', user?: User) => {
    setModalType(type);
    setSelectedUser(user || null);
    setModalOpen(true);
    setFormError('');
    if (type === 'create') {
      setFormData({
        username: '',
        email: '',
        role: '',
      });
    }
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setFormError('');
  };

  const handleInputChange = (field: keyof CreateUserForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = () => {
    if (!formData.username || !formData.email || !formData.role) {
      setFormError('Username, email, and role are required');
      return;
    }
    createUserMutation.mutate(formData);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {/* Add User Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpenModal('create')}
      >
        Add User
      </Button>

      {/* User Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users?.results?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.position}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleOpenModal('view', user)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenModal('edit', user)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenModal('delete', user)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* MODAL */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modalType === 'create' && 'Create User'}
          {modalType === 'edit' && 'Edit User'}
          {modalType === 'view' && 'View User'}
          {modalType === 'delete' && 'Delete User'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          {modalType === 'view' && (
            <Box>
              <Typography>Name: {selectedUser?.full_name}</Typography>
              <Typography>Email: {selectedUser?.email}</Typography>
              <Typography>Role: {selectedUser?.position}</Typography>
            </Box>
          )}

          {modalType === 'create' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                fullWidth
              />
              <TextField
                select
                label="Role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                required
                fullWidth
                disabled={rolesLoading}
              >
                {rolesLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  rolesData?.roles?.map((role: RoleOption) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <TextField
                label="Phone Number (Optional)"
                value={formData.phone_number || ''}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                fullWidth
              />
              <TextField
                label="Country (Optional)"
                value={formData.country || ''}
                onChange={(e) => handleInputChange('country', e.target.value)}
                fullWidth
              />
              <TextField
                label="State (Optional)"
                value={formData.state || ''}
                onChange={(e) => handleInputChange('state', e.target.value)}
                fullWidth
              />
              <TextField
                label="City (Optional)"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                fullWidth
              />
              <TextField
                label="Address (Optional)"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                fullWidth
              />
              <TextField
                label="Zip Code (Optional)"
                value={formData.zip_code || ''}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                fullWidth
              />
              <Alert severity="info">
                A random password will be generated and sent to the user's email.
              </Alert>
            </Box>
          )}

          {modalType === 'delete' && (
            <Typography>
              Are you sure you want to delete {selectedUser?.full_name}?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          {modalType === 'create' && (
            <Button
              color="primary"
              variant="contained"
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? <CircularProgress size={20} /> : 'Create User'}
            </Button>
          )}
          {modalType === 'delete' && (
            <Button color="secondary" variant="contained">
              Confirm Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;