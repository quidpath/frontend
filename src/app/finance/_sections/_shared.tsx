'use client';

import React from 'react';
import {
  Table, TableCell, TableContainer, TableRow,
  Paper, Typography, Chip, IconButton, Menu, MenuItem,
  Divider, Skeleton, Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { STATUS_COLORS } from '../_constants';

export interface SectionProps {
  subTab: string;
  notify: (msg: string, sev?: 'success' | 'error') => void;
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
}

export function StatusChip({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS[status?.toUpperCase()] ?? { bg: '#F1F5F9', color: '#64748B', label: status };
  return (
    <Chip label={cfg.label} size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11, height: 22, border: 'none' }} />
  );
}

export function ColHead({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <TableCell align={align} sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', py: 1.25, whiteSpace: 'nowrap', bgcolor: 'background.default' }}>
      {children}
    </TableCell>
  );
}

export function TableSkel({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}><Skeleton height={16} /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function EmptyRow({ cols, message, onAdd, addLabel }: { cols: number; message: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <TableRow>
      <TableCell colSpan={cols} sx={{ py: 8, textAlign: 'center', border: 'none' }}>
        <Typography color="text.secondary" mb={2}>{message}</Typography>
        {onAdd && <Button variant="outlined" size="small" onClick={onAdd}>{addLabel ?? 'Add'}</Button>}
      </TableCell>
    </TableRow>
  );
}

export function RowMenu({ onView, onEdit, onDelete }: { onView?: () => void; onEdit?: () => void; onDelete?: () => void }) {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton size="small" onClick={e => { e.stopPropagation(); setAnchor(e.currentTarget); }}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} onClick={e => e.stopPropagation()}>
        {onView && <MenuItem dense onClick={() => { onView(); setAnchor(null); }}><VisibilityIcon fontSize="small" sx={{ mr: 1 }} />View</MenuItem>}
        {onEdit && <MenuItem dense onClick={() => { onEdit(); setAnchor(null); }}><EditIcon fontSize="small" sx={{ mr: 1 }} />Edit</MenuItem>}
        {onDelete && [
          <Divider key="d" />,
          <MenuItem key="del" dense onClick={() => { onDelete(); setAnchor(null); }} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />Delete
          </MenuItem>,
        ]}
      </Menu>
    </>
  );
}

export function FinTable({ children }: { children: React.ReactNode }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">{children}</Table>
    </TableContainer>
  );
}

export function fmt(n?: number | null) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

export function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Re-export the system MetricCard as StatCard so all sections use the same component
export { default as StatCard } from '@/components/ui/MetricCard';
