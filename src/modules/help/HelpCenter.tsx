'use client';

import React, { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, TextField, InputAdornment, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageHeader from '@/components/ui/PageHeader';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        { q: 'How do I create my first invoice?', a: 'Navigate to Accounting > Invoices and click "New Invoice". Fill in customer details, add line items, and save.' },
        { q: 'How do I add a new employee?', a: 'Go to HRM > Employees and click "New Employee". Enter employee information and assign to a department.' },
        { q: 'How do I set up bank accounts?', a: 'Visit Banking > Accounts and click "New Account". Enter your bank details and set as default if needed.' },
      ],
    },
    {
      category: 'Accounting',
      questions: [
        { q: 'How do I record an expense?', a: 'Go to Accounting > Expenses, click "New Expense", select category, enter amount and details.' },
        { q: 'How do I reconcile bank statements?', a: 'Navigate to Banking > Reconciliation, select account and period, then match transactions.' },
        { q: 'How do I generate financial reports?', a: 'Visit Analytics or Reports section, select report type, choose date range, and generate.' },
      ],
    },
    {
      category: 'Sales & CRM',
      questions: [
        { q: 'How do I track deals?', a: 'Go to CRM > Deals, create new deal, set stage and probability, track through pipeline.' },
        { q: 'How do I convert a quote to invoice?', a: 'Open the quote, click action menu, select "Convert to Invoice".' },
        { q: 'How do I manage customer contacts?', a: 'Use Contacts module to add customers, or CRM module for leads and prospects.' },
      ],
    },
    {
      category: 'Inventory & POS',
      questions: [
        { q: 'How do I add products?', a: 'Navigate to Inventory > Products, click "New Product", enter details, pricing, and stock levels.' },
        { q: 'How do I process a POS sale?', a: 'Go to POS, ensure session is open, click "New Order", add items, select payment method.' },
        { q: 'How do I track stock movements?', a: 'Inventory > Stock Movements shows all transfers, adjustments, and transactions.' },
      ],
    },
    {
      category: 'HRM & Payroll',
      questions: [
        { q: 'How do I run payroll?', a: 'Go to HRM > Payroll, click "New Pay Run", select period and employees, review and process.' },
        { q: 'How do I approve leave requests?', a: 'HRM > Leave shows pending requests. Click action menu and approve or reject.' },
        { q: 'How do I manage departments?', a: 'HRM > Departments allows you to create and manage organizational structure.' },
      ],
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Help & Support"
        subtitle="Documentation, FAQs, and support resources"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Help' }]}
        icon={<HelpIcon sx={{ fontSize: 26 }} />}
        color="#FF9800"
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Links</Typography>
              <List>
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemText primary="User Guide" secondary="Complete system documentation" />
                </ListItem>
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemText primary="Video Tutorials" secondary="Step-by-step video guides" />
                </ListItem>
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemText primary="API Documentation" secondary="Developer resources" />
                </ListItem>
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemText primary="Contact Support" secondary="Get help from our team" />
                </ListItem>
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemText primary="Feature Requests" secondary="Suggest new features" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Frequently Asked Questions</Typography>
              {faqs.map((category) => (
                <Box key={category.category} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    {category.category}
                  </Typography>
                  {category.questions.map((faq, idx) => (
                    <Accordion key={idx}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{faq.q}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography color="text.secondary">{faq.a}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
