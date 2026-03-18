'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Chip,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BadgeIcon from '@mui/icons-material/Badge';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useRouter } from 'next/navigation';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'Pages' | 'Recent' | 'Actions';
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const pages: CommandItem[] = [
    {
      id: 'home',
      label: 'Home',
      description: 'Dashboard overview',
      icon: <HomeIcon fontSize="small" />,
      action: () => router.push('/dashboard'),
      category: 'Pages',
      keywords: ['dashboard', 'overview', 'home'],
    },
    {
      id: 'finance',
      label: 'Finance',
      description: 'Sales, Purchases, Accounting, Tax, Bank',
      icon: <AccountBalanceWalletIcon fontSize="small" />,
      action: () => router.push('/finance'),
      category: 'Pages',
      keywords: ['finance', 'accounting', 'sales', 'purchases', 'tax', 'bank', 'invoices', 'expenses'],
    },
    {
      id: 'pos',
      label: 'POS',
      description: 'Point of Sale',
      icon: <PointOfSaleIcon fontSize="small" />,
      action: () => router.push('/pos'),
      category: 'Pages',
      keywords: ['pos', 'point of sale', 'orders', 'sales'],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      description: 'Products, Stock, Warehouses',
      icon: <InventoryIcon fontSize="small" />,
      action: () => router.push('/inventory'),
      category: 'Pages',
      keywords: ['inventory', 'products', 'stock', 'warehouses', 'items'],
    },
    {
      id: 'crm',
      label: 'CRM',
      description: 'Contacts, Deals, Campaigns',
      icon: <PeopleAltIcon fontSize="small" />,
      action: () => router.push('/crm'),
      category: 'Pages',
      keywords: ['crm', 'contacts', 'customers', 'deals', 'pipeline', 'campaigns'],
    },
    {
      id: 'hr',
      label: 'HR & Payroll',
      description: 'Employees, Payroll, Leave',
      icon: <BadgeIcon fontSize="small" />,
      action: () => router.push('/hrm'),
      category: 'Pages',
      keywords: ['hr', 'hrm', 'payroll', 'employees', 'leave', 'recruitment'],
    },
    {
      id: 'reports',
      label: 'Reports',
      description: 'Analytics and Reports',
      icon: <AssessmentIcon fontSize="small" />,
      action: () => router.push('/reports'),
      category: 'Pages',
      keywords: ['reports', 'analytics', 'dashboards', 'metrics'],
    },
    {
      id: 'projects',
      label: 'Projects',
      description: 'Project Management',
      icon: <FolderOpenIcon fontSize="small" />,
      action: () => router.push('/projects'),
      category: 'Pages',
      keywords: ['projects', 'tasks', 'time logs', 'issues'],
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'System Settings',
      icon: <SettingsIcon fontSize="small" />,
      action: () => router.push('/settings'),
      category: 'Pages',
      keywords: ['settings', 'preferences', 'configuration'],
    },
    {
      id: 'help',
      label: 'Help & Support',
      description: 'Documentation and Support',
      icon: <HelpOutlineIcon fontSize="small" />,
      action: () => router.push('/help'),
      category: 'Pages',
      keywords: ['help', 'support', 'documentation', 'faq'],
    },
  ];

  const actions: CommandItem[] = [
    {
      id: 'new-invoice',
      label: 'New Invoice',
      description: 'Create a new invoice',
      icon: <ReceiptIcon fontSize="small" />,
      action: () => {
        router.push('/finance');
        // TODO: Trigger invoice modal
      },
      category: 'Actions',
      keywords: ['new', 'create', 'invoice', 'sales'],
    },
    {
      id: 'new-expense',
      label: 'New Expense',
      description: 'Record a new expense',
      icon: <DescriptionIcon fontSize="small" />,
      action: () => {
        router.push('/finance');
        // TODO: Trigger expense modal
      },
      category: 'Actions',
      keywords: ['new', 'create', 'expense', 'purchases'],
    },
  ];

  const allItems = [...pages, ...actions];

  const fuzzyMatch = (text: string, query: string): boolean => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // Exact match
    if (lowerText.includes(lowerQuery)) return true;
    
    // Keyword match
    return false;
  };

  const filteredItems = search
    ? allItems.filter((item) => {
        const searchLower = search.toLowerCase();
        return (
          item.label.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.keywords?.some((k) => k.includes(searchLower))
        );
      })
    : pages; // Show pages by default

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const handleSelect = (item: CommandItem) => {
    item.action();
    onClose();
    setSearch('');
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: 100,
          m: 0,
          maxHeight: 'calc(100vh - 200px)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <TextField
          fullWidth
          placeholder="Search pages, actions, and records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: 0, '& fieldset': { border: 'none' } },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
        />

        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {Object.entries(groupedItems).map(([category, items]) => (
            <Box key={category}>
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 1,
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: 0.5,
                }}
              >
                {category}
              </Typography>
              <List disablePadding>
                {items.map((item, index) => {
                  const globalIndex = filteredItems.indexOf(item);
                  return (
                    <ListItem key={item.id} disablePadding>
                      <ListItemButton
                        selected={globalIndex === selectedIndex}
                        onClick={() => handleSelect(item)}
                        sx={{ py: 1.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          secondary={item.description}
                          primaryTypographyProps={{ fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        {globalIndex === selectedIndex && (
                          <Chip label="↵" size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}

          {filteredItems.length === 0 && (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography color="text.secondary">No results found</Typography>
              <Typography variant="caption" color="text.secondary">
                Try searching for pages, actions, or records
              </Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Chip label="↑↓" size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
            <Typography variant="caption" color="text.secondary">
              Navigate
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Chip label="↵" size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
            <Typography variant="caption" color="text.secondary">
              Select
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Chip label="Esc" size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
            <Typography variant="caption" color="text.secondary">
              Close
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
