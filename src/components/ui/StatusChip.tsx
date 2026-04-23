'use client';

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { alpha } from '@mui/material/styles';

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: alpha('#27AE60', 0.1), text: '#1B7A3E', dot: '#27AE60' },
  paid: { bg: alpha('#27AE60', 0.1), text: '#1B7A3E', dot: '#27AE60' },
  completed: { bg: alpha('#27AE60', 0.1), text: '#1B7A3E', dot: '#27AE60' },
  won: { bg: alpha('#27AE60', 0.1), text: '#1B7A3E', dot: '#27AE60' },
  approved: { bg: alpha('#27AE60', 0.1), text: '#1B7A3E', dot: '#27AE60' },
  processed: { bg: alpha('#27AE60', 0.1), text: '#1B7A3E', dot: '#27AE60' },
  resolved: { bg: alpha('#27AE60', 0.1), text: '#1B7A3E', dot: '#27AE60' },

  pending: { bg: alpha('#F2A40E', 0.1), text: '#926109', dot: '#F2A40E' },
  draft: { bg: alpha('#F2A40E', 0.1), text: '#926109', dot: '#F2A40E' },
  on_hold: { bg: alpha('#F2A40E', 0.1), text: '#926109', dot: '#F2A40E' },
  planning: { bg: alpha('#F2A40E', 0.1), text: '#926109', dot: '#F2A40E' },
  sent: { bg: alpha('#3182CE', 0.1), text: '#1A4F82', dot: '#3182CE' },
  open: { bg: alpha('#3182CE', 0.1), text: '#1A4F82', dot: '#3182CE' },
  in_progress: { bg: alpha('#3182CE', 0.1), text: '#1A4F82', dot: '#3182CE' },
  ordered: { bg: alpha('#3182CE', 0.1), text: '#1A4F82', dot: '#3182CE' },
  todo: { bg: alpha('#64748B', 0.1), text: '#334155', dot: '#64748B' },

  overdue: { bg: alpha('#E53E3E', 0.1), text: '#9B1C1C', dot: '#E53E3E' },
  cancelled: { bg: alpha('#E53E3E', 0.1), text: '#9B1C1C', dot: '#E53E3E' },
  rejected: { bg: alpha('#E53E3E', 0.1), text: '#9B1C1C', dot: '#E53E3E' },
  terminated: { bg: alpha('#E53E3E', 0.1), text: '#9B1C1C', dot: '#E53E3E' },
  lost: { bg: alpha('#E53E3E', 0.1), text: '#9B1C1C', dot: '#E53E3E' },
  critical: { bg: alpha('#E53E3E', 0.1), text: '#9B1C1C', dot: '#E53E3E' },

  inactive: { bg: alpha('#94A3B8', 0.1), text: '#475569', dot: '#94A3B8' },
  discontinued: { bg: alpha('#94A3B8', 0.1), text: '#475569', dot: '#94A3B8' },
  on_leave: { bg: alpha('#94A3B8', 0.1), text: '#475569', dot: '#94A3B8' },
  voided: { bg: alpha('#94A3B8', 0.1), text: '#475569', dot: '#94A3B8' },
  review: { bg: alpha('#8B5CF6', 0.1), text: '#5B21B6', dot: '#8B5CF6' },
  high: { bg: alpha('#E53E3E', 0.1), text: '#9B1C1C', dot: '#E53E3E' },
  urgent: { bg: alpha('#E53E3E', 0.12), text: '#9B1C1C', dot: '#E53E3E' },
  medium: { bg: alpha('#F2A40E', 0.1), text: '#926109', dot: '#F2A40E' },
  low: { bg: alpha('#64748B', 0.1), text: '#334155', dot: '#64748B' },
};

interface StatusChipProps {
  status: string | null | undefined;
  label?: string;
  size?: ChipProps['size'];
}

export default function StatusChip({ status, label, size = 'small' }: StatusChipProps) {
  // Handle null/undefined status
  if (!status) {
    return (
      <Chip
        size={size}
        label="N/A"
        sx={{
          backgroundColor: alpha('#64748B', 0.1),
          color: '#334155',
          fontWeight: 600,
          fontSize: '0.7rem',
          height: size === 'small' ? 22 : 28,
          borderRadius: '5px',
        }}
      />
    );
  }

  const key = status.toLowerCase().replace(/ /g, '_');
  const colors = STATUS_COLORS[key] || { bg: alpha('#64748B', 0.1), text: '#334155', dot: '#64748B' };
  const displayLabel = label || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Chip
      size={size}
      label={displayLabel}
      sx={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: size === 'small' ? 22 : 28,
        borderRadius: '5px',
        '& .MuiChip-label': {
          px: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          '&::before': {
            content: '""',
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: colors.dot,
            display: 'inline-block',
            flexShrink: 0,
          },
        },
      }}
    />
  );
}
