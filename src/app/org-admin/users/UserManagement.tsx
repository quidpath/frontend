import React, { useState } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { useEmployees } from '@/hooks/useHRM';
import { Employee as User } from '@/services/hrmService';

const UserManagement: React.FC = () => {
  const { data: users, isLoading } = useEmployees();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'delete'>('view');

  const handleOpenModal = (type: 'create' | 'edit' | 'view' | 'delete', user?: User) => {
    setModalType(type);
    setSelectedUser(user || null);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
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
          {/* Content to populate the modal based on modalType */}
          {modalType === 'view' && (
            <Box>
              <Typography>Name: {selectedUser?.full_name}</Typography>
              <Typography>Email: {selectedUser?.email}</Typography>
              <Typography>Role: {selectedUser?.position}</Typography>
            </Box>
          )}
          {/* Forms for Create/Edit/Delete can go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
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