'use client';

import React from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InventoryIcon from '@mui/icons-material/Inventory2';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BadgeIcon from '@mui/icons-material/Badge';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';

export interface NavChild {
  id: string;
  label: string;
  path: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavChild[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: <DashboardIcon fontSize="small" />,
    path: '/dashboard',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: <AccountBalanceIcon fontSize="small" />,
    path: '/finance',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <InventoryIcon fontSize="small" />,
    path: '/inventory',
  },
  {
    id: 'pos',
    label: 'Point of Sale',
    icon: <PointOfSaleIcon fontSize="small" />,
    path: '/pos',
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: <PeopleAltIcon fontSize="small" />,
    path: '/crm',
  },
  {
    id: 'hrm',
    label: 'HR Management',
    icon: <BadgeIcon fontSize="small" />,
    path: '/hrm',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <FolderOpenIcon fontSize="small" />,
    path: '/projects',
  },
];

/** Only shown to superuser (system owner). Manage all organisations and users. */
export const SYSTEM_ADMIN_SECTION: NavSection = {
  id: 'system-admin',
  label: 'System Admin',
  icon: <AdminPanelSettingsIcon fontSize="small" />,
  path: '/system-admin',
  children: [
    { id: 'organisations', label: 'Organisations', path: '/system-admin/organisations' },
  ],
};

/** Only shown to org admin (SUPERADMIN role). Manage corporate users and logo. */
export const ORG_ADMIN_SECTION: NavSection = {
  id: 'org-admin',
  label: 'Org Admin',
  icon: <GroupIcon fontSize="small" />,
  path: '/org-admin',
  children: [
    { id: 'users', label: 'Users', path: '/org-admin/users' },
    { id: 'logo', label: 'Logo & branding', path: '/org-admin/logo' },
  ],
};

export const BOTTOM_NAV = [
  { id: 'analytics', label: 'Analytics', icon: <BarChartIcon fontSize="small" />, path: '/analytics' },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/settings' },
  { id: 'help', label: 'Help & Support', icon: <HelpOutlineIcon fontSize="small" />, path: '/help' },
];
