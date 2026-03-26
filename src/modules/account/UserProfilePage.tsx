'use client';

import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PageHeader from '@/components/ui/PageHeader';
import { useUserStore } from '@/store/userStore';
import { gatewayClient } from '@/services/apiClient';
import authService, { profileToStoredUser } from '@/auth/authService';

// Fields the user can edit themselves
const USER_EDITABLE = ['phone_number', 'address', 'city', 'country', 'zip_code', 'date_of_birth', 'gender'] as const;
// Fields only SUPERADMIN can change
const ADMIN_ONLY = ['username', 'email'] as const;

type UserEditableField = typeof USER_EDITABLE[number];

interface ProfileForm {
  phone_number: string;
  address: string;
  city: string;
  country: string;
  zip_code: string;
  date_of_birth: string;
  gender: string;
}

export default function UserProfilePage() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const isSuperAdmin = user?.role?.name === 'SUPERADMIN' || user?.is_superuser;

  const [tab, setTab] = useState(0);

  // ── profile edit state ────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    phone_number: (user as any)?.phone_number ?? '',
    address: (user as any)?.address ?? '',
    city: (user as any)?.city ?? '',
    country: (user as any)?.country ?? '',
    zip_code: (user as any)?.zip_code ?? '',
    date_of_birth: (user as any)?.date_of_birth ?? '',
    gender: (user as any)?.gender ?? '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── password change state ─────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── profile save ──────────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      // strip empty strings so we don't overwrite with blanks
      const payload = Object.fromEntries(
        Object.entries(profileForm).filter(([, v]) => v !== '')
      );
      await gatewayClient.post('/user-profile-update/', payload);
      // refresh store from backend
      const { data } = await authService.getProfile();
      setUser(profileToStoredUser(data));
      setEditing(false);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? 'Failed to update profile.';
      setProfileMsg({ type: 'error', text: msg });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileCancel = () => {
    setEditing(false);
    setProfileMsg(null);
    setProfileForm({
      phone_number: (user as any)?.phone_number ?? '',
      address: (user as any)?.address ?? '',
      city: (user as any)?.city ?? '',
      country: (user as any)?.country ?? '',
      zip_code: (user as any)?.zip_code ?? '',
      date_of_birth: (user as any)?.date_of_birth ?? '',
      gender: (user as any)?.gender ?? '',
    });
  };

  // ── password change ───────────────────────────────────────────────────────
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwLoading(true);
    try {
      await gatewayClient.post('/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? 'Failed to change password.';
      setPwMsg({ type: 'error', text: msg });
    } finally {
      setPwLoading(false);
    }
  };

  const userInitials = user?.username?.charAt(0).toUpperCase() ?? 'U';

  return (
    <Box>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and security settings"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Profile' }]}
        icon={<AccountCircleIcon sx={{ fontSize: 26 }} />}
        color="#43A047"
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="Personal Info" icon={<AccountCircleIcon />} iconPosition="start" />
        <Tab label="Change Password" icon={<LockIcon />} iconPosition="start" />
      </Tabs>

      {/* ── PERSONAL INFO TAB ── */}
      {tab === 0 && (
        <Grid container spacing={2.5}>
          {/* Avatar card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                {user?.corporate?.logo ? (
                  <Avatar
                    src={user.corporate.logo as string}
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2, border: '3px solid', borderColor: 'primary.main' }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 100, height: 100, mx: 'auto', mb: 2,
                      fontSize: '2.5rem', fontWeight: 700,
                      background: 'linear-gradient(135deg, #43A047, #1B5E20)',
                    }}
                  >
                    {userInitials}
                  </Avatar>
                )}
                <Typography variant="h6" fontWeight={600}>{user?.username}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>{user?.email}</Typography>
                <Chip label={user?.role?.name ?? 'User'} color="primary" size="small" sx={{ mt: 1 }} />
                {user?.corporate?.name && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    {user.corporate.name}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Info form */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Personal Information</Typography>
                  {!editing ? (
                    <Button startIcon={<EditIcon />} size="small" onClick={() => setEditing(true)}>
                      Edit
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={profileLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                        size="small" variant="contained"
                        onClick={handleProfileSave}
                        disabled={profileLoading}
                      >
                        Save
                      </Button>
                      <Button startIcon={<CancelIcon />} size="small" color="inherit" onClick={handleProfileCancel}>
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />

                {profileMsg && (
                  <Alert severity={profileMsg.type} sx={{ mb: 2 }} onClose={() => setProfileMsg(null)}>
                    {profileMsg.text}
                  </Alert>
                )}

                {/* Read-only admin-only fields */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                  Username and email can only be changed by your organisation admin.
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Username" value={user?.username ?? ''} disabled
                      size="small"
                      helperText={isSuperAdmin ? undefined : 'Admin only'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Email" value={user?.email ?? ''} disabled
                      size="small"
                      helperText={isSuperAdmin ? undefined : 'Admin only'}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                {/* Editable fields */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Phone Number" size="small"
                      value={editing ? profileForm.phone_number : ((user as any)?.phone_number ?? '')}
                      onChange={(e) => setProfileForm((f) => ({ ...f, phone_number: e.target.value }))}
                      disabled={!editing}
                      placeholder={editing ? 'e.g. +254712345678' : undefined}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Gender" size="small" select
                      value={editing ? profileForm.gender : ((user as any)?.gender ?? '')}
                      onChange={(e) => setProfileForm((f) => ({ ...f, gender: e.target.value }))}
                      disabled={!editing}
                      SelectProps={{ native: true }}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Date of Birth" size="small" type="date"
                      value={editing ? profileForm.date_of_birth : ((user as any)?.date_of_birth ?? '')}
                      onChange={(e) => setProfileForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                      disabled={!editing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Country" size="small"
                      value={editing ? profileForm.country : ((user as any)?.country ?? '')}
                      onChange={(e) => setProfileForm((f) => ({ ...f, country: e.target.value }))}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="City" size="small"
                      value={editing ? profileForm.city : ((user as any)?.city ?? '')}
                      onChange={(e) => setProfileForm((f) => ({ ...f, city: e.target.value }))}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="ZIP / Postal Code" size="small"
                      value={editing ? profileForm.zip_code : ((user as any)?.zip_code ?? '')}
                      onChange={(e) => setProfileForm((f) => ({ ...f, zip_code: e.target.value }))}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth label="Address" size="small"
                      value={editing ? profileForm.address : ((user as any)?.address ?? '')}
                      onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))}
                      disabled={!editing}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── CHANGE PASSWORD TAB ── */}
      {tab === 1 && (
        <Grid container spacing={2.5} justifyContent="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockIcon color="primary" />
                  Change Password
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {pwMsg && (
                  <Alert severity={pwMsg.type} sx={{ mb: 2 }} onClose={() => setPwMsg(null)}>
                    {pwMsg.text}
                  </Alert>
                )}

                <Box component="form" onSubmit={handlePasswordChange} noValidate>
                  <TextField
                    fullWidth required label="Current Password" margin="normal"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end" size="small">
                            {showCurrent ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth required label="New Password" margin="normal"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    helperText="Minimum 8 characters"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNew(!showNew)} edge="end" size="small">
                            {showNew ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth required label="Confirm New Password" margin="normal"
                    type={showNew ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmPassword.length > 0 && confirmPassword !== newPassword}
                    helperText={confirmPassword.length > 0 && confirmPassword !== newPassword ? 'Passwords do not match' : ''}
                  />
                  <Button
                    type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3 }}
                    disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
                    startIcon={pwLoading ? <CircularProgress size={20} /> : <LockIcon />}
                  >
                    {pwLoading ? 'Changing…' : 'Change Password'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
