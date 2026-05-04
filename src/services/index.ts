/**
 * QuidPath ERP - Services Index
 * Central export for all API services
 */

// Core
export { gatewayClient } from './apiClient';

// Module Services
export { default as accountingService } from './accountingService';
export { default as inventoryService } from './inventoryService';
export { default as crmService } from './crmService';
export { default as hrmService } from './hrmService';
export { default as posService } from './posService';
export { default as purchasingService } from './purchasingService';
export { default as billingService } from './billingService';

// Individual service exports from accounting
export {
  customerService,
  invoiceService,
  quoteService,
  paymentService,
  vendorService,
  purchaseOrderService,
  chartOfAccountsService,
  journalEntryService,
  bankAccountService,
  bankRuleService,
  vendorBillService,
  expenseService,
  pettyCashService,
  taxRateService,
  fixedAssetService,
  dashboardService,
  reportService,
  contactService,
  productService,
  settingsService,
  payrollService,
} from './accountingService';

// Re-export types
export type { Plan, Subscription, SubscriptionStatus, Payment } from './billingService';
