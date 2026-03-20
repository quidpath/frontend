'use client';

import React from 'react';
import { Box, Card, CardContent, Grid, Typography, alpha, Divider, Avatar, Chip, CircularProgress } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InventoryIcon from '@mui/icons-material/Inventory2';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BadgeIcon from '@mui/icons-material/Badge';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import { useBillingSummary } from '@/hooks/useBilling';
import { useInventorySummary } from '@/hooks/useInventory';
import { usePOSSummary } from '@/hooks/usePOS';
import { useHRMSummary } from '@/hooks/useHRM';
import { useProjectsSummary } from '@/hooks/useProjects';
import { useCRMSummary } from '@/hooks/useCRM';
import { useRecentActivity, formatRelativeTime, getActivityColor } from '@/hooks/useActivity';
import { formatCurrency } from '@/utils/formatters';

const MODULE_CARDS = [
  {
    label: 'Finance',
    icon: <AccountBalanceIcon sx={{ fontSize: 22 }} />,
    path: '/finance',
    color: '#2E7D32',
    desc: 'Invoices, journals & financial reports',
  },
  {
    label: 'Inventory',
    icon: <InventoryIcon sx={{ fontSize: 22 }} />,
    path: '/inventory',
    color: '#1565C0',
    desc: 'Products, warehouses & stock control',
  },
  {
    label: 'Point of Sale',
    icon: <PointOfSaleIcon sx={{ fontSize: 22 }} />,
    path: '/pos',
    color: '#6A1B9A',
    desc: 'Sales orders & purchase management',
  },
  {
    label: 'CRM',
    icon: <PeopleAltIcon sx={{ fontSize: 22 }} />,
    path: '/crm',
    color: '#00695C',
    desc: 'Contacts, pipeline & campaigns',
  },
  {
    label: 'HR Management',
    icon: <BadgeIcon sx={{ fontSize: 22 }} />,
    path: '/hrm',
    color: '#C62828',
    desc: 'Employees, payroll & attendance',
  },
  {
    label: 'Projects',
    icon: <FolderOpenIcon sx={{ fontSize: 22 }} />,
    path: '/projects',
    color: '#E65100',
    desc: 'Tasks, time logs & issues',
  },
];

export default function DashboardOverview() {
  const { data: billing, isLoading: billingLoading } = useBillingSummary();
  const { data: inventory, isLoading: inventoryLoading } = useInventorySummary();
  const { data: pos, isLoading: posLoading } = usePOSSummary();
  const { data: hrm, isLoading: hrmLoading } = useHRMSummary();
  const { data: projects, isLoading: projectsLoading } = useProjectsSummary();
  const { data: crm, isLoading: crmLoading } = useCRMSummary();
  
  // Fetch real activity data
  const { data: activityData, isLoading: activityLoading } = useRecentActivity({ page_size: 6 });

  return (
    <Box>
      <PageHeader
        title="Operations Overview"
        subtitle={`Good ${getTimeOfDay()}, Admin — here's your business at a glance.`}
        breadcrumbs={[{ label: 'QuidPath ERP' }, { label: 'Dashboard' }]}
      />

      {/* Top KPI Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total Revenue"
            value={billing ? formatCurrency(billing.total_revenue) : '—'}
            change={12.4}
            changeLabel="vs last month"
            trend="up"
            icon={<AccountBalanceIcon fontSize="small" />}
            color="#2E7D32"
            loading={billingLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Outstanding Invoices"
            value={billing ? formatCurrency(billing.total_outstanding) : '—'}
            change={-5.2}
            changeLabel="vs last week"
            trend="down"
            icon={<AccountBalanceIcon fontSize="small" />}
            color="#E65100"
            loading={billingLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Today's POS Sales"
            value={pos ? formatCurrency(pos.todays_sales) : '—'}
            change={8.7}
            changeLabel="vs yesterday"
            trend="up"
            icon={<PointOfSaleIcon fontSize="small" />}
            color="#6A1B9A"
            loading={posLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Active Employees"
            value={hrm?.total_employees ?? '—'}
            change={2}
            changeLabel="new this month"
            trend="up"
            icon={<BadgeIcon fontSize="small" />}
            color="#C62828"
            loading={hrmLoading}
          />
        </Grid>
      </Grid>

      {/* Secondary Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard
            label="Pipeline Value"
            value={crm ? formatCurrency(crm.pipeline_value) : '—'}
            icon={<PeopleAltIcon fontSize="small" />}
            color="#00695C"
            loading={crmLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard
            label="Low Stock Items"
            value={inventory?.low_stock_items ?? '—'}
            trend="down"
            icon={<InventoryIcon fontSize="small" />}
            color="#1565C0"
            loading={inventoryLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard
            label="Active Projects"
            value={projects?.active_projects ?? '—'}
            icon={<FolderOpenIcon fontSize="small" />}
            color="#E65100"
            loading={projectsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard
            label="Open Issues"
            value={projects?.open_issues ?? '—'}
            icon={<FolderOpenIcon fontSize="small" />}
            color="#C62828"
            loading={projectsLoading}
          />
        </Grid>
      </Grid>

      {/* Modules + Activity */}
      <Grid container spacing={3}>
        {/* Module quick access */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Typography variant="h6" fontWeight={600}>
                  Modules
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Quick navigation
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {MODULE_CARDS.map((mod) => (
                  <Grid key={mod.label} size={{ xs: 12, sm: 6 }}>
                    <Box
                      component={Link}
                      href={mod.path}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.75,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        textDecoration: 'none',
                        transition: 'all 0.18s ease',
                        '&:hover': {
                          backgroundColor: alpha(mod.color, 0.04),
                          borderColor: alpha(mod.color, 0.3),
                          transform: 'translateX(2px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          backgroundColor: alpha(mod.color, 0.1),
                          color: mod.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {mod.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                          {mod.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {mod.desc}
                        </Typography>
                      </Box>
                      <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Feed */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Activity
                </Typography>
                <Chip label="Live" size="small" sx={{ backgroundColor: alpha('#27AE60', 0.1), color: '#1B7A3E', fontWeight: 600, height: 22, fontSize: '0.7rem' }} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activityLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : activityData && activityData.results.length > 0 ? (
                  activityData.results.map((activity, i) => (
                    <React.Fragment key={activity.id}>
                      <Box sx={{ display: 'flex', gap: 1.5, py: 1.5 }}>
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            backgroundColor: getActivityColor(activity.type),
                            mt: 0.8,
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.5 }}>
                            {activity.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatRelativeTime(activity.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      {i < activityData.results.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
