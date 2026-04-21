import { hrmClient } from './apiClient';

// ── Employee ──────────────────────────────────────────────────────────────────
// Fields match the backend Employee model exactly.
export interface Employee {
  id: string;
  employee_number: string;      // was "employee_id"
  first_name: string;           // split from "full_name"
  last_name: string;            // split from "full_name"
  full_name?: string;           // read-only computed
  work_email: string;           // was "email"
  personal_email?: string;
  phone?: string;
  department_id?: string;       // FK UUID
  department_name?: string;     // read-only
  position_id?: string;         // FK UUID, was "position" string
  position_title?: string;      // read-only
  employment_status: 'active' | 'on_leave' | 'terminated';  // was "status"
  date_joined: string;          // was "join_date"
  termination_date?: string;
  salary?: number;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  national_id?: string;
  created_at: string;
}

export interface EmployeeListResponse {
  results: Employee[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ── Department ────────────────────────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  code: string;
  head?: string;
  head_id?: string;
  employee_count: number;
  description?: string;
  created_at: string;
}

export interface DepartmentListResponse {
  results: Department[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ── Position ──────────────────────────────────────────────────────────────────
export interface Position {
  id: string;
  title: string;
  department_id?: string;
  department?: string;
  description?: string;
}

export interface PositionListResponse {
  results: Position[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ── Leave ─────────────────────────────────────────────────────────────────────
export interface LeaveType {
  id: string;
  name: string;
  days_allowed: number;
  is_paid: boolean;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  approver_notes?: string;
  created_at: string;
}

export interface LeaveRequestListResponse {
  results: LeaveRequest[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ── Payroll ───────────────────────────────────────────────────────────────────
export interface PayrollRun {
  id: string;
  period: string;
  month: string;
  year: number;
  status: 'draft' | 'calculated' | 'approved' | 'posted';
  total_amount: number;
  employee_count: number;
  processed_at?: string;
  created_at: string;
}

export interface PayrollRunListResponse {
  results: PayrollRun[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  is_taxable: boolean;
}

// ── Summary ───────────────────────────────────────────────────────────────────
export interface HRMSummary {
  total_employees: number;
  total_employees_previous?: number;
  total_employees_change?: number;
  total_employees_trend?: 'up' | 'down' | 'neutral';
  new_this_month: number;
  on_leave_today: number;
  pending_leaves: number;
  departments_count: number;
  open_positions?: number;
}

// ── Service ───────────────────────────────────────────────────────────────────
const hrmService = {
  // Employees — /api/hrm/employees/
  getEmployees: (params?: Record<string, unknown>) =>
    hrmClient.get<EmployeeListResponse>('/api/hrm/employees/', { params }),

  getEmployee: (id: string) =>
    hrmClient.get<Employee>(`/api/hrm/employees/${id}/`),

  createEmployee: (data: {
    first_name: string;
    last_name: string;
    work_email: string;
    phone?: string;
    department_id?: string;
    position_id?: string;
    date_joined?: string;
    employee_number?: string;
    salary?: number;
    date_of_birth?: string;
    gender?: string;
    national_id?: string;
  }) => {
    const payload = {
      ...data,
      date_joined: data.date_joined ?? new Date().toISOString().split('T')[0],
      employment_status: 'active',
    };
    return hrmClient.post<Employee>('/api/hrm/employees/', payload);
  },

  updateEmployee: (id: string, data: Partial<Employee>) => {
    // Strip read-only fields
    const { full_name, department_name, position_title, ...payload } = data;
    return hrmClient.put<Employee>(`/api/hrm/employees/${id}/`, payload);
  },

  deleteEmployee: (id: string) =>
    hrmClient.delete(`/api/hrm/employees/${id}/`),

  uploadDocument: (id: string, formData: FormData) =>
    hrmClient.post(`/api/hrm/employees/${id}/documents/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  addEmergencyContact: (id: string, data: Record<string, unknown>) =>
    hrmClient.post(`/api/hrm/employees/${id}/emergency-contacts/`, data),

  // Departments — /api/hrm/org/departments/
  getDepartments: (params?: Record<string, unknown>) =>
    hrmClient.get<DepartmentListResponse>('/api/hrm/org/departments/', { params }),

  getDepartment: (id: string) =>
    hrmClient.get<Department>(`/api/hrm/org/departments/${id}/`),

  createDepartment: (data: { name: string; code: string; head_id?: string; description?: string }) =>
    hrmClient.post<Department>('/api/hrm/org/departments/', data),

  updateDepartment: (id: string, data: Partial<Department>) =>
    hrmClient.put<Department>(`/api/hrm/org/departments/${id}/`, data),

  deleteDepartment: (id: string) =>
    hrmClient.delete(`/api/hrm/org/departments/${id}/`),

  // Positions — /api/hrm/org/positions/
  getPositions: (params?: Record<string, unknown>) =>
    hrmClient.get<PositionListResponse>('/api/hrm/org/positions/', { params }),

  getPosition: (id: string) =>
    hrmClient.get<Position>(`/api/hrm/org/positions/${id}/`),

  createPosition: (data: { title: string; department_id?: string; description?: string }) =>
    hrmClient.post<Position>('/api/hrm/org/positions/', data),

  updatePosition: (id: string, data: Partial<Position>) =>
    hrmClient.put<Position>(`/api/hrm/org/positions/${id}/`, data),

  deletePosition: (id: string) =>
    hrmClient.delete(`/api/hrm/org/positions/${id}/`),

  // Leave Types — /api/hrm/leaves/types/
  getLeaveTypes: () =>
    hrmClient.get<{ results: LeaveType[] }>('/api/hrm/leaves/types/'),

  // Leave Requests — /api/hrm/leaves/requests/
  getLeaveRequests: (params?: Record<string, unknown>) =>
    hrmClient.get<LeaveRequestListResponse>('/api/hrm/leaves/requests/', { params }),

  getLeaveRequest: (id: string) =>
    hrmClient.get<LeaveRequest>(`/api/hrm/leaves/requests/${id}/`),

  requestLeave: (data: {
    employee_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
  }) =>
    hrmClient.post<LeaveRequest>('/api/hrm/leaves/requests/', data),

  updateLeaveRequest: (id: string, data: Partial<LeaveRequest>) =>
    hrmClient.put<LeaveRequest>(`/api/hrm/leaves/requests/${id}/`, data),

  approveLeave: (id: string, notes?: string) =>
    hrmClient.post<LeaveRequest>(`/api/hrm/leaves/requests/${id}/approve/`, { notes }),

  rejectLeave: (id: string, reason: string) =>
    hrmClient.post<LeaveRequest>(`/api/hrm/leaves/requests/${id}/reject/`, { reason }),

  deleteLeaveRequest: (id: string) =>
    hrmClient.delete(`/api/hrm/leaves/requests/${id}/`),

  getEmployeeLeaveBalances: (employeeId: string) =>
    hrmClient.get(`/api/hrm/leaves/employees/${employeeId}/balances/`),

  // Payroll — /api/hrm/payroll/
  getSalaryComponents: () =>
    hrmClient.get<{ results: SalaryComponent[] }>('/api/hrm/payroll/components/'),

  getEmployeeSalary: (employeeId: string) =>
    hrmClient.get(`/api/hrm/payroll/employees/${employeeId}/salary/`),

  getPayrollRuns: (params?: Record<string, unknown>) =>
    hrmClient.get<PayrollRunListResponse>('/api/hrm/payroll/runs/', { params }),

  getPayrollRun: (id: string) =>
    hrmClient.get<PayrollRun>(`/api/hrm/payroll/runs/${id}/`),

  createPayrollRun: (data: { month: string; year: number }) =>
    hrmClient.post<PayrollRun>('/api/hrm/payroll/runs/', data),

  calculatePayroll: (id: string) =>
    hrmClient.post<PayrollRun>(`/api/hrm/payroll/runs/${id}/calculate/`),

  approvePayroll: (id: string) =>
    hrmClient.post<PayrollRun>(`/api/hrm/payroll/runs/${id}/approve/`),

  postPayrollToAccounting: (id: string) =>
    hrmClient.post(`/api/hrm/payroll/runs/${id}/post/`),

  getPayslip: (id: string) =>
    hrmClient.get(`/api/hrm/payroll/payslips/${id}/`),

  // Summary
  getSummary: () =>
    hrmClient.get<HRMSummary>('/api/hrm/employees/summary/'),
};

export default hrmService;
