'use client';

import React from 'react';
import { Box, Card, CardContent, Skeleton, Typography, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { MetricData } from '@/types';

interface MetricCardProps extends MetricData {
  loading?: boolean;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export default function MetricCard({
  label,
  value,
  change,
  changeLabel,
  trend = 'neutral',
  prefix,
  suffix,
  loading,
  icon,
  color = '#43A047',
  onClick,
}: MetricCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : TrendingFlatIcon;
  const trendColor = trend === 'up' ? '#27AE60' : trend === 'down' ? '#E53E3E' : '#64748B';

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            }
          : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: color,
        },
      }}
    >
      <CardContent>
        {loading ? (
          <Box>
            <Skeleton width="60%" height={16} sx={{ mb: 1.5 }} />
            <Skeleton width="40%" height={36} sx={{ mb: 1 }} />
            <Skeleton width="50%" height={16} />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ lineHeight: 1.3, letterSpacing: '0.08em' }}
              >
                {label}
              </Typography>
              {icon && (
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: alpha(color, 0.1),
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </Box>
              )}
            </Box>

            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.1, mb: 1.5 }}
            >
              {prefix && (
                <Typography component="span" variant="h6" sx={{ fontWeight: 600, opacity: 0.7 }}>
                  {prefix}
                </Typography>
              )}
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix && (
                <Typography component="span" variant="h6" sx={{ fontWeight: 600, opacity: 0.7 }}>
                  {suffix}
                </Typography>
              )}
            </Typography>

            {(change !== undefined || changeLabel) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
                {change !== undefined && (
                  <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>
                    {change > 0 ? '+' : ''}
                    {change}%
                  </Typography>
                )}
                {changeLabel && (
                  <Typography variant="caption" color="text.secondary">
                    {changeLabel}
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
