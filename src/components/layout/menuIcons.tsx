'use client';

import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InventoryIcon from '@mui/icons-material/Inventory2';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BadgeIcon from '@mui/icons-material/Badge';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import type { MenuSection } from '@/types/auth';
import type { NavSection, NavChild } from './navConfig';

const ICON_MAP: Record<string, React.ReactNode> = {
  dashboard: <DashboardIcon fontSize="small" />,
  account_balance: <AccountBalanceIcon fontSize="small" />,
  inventory_2: <InventoryIcon fontSize="small" />,
  point_of_sale: <PointOfSaleIcon fontSize="small" />,
  people_alt: <PeopleAltIcon fontSize="small" />,
  badge: <BadgeIcon fontSize="small" />,
  folder_open: <FolderOpenIcon fontSize="small" />,
  bar_chart: <BarChartIcon fontSize="small" />,
  settings: <SettingsIcon fontSize="small" />,
  help: <HelpOutlineIcon fontSize="small" />,
};

export function getIconForSlug(slug: string | null | undefined): React.ReactNode {
  if (!slug) return <DashboardIcon fontSize="small" />;
  return ICON_MAP[slug] ?? <DashboardIcon fontSize="small" />;
}

/** Convert backend menu sections to NavSection[] for Sidebar. */
export function menuToNavSections(menu: MenuSection[]): NavSection[] {
  return menu.map((s) => ({
    id: s.id,
    label: s.label,
    path: s.path,
    icon: getIconForSlug(s.icon),
    children: s.children as NavChild[] | undefined,
  }));
}

export interface QuickAccessItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface QuickAccessCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: QuickAccessItem[];
}

/** Convert backend menu to Quick Access categories (only what user can see). */
export function menuToQuickAccessCategories(menu: MenuSection[]): QuickAccessCategory[] {
  return menu.map((s) => {
    const icon = getIconForSlug(s.icon);
    const items = s.children?.length
      ? s.children.map((c) => ({
          id: c.id,
          label: c.label,
          path: c.path,
          icon,
        }))
      : [{ id: s.id, label: s.label, path: s.path, icon }];
    return {
      id: s.id,
      title: s.label,
      icon,
      items,
    };
  });
}
