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
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization } from '@/hooks/useHRM';
import { Organization } from '@/services/hrmService';

const OrganizationManagement: React.FC = () => {
  const { data: organizations, isLoading } = useOrganizations();
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'delete'>('view');

  const handleOpenModal = (type: 'create' | 'edit' | 'view' | 'delete', org?: Organization) => {
    setModalType(type);
    setSelectedOrganization(org || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrganization(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Organization Management
      </Typography>

      {/* Add Organization Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpenModal('create')}
      >
        Add Organization
      </Button>

      {/* Organization Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Head</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {organizations?.map((org) => (
            <TableRow key={org.id}>
              <TableCell>{org.name}</TableCell>
              <TableCell>{org.code}</TableCell>
              <TableCell>{org.head}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleOpenModal('view', org)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenModal('edit', org)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenModal('delete', org)}>
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
          {modalType === 'create' && 'Create Organization'}
          {modalType === 'edit' && 'Edit Organization'}
          {modalType === 'view' && 'View Organization'}
          {modalType === 'delete' && 'Delete Organization'}
        </DialogTitle>
        <DialogContent>
          {/* Content to populate the modal based on modalType */}
          {modalType === 'view' && (
            <Box>
              <Typography>Name: {selectedOrganization?.name}</Typography>
              <Typography>Code: {selectedOrganization?.code}</Typography>
              <Typography>Head: {selectedOrganization?.head}</Typography>
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

export default OrganizationManagement;