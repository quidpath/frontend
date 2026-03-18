'use client';

import React, { useState } from 'react';
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { NAV_SECTIONS, BOTTOM_NAV, SYSTEM_ADMIN_SECTION, ORG_ADMIN_SECTION } from './navConfig';

const SIDEBAR_WIDTH = 248;
const SIDEBAR_COLLAPSED_WIDTH = 68;

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const user = useUserStore((s) => s.user);
  let navSections = [...NAV_SECTIONS];
  if (user?.is_superuser) navSections = [...navSections, SYSTEM_ADMIN_SECTION];
  if (user?.role?.name === 'SUPERADMIN') navSections = [...navSections, ORG_ADMIN_SECTION];
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(navSections.filter((s) => pathname?.startsWith(s.path)).map((s) => s.id))
  );
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function isActive(path: string) {
    return pathname === path || pathname?.startsWith(path + '/');
  }

  const drawerWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        width: drawerWidth,
        transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: sidebarCollapsed ? 1.5 : 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          height: 60,
          minHeight: 60,
          maxHeight: 60,
        }}
      >
        {!sidebarCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            <Box
              component="img"
              src="/quidpathLong.svg"
              alt="QuidPath"
              sx={{
                height: 100,
                maxHeight: 100,
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}

        {sidebarCollapsed && (
          <Box
            component="img"
            src="/quidpathShort.svg"
            alt="QuidPath"
            sx={{
              height: 34,
              width: 34,
              objectFit: 'contain',
            }}
          />
        )}

        {!sidebarCollapsed && (
          <IconButton
            size="small"
            onClick={toggleSidebarCollapsed}
            sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Main Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        <List disablePadding>
          {navSections.map((section) => {
            const active = isActive(section.path);
            const expanded = expandedSections.has(section.id);
            const hasChildren = !!section.children?.length;

            return (
              <React.Fragment key={section.id}>
                <ListItem 
                  disablePadding
                  onMouseEnter={() => setHoveredSection(section.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                  sx={{ position: 'relative' }}
                >
                  <Tooltip title={sidebarCollapsed ? section.label : ''} placement="right">
                    <ListItemButton
                      component={hasChildren ? 'div' : Link}
                      href={hasChildren ? undefined : section.path}
                      onClick={hasChildren ? () => !sidebarCollapsed && toggleSection(section.id) : undefined}
                      selected={active}
                      sx={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
                    >
                      <ListItemIcon sx={{ minWidth: sidebarCollapsed ? 0 : 38 }}>
                        {section.icon}
                      </ListItemIcon>
                      {!sidebarCollapsed && (
                        <>
                          <ListItemText primary={section.label} />
                          {hasChildren && (
                            <Box sx={{ color: 'text.disabled', display: 'flex' }}>
                              {expanded ? (
                                <ExpandLessIcon fontSize="small" />
                              ) : (
                                <ExpandMoreIcon fontSize="small" />
                              )}
                            </Box>
                          )}
                        </>
                      )}
                    </ListItemButton>
                  </Tooltip>
                  
                  {/* Quick-add button on hover */}
                  {!sidebarCollapsed && hoveredSection === section.id && !hasChildren && (
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        right: 8,
                        opacity: 0.7,
                        '&:hover': { opacity: 1 },
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // TODO: Trigger create modal for this module
                        console.log('Quick add for:', section.label);
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>

                {hasChildren && !sidebarCollapsed && (
                  <Collapse in={expanded} timeout={200} unmountOnExit>
                    <List disablePadding>
                      {section.children!.map((child) => (
                        <ListItem key={child.id} disablePadding>
                          <ListItemButton
                            component={Link}
                            href={child.path}
                            selected={pathname === child.path}
                            sx={{ pl: 5.5, py: 0.75 }}
                          >
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 400 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* Bottom Nav */}
      <Box sx={{ py: 1 }}>
        {sidebarCollapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', pb: 0.5 }}>
            <IconButton
              size="small"
              onClick={toggleSidebarCollapsed}
              sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <List disablePadding>
          {BOTTOM_NAV.map((item) => (
            <ListItem key={item.id} disablePadding>
              <Tooltip title={sidebarCollapsed ? item.label : ''} placement="right">
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={pathname === item.path}
                  sx={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
                >
                  <ListItemIcon sx={{ minWidth: sidebarCollapsed ? 0 : 38 }}>
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && <ListItemText primary={item.label} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
            overflowX: 'hidden',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
