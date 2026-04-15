'use client';

import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Chip, LinearProgress, Button, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import { IntegrationStatus } from '@/services/inventoryService';

interface IntegrationHealthPanelProps {
  health: IntegrationStatus | undefined;
  loading: boolean;
  onRefresh: () => void;
}

export default function IntegrationHealthPanel({ health, loading, onRefresh }: IntegrationHealthPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Integration Health Check</Typography>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Checking service connectivity...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load integration health status. Please try again.
          </Alert>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={onRefresh}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const services = health.services || {};
  const serviceNames = Object.keys(services);
  const onlineServices = serviceNames.filter(name => services[name].status === 'online');
  const offlineServices = serviceNames.filter(name => services[name].status === 'offline');
  const errorServices = serviceNames.filter(name => services[name].status === 'error');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon sx={{ color: '#27AE60', fontSize: 20 }} />;
      case 'offline':
        return <ErrorIcon sx={{ color: '#E53E3E', fontSize: 20 }} />;
      case 'error':
        return <WarningIcon sx={{ color: '#F2A40E', fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'error':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Overall Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Integration Health Status</Typography>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={onRefresh}
              size="small"
              variant="outlined"
            >
              Refresh
            </Button>
          </Box>

          {health.all_services_online ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              All services are online and functioning properly. Full ERP integration is active.
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {offlineServices.length + errorServices.length} service(s) are experiencing issues. 
              Some features may be limited.
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#E8F5E9', borderRadius: 2 }}>
                <Typography variant="h3" color="success.main">{onlineServices.length}</Typography>
                <Typography variant="body2" color="text.secondary">Online</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#FFF3E0', borderRadius: 2 }}>
                <Typography variant="h3" color="warning.main">{errorServices.length}</Typography>
                <Typography variant="body2" color="text.secondary">Errors</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#FFEBEE', borderRadius: 2 }}>
                <Typography variant="h3" color="error.main">{offlineServices.length}</Typography>
                <Typography variant="body2" color="text.secondary">Offline</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Service Details */}
      <Typography variant="h6" gutterBottom>Service Details</Typography>
      <Grid container spacing={2.5}>
        {serviceNames.map((serviceName) => {
          const service = services[serviceName];
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={serviceName}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(service.status)}
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        {serviceName}
                      </Typography>
                    </Box>
                    <Chip 
                      label={service.status.toUpperCase()} 
                      size="small"
                      color={getStatusColor(service.status) as any}
                    />
                  </Box>

                  {service.status === 'online' && service.response_time !== undefined && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Response Time
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {(service.response_time * 1000).toFixed(0)}ms
                      </Typography>
                    </Box>
                  )}

                  {service.status === 'error' && service.error && (
                    <Box>
                      <Typography variant="body2" color="error.main">
                        Error: {service.error}
                      </Typography>
                    </Box>
                  )}

                  {service.status === 'offline' && (
                    <Box>
                      <Typography variant="body2" color="error.main">
                        Service is not responding. Please check the service status.
                      </Typography>
                    </Box>
                  )}

                  {/* Service Description */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      {getServiceDescription(serviceName)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Integration Features */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Integration Features</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" gutterBottom>Product Management</Typography>
              <Typography variant="body2" color="text.secondary">
                • Automatic sync to Accounting (inventory items)<br />
                • Automatic sync to POS (product catalog)<br />
                • Automatic sync to Projects (materials)<br />
                • Notifications to CRM (product catalog)<br />
                • Notifications to HRM (asset tracking)
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" gutterBottom>Stock Operations</Typography>
              <Typography variant="body2" color="text.secondary">
                • Automatic accounting entries (COGS, inventory valuation)<br />
                • Real-time POS stock updates<br />
                • Project material tracking<br />
                • HRM asset location updates<br />
                • Complete audit trail
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

function getServiceDescription(serviceName: string): string {
  const descriptions: Record<string, string> = {
    'Accounting': 'Manages inventory items, journal entries, and COGS calculations',
    'POS': 'Provides product catalog and real-time stock levels for sales',
    'CRM': 'Tracks product catalog and customer purchase history',
    'HRM': 'Manages asset tracking and equipment locations',
    'Projects': 'Handles materials, resources, and usage tracking',
  };
  return descriptions[serviceName] || 'ERP service integration';
}
