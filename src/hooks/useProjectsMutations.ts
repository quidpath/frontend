import { useMutation, useQueryClient } from '@tanstack/react-query';
import projectService, { Project, Task, Issue, TimeLog } from '@/services/projectService';

export const PROJECT_MUTATION_KEYS = {
  create: ['project', 'create'],
  update: ['project', 'update'],
  delete: ['project', 'delete'],
};

export const TASK_MUTATION_KEYS = {
  create: ['task', 'create'],
  update: ['task', 'update'],
  delete: ['task', 'delete'],
  move: ['task', 'move'],
};

export const ISSUE_MUTATION_KEYS = {
  create: ['issue', 'create'],
  update: ['issue', 'update'],
  delete: ['issue', 'delete'],
  resolve: ['issue', 'resolve'],
};

export const TIMELOG_MUTATION_KEYS = {
  create: ['timelog', 'create'],
  update: ['timelog', 'update'],
  delete: ['timelog', 'delete'],
};

/** Create project */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      code: string;
      client_id?: number;
      start_date?: string;
      end_date?: string;
      budget?: string;
      description?: string;
    }) =>
      projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'summary'] });
    },
  });
}

/** Update project */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      projectService.updateProject(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'detail'] });
    },
  });
}

/** Delete project */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'summary'] });
    },
  });
}

/** Create task */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      project_id: number;
      assignee_id?: number;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      due_date?: string;
      description?: string;
    }) =>
      projectService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'summary'] });
    },
  });
}

/** Update task */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      projectService.updateTask(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'tasks'] });
    },
  });
}

/** Delete task */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      projectService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'tasks'] });
    },
  });
}

/** Move task to different status */
export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; status: string }) =>
      projectService.moveTask(data.id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'tasks'] });
    },
  });
}

/** Create issue */
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      project_id: number;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      assignee_id?: number;
      description?: string;
    }) =>
      projectService.createIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'issues'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'summary'] });
    },
  });
}

/** Update issue */
export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      projectService.updateIssue(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'issues'] });
    },
  });
}

/** Delete issue */
export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      projectService.deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'issues'] });
    },
  });
}

/** Resolve issue */
export function useResolveIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; resolution: string }) =>
      projectService.resolveIssue(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'issues'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'summary'] });
    },
  });
}

/** Create time log */
export function useCreateTimeLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      task_id: number;
      hours: number;
      date: string;
      description?: string;
      is_billable?: boolean;
    }) =>
      projectService.createTimeLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'timelogs'] });
    },
  });
}

/** Update time log */
export function useUpdateTimeLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; [key: string]: unknown }) =>
      projectService.updateTimeLog(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'timelogs'] });
    },
  });
}

/** Delete time log */
export function useDeleteTimeLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      projectService.deleteTimeLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'timelogs'] });
    },
  });
}
