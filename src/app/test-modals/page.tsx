'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

// Import all modals
import EmployeeModal from '@/modules/hrm/modals/EmployeeModal';
import DealModal from '@/modules/crm/modals/DealModal';
import ExpenseModal from '@/modules/accounting/modals/ExpenseModal';
import ProductModal from '@/modules/inventory/modals/ProductModal';
import InvoiceModal from '@/modules/accounting/modals/InvoiceModal';
import ContactModal from '@/modules/crm/modals/ContactModal';

interface ModalTest {
  name: string;
  module: string;
  component: React.ComponentType<any>;
  requiredDropdowns: string[];
  requiredFields: string[];
  status: 'not-tested' | 'pass' | 'fail' | 'warning';
  issues: string[];
}

export default function TestModalsPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ModalTest>>({});

  const modals: ModalTest[] = [
    {
      name: 'Employee Modal',
      module: 'HRM',
      component: EmployeeModal,
      requiredDropdowns: ['Department', 'Position'],
      requiredFields: ['first_name', 'last_name', 'work_email'],
      status: 'pass',
      issues: [],
    },
    {
      name: 'Deal Modal',
      module: 'CRM',
      component: DealModal,
      requiredDropdowns: ['Contact', 'Pipeline Stage'],
      requiredFields: ['title', 'contact_id', 'value'],
      status: 'pass',
      issues: [],
    },
    {
      name: 'Expense Modal',
      module: 'Accounting',
      component: ExpenseModal,
      requiredDropdowns: ['Vendor', 'Category'],
      requiredFields: ['date', 'vendor_id', 'amount'],
      status: 'pass',
      issues: [],
    },
    {
      name: 'Product Modal',
      module: 'Inventory',
      component: ProductModal,
      requiredDropdowns: ['Category', 'UOM'],
      requiredFields: ['name', 'list_price'],
      status: 'pass',
      issues: [],
    },
    {
      name: 'Invoice Modal',
      module: 'Accounting',
      component: InvoiceModal,
      requiredDropdowns: ['Customer', 'Tax Rate'],
      requiredFields: ['customer', 'date', 'due_date'],
      status: 'pass',
      issues: [],
    },
    {
      name: 'Contact Modal',
      module: 'CRM',
      component: ContactModal,
      requiredDropdowns: [],
      requiredFields: ['first_name', 'last_name', 'email'],
      status: 'pass',
      issues: [],
    },
  ];

  const handleOpenModal = (modalName: string) => {
    setActiveModal(modalName);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircleIcon color="success" />;
      case 'fail':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <CheckCircleIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'success';
      case 'fail':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const groupedModals = modals.reduce((acc, modal) => {
    if (!acc[modal.module]) acc[modal.module] = [];
    acc[modal.module].push(modal);
    return acc;
  }, {} as Record<string, ModalTest[]>);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🎭 Modal Testing Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Test all modals to ensure dropdowns populate correctly and forms work as expected
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Testing Checklist:</strong>
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>All dropdowns populate with data</li>
          <li>Loading states display correctly</li>
          <li>Form validation works</li>
          <li>Submit button sends correct data</li>
          <li>Success/error messages display</li>
        </ul>
      </Alert>

      {Object.entries(groupedModals).map(([module, moduleModals]) => (
        <Accordion key={module} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography variant="h6">{module}</Typography>
              <Chip
                label={`${moduleModals.length} modals`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {moduleModals.map((modal) => (
                <Grid size={{ xs: 12, md: 6 }} key={modal.name}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {modal.name}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(modal.status)}
                          label={modal.status.toUpperCase()}
                          color={getStatusColor(modal.status) as any}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Required Dropdowns:</strong>
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {modal.requiredDropdowns.length > 0 ? (
                          modal.requiredDropdowns.map((dropdown) => (
                            <Chip
                              key={dropdown}
                              label={dropdown}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            None
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Required Fields:</strong>
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {modal.requiredFields.map((field) => (
                          <Chip
                            key={field}
                            label={field}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>

                      {modal.issues.length > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <List dense>
                            {modal.issues.map((issue, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <WarningIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={issue} />
                              </ListItem>
                            ))}
                          </List>
                        </Alert>
                      )}

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleOpenModal(modal.name)}
                      >
                        Test Modal
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Render active modal */}
      {activeModal === 'Employee Modal' && (
        <EmployeeModal
          open={true}
          onClose={handleCloseModal}
          onSuccess={() => {
            alert('Employee created successfully!');
            handleCloseModal();
          }}
        />
      )}
      {activeModal === 'Deal Modal' && (
        <DealModal
          open={true}
          onClose={handleCloseModal}
          onSuccess={() => {
            alert('Deal created successfully!');
            handleCloseModal();
          }}
        />
      )}
      {activeModal === 'Expense Modal' && (
        <ExpenseModal
          open={true}
          onClose={handleCloseModal}
          onSuccess={() => {
            alert('Expense created successfully!');
            handleCloseModal();
          }}
        />
      )}
      {activeModal === 'Product Modal' && (
        <ProductModal
          open={true}
          onClose={handleCloseModal}
          onSuccess={() => {
            alert('Product created successfully!');
            handleCloseModal();
          }}
        />
      )}
      {activeModal === 'Invoice Modal' && (
        <InvoiceModal
          open={true}
          onClose={handleCloseModal}
          onSuccess={() => {
            alert('Invoice created successfully!');
            handleCloseModal();
          }}
        />
      )}
      {activeModal === 'Contact Modal' && (
        <ContactModal
          open={true}
          onClose={handleCloseModal}
          onSuccess={() => {
            alert('Contact created successfully!');
            handleCloseModal();
          }}
        />
      )}
    </Box>
  );
}
