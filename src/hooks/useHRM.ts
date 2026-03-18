import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import hrmService from '@/services/hrmService';

export const HRM_KEYS = {
  all: ['hrm'] as const,
  employees: (params?: Record<string, unknown>) => ['hrm', 'employees', params] as const,
  departments: (params?: Record<string, unknown>) => ['hrm', 'departments', params] as const,
  leaves: (params?: Record<string, unknown>) => ['hrm', 'leaves', params] as const,
  payroll: (params?: Record<string, unknown>) => ['hrm', 'payroll', params] as const,
  summary: () => ['hrm', 'summary'] as const,
};

export function useEmployees(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: HRM_KEYS.employees(params),
    queryFn: async () => {
      const { data } = await hrmService.getEmployees(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useDepartments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: HRM_KEYS.departments(params),
    queryFn: async () => {
      const { data } = await hrmService.getDepartments(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useLeaveRequests(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: HRM_KEYS.leaves(params),
    queryFn: async () => {
      const { data } = await hrmService.getLeaveRequests(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function usePayrollRuns(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: HRM_KEYS.payroll(params),
    queryFn: async () => {
      const { data } = await hrmService.getPayrollRuns(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useHRMSummary() {
  return useQuery({
    queryKey: HRM_KEYS.summary(),
    queryFn: async () => {
      const { data } = await hrmService.getSummary();
      return data;
    },
    staleTime: 60_000,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrmService.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HRM_KEYS.all });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrmService.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HRM_KEYS.all });
    },
  });
}
