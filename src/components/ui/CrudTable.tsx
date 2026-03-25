'use client';

import React, { useState } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Typography, CircularProgress, Alert, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface CrudTableProps<T extends { id: string }> {
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  addLabel?: string;
  emptyMessage?: string;
}

export default function CrudTable<T extends { id: string }>({
  title,
  subtitle,
  columns,
  rows,
  loading,
  error,
  canAdd = true,
  canEdit = true,
  canDelete = true,
  onAdd,
  onEdit,
  onDelete,
  addLabel = 'Add',
  emptyMessage = 'No items found',
}: CrudTableProps<T>) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        {canAdd && onAdd && (
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
            {addLabel}
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          {emptyMessage}
        </Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>{col.label}</TableCell>
                ))}
                {(canEdit || canDelete) && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key] ?? '—')}
                    </TableCell>
                  ))}
                  {(canEdit || canDelete) && (
                    <TableCell align="right">
                      {canEdit && onEdit && (
                        <IconButton size="small" onClick={() => onEdit(row)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canDelete && onDelete && (
                        <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
