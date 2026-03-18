'use client';

import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  CircularProgress,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { TableColumn } from '@/types';
import EmptyState from './EmptyState';

interface DataTableProps<T extends object> {
  columns: TableColumn<T>[];
  rows: T[];
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
  toolbar?: React.ReactNode;
  stickyHeader?: boolean;
  dense?: boolean;
}

type Order = 'asc' | 'desc';

export default function DataTable<T extends object>({
  columns,
  rows,
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
  toolbar,
  stickyHeader = true,
  dense = false,
}: DataTableProps<T>) {
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<Order>('asc');
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [searchValue, setSearchValue] = useState('');

  function handleSort(field: string) {
    const isAsc = orderBy === field && order === 'asc';
    const newOrder: Order = isAsc ? 'desc' : 'asc';
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

  const numSelected = selected.size;
  const rowCount = rows.length;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {(onSearch || toolbar) && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.default',
          }}
        >
          {onSearch && (
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
              sx={{ width: 260 }}
            />
          )}
          {toolbar && <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>{toolbar}</Box>}
        </Box>
      )}

      <TableContainer sx={{ maxHeight: stickyHeader ? 520 : undefined }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAll}
                    size="small"
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={String(col.id)}
                  align={col.align}
                  style={{ minWidth: col.minWidth, maxWidth: col.maxWidth }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleSort(String(col.id))}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: pageSize > 10 ? 8 : pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rectangular" width={18} height={18} sx={{ borderRadius: 1 }} />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={String(col.id)}>
                      <Skeleton height={14} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} sx={{ py: 6 }}>
                  <EmptyState message={emptyMessage || 'No records found'} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const id = getRowId(row);
                const isSelected = selected.has(id);
                return (
                  <TableRow
                    key={id}
                    selected={isSelected}
                    onClick={selectable ? () => handleSelectRow(row) : undefined}
                    sx={selectable ? { cursor: 'pointer' } : {}}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox checked={isSelected} size="small" />
                      </TableCell>
                    )}
                    {columns.map((col) => {
                      const rawValue = (row as Record<string, unknown>)[col.id as string];
                      return (
                        <TableCell key={String(col.id)} align={col.align}>
                          {col.format ? col.format(rawValue, row) : (rawValue as React.ReactNode)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {(total !== undefined || onPageChange) && (
        <TablePagination
          component="div"
          count={total ?? rows.length}
          page={page}
          rowsPerPage={pageSize}
          onPageChange={(_, p) => onPageChange?.(p)}
          onRowsPerPageChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-toolbar': { fontSize: '0.8125rem' },
          }}
        />
      )}
    </Paper>
  );
}
