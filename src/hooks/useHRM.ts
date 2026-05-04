/**
 * QuidPath ERP - HRM Hooks
 * React Query hooks for HRM module
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import hrmService from '@/services/hrmService';

export const HRM_KEYS = {
  all: ['hrm'] as const,
  employees: () => ['hrm', 'employees'] as const,
  employee: (id: string) => ['hrm', 'employees', id] as const,
  payroll: () => ['hrm', 'payroll'] as const,
};

// Employees
export const useEmployees = (params?: any) => {
  return useQuery({
    queryKey: [...HRM_KEYS.employees(), params],
    queryFn: () => hrmService.employees.list(params),
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: HRM_KEYS.employee(id),
    queryFn: () => hrmService.employees.get(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrmService.employees.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HRM_KEYS.employees() });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      hrmService.employees.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HRM_KEYS.employees() });
      queryClient.invalidateQueries({ queryKey: HRM_KEYS.employee(variables.id) });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrmService.employees.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HRM_KEYS.employees() });
    },
  });
};

// Payroll
export const usePayroll = (params?: any) => {
  return useQuery({
    queryKey: [...HRM_KEYS.payroll(), params],
    queryFn: () => hrmService.payroll.list(params),
  });
};

export const useProcessPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrmService.payroll.process,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HRM_KEYS.payroll() });
    },
  });
};
