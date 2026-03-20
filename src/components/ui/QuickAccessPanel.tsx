'use client';

import React from 'react';
import {
  Box,
  Grid,
  Grow,
  ListItemButton,
  ListItemIcon,
  Paper,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import StorageIcon from '@mui/icons-material/Storage';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import LeadIcon from '@mui/icons-material/Leaderboard';
import BadgeIcon from '@mui/icons-material/Badge';
import PayrollIcon from '@mui/icons-material/AccountBalanceWallet';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useUserStore } from '@/store/userStore';
import type { QuickAccessCategory } from '@/components/layout/menuIcons';

export type { QuickAccessItem, QuickAccessCategory } from '@/components/layout/menuIcons';

const QUICK_ACCESS: QuickAccessCategory[] = [
  {
    id: 'finance',
    title: 'Finance',
    icon: <AccountBalanceIcon fontSize="small" />,
    items: [
      { id: 'invoices', label: 'Invoices', path: '/finance?tab=sales', icon: <ReceiptIcon fontSize="small" /> },
      { id: 'expenses', label: 'Expenses', path: '/finance?tab=expenses', icon: <MoneyOffIcon fontSize="small" /> },
      { id: 'reports', label: 'Reports', path: '/finance?tab=overview', icon: <AssessmentIcon fontSize="small" /> },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: <InventoryIcon fontSize="small" />,
    items: [
      { id: 'products', label: 'Products', path: '/inventory', icon: <CategoryIcon fontSize="small" /> },
      { id: 'stock', label: 'Stock Levels', path: '/inventory', icon: <StorageIcon fontSize="small" /> },
      { id: 'suppliers', label: 'Suppliers', path: '/inventory', icon: <LocalShippingIcon fontSize="small" /> },
    ],
  },
  {
    id: 'pos',
    title: 'POS',
    icon: <PointOfSaleIcon fontSize="small" />,
    items: [
      { id: 'new-sale', label: 'New Sale', path: '/pos', icon: <AddShoppingCartIcon fontSize="small" /> },
      { id: 'transactions', label: 'Transactions', path: '/pos/orders', icon: <ReceiptLongIcon fontSize="small" /> },
    ],
  },
  {
    id: 'crm',
    title: 'CRM',
    icon: <PeopleAltIcon fontSize="small" />,
    items: [
      { id: 'customers', label: 'Customers', path: '/crm', icon: <PersonIcon fontSize="small" /> },
      { id: 'leads', label: 'Leads', path: '/crm', icon: <LeadIcon fontSize="small" /> },
    ],
  },
  {
    id: 'hrm',
    title: 'HRM',
    icon: <BadgeIcon fontSize="small" />,
    items: [
      { id: 'employees', label: 'Employees', path: '/hrm', icon: <PersonIcon fontSize="small" /> },
      { id: 'payroll', label: 'Payroll', path: '/hrm', icon: <PayrollIcon fontSize="small" /> },
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: <FolderOpenIcon fontSize="small" />,
    items: [
      { id: 'tasks', label: 'Tasks', path: '/projects/tasks', icon: <TaskAltIcon fontSize="small" /> },
      { id: 'active', label: 'Active Projects', path: '/projects', icon: <AssignmentIcon fontSize="small" /> },
    ],
  },
];

const PANEL_TRANSITION_MS = 200;

interface QuickAccessPanelProps {
  open: boolean;
  onClose: () => void;
  /** Called when mouse enters panel (e.g. to cancel close timer) */
  onMouseEnterPanel?: () => void;
  /** Left boundary in px so panel does not overlap sidebar */
  contentAreaLeft?: number;
  /** Anchor element for positioning (e.g. trigger button) */
  anchorEl: HTMLElement | null;
  /** Topbar height in px so panel opens below it */
  topbarHeight?: number;
}

export default function QuickAccessPanel({
  open,
  onClose,
  onMouseEnterPanel,
  contentAreaLeft = 0,
  anchorEl,
  topbarHeight = 60,
}: QuickAccessPanelProps) {
  const user = useUserStore((s) => s.user);
  const categories = QUICK_ACCESS;

  return (
    <Grow in={open} timeout={PANEL_TRANSITION_MS} style={{ transformOrigin: 'top left' }}>
      <Paper
        elevation={4}
        onMouseLeave={onClose}
        onMouseEnter={onMouseEnterPanel}
        sx={{
          position: 'fixed',
          left: contentAreaLeft,
          top: topbarHeight,
          width: `calc(100vw - ${contentAreaLeft}px)`,
          maxWidth: 720,
          minWidth: 520,
          maxHeight: `calc(100vh - ${topbarHeight}px - 16px)`,
          overflow: 'auto',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          zIndex: (theme) => theme.zIndex.appBar - 1,
          py: 2,
          px: 2,
        }}
      >
        <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ px: 1.5, mb: 1.5, display: 'block' }}>
          Quick navigation
        </Typography>
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  height: '100%',
                  borderRadius: 1.5,
                  borderColor: 'divider',
                  backgroundColor: 'grey.50',
                  transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    backgroundColor: 'background.paper',
                    boxShadow: 1,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 0.5 }}>
                  <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    {category.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                    {category.title}
                  </Typography>
                </Box>
                <Box component="ul" sx={{ m: 0, pl: 2.5, listStyle: 'none' }}>
                  {category.items.map((item) => (
                    <li key={item.id}>
                      <ListItemButton
                        component={Link}
                        href={item.path}
                        onClick={onClose}
                        dense
                        sx={{
                          borderRadius: 1,
                          py: 0.5,
                          px: 1,
                          mb: 0.25,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                          {item.icon}
                        </ListItemIcon>
                        <Typography variant="body2">{item.label}</Typography>
                      </ListItemButton>
                    </li>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Grow>
  );
}

export { QUICK_ACCESS as QUICK_ACCESS_CATEGORIES, PANEL_TRANSITION_MS };
