'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Tab, Tabs, Card, CardContent, Typography, List, ListItem, ListItemText, ListItemIcon, Alert } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockIcon from '@mui/icons-material/Lock';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { usePermissions } from '@/hooks/usePermissions';

export default function SettingsDashboard() {
  const [tab, setTab] = useState(0);
  const router = useRouter();
  const { canAccessSettings, isSuperuser, isAdmin } = usePermissions();

  useEffect(() => {
    if (!canAccessSettings()) {
      router.push('/dashboard');
    }
  }, [canAccessSettings, router]);

  if (!canAccessSettings()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" icon={<LockIcon />}>
          Access Denied. Only superusers and administrators can access settings.
        </Alert>
      </Box>
    );
  }

  const renderSettingItem = (title: string, description: string, onClick: () => void) => (
    <ListItem 
      component="button" 
      onClick={onClick} 
      sx={{ 
        borderRadius: 1, 
        mb: 0.5, 
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        width: '100%',
        textAlign: 'left',
        border: 'none',
        background: 'none',
        padding: '8px 16px'
      }}
    >
      <ListItemText primary={title} secondary={description} />
      <ListItemIcon sx={{ minWidth: 'auto' }}>
        <ChevronRightIcon />
      </ListItemIcon>
    </ListItem>
  );

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Configure your ERP system preferences and defaults"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Settings' }]}
        icon={<SettingsIcon sx={{ fontSize: 26 }} />}
        color="#607D8B"
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="General" />
        <Tab label="Accounting" />
        <Tab label="Sales" />
        <Tab label="Purchases" />
        <Tab label="Banking" />
        <Tab label="Tax" />
        <Tab label="Contacts" />
        <Tab label="HRM" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Company Settings</Typography>
                <List>
                  {renderSettingItem('Company Profile', 'Business name, logo, and contact information', () => {})}
                  {renderSettingItem('Business Details', 'Industry, size, and registration info', () => {})}
                  {renderSettingItem('Fiscal Year', 'Set fiscal year start and end dates', () => {})}
                  {renderSettingItem('Currency', 'Default currency and exchange rates', () => {})}
                  {renderSettingItem('Time Zone', 'Set your business time zone', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>System Settings</Typography>
                <List>
                  {renderSettingItem('Users & Permissions', 'Manage user access and roles', () => {})}
                  {renderSettingItem('Notifications', 'Email and system notification preferences', () => {})}
                  {renderSettingItem('Integrations', 'Connect third-party services', () => {})}
                  {renderSettingItem('Data Import/Export', 'Bulk data management', () => {})}
                  {renderSettingItem('Backup & Restore', 'Data backup configuration', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Accounting Settings</Typography>
                <List>
                  {renderSettingItem('Chart of Accounts', 'Manage account categories and codes', () => {})}
                  {renderSettingItem('Fixed Assets', 'Asset categories and depreciation rules', () => {})}
                  {renderSettingItem('Journal Entry Templates', 'Predefined journal entry formats', () => {})}
                  {renderSettingItem('Accounting Periods', 'Lock/unlock accounting periods', () => {})}
                  {renderSettingItem('Default Accounts', 'Set default GL accounts', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Financial Settings</Typography>
                <List>
                  {renderSettingItem('Number Formats', 'Currency and number display formats', () => {})}
                  {renderSettingItem('Rounding Rules', 'Set rounding preferences', () => {})}
                  {renderSettingItem('Multi-Currency', 'Enable and configure currencies', () => {})}
                  {renderSettingItem('Cost Centers', 'Department cost tracking', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sales Settings</Typography>
                <List>
                  {renderSettingItem('Invoice Templates', 'Customize invoice layouts and branding', () => {})}
                  {renderSettingItem('Quote Settings', 'Quote numbering and validity periods', () => {})}
                  {renderSettingItem('Payment Terms', 'Define payment terms and conditions', () => {})}
                  {renderSettingItem('Online Payments', 'Configure payment gateways', () => {})}
                  {renderSettingItem('Sales Tax Rates', 'Manage sales tax configurations', () => {})}
                  {renderSettingItem('Discount Rules', 'Set up discount policies', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Customer Settings</Typography>
                <List>
                  {renderSettingItem('Customer Categories', 'Segment customers by type', () => {})}
                  {renderSettingItem('Credit Limits', 'Set customer credit policies', () => {})}
                  {renderSettingItem('Pricing Tiers', 'Customer-specific pricing', () => {})}
                  {renderSettingItem('Loyalty Programs', 'Configure reward programs', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 3 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Purchase Settings</Typography>
                <List>
                  {renderSettingItem('Purchase Order Templates', 'PO formats and approval workflows', () => {})}
                  {renderSettingItem('Vendor Bill Settings', 'Bill processing and matching rules', () => {})}
                  {renderSettingItem('Expense Categories', 'Categorize business expenses', () => {})}
                  {renderSettingItem('Approval Workflows', 'Multi-level purchase approvals', () => {})}
                  {renderSettingItem('Reorder Points', 'Automatic reorder triggers', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Supplier Settings</Typography>
                <List>
                  {renderSettingItem('Supplier Categories', 'Organize suppliers by type', () => {})}
                  {renderSettingItem('Payment Terms', 'Vendor payment conditions', () => {})}
                  {renderSettingItem('Supplier Ratings', 'Performance evaluation criteria', () => {})}
                  {renderSettingItem('Purchase Limits', 'Set spending limits per supplier', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 4 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Banking Settings</Typography>
                <List>
                  {renderSettingItem('Bank Accounts', 'Manage connected bank accounts', () => {})}
                  {renderSettingItem('Bank Rules', 'Automatic transaction categorization', () => {})}
                  {renderSettingItem('Bank Feeds', 'Configure automatic bank imports', () => {})}
                  {renderSettingItem('Reconciliation Rules', 'Auto-matching rules', () => {})}
                  {renderSettingItem('Payment Methods', 'Available payment options', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 5 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Tax Settings</Typography>
                <List>
                  {renderSettingItem('Tax Rates', 'Configure tax rates and types', () => {})}
                  {renderSettingItem('Tax Codes', 'Set up tax code mappings', () => {})}
                  {renderSettingItem('Tax Jurisdictions', 'Multi-jurisdiction tax rules', () => {})}
                  {renderSettingItem('Tax Filing', 'Filing frequency and deadlines', () => {})}
                  {renderSettingItem('Tax Exemptions', 'Manage tax-exempt entities', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 6 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Contact Settings</Typography>
                <List>
                  {renderSettingItem('Contact Types', 'Define contact categories', () => {})}
                  {renderSettingItem('Custom Fields', 'Add custom contact fields', () => {})}
                  {renderSettingItem('Import Contacts', 'Bulk contact import', () => {})}
                  {renderSettingItem('Duplicate Detection', 'Prevent duplicate contacts', () => {})}
                  {renderSettingItem('Contact Sync', 'Sync with external systems', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 7 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>HRM Settings</Typography>
                <List>
                  {renderSettingItem('Payroll Settings', 'Pay periods, deductions, and benefits', () => {})}
                  {renderSettingItem('Leave Policies', 'Annual leave, sick leave rules', () => {})}
                  {renderSettingItem('Department Structure', 'Organizational hierarchy', () => {})}
                  {renderSettingItem('Employee Categories', 'Job roles and classifications', () => {})}
                  {renderSettingItem('Attendance Rules', 'Working hours and overtime', () => {})}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
