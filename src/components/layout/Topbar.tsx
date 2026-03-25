'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import authService from '@/auth/authService';
import QuickAccess from '@/components/ui/QuickAccess';
import { useNotificationBadge, useNotifications, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';
import FAQModal from '@/modules/help/modals/FAQModal';
import ContactSupportModal from '@/modules/help/modals/ContactSupportModal';

interface TopbarProps {
  onMobileMenuToggle?: () => void;
}

export default function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const router = useRouter();
  const { sidebarCollapsed } = useUIStore();
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const { count: unreadCount } = useNotificationBadge();
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications({ page_size: 5 });
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [helpAnchor, setHelpAnchor] = useState<null | HTMLElement>(null);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleLogout = () => {
    setAnchorEl(null);
    clearUser();
    authService.logout();
    router.push('/login');
  };

  const handleMarkAllRead = () => {
    markAllAsReadMutation.mutate();
    setNotifAnchor(null);
  };

  // Get user display info
  const userInitials = user?.username?.charAt(0).toUpperCase() ?? 'U';
  const userName = user?.username ?? 'User';
  const userEmail = user?.email ?? '';
  const roleName = user?.role?.name ?? 'User';
  
  // Get corporate logo
  const corporateLogo = user?.corporate?.logo;
  const corporateName = user?.corporate?.name ?? '';

  const sidebarWidth = sidebarCollapsed ? 68 : 248;
  const TOPBAR_HEIGHT = 60;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${sidebarWidth}px)` },
        ml: { md: `${sidebarWidth}px` },
        transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1), margin-left 0.2s cubic-bezier(0.4,0,0.2,1)',
        zIndex: (theme) => theme.zIndex.drawer - 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '60px !important',
          pl: { xs: 0.25, sm: 0.375 },
          pr: { xs: 2, sm: 3 },
          gap: 1,
        }}
      >
        {/* Mobile menu toggle */}
        <IconButton
          edge="start"
          onClick={onMobileMenuToggle}
          sx={{ display: { md: 'none' }, mr: 1, color: 'text.secondary' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Quick access – hover to expand */}
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <QuickAccess
            contentAreaLeft={sidebarWidth}
            topbarHeight={TOPBAR_HEIGHT}
          />
        </Box>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search modules, records..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            width: 280,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'grey.50',
              fontSize: '0.875rem',
            },
          }}
        />

        <Box sx={{ flex: 1 }} />

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              onClick={(e) => setNotifAnchor(e.currentTarget)}
              sx={{ color: 'text.secondary' }}
            >
              <Badge 
                badgeContent={notificationsLoading ? undefined : unreadCount} 
                color="error" 
                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 16, height: 16 } }}
              >
                {notificationsLoading ? <CircularProgress size={16} /> : <NotificationsIcon fontSize="small" />}
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Help">
            <IconButton 
              size="small" 
              sx={{ color: 'text.secondary' }}
              onClick={(e) => setHelpAnchor(e.currentTarget)}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <CurrencySwitcher />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1.5 }} />

          {/* User menu */}
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              px: 1,
              py: 0.5,
              borderRadius: 2,
              transition: 'background 0.15s ease',
              '&:hover': { backgroundColor: 'grey.100' },
            }}
          >
            {corporateLogo ? (
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                }}
                src={corporateLogo}
              />
            ) : (
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #43A047, #1B5E20)',
                }}
              >
                {userInitials}
              </Avatar>
            )}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="caption" fontWeight={600} lineHeight={1.3} display="block">
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.3} display="block" fontSize="0.7rem">
                {roleName}
              </Typography>
            </Box>
            <KeyboardArrowDownIcon fontSize="small" sx={{ color: 'text.disabled' }} />
          </Box>
        </Box>
      </Toolbar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 4,
          sx: { mt: 0.5, minWidth: 200, borderRadius: 2, border: '1px solid', borderColor: 'divider' },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: corporateName ? '1px solid' : 'none', borderColor: 'divider' }}>
          {corporateLogo && (
            <Box
              component="img"
              src={corporateLogo}
              sx={{
                height: 40,
                mb: 1,
                objectFit: 'contain',
                maxWidth: '100%',
              }}
              alt={corporateName}
            />
          )}
          <Typography variant="subtitle2" fontWeight={600}>{userName}</Typography>
          <Typography variant="caption" color="text.secondary" display="block">{userEmail}</Typography>
          {corporateName && (
            <Typography variant="caption" color="primary.main" display="block" sx={{ mt: 0.5 }}>
              {corporateName}
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1 }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          <Typography variant="body2">Profile</Typography>
        </MenuItem>
        {roleName === 'SUPERADMIN' && (
          <MenuItem 
            onClick={() => {
              setAnchorEl(null);
              router.push('/account');
            }} 
            sx={{ gap: 1.5, py: 1 }}
          >
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            <Typography variant="body2">Account</Typography>
          </MenuItem>
        )}
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1 }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1, color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
          <Typography variant="body2">Sign out</Typography>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 4,
          sx: { mt: 0.5, width: 320, borderRadius: 2, border: '1px solid', borderColor: 'divider' },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" fontWeight={600}>Notifications</Typography>
          <Typography 
            variant="caption" 
            color="primary.main" 
            sx={{ cursor: 'pointer' }}
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Typography>
        </Box>
        <Divider />
        {notificationsLoading ? (
          <Box sx={{ py: 2, px: 2 }}>
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
          </Box>
        ) : notificationsData?.results && notificationsData.results.length > 0 ? (
          notificationsData.results.map((n) => (
            <MenuItem 
              key={n.id} 
              sx={{ 
                gap: 1.5, 
                py: 1.5, 
                alignItems: 'flex-start',
                backgroundColor: n.is_read ? 'transparent' : 'grey.50',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  mt: 0.5,
                  flexShrink: 0,
                  backgroundColor:
                    n.notification_type === 'EMAIL' ? 'info.main' : 
                    n.notification_type === 'SMS' ? 'warning.main' : 
                    n.state === 'FAILED' ? 'error.main' : 'success.main',
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={n.is_read ? 400 : 600} noWrap>
                  {n.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ py: 3, px: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No notifications</Typography>
          </Box>
        )}
      </Menu>

      {/* Help Menu */}
      <Menu
        anchorEl={helpAnchor}
        open={Boolean(helpAnchor)}
        onClose={() => setHelpAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 4,
          sx: { mt: 0.5, minWidth: 220, borderRadius: 2, border: '1px solid', borderColor: 'divider' },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>Help & Support</Typography>
          <Typography variant="caption" color="text.secondary">Get help and resources</Typography>
        </Box>
        <Divider />
        <MenuItem 
          onClick={() => {
            setHelpAnchor(null);
            router.push('/help');
          }} 
          sx={{ gap: 1.5, py: 1 }}
        >
          <ListItemIcon><HelpOutlineIcon fontSize="small" /></ListItemIcon>
          <Typography variant="body2">Help Center</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setHelpAnchor(null);
            setFaqModalOpen(true);
          }} 
          sx={{ gap: 1.5, py: 1 }}
        >
          <ListItemIcon><HelpOutlineIcon fontSize="small" /></ListItemIcon>
          <Typography variant="body2">FAQs</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setHelpAnchor(null);
            setContactModalOpen(true);
          }} 
          sx={{ gap: 1.5, py: 1 }}
        >
          <ListItemIcon><HelpOutlineIcon fontSize="small" /></ListItemIcon>
          <Typography variant="body2">Contact Support</Typography>
        </MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Email: quidpath@gmail.com
          </Typography>
        </Box>
      </Menu>

      {/* Help Modals */}
      <FAQModal open={faqModalOpen} onClose={() => setFaqModalOpen(false)} />
      <ContactSupportModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} />

    </AppBar>
  );
}
