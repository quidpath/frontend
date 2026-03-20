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
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'lead' as 'lead' | 'prospect' | 'customer',
    status: 'active' as 'active' | 'inactive',
    source: '',
    notes: '',
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        type: contact.type || 'lead',
        status: contact.status || 'active',
        source: contact.source || '',
        notes: contact.notes || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        type: 'lead',
        status: 'active',
        source: '',
        notes: '',
      });
    }
    setErrors({});
  }, [contact, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
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
      subtitle={contact ? `Editing ${contact.name}` : 'Add a new contact to your CRM'}
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
          <TextField fullWidth label="Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} error={!!errors.name} helperText={errors.name} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} error={!!errors.email} helperText={errors.email} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} error={!!errors.phone} helperText={errors.phone} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Company" value={formData.company} onChange={(e) => handleChange('company', e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select label="Type" value={formData.type} onChange={(e) => handleChange('type', e.target.value)}>
            {CONTACT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select label="Status" value={formData.status} onChange={(e) => handleChange('status', e.target.value)}>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select label="Source" value={formData.source} onChange={(e) => handleChange('source', e.target.value)}>
            <MenuItem value=""><em>Select source</em></MenuItem>
            {CONTACT_SOURCES.map((source) => (
              <MenuItem key={source} value={source}>{source}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} multiline rows={3} />
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
