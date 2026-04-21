/**
 * Endpoint Testing Utility
 * Tests all API endpoints from the frontend
 */

import accountingService from '@/services/accountingService';
import bankingService from '@/services/bankingService';
import crmService from '@/services/crmService';
import hrmService from '@/services/hrmService';
import inventoryService from '@/services/inventoryService';
import posService from '@/services/posService';
import projectsService from '@/services/projectsService';
import taxService from '@/services/taxService';
import financeService from '@/services/financeService';

export interface TestResult {
  module: string;
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  duration: number;
}

export class EndpointTester {
  private results: TestResult[] = [];

  async testAll(): Promise<TestResult[]> {
    this.results = [];
    await this.testAccounting();
    await this.testBanking();
    await this.testCRM();
    await this.testHRM();
    await this.testInventory();
    await this.testPOS();
    await this.testProjects();
    await this.testTax();
    await this.testFinance();
    return this.results;
  }

  private async testEndpoint(
    module: string,
    endpoint: string,
    method: string,
    testFn: () => Promise<any>
  ): Promise<void> {
    const start = Date.now();
    try {
      await testFn();
      const duration = Date.now() - start;
      this.results.push({ module, endpoint, method, status: 'success', message: `Success (${duration}ms)`, duration });
    } catch (error: any) {
      const duration = Date.now() - start;
      const msg = error?.response?.data?.error || error?.message || 'Unknown error';
      this.results.push({ module, endpoint, method, status: 'error', message: `Error: ${msg}`, duration });
    }
  }

  async testAccounting() {
    await this.testEndpoint('Accounting', '/invoice/list/', 'GET', () => accountingService.getInvoices());
    await this.testEndpoint('Accounting', '/journal/list/', 'GET', () => accountingService.getJournalEntries());
    await this.testEndpoint('Accounting', '/expense/list/', 'GET', () => accountingService.getExpenses());
  }

  async testBanking() {
    await this.testEndpoint('Banking', '/bank-account/list/', 'GET', () => bankingService.getBankAccounts());
    await this.testEndpoint('Banking', '/transaction/list/', 'GET', () => bankingService.getTransactions());
  }

  async testCRM() {
    await this.testEndpoint('CRM', '/api/crm/contacts/', 'GET', () => crmService.getContacts());
    await this.testEndpoint('CRM', '/api/crm/pipeline/opportunities/', 'GET', () => crmService.getDeals());
    await this.testEndpoint('CRM', '/api/crm/pipeline/stages/', 'GET', () => crmService.getPipelineStages());
    await this.testEndpoint('CRM', '/api/crm/campaigns/', 'GET', () => crmService.getCampaigns());
    await this.testEndpoint('CRM', '/api/crm/contacts/activities/', 'GET', () => crmService.getActivities());
  }

  async testHRM() {
    await this.testEndpoint('HRM', '/api/hrm/employees/', 'GET', () => hrmService.getEmployees());
    await this.testEndpoint('HRM', '/api/hrm/org/departments/', 'GET', () => hrmService.getDepartments());
    await this.testEndpoint('HRM', '/api/hrm/org/positions/', 'GET', () => hrmService.getPositions());
    await this.testEndpoint('HRM', '/api/hrm/leaves/types/', 'GET', () => hrmService.getLeaveTypes());
    await this.testEndpoint('HRM', '/api/hrm/leaves/requests/', 'GET', () => hrmService.getLeaveRequests());
    await this.testEndpoint('HRM', '/api/hrm/payroll/runs/', 'GET', () => hrmService.getPayrollRuns());
  }

  async testInventory() {
    await this.testEndpoint('Inventory', '/api/inventory/products/integrated/list/', 'GET', () => inventoryService.getProducts());
    await this.testEndpoint('Inventory', '/api/inventory/warehouse/', 'GET', () => inventoryService.getWarehouses());
    await this.testEndpoint('Inventory', '/api/inventory/stock/moves/integrated/list/', 'GET', () => inventoryService.getStockMovements());
    await this.testEndpoint('Inventory', '/api/inventory/products/categories/', 'GET', () => inventoryService.getCategories());
    await this.testEndpoint('Inventory', '/api/inventory/products/uom/', 'GET', () => inventoryService.getUnitsOfMeasure());
  }

  async testPOS() {
    await this.testEndpoint('POS', '/api/pos/orders/', 'GET', () => posService.getOrders());
    await this.testEndpoint('POS', '/api/pos/stores/', 'GET', () => posService.getStores());
  }

  async testProjects() {
    await this.testEndpoint('Projects', '/api/projects/', 'GET', () => projectsService.getProjects());
    await this.testEndpoint('Projects', '/api/timelog/', 'GET', () => projectsService.getTimeLogs());
  }

  async testTax() {
    await this.testEndpoint('Tax', '/get-tax-rate/', 'GET', () => taxService.getTaxRates());
  }

  async testFinance() {
    await this.testEndpoint('Finance', '/customer/list/', 'GET', () => financeService.getCustomers());
    await this.testEndpoint('Finance', '/vendor/list/', 'GET', () => financeService.getVendors());
  }

  generateReport(): string {
    const total = this.results.length;
    if (total === 0) return 'No tests run yet.';
    const success = this.results.filter(r => r.status === 'success').length;
    const errors = this.results.filter(r => r.status === 'error').length;
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;

    let report = `Total: ${total} | Passed: ${success} | Failed: ${errors} | Avg: ${avgDuration.toFixed(0)}ms\n\n`;

    const byModule = this.results.reduce((acc, r) => {
      if (!acc[r.module]) acc[r.module] = [];
      acc[r.module].push(r);
      return acc;
    }, {} as Record<string, TestResult[]>);

    Object.entries(byModule).forEach(([module, results]) => {
      const ms = results.filter(r => r.status === 'success').length;
      report += `${module} (${ms}/${results.length})\n`;
      results.forEach(r => {
        report += `  ${r.status === 'success' ? '✅' : '❌'} ${r.method} ${r.endpoint} (${r.duration}ms)`;
        if (r.status === 'error') report += ` — ${r.message}`;
        report += '\n';
      });
      report += '\n';
    });

    return report;
  }
}

export const endpointTester = new EndpointTester();
