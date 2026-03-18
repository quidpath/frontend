import { useMutation, useQueryClient } from '@tanstack/react-query';
import hrmService, { Employee, LeaveRequest, Department } from '@/services/hrmService';

export const EMPLOYEE_MUTATION_KEYS = {
  create: ['employee', 'create'],
  update: ['employee', 'update'],
  delete: ['employee', 'delete'],
  onboard: ['employee', 'onboard'],
  terminate: ['employee', 'terminate'],
};

export const LEAVE_MUTATION_KEYS = {
  request: ['leave', 'request'],
  approve: ['leave', 'approve'],
  reject: ['leave', 'reject'],
};

/** Create employee */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      full_name: string;
      email: string;
      phone?: string;
      department_id?: string;
      position?: string;
      join_date?: string;
      employee_id?: string;
    }) =>
      hrmService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm', 'employees'] });
      queryClient.invalidateQueries({ queryKey: ['hrm', 'summary'] });
    },
  });
}

/** Update employee */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      hrmService.updateEmployee(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm', 'employees'] });
      queryClient.invalidateQueries({ queryKey: ['hrm', 'employee'] });
    },
  });
}

/** Delete employee */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      hrmService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm', 'employees'] });
      queryClient.invalidateQueries({ queryKey: ['hrm', 'summary'] });
    },
  });
}

/** Onboard employee */
export function useOnboardEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; department_id: string; position: string }) =>
      hrmService.onboardEmployee(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm', 'employees'] });
    },
  });
}

/** Terminate employee */
export function useTerminateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; reason: string; termination_date: string }) =>
      hrmService.terminateEmployee(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm', 'employees'] });
      queryClient.invalidateQueries({ queryKey: ['hrm', 'summary'] });
    },
  });
}

/** Request leave */
export function useRequestLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      employee_id: number;
      leave_type: string;
      start_date: string;
      end_date: string;
      reason: string;
    }) =>
      hrmService.requestLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm', 'leaves'] });
    },
  });
}

/** Approve leave */
export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      hrmService.approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm', 'leaves'] });
    },
  });
}

/** Reject leave */
export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; reason: string }) =>
      hrmService.rejectLeave(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm', 'leaves'] });
    },
  });
}

/** Create department */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; code: string; head_id?: number }) =>
      hrmService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm', 'departments'] });
    },
  });
}

/** Update department */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      hrmService.updateDepartment(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm', 'departments'] });
    },
  });
}
