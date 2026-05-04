/**
 * QuidPath ERP - HRM Service
 * Complete HRM module API client
 */
import { gatewayClient } from './apiClient';

const BASE_URL = '/api/v1/hrm';

// ============================================================================
// EMPLOYEES
// ============================================================================
export const employeeService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/employees/`, { params }),
  create: (data: any) => gatewayClient.post(`${BASE_URL}/employees/create/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/employees/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/employees/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/employees/${id}/delete/`),
};

// ============================================================================
// PAYROLL
// ============================================================================
export const payrollService = {
  list: (params?: any) => gatewayClient.get(`${BASE_URL}/payroll/`, { params }),
  process: (data: any) => gatewayClient.post(`${BASE_URL}/payroll/process/`, data),
  get: (id: string) => gatewayClient.get(`${BASE_URL}/payroll/${id}/`),
  update: (id: string, data: any) => gatewayClient.put(`${BASE_URL}/payroll/${id}/update/`, data),
  delete: (id: string) => gatewayClient.delete(`${BASE_URL}/payroll/${id}/delete/`),
};

// Default export
const hrmService = {
  employees: employeeService,
  payroll: payrollService,
};

export default hrmService;
