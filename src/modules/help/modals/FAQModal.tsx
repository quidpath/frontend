'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FAQModalProps {
  open: boolean;
  onClose: () => void;
}

const faqs = [
  {
    category: 'Getting Started',
    color: '#4CAF50',
    questions: [
      {
        q: 'How do I create my first invoice?',
        a: 'Navigate to Accounting > Invoices and click "New Invoice". Fill in customer details, add line items with descriptions and amounts, set payment terms, and save. You can then send it directly to your customer via email.',
      },
      {
        q: 'How do I add a new employee?',
        a: 'Go to HRM > Employees and click "New Employee". Enter employee information including name, email, phone, department, position, and employment details. You can also add emergency contacts and upload documents.',
      },
      {
        q: 'How do I set up bank accounts?',
        a: 'Visit Settings > Banking or Banking > Accounts and click "New Account". Enter your bank name, account name, account number, and currency. You can set one account as default for transactions.',
      },
      {
        q: 'How do I invite team members?',
        a: 'Go to Settings > Users or Org Admin > Users, click "Invite User", enter their email and assign a role. They will receive an invitation email to join your organization.',
      },
    ],
  },
  {
    category: 'Accounting & Finance',
    color: '#2196F3',
    questions: [
      {
        q: 'How do I record an expense?',
        a: 'Go to Accounting > Expenses, click "New Expense", select expense category, enter amount and description, attach receipt if available, and save. The expense will be reflected in your financial reports.',
      },
      {
        q: 'How do I reconcile bank statements?',
        a: 'Navigate to Banking > Reconciliation, select your bank account and period, then match transactions from your bank statement with recorded transactions in the system. Mark matched items and resolve discrepancies.',
      },
      {
        q: 'How do I generate financial reports?',
        a: 'Visit Analytics or Reports section, select the report type (P&L, Balance Sheet, Cash Flow), choose date range, and click generate. You can export reports to PDF or Excel.',
      },
      {
        q: 'How do I handle multiple currencies?',
        a: 'Set your base currency in Settings > General. You can switch display currency from the top bar. The system automatically converts amounts using live exchange rates from Frankfurter API.',
      },
      {
        q: 'How do I create journal entries?',
        a: 'Go to Accounting > Journal Entries, click "New Entry", add debit and credit lines ensuring they balance, enter reference and description, then save. This is for advanced accounting adjustments.',
      },
    ],
  },
  {
    category: 'Sales & CRM',
    color: '#FF9800',
    questions: [
      {
        q: 'How do I track deals in the pipeline?',
        a: 'Go to CRM > Deals, create new deal with value and stage, link to contact/company, and track through pipeline stages. Update probability and expected close date as the deal progresses.',
      },
      {
        q: 'How do I convert a quote to invoice?',
        a: 'Open the quote from Accounting > Quotes, click the action menu (three dots), and select "Convert to Invoice". The system will create an invoice with the same line items.',
      },
      {
        q: 'How do I manage customer contacts?',
        a: 'Use CRM > Contacts to add customers, leads, and prospects. Enter contact details, company information, and tags. You can also log activities like calls, meetings, and emails.',
      },
      {
        q: 'How do I create a sales campaign?',
        a: 'Navigate to CRM > Campaigns, click "New Campaign", set campaign name, type (email/sms/social), budget, dates, and add target contacts. Track campaign performance from the dashboard.',
      },
    ],
  },
  {
    category: 'Inventory & POS',
    color: '#9C27B0',
    questions: [
      {
        q: 'How do I add products to inventory?',
        a: 'Navigate to Inventory > Products, click "New Product", enter product name, SKU, description, set pricing (cost and selling price), define initial stock quantity, and set reorder level for low stock alerts.',
      },
      {
        q: 'How do I process a POS sale?',
        a: 'Go to POS module, ensure session is open, click "New Order", search and add products, adjust quantities, apply discounts if needed, select payment method (Cash/Card/Mobile), and complete the sale.',
      },
      {
        q: 'How do I track stock movements?',
        a: 'Inventory > Stock Movements shows all transfers, adjustments, and transactions. You can filter by date, product, or movement type to track inventory changes.',
      },
      {
        q: 'How do I handle stock adjustments?',
        a: 'Use Inventory > Adjustments to correct inventory counts or record damaged/lost items. Enter the product, adjustment quantity (positive or negative), reason, and save.',
      },
      {
        q: 'How do I transfer stock between locations?',
        a: 'Go to Inventory > Transfers, select source and destination locations, add products with quantities, and confirm transfer. Stock levels update automatically at both locations.',
      },
    ],
  },
  {
    category: 'HRM & Payroll',
    color: '#E91E63',
    questions: [
      {
        q: 'How do I run payroll?',
        a: 'Go to HRM > Payroll, click "New Pay Run", select pay period and employees, review calculations including deductions and bonuses, then process and generate payslips. Employees can view their payslips online.',
      },
      {
        q: 'How do I approve leave requests?',
        a: 'HRM > Leave shows pending requests. Click on a request to view details, then approve or reject with optional comments. The employee receives a notification of the decision.',
      },
      {
        q: 'How do I manage departments?',
        a: 'HRM > Departments allows you to create and manage organizational structure. Add departments, assign department heads, and organize employees by department.',
      },
      {
        q: 'How do I track employee attendance?',
        a: 'Use HRM > Attendance to record clock-in/out times. You can manually enter attendance or integrate with biometric devices. Generate attendance reports for payroll processing.',
      },
      {
        q: 'How do I set up employee benefits?',
        a: 'Go to HRM > Benefits, define benefit types (health insurance, pension, etc.), set contribution amounts, and assign to employees. Benefits are automatically calculated in payroll.',
      },
    ],
  },
  {
    category: 'Projects & Tasks',
    color: '#00BCD4',
    questions: [
      {
        q: 'How do I create a project?',
        a: 'Navigate to Projects, click "New Project", enter project name, description, client, budget, start and end dates. Assign team members and set project status.',
      },
      {
        q: 'How do I track project time?',
        a: 'Use the time tracking feature in Projects to log hours spent on tasks. Team members can start/stop timers or manually enter time. Generate time reports for billing.',
      },
      {
        q: 'How do I manage project tasks?',
        a: 'Within a project, create tasks with descriptions, assignees, due dates, and priorities. Track task progress and mark as complete when done.',
      },
      {
        q: 'How do I bill clients for projects?',
        a: 'Go to project details, click "Create Invoice", select billable time entries and expenses, review amounts, and generate invoice. Send directly to client.',
      },
    ],
  },
  {
    category: 'Settings & Configuration',
    color: '#607D8B',
    questions: [
      {
        q: 'How do I change my company logo?',
        a: 'Go to Settings > General, click on the logo area to upload a new image. The logo appears on invoices, quotes, and other documents.',
      },
      {
        q: 'How do I set up tax rates?',
        a: 'Navigate to Settings > Tax Rates, click "New Tax Rate", enter tax name, rate percentage, and description. Assign tax rates to products and services.',
      },
      {
        q: 'How do I manage user permissions?',
        a: 'Go to Settings > Roles & Permissions, select a role, and configure module access and permissions. Assign roles to users to control what they can see and do.',
      },
      {
        q: 'How do I customize email templates?',
        a: 'Visit Settings > Email Templates, select template type (invoice, quote, etc.), edit subject and body using available variables, preview, and save.',
      },
      {
        q: 'How do I backup my data?',
        a: 'Contact support at quidpath@gmail.com to request a data backup. We recommend regular backups for data security. Enterprise plans include automated daily backups.',
      },
    ],
  },
  {
    category: 'Billing & Subscription',
    color: '#FF5722',
    questions: [
      {
        q: 'How do I upgrade my plan?',
        a: 'Go to Account > Billing & Subscription, select a new plan, enter M-Pesa phone number, and complete payment. Your account is upgraded immediately upon successful payment.',
      },
      {
        q: 'How long is the free trial?',
        a: 'New organizations get a 14-day free trial with full access to all features. No credit card required. You can upgrade anytime during or after the trial.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We currently accept M-Pesa payments. Support for credit cards and bank transfers is coming soon. Contact support for alternative payment arrangements.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, you can cancel anytime from Account > Billing. Your access continues until the end of the current billing period. No refunds for partial months.',
      },
      {
        q: 'How do I view my invoices?',
        a: 'Go to Account > Billing & Subscription, scroll to the Invoices section. You can view, download, and print all your billing invoices.',
      },
    ],
  },
];

export default function FAQModal({ open, onClose }: FAQModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | false>('Getting Started');

  const filteredFAQs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (faq) =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find answers to common questions
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Stack spacing={2}>
          {filteredFAQs.map((category) => (
            <Box key={category.category}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={category.category}
                  size="small"
                  sx={{ bgcolor: category.color, color: 'white', fontWeight: 600 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {category.questions.length} question{category.questions.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              {category.questions.map((faq, idx) => (
                <Accordion
                  key={idx}
                  expanded={expandedCategory === `${category.category}-${idx}`}
                  onChange={(_, isExpanded) =>
                    setExpandedCategory(isExpanded ? `${category.category}-${idx}` : false)
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={500}>{faq.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {faq.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Stack>

        {filteredFAQs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No FAQs found matching "{searchQuery}"
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try different keywords or contact support for help
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
