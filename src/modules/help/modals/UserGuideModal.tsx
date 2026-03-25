'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SettingsIcon from '@mui/icons-material/Settings';

interface UserGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const guides = [
  {
    id: 'accounting',
    title: 'Accounting Module',
    icon: <AccountBalanceIcon />,
    content: `
      <h3>Getting Started with Accounting</h3>
      <p>The accounting module helps you manage your financial records, invoices, and expenses.</p>
      
      <h4>Creating Invoices</h4>
      <ol>
        <li>Navigate to Accounting > Invoices</li>
        <li>Click "New Invoice"</li>
        <li>Select or create a customer</li>
        <li>Add line items with descriptions and amounts</li>
        <li>Set payment terms and due date</li>
        <li>Save and send to customer</li>
      </ol>
      
      <h4>Recording Expenses</h4>
      <ol>
        <li>Go to Accounting > Expenses</li>
        <li>Click "New Expense"</li>
        <li>Select expense category</li>
        <li>Enter amount and description</li>
        <li>Attach receipt if available</li>
        <li>Save the expense</li>
      </ol>
      
      <h4>Journal Entries</h4>
      <p>For advanced accounting, use journal entries to record debits and credits directly to your chart of accounts.</p>
    `,
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    icon: <InventoryIcon />,
    content: `
      <h3>Managing Your Inventory</h3>
      <p>Track products, stock levels, and movements efficiently.</p>
      
      <h4>Adding Products</h4>
      <ol>
        <li>Navigate to Inventory > Products</li>
        <li>Click "New Product"</li>
        <li>Enter product name, SKU, and description</li>
        <li>Set pricing (cost and selling price)</li>
        <li>Define initial stock quantity</li>
        <li>Set reorder level for low stock alerts</li>
      </ol>
      
      <h4>Stock Adjustments</h4>
      <p>Use stock adjustments to correct inventory counts or record damaged/lost items.</p>
      
      <h4>Stock Transfers</h4>
      <p>Transfer stock between warehouses or locations to maintain accurate inventory across multiple sites.</p>
    `,
  },
  {
    id: 'pos',
    title: 'Point of Sale (POS)',
    icon: <PointOfSaleIcon />,
    content: `
      <h3>Using the POS System</h3>
      <p>Process sales quickly and efficiently with our POS module.</p>
      
      <h4>Opening a Session</h4>
      <ol>
        <li>Go to POS module</li>
        <li>Click "Open Session"</li>
        <li>Select terminal and enter opening cash amount</li>
        <li>Confirm to start selling</li>
      </ol>
      
      <h4>Processing Sales</h4>
      <ol>
        <li>Click "New Order"</li>
        <li>Search and add products</li>
        <li>Adjust quantities as needed</li>
        <li>Apply discounts if applicable</li>
        <li>Select payment method (Cash/Card/Mobile)</li>
        <li>Complete the sale</li>
      </ol>
      
      <h4>Closing a Session</h4>
      <p>At end of day, close your session by counting cash and reconciling with system records.</p>
    `,
  },
  {
    id: 'hrm',
    title: 'Human Resource Management',
    icon: <PeopleIcon />,
    content: `
      <h3>Managing Your Team</h3>
      <p>Handle employee records, leave, and payroll efficiently.</p>
      
      <h4>Adding Employees</h4>
      <ol>
        <li>Navigate to HRM > Employees</li>
        <li>Click "New Employee"</li>
        <li>Enter personal information</li>
        <li>Assign to department and position</li>
        <li>Set employment details and salary</li>
        <li>Add emergency contacts</li>
      </ol>
      
      <h4>Leave Management</h4>
      <p>Employees can request leave through the system. Managers approve or reject requests from the HRM dashboard.</p>
      
      <h4>Running Payroll</h4>
      <ol>
        <li>Go to HRM > Payroll</li>
        <li>Click "New Pay Run"</li>
        <li>Select pay period and employees</li>
        <li>Review calculations</li>
        <li>Process and generate payslips</li>
      </ol>
    `,
  },
  {
    id: 'crm',
    title: 'Customer Relationship Management',
    icon: <BusinessCenterIcon />,
    content: `
      <h3>Managing Customer Relationships</h3>
      <p>Track leads, deals, and customer interactions.</p>
      
      <h4>Adding Contacts</h4>
      <ol>
        <li>Navigate to CRM > Contacts</li>
        <li>Click "New Contact"</li>
        <li>Enter contact details</li>
        <li>Assign tags and categories</li>
        <li>Save the contact</li>
      </ol>
      
      <h4>Managing Deals</h4>
      <ol>
        <li>Go to CRM > Deals</li>
        <li>Create new deal with value and stage</li>
        <li>Link to contact/company</li>
        <li>Track through pipeline stages</li>
        <li>Update probability and close date</li>
      </ol>
      
      <h4>Activities & Follow-ups</h4>
      <p>Log calls, meetings, and tasks to maintain complete customer interaction history.</p>
    `,
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: <AssessmentIcon />,
    content: `
      <h3>Generating Reports</h3>
      <p>Access comprehensive reports and analytics across all modules.</p>
      
      <h4>Financial Reports</h4>
      <ul>
        <li>Profit & Loss Statement</li>
        <li>Balance Sheet</li>
        <li>Cash Flow Statement</li>
        <li>Aged Receivables/Payables</li>
      </ul>
      
      <h4>Sales Reports</h4>
      <ul>
        <li>Sales by Product</li>
        <li>Sales by Customer</li>
        <li>Sales Trends</li>
        <li>Top Performing Items</li>
      </ul>
      
      <h4>Inventory Reports</h4>
      <ul>
        <li>Stock Valuation</li>
        <li>Stock Movement</li>
        <li>Low Stock Alert</li>
        <li>Inventory Aging</li>
      </ul>
    `,
  },
  {
    id: 'settings',
    title: 'System Settings',
    icon: <SettingsIcon />,
    content: `
      <h3>Configuring Your System</h3>
      <p>Customize the system to match your business needs.</p>
      
      <h4>General Settings</h4>
      <ul>
        <li>Company information and logo</li>
        <li>Base currency and timezone</li>
        <li>Date and number formats</li>
      </ul>
      
      <h4>User Management</h4>
      <p>Create users, assign roles, and manage permissions to control access to different modules.</p>
      
      <h4>Tax Configuration</h4>
      <p>Set up tax rates for different regions and product categories.</p>
      
      <h4>Bank Accounts</h4>
      <p>Add your bank accounts for reconciliation and payment tracking.</p>
      
      <h4>Email Templates</h4>
      <p>Customize email templates for invoices, quotes, and notifications.</p>
    `,
  },
];

export default function UserGuideModal({ open, onClose }: UserGuideModalProps) {
  const [selectedGuide, setSelectedGuide] = useState(guides[0]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          User Guide
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: '70vh', display: 'flex' }}>
        <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
          <List>
            {guides.map((guide) => (
              <ListItem key={guide.id} disablePadding>
                <ListItemButton
                  selected={selectedGuide.id === guide.id}
                  onClick={() => setSelectedGuide(guide)}
                >
                  <ListItemIcon>{guide.icon}</ListItemIcon>
                  <ListItemText primary={guide.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
            <Box
              dangerouslySetInnerHTML={{ __html: selectedGuide.content }}
              sx={{
                '& h3': { mt: 0, mb: 2, color: 'primary.main' },
                '& h4': { mt: 3, mb: 1.5, fontWeight: 600 },
                '& p': { mb: 2, lineHeight: 1.7 },
                '& ol, & ul': { pl: 3, mb: 2 },
                '& li': { mb: 1 },
              }}
            />
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
