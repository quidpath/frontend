'use client';

import React, { useState, useEffect } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from '../CommandPalette';
import { useUIStore } from '@/store/uiStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { sidebarCollapsed } = useUIStore();
  const sidebarWidth = sidebarCollapsed ? 68 : 248;

  // Global keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Topbar onMobileMenuToggle={() => setMobileOpen(true)} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Toolbar sx={{ minHeight: '60px !important' }} />
        <Box
          sx={{
            flex: 1,
            pt: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
            px: { xs: 0.75, sm: 1 },
            maxWidth: 1800,
            width: '100%',
            mx: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </Box>
  );
}
