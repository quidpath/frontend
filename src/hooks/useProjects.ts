import { useQuery } from '@tanstack/react-query';
import projectsService from '@/services/projectsService';

export const PROJECTS_KEYS = {
  all: ['projects'] as const,
  projects: (params?: Record<string, unknown>) => ['projects', 'list', params] as const,
  project: (id: string) => ['projects', 'detail', id] as const,
  tasks: (params?: Record<string, unknown>) => ['projects', 'tasks', params] as const,
  timeLogs: (params?: Record<string, unknown>) => ['projects', 'timeLogs', params] as const,
  issues: (params?: Record<string, unknown>) => ['projects', 'issues', params] as const,
  summary: () => ['projects', 'summary'] as const,
};

export function useProjects(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: PROJECTS_KEYS.projects(params),
    queryFn: async () => {
      const { data } = await projectsService.getProjects(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useTasks(projectId?: number, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: PROJECTS_KEYS.tasks(params),
    queryFn: async () => {
      if (!projectId) return null;
      const { data } = await projectsService.getTasks(projectId, params);
      return data;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useTimeLogs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: PROJECTS_KEYS.timeLogs(params),
    queryFn: async () => {
      const { data } = await projectsService.getTimeLogs(params);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useIssues(projectId?: number, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: PROJECTS_KEYS.issues(params),
    queryFn: async () => {
      if (!projectId) return null;
      const { data } = await projectsService.getIssues(projectId, params);
      return data;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useProjectsSummary() {
  return useQuery({
    queryKey: PROJECTS_KEYS.summary(),
    queryFn: async () => {
      const { data } = await projectsService.getSummary();
      return data;
    },
    staleTime: 60_000,
  });
}
