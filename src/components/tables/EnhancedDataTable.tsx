'use client';

import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import ActionMenu, { ActionMenuItem } from '@/components/ui/ActionMenu';
import EmptyState from '@/components/ui/EmptyState';
import { usePermissions } from '@/hooks/usePermissions';

export interface TableColumn<T> {
  id: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

export interface TableAction<T> {
  type: 'view' | 'edit' | 'delete' | 'print' | 'download' | 'custom';
  label?: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  color?: 'default' | 'error' | 'warning' | 'success';
  requireRole?: 'user' | 'manager' | 'admin';
  show?: (row: T) => boolean;
}

interface EnhancedDataTableProps<T extends object> {
  columns: TableColumn<T>[];
  rows: T[];
  actions?: TableAction<T>[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  getRowId?: (row: T) => string | number;
  emptyMessage?: string;
  stickyHeader?: boolean;
  dense?: boolean;
}

export default function EnhancedDataTable<T extends object>({
  columns,
  rows,
  actions = [],
  loading,
  total,
  page = 0,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  onSort,
  onSearch,
  searchPlaceholder = 'Search...',
  selectable,
  onSelectionChange,
  getRowId = (row) => ((row as Record<string, unknown>).id as string | number) ?? '',
  emptyMessage,
  stickyHeader = true,
  dense = false,
}: EnhancedDataTableProps<T>) {
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const { canEdit, canDelete } = usePermissions();

  function handleSort(field: string) {
    const isAsc = orderBy === field && order === 'asc';
    const newOrder: 'asc' | 'desc' = isAsc ? 'desc' : 'asc';
    setOrderBy(field);
    setOrder(newOrder);
    onSort?.(field, newOrder);
  }

  function handleSelectAll(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      const newSelected = new Set(rows.map(getRowId));
      setSelected(newSelected);
      onSelectionChange?.(rows);
    } else {
      setSelected(new Set());
      onSelectionChange?.([]);
    }
  }

  function handleSelectRow(row: T) {
    const id = getRowId(row);
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
    onSelectionChange?.(rows.filter((r) => newSelected.has(getRowId(r))));
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'view': return <VisibilityIcon fontSize="small" />;
      case 'edit': return <EditIcon fontSize="small" />;
      case 'delete': return <DeleteIcon fontSize="small" />;
      case 'print': return <PrintIcon fontSize="small" />;
      case 'download': return <DownloadIcon fontSize="small" />;
      default: return null;
    }
  };

  const buildActionMenu = (row: T): ActionMenuItem[] => {
    return actions
      .filter(action => {
        if (action.show && !action.show(row)) return false;
        if (action.type === 'edit' && !canEdit()) return false;
        if (action.type === 'delete' && !canDelete()) return false;
        return true;
      })
      .map(action => ({
        label: action.label || action.type.charAt(0).toUpperCase() + action.type.slice(1),
        icon: action.icon || getActionIcon(action.type),
        onClick: () => action.onClick(row),
        color: action.color,
        divider: action.type === 'delete',
      }));
  };

  const hasActions = actions.length > 0;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {onSearch && (
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>
      )}

      <TableContainer sx={{ maxHeight: stickyHeader ? 520 : undefined }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.size > 0 && selected.size < rows.length}
                    checked={rows.length > 0 && selected.size === rows.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{ fontWeight: 600, width: col.width }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell sx={{ fontWeight: 600, width: 80 }} align="center">
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)}>
                  <EmptyState message={emptyMessage || 'No data available'} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const id = getRowId(row);
                const isSelected = selected.has(id);
                const actionMenu = buildActionMenu(row);

                return (
                  <TableRow key={id} hover selected={isSelected}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(row)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.id}>
                        {col.render ? col.render(row) : (row as Record<string, unknown>)[col.id] as React.ReactNode}
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell align="center">
                        {actionMenu.length > 0 && <ActionMenu actions={actionMenu} />}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {(onPageChange || onPageSizeChange) && (
        <TablePagination
          component="div"
          count={total ?? rows.length}
          page={page}
          onPageChange={(_, newPage) => onPageChange?.(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </Paper>
  );
}
