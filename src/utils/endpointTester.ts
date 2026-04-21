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

interface TestResult {
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
    console.log('🚀 Starting comprehensive endpoint testing...');
    
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
      this.results.push({
        module,
        endpoint,
        method,
        status: 'success',
        message: `✅ Success (${duration}ms)`,
        duration,
      });
      console.log(`✅ ${module} - ${method} ${endpoint} (${duration}ms)`);
    } catch (error: any) {
      const duration = Date.now() - start;
      this.results.push({
        module,
        endpoint,
        method,
        status: 'error',
        message: `❌ Error: ${error.message}`,
        duration,
      });
      console.error(`❌ ${module} - ${method} ${endpoint}:`, error.message);
    }
  }

  // ACCOUNTING MODULE
  async testAccounting() {
    console.log('\n📊 Testing ACCOUNTING endpoints...');
    
    await this.testEndpoint('Accounting', '/invoice/list/', 'GET', () =>
      accountingService.getInvoices()
    );
    
    await this.testEndpoint('Accounting', '/journal/list/', 'GET', () =>
      accountingService.getJournalEntries()
    );
    
    await this.testEndpoint('Accounting', '/expense/list/', 'GET', () =>
      accountingService.getExpenses()
    );
    
    await this.testEndpoint('Accounting', '/account/list/', 'GET', () =>
      accountingService.getAccounts()
    );
  }

  // BANKING MODULE
  async testBanking() {
    console.log('\n🏦 Testing BANKING endpoints...');
    
    await this.testEndpoint('Banking', '/bank-account/list/', 'GET', () =>
      bankingService.getBankAccounts()
    );
    
    await this.testEndpoint('Banking', '/transaction/list/', 'GET', () =>
      bankingService.getTransactions()
    );
  }

  // CRM MODULE
  async testCRM() {
    console.log('\n👥 Testing CRM endpoints...');
    
    await this.testEndpoint('CRM', '/api/crm/contacts/', 'GET', () =>
      crmService.getContacts()
    );
    
    await this.testEndpoint('CRM', '/api/crm/pipeline/opportunities/', 'GET', () =>
      crmService.getDeals()
    );
    
    await this.testEndpoint('CRM', '/api/crm/pipeline/stages/', 'GET', () =>
      crmService.getPipelineStages()
    );
    
    await this.testEndpoint('CRM', '/api/crm/campaigns/', 'GET', () =>
      crmService.getCampaigns()
    );
    
    await this.testEndpoint('CRM', '/api/crm/contacts/activities/', 'GET', () =>
      crmService.getActivities()
    );
  }

  // HRM MODULE
  async testHRM() {
    console.log('\n👔 Testing HRM endpoints...');
    
    await this.testEndpoint('HRM', '/api/hrm/employees/', 'GET', () =>
      hrmService.getEmployees()
    );
    
    await this.testEndpoint('HRM', '/api/hrm/org/departments/', 'GET', () =>
      hrmService.getDepartments()
    );
    
    await this.testEndpoint('HRM', '/api/hrm/org/positions/', 'GET', () =>
      hrmService.getPositions()
    );
    
    await this.testEndpoint('HRM', '/api/hrm/leaves/types/', 'GET', () =>
      hrmService.getLeaveTypes()
    );
    
    await this.testEndpoint('HRM', '/api/hrm/leaves/requests/', 'GET', () =>
      hrmService.getLeaveRequests()
    );
    
    await this.testEndpoint('HRM', '/api/hrm/payroll/runs/', 'GET', () =>
      hrmService.getPayrollRuns()
    );
  }

  // INVENTORY MODULE
  async testInventory() {
    console.log('\n📦 Testing INVENTORY endpoints...');
    
    await this.testEndpoint('Inventory', '/api/inventory/products/integrated/', 'GET', () =>
      inventoryService.getProducts()
    );
    
    await this.testEndpoint('Inventory', '/api/inventory/warehouse/', 'GET', () =>
      inventoryService.getWarehouses()
    );
    
    await this.testEndpoint('Inventory', '/api/inventory/stock/moves/integrated/', 'GET', () =>
      inventoryService.getStockMovements()
    );
    
    await this.testEndpoint('Inventory', '/api/inventory/products/categories/', 'GET', () =>
      inventoryService.getCategories()
    );
    
    await this.testEndpoint('Inventory', '/api/inventory/products/uom/', 'GET', () =>
      inventoryService.getUnitsOfMeasure()
    );
  }

  // POS MODULE
  async testPOS() {
    console.log('\n🛒 Testing POS endpoints...');
    
    await this.testEndpoint('POS', '/api/pos/orders/', 'GET', () =>
      posService.getOrders()
    );
    
    await this.testEndpoint('POS', '/api/pos/stores/', 'GET', () =>
      posService.getStores()
    );
  }

  // PROJECTS MODULE
  async testProjects() {
    console.log('\n📋 Testing PROJECTS endpoints...');
    
    await this.testEndpoint('Projects', '/api/projects/', 'GET', () =>
      projectsService.getProjects()
    );
  }

  // TAX MODULE
  async testTax() {
    console.log('\n💰 Testing TAX endpoints...');
    
    await this.testEndpoint('Tax', '/get-tax-rate/', 'GET', () =>
      taxService.getTaxRates()
    );
  }

  // FINANCE MODULE
  async testFinance() {
    console.log('\n💵 Testing FINANCE endpoints...');
    
    await this.testEndpoint('Finance', '/customer/list/', 'GET', () =>
      financeService.getCustomers()
    );
    
    await this.testEndpoint('Finance', '/vendor/list/', 'GET', () =>
      financeService.getVendors()
    );
  }

  // Generate Report
  generateReport(): string {
    const total = this.results.length;
    const success = this.results.filter(r => r.status === 'success').length;
    const errors = this.results.filter(r => r.status === 'error').length;
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;

    let report = '\n\n═══════════════════════════════════════════════════════\n';
    report += '           ENDPOINT TESTING REPORT\n';
    report += '═══════════════════════════════════════════════════════\n\n';
    report += `Total Endpoints Tested: ${total}\n`;
    report += `✅ Successful: ${success} (${((success/total)*100).toFixed(1)}%)\n`;
    report += `❌ Failed: ${errors} (${((errors/total)*100).toFixed(1)}%)\n`;
    report += `⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms\n\n`;

    // Group by module
    const byModule = this.results.reduce((acc, r) => {
      if (!acc[r.module]) acc[r.module] = [];
      acc[r.module].push(r);
      return acc;
    }, {} as Record<string, TestResult[]>);

    Object.entries(byModule).forEach(([module, results]) => {
      const moduleSuccess = results.filter(r => r.status === 'success').length;
      const moduleTotal = results.length;
      report += `\n${module} (${moduleSuccess}/${moduleTotal})\n`;
      report += '─'.repeat(50) + '\n';
      results.forEach(r => {
        report += `  ${r.status === 'success' ? '✅' : '❌'} ${r.method} ${r.endpoint} (${r.duration}ms)\n`;
        if (r.status === 'error') {
          report += `     ${r.message}\n`;
        }
      });
    });

    report += '\n═══════════════════════════════════════════════════════\n';
    return report;
  }
}

// Export singleton instance
export const endpointTester = new EndpointTester();
