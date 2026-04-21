'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, MenuItem } from '@mui/material';
import UniversalModal from '@/components/ui/UniversalModal';
import { Contact } from '@/services/crmService';
import crmService from '@/services/crmService';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  contact?: Contact | null;
  onSuccess: () => void;
}

const CONTACT_TYPES = ['lead', 'prospect', 'customer'];
const CONTACT_SOURCES = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Event', 'Other'];

export default function ContactModal({ open, onClose, contact, onSuccess }: ContactModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',       // FK UUID (optional)
    is_active: true,
    description: '',   // was "notes"
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        is_active: contact.is_active ?? true,
        description: contact.description || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        is_active: true,
        description: '',
      });
    }
    setErrors({});
  }, [contact, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'is_active' ? value === 'true' : value,
    }));
    if (errors[field]) {
      setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (contact) {
        await crmService.updateContact(contact.id, formData);
      } else {
        await crmService.createContact(formData);
      }
      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving contact:', error);
      setErrors({ submit: 'Failed to save contact. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={contact ? 'Edit Contact' : 'New Contact'}
      subtitle={contact ? `Editing ${contact.first_name} ${contact.last_name}` : 'Add a new contact to your CRM'}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {contact ? 'Update' : 'Create'} Contact
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="First Name" value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)} error={!!errors.first_name} helperText={errors.first_name} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Last Name" value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)} error={!!errors.last_name} helperText={errors.last_name} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} error={!!errors.email} helperText={errors.email} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Company" value={formData.company} onChange={(e) => handleChange('company', e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth select label="Status" value={formData.is_active ? 'active' : 'inactive'} onChange={(e) => handleChange('is_active', e.target.value === 'active' ? 'true' : 'false')}>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Notes" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} multiline rows={3} />
        </Grid>
        {errors.submit && (
          <Grid size={{ xs: 12 }}>
            <div style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.submit}</div>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
