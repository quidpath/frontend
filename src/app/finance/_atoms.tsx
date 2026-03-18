'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Drawer, IconButton, Menu, MenuItem,
  Skeleton, Snackbar, Stack, TableCell, TableRow, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SendIcon from '@mui/icons-material/Send';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { STATUS_COLORS } from './_constants';

// ─── Status Pill ──────────────────────────────────────────────────────────────

export function StatusPill({ status, onChange }: { status: string; onChange?: (s: string) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const cfg = STATUS_COLORS[status] ?? { bg: '#F1F5F9', color: '#64748B', label: status };
  const statuses = ['draft', 'pending', 'posted', 'paid', 'approved', 'overdue', 'rejected', 'invoiced'];
  return (
    <>
      <Chip
        label={cfg.label}
        size="small"
        onClick={onChange ? (e) => { e.stopPropagation(); setAnchor(e.currentTarget); } : undefined}
        sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11, height: 22, cursor: onChange ? 'pointer' : 'default', border: 'none' }}
      />
      {onChange && (
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          {statuses.map(s => (
            <MenuItem key={s} dense onClick={() => { onChange(s); setAnchor(null); }}>
              <StatusPill status={s} />
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
}

// ─── Trend Badge ──────────────────────────────────────────────────────────────

export function TrendBadge({ value }: { value?: number }) {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: up ? '#059669' : '#DC2626' }}>
      {up ? <TrendingUpIcon sx={{ fontSize: 13 }} /> : <TrendingDownIcon sx={{ fontSize: 13 }} />}
      <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{Math.abs(value).toFixed(1)}%</Typography>
    </Box>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

export function StatCardItem({ label, value, trend, loading }: { label: string; value: string; trend?: number; loading?: boolean }) {
  return (
    <Box component="div" sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, flex: 1, minWidth: 0, bgcolor: 'background.paper' }}>
      {loading ? (
        <>
          <Skeleton width="60%" height={13} sx={{ mb: 1.5 }} />
          <Skeleton width="80%" height={32} sx={{ mb: 1 }} />
          <Skeleton width="40%" height={13} />
        </>
      ) : (
        <>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1, fontWeight: 500 }}>{label}</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary', lineHeight: 1.2, mb: 0.5 }}>{value}</Typography>
          <TrendBadge value={trend} />
        </>
      )}
    </Box>
  );
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
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

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ message, action, onAction }: { message: string; action?: string; onAction?: () => void }) {
  return (
    <TableRow>
      <TableCell colSpan={20} sx={{ py: 8, textAlign: 'center', border: 'none' }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{message}</Typography>
        {action && onAction && (
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={onAction}>{action}</Button>
        )}
      </TableCell>
    </TableRow>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export function Toast({ open, message, severity, onClose }: { open: boolean; message: string; severity: 'success' | 'error'; onClose: () => void }) {
  return (
    <Snackbar open={open} autoHideDuration={3500} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Alert severity={severity} onClose={onClose} sx={{ minWidth: 280 }}>{message}</Alert>
    </Snackbar>
  );
}

// ─── Row Actions ──────────────────────────────────────────────────────────────

export function RowActions({ onEdit, onDuplicate, onDelete, onSend }: {
  onEdit?: () => void; onDuplicate?: () => void; onDelete?: () => void; onSend?: () => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} onClick={(e) => e.stopPropagation()}>
        {onEdit && <MenuItem dense onClick={() => { onEdit(); setAnchor(null); }}><EditIcon fontSize="small" sx={{ mr: 1 }} />Edit</MenuItem>}
        {onDuplicate && <MenuItem dense onClick={() => { onDuplicate(); setAnchor(null); }}><ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />Duplicate</MenuItem>}
        {onSend && <MenuItem dense onClick={() => { onSend(); setAnchor(null); }}><SendIcon fontSize="small" sx={{ mr: 1 }} />Send / Email</MenuItem>}
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

// ─── Bulk Bar ─────────────────────────────────────────────────────────────────

export function BulkBar({ count, onDelete, onExport, contextAction }: {
  count: number; onDelete: () => void; onExport: () => void;
  contextAction?: { label: string; onClick: () => void };
}) {
  if (count === 0) return null;
  return (
    <Box sx={{
      position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'primary.main', color: '#fff',
      px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 2,
    }}>
      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{count} selected</Typography>
      <Box sx={{ flex: 1 }} />
      {contextAction && (
        <Button size="small" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }} onClick={contextAction.onClick}>
          {contextAction.label}
        </Button>
      )}
      <Button size="small" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }} onClick={onExport} startIcon={<FileDownloadIcon />}>Export</Button>
      <Button size="small" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }} onClick={onDelete} startIcon={<DeleteIcon />}>Delete</Button>
    </Box>
  );
}

// ─── Record Drawer ────────────────────────────────────────────────────────────

export function RecordDrawer({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  return (
    <Drawer anchor="right" open={open} onClose={onClose} ModalProps={{ keepMounted: false }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 520 } } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>{title}</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>{children}</Box>
    </Drawer>
  );
}

// ─── Multi-step Modal ─────────────────────────────────────────────────────────

export function MultiStepModal({ open, onClose, title, steps, onSave, saving }: {
  open: boolean; onClose: () => void; title: string;
  steps: { label: string; content: React.ReactNode }[];
  onSave: () => void; saving?: boolean;
}) {
  const [step, setStep] = useState(0);
  useEffect(() => { if (!open) setStep(0); }, [open]);
  const isLast = step === steps.length - 1;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">Step {step + 1} of {steps.length}: {steps[step].label}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <Box sx={{ px: 3, pb: 1, display: 'flex', gap: 1 }}>
        {steps.map((_, i) => (
          <Box key={i} sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: i <= step ? 'primary.main' : 'divider', transition: 'background 0.2s' }} />
        ))}
      </Box>
      <DialogContent dividers sx={{ minHeight: 320 }}>{steps[step].content}</DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        {step > 0 && <Button onClick={() => setStep(s => s - 1)} startIcon={<ChevronLeftIcon />}>Back</Button>}
        {!isLast && <Button variant="contained" onClick={() => setStep(s => s + 1)} endIcon={<ChevronRightIcon />}>Next</Button>}
        {isLast && (
          <Button variant="contained" onClick={onSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}>
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── Simple Drawer Form ───────────────────────────────────────────────────────

export function SimpleDrawerForm({ open, onClose, title, children, onSave, saving }: {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; onSave: () => void; saving?: boolean;
}) {
  return (
    <RecordDrawer open={open} onClose={onClose} title={title}>
      <Stack spacing={2.5}>{children}</Stack>
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onClose} fullWidth>Cancel</Button>
        <Button variant="contained" onClick={onSave} disabled={saving} fullWidth
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}>
          Save
        </Button>
      </Box>
    </RecordDrawer>
  );
}
