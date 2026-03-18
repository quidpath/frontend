'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '@/components/ui/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import orgAdminService from '@/services/orgAdminService';

export default function OrgAdminLogoPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: logoData, isLoading } = useQuery({
    queryKey: ['org-admin', 'logo'],
    queryFn: async () => {
      const { data } = await orgAdminService.getLogo();
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (base64: string) => orgAdminService.uploadLogo(base64).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-admin', 'logo'] });
      setSuccess('Logo updated.');
      setError(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Upload failed';
      setError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => orgAdminService.deleteLogo().then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-admin', 'logo'] });
      setSuccess('Logo removed.');
      setError(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Delete failed';
      setError(msg);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      uploadMutation.mutate(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const logoUrl = logoData?.logo;

  return (
    <Box>
      <PageHeader
        title="Logo & branding"
        subtitle="Upload or remove your organisation logo"
        breadcrumbs={[
          { label: 'Org Admin', href: '/org-admin' },
          { label: 'Logo' },
        ]}
        icon={<ImageIcon sx={{ fontSize: 26 }} />}
        color="#1565C0"
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      <Paper variant="outlined" sx={{ p: 3, maxWidth: 400 }}>
        {isLoading && <CircularProgress size={24} />}
        {!isLoading && (
          <>
            {logoUrl && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Current logo</Typography>
                <Box
                  component="img"
                  src={logoUrl.startsWith('data:') ? logoUrl : logoUrl}
                  alt="Organisation logo"
                  sx={{ maxWidth: 200, maxHeight: 100, objectFit: 'contain', border: 1, borderColor: 'divider', borderRadius: 1 }}
                />
              </Box>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              startIcon={<UploadIcon />}
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              sx={{ mr: 1 }}
            >
              Upload logo
            </Button>
            {logoUrl && (
              <Button
                startIcon={<DeleteOutlineIcon />}
                variant="outlined"
                color="error"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                Remove logo
              </Button>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
