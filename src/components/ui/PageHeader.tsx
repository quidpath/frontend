'use client';

import React from 'react';
import { Box, Breadcrumbs, Button, Skeleton, Typography, alpha } from '@mui/material';
import Link from 'next/link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  color?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  loading,
  icon,
  color = '#43A047',
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 3,
        pb: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1.5, '& .MuiBreadcrumbs-separator': { color: 'text.disabled' } }}
        >
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={i} variant="caption" color="text.secondary" fontWeight={500}>
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={i}
                href={crumb.href || '#'}
                style={{ textDecoration: 'none' }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    '&:hover': { color: color },
                    transition: 'color 0.15s ease',
                  }}
                >
                  {crumb.label}
                </Typography>
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {icon && (
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${alpha(color, 0.12)}, ${alpha(color, 0.06)})`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                fontSize: 28,
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            {loading ? (
              <>
                <Skeleton width={200} height={32} sx={{ mb: 0.5 }} />
                <Skeleton width={300} height={20} />
              </>
            ) : (
              <>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {subtitle}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>

        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}
