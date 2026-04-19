'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CategoryIcon from '@mui/icons-material/Category';
import StraightenIcon from '@mui/icons-material/Straighten';
import inventoryService, { Category, UnitOfMeasure } from '@/services/inventoryService';

interface CategoryManagementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function CategoryManagementModal({
  open,
  onClose,
  onSuccess,
}: CategoryManagementModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingUom, setEditingUom] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showUomForm, setShowUomForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
  });

  // UoM form state
  const [uomForm, setUomForm] = useState({
    name: '',
    symbol: '',
    factor: '1.0',
    rounding: 'HALF_UP' as 'UP' | 'DOWN' | 'HALF_UP',
    is_base: false,
    is_active: true,
  });

  useEffect(() => {
    if (open) {
      loadCategories();
      loadUoms();
    }
  }, [open]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getCategories();
      setCategories(response.data.data || response.data.results || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUoms = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getUnitsOfMeasure();
      setUoms(response.data.data || response.data.results || []);
    } catch (err) {
      console.error('Failed to load UoMs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Category CRUD operations
  const handleSaveCategory = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (editingCategory) {
        await inventoryService.updateCategory(editingCategory, categoryForm);
        setMessage({ type: 'success', text: 'Category updated successfully' });
      } else {
        await inventoryService.createCategory(categoryForm);
        setMessage({ type: 'success', text: 'Category created successfully' });
      }
      await loadCategories();
      resetCategoryForm();
      onSuccess?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save category' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active,
    });
    setEditingCategory(category.id);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    setLoading(true);
    setMessage(null);
    try {
      await inventoryService.deleteCategory(id);
      setMessage({ type: 'success', text: 'Category deleted successfully' });
      await loadCategories();
      onSuccess?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete category' });
    } finally {
      setLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      is_active: true,
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  // UoM CRUD operations
  const handleSaveUom = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // For UoM, we need a category_id - using a default or first available
      const payload = {
        ...uomForm,
        category_id: uoms[0]?.category_id || '', // You may want to add a category selector
      };
      
      if (editingUom) {
        await inventoryService.updateUnitOfMeasure(editingUom, payload);
        setMessage({ type: 'success', text: 'Unit of measure updated successfully' });
      } else {
        await inventoryService.createUnitOfMeasure(payload);
        setMessage({ type: 'success', text: 'Unit of measure created successfully' });
      }
      await loadUoms();
      resetUomForm();
      onSuccess?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save unit of measure' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUom = (uom: UnitOfMeasure) => {
    setUomForm({
      name: uom.name,
      symbol: uom.symbol,
      factor: uom.factor,
      rounding: uom.rounding,
      is_base: uom.is_base,
      is_active: uom.is_active,
    });
    setEditingUom(uom.id);
    setShowUomForm(true);
  };

  const handleDeleteUom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this unit of measure?')) return;
    
    setLoading(true);
    setMessage(null);
    try {
      await inventoryService.deleteUnitOfMeasure(id);
      setMessage({ type: 'success', text: 'Unit of measure deleted successfully' });
      await loadUoms();
      onSuccess?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete unit of measure' });
    } finally {
      setLoading(false);
    }
  };

  const resetUomForm = () => {
    setUomForm({
      name: '',
      symbol: '',
      factor: '1.0',
      rounding: 'HALF_UP',
      is_base: false,
      is_active: true,
    });
    setEditingUom(null);
    setShowUomForm(false);
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (categoryForm.name && !editingCategory) {
      const slug = categoryForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setCategoryForm((prev) => ({ ...prev, slug }));
    }
  }, [categoryForm.name, editingCategory]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Manage Categories & Units
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<CategoryIcon />} iconPosition="start" label="Categories" />
          <Tab icon={<StraightenIcon />} iconPosition="start" label="Units of Measure" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 400 }}>
        {message && (
          <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {/* Categories Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              {categories.length} categories
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCategoryForm(true)}
              disabled={loading}
            >
              New Category
            </Button>
          </Box>

          {showCategoryForm && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Slug"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    required
                    disabled={loading}
                    helperText="URL-friendly identifier"
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  multiline
                  rows={2}
                  disabled={loading}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveCategory}
                    disabled={loading || !categoryForm.name || !categoryForm.slug}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={resetCategoryForm}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No categories found. Create one to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {category.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {category.slug}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {category.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={category.is_active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCategory(category)}
                            disabled={loading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={loading}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Units of Measure Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              {uoms.length} units of measure
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowUomForm(true)}
              disabled={loading}
            >
              New Unit
            </Button>
          </Box>

          {showUomForm && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                {editingUom ? 'Edit Unit of Measure' : 'New Unit of Measure'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Unit Name"
                    value={uomForm.name}
                    onChange={(e) => setUomForm({ ...uomForm, name: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="e.g., Kilogram, Meter"
                  />
                  <TextField
                    fullWidth
                    label="Symbol"
                    value={uomForm.symbol}
                    onChange={(e) => setUomForm({ ...uomForm, symbol: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="e.g., kg, m"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Conversion Factor"
                    type="number"
                    value={uomForm.factor}
                    onChange={(e) => setUomForm({ ...uomForm, factor: e.target.value })}
                    disabled={loading}
                    helperText="Multiplier to base unit"
                  />
                  <TextField
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    label="Rounding"
                    value={uomForm.rounding}
                    onChange={(e) => setUomForm({ ...uomForm, rounding: e.target.value as any })}
                    disabled={loading}
                  >
                    <option value="UP">Up</option>
                    <option value="DOWN">Down</option>
                    <option value="HALF_UP">Half Up</option>
                  </TextField>
                  <TextField
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    label="Type"
                    value={uomForm.is_base ? 'base' : 'derived'}
                    onChange={(e) => setUomForm({ ...uomForm, is_base: e.target.value === 'base' })}
                    disabled={loading}
                  >
                    <option value="base">Base Unit</option>
                    <option value="derived">Derived Unit</option>
                  </TextField>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveUom}
                    disabled={loading || !uomForm.name || !uomForm.symbol}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={resetUomForm}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Factor</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && uoms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : uoms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No units of measure found. Create one to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  uoms.map((uom) => (
                    <TableRow key={uom.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {uom.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={uom.symbol} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {uom.factor}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={uom.is_base ? 'Base' : 'Derived'}
                          size="small"
                          color={uom.is_base ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={uom.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={uom.is_active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUom(uom)}
                            disabled={loading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUom(uom.id)}
                            disabled={loading}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}
