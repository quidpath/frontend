'use client';

import React, { useRef, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, IconButton, MenuItem,
  TextField, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import analyticsService from '@/services/analyticsService';
import { downloadBlob } from '@/utils/downloadBlob';

type Entity = 'customers' | 'vendors' | 'expenses' | 'products';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
}

const ENTITY_INFO: Record<Entity, { label: string; requiredCols: string[]; optionalCols: string[] }> = {
  customers: {
    label: 'Customers',
    requiredCols: ['name', 'email'],
    optionalCols: ['phone', 'address', 'city', 'country', 'tax_id'],
  },
  vendors: {
    label: 'Vendors',
    requiredCols: ['name'],
    optionalCols: ['email', 'phone', 'address', 'city', 'country', 'tax_id', 'category'],
  },
  expenses: {
    label: 'Expenses',
    requiredCols: ['date', 'category', 'description', 'amount'],
    optionalCols: ['vendor', 'payment_method', 'reference', 'tax_amount'],
  },
  products: {
    label: 'Products',
    requiredCols: ['name', 'sku', 'unit_price', 'cost_price'],
    optionalCols: ['barcode', 'category', 'description', 'quantity_on_hand', 'reorder_point', 'unit_of_measure'],
  },
};

export default function ImportModal({ open, onClose }: ImportModalProps) {
  const [entity, setEntity] = useState<Entity>('customers');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const info = ENTITY_INFO[entity];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
      setError('');
    }
  };

  const handleDownloadTemplate = async () => {
    setTemplateLoading(true);
    try {
      const res = await analyticsService.downloadTemplate(entity);
      downloadBlob(res.data, `${entity}_import_template.xlsx`);
    } catch {
      setError('Failed to download template');
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const importFns: Record<Entity, (f: File) => Promise<any>> = {
        customers: analyticsService.importCustomers,
        vendors: analyticsService.importVendors,
        expenses: analyticsService.importExpenses,
        products: analyticsService.importProducts,
      };
      const res = await importFns[entity](file);
      const d = (res.data as any)?.data;
      setResult(d);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Import failed. Please check your file format.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>Import Data</Typography>
        <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
          <TextField
            select
            fullWidth
            label="Entity Type"
            value={entity}
            onChange={(e) => { setEntity(e.target.value as Entity); setFile(null); setResult(null); setError(''); }}
          >
            {(Object.keys(ENTITY_INFO) as Entity[]).map((k) => (
              <MenuItem key={k} value={k}>{ENTITY_INFO[k].label}</MenuItem>
            ))}
          </TextField>

          {/* Column info */}
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Required columns: {info.requiredCols.join(', ')}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Optional columns: {info.optionalCols.join(', ')}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={templateLoading ? <CircularProgress size={14} /> : <DownloadIcon />}
            onClick={handleDownloadTemplate}
            disabled={templateLoading}
          >
            Download Template
          </Button>

          <Divider />

          {/* File upload */}
          <Box
            sx={{
              border: '2px dashed',
              borderColor: file ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: file ? 'primary.50' : 'transparent',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.50' },
            }}
            onClick={() => fileRef.current?.click()}
          >
            <FileUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {file ? file.name : 'Click to select CSV or Excel file'}
            </Typography>
            {file && (
              <Typography variant="caption" color="primary.main">
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {result && (
            <Alert severity={result.errors.length > 0 ? 'warning' : 'success'}>
              <Typography variant="body2" fontWeight={600}>
                Import complete: {result.created} created, {result.skipped} skipped
              </Typography>
              {result.errors.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    Errors ({result.errors.length}):
                  </Typography>
                  {result.errors.slice(0, 5).map((e, i) => (
                    <Typography key={i} variant="caption" display="block" color="error.main">
                      {e}
                    </Typography>
                  ))}
                  {result.errors.length > 5 && (
                    <Typography variant="caption" color="text.secondary">
                      ...and {result.errors.length - 5} more
                    </Typography>
                  )}
                </Box>
              )}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!file || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <FileUploadIcon />}
        >
          {loading ? 'Importing...' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
