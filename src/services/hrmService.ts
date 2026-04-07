import { hrmClient } from './apiClient';

export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  department_id?: string;
  position?: string;
  status: 'active' | 'on_leave' | 'terminated';
  join_date: string;
  termination_date?: string;
  salary?: number;
  avatar?: string;
  created_at: string;
}

export interface EmployeeListResponse {
  results: Employee[];
  count: number;
  next: string | null;
  previous: string | null;
}

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

export interface HRMSummary {
  total_employees: number;
  on_leave_today: number;
  pending_leaves: number;
  departments_count: number;
  open_positions: number;
}

const hrmService = {
  // Employees — /api/hrm/employees/
  getEmployees: (params?: Record<string, unknown>) =>
    hrmClient.get<EmployeeListResponse>('/api/hrm/employees/', { params }),

  getEmployee: (id: string) =>
    hrmClient.get<Employee>(`/api/hrm/employees/${id}/`),

  createEmployee: (data: { full_name: string; email: string; phone?: string; department_id?: string; position?: string; join_date?: string; employee_id?: string }) => {
    // Parse full name into first_name and last_name
    const nameParts = data.full_name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;
    
    // Map frontend fields to backend model fields
    const backendData = {
      first_name: firstName,
      last_name: lastName,
      employee_number: data.employee_id || '', // Map employee_id to employee_number
      work_email: data.email, // Map email to work_email
      phone: data.phone,
      department: data.department_id, // FK to Department
      position: data.position, // FK to Position
      date_joined: data.join_date || new Date().toISOString().split('T')[0], // Map join_date to date_joined
      employment_status: 'active', // Default status
    };
    return hrmClient.post<Employee>('/api/hrm/employees/', backendData);
  },

  updateEmployee: (id: string, data: Partial<Employee>) => {
    // Map frontend fields to backend model fields for update
    const backendData: Record<string, unknown> = {};
    
    // Handle full_name if provided
    if (data.full_name) {
      const nameParts = data.full_name.trim().split(' ');
      backendData.first_name = nameParts[0];
      backendData.last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];
    }
    
    if (data.employee_id !== undefined) backendData.employee_number = data.employee_id;
    if (data.email !== undefined) backendData.work_email = data.email;
    if (data.phone !== undefined) backendData.phone = data.phone;
    if (data.department_id !== undefined) backendData.department = data.department_id;
    if (data.position !== undefined) backendData.position = data.position;
    if (data.join_date !== undefined) backendData.date_joined = data.join_date;
    if (data.status !== undefined) backendData.employment_status = data.status;
    if (data.salary !== undefined) backendData.salary = data.salary;
    
    return hrmClient.put<Employee>(`/api/hrm/employees/${id}/`, backendData);
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

  requestLeave: (data: { employee_id: string; leave_type: string; start_date: string; end_date: string; reason: string }) =>
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
    hrmClient.get<HRMSummary>('/api/hrm/employees/'),
};

export default hrmService;
