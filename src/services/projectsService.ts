import { projectsClient } from './apiClient';

export interface Project {
  id: number;
  name: string;
  code: string;
  description?: string;
  client?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  budget?: number;
  spent?: number;
  manager?: string;
  created_at: string;
}

export interface ProjectListResponse {
  results: Project[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Tasks are nested under projects: /api/tasks/{project_pk}/
export interface Task {
  id: number;
  project_id: number;
  project_name: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
}

export interface TaskListResponse {
  results: Task[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Time logs: /api/timelog/
export interface TimeLog {
  id: number;
  task_id: number;
  task_title: string;
  employee_id: string;
  employee_name: string;
  hours: number;
  date: string;
  description?: string;
  billable: boolean;
  created_at: string;
}

export interface TimeLogListResponse {
  results: TimeLog[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Issues are nested under projects: /api/issues/{project_pk}/
export interface Issue {
  id: number;
  project_id: number;
  project_name: string;
  title: string;
  description?: string;
  type: 'bug' | 'feature' | 'improvement' | 'task';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  reported_by?: string;
  created_at: string;
}

export interface IssueListResponse {
  results: Issue[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface Sprint {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed';
}

export interface Milestone {
  id: number;
  name: string;
  due_date: string;
  status: 'pending' | 'completed';
}

export interface ProjectsSummary {
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  total_hours_logged: number;
  open_issues: number;
}

const projectsService = {
  // Projects — /api/projects/
  getProjects: (params?: Record<string, unknown>) =>
    projectsClient.get<ProjectListResponse>('/api/projects/', { params }),

  getProject: (id: number) =>
    projectsClient.get<Project>(`/api/projects/${id}/`),

  createProject: (data: Omit<Project, 'id' | 'created_at' | 'spent'>) =>
    projectsClient.post<Project>('/api/projects/', data),

  updateProject: (id: number, data: Partial<Project>) =>
    projectsClient.put<Project>(`/api/projects/${id}/`, data),

  deleteProject: (id: number) =>
    projectsClient.delete(`/api/projects/${id}/`),

  getProjectGantt: (id: number) =>
    projectsClient.get(`/api/projects/${id}/gantt/`),

  getProjectBudget: (id: number) =>
    projectsClient.get(`/api/projects/${id}/budget/`),

  // Project Members
  getProjectMembers: (projectId: number) =>
    projectsClient.get(`/api/projects/${projectId}/members/`),

  addProjectMember: (projectId: number, data: Record<string, unknown>) =>
    projectsClient.post(`/api/projects/${projectId}/members/`, data),

  removeProjectMember: (projectId: number, memberId: number) =>
    projectsClient.delete(`/api/projects/${projectId}/members/${memberId}/`),

  // Sprints — /api/projects/{project_pk}/sprints/
  getSprints: (projectId: number) =>
    projectsClient.get<{ results: Sprint[] }>(`/api/projects/${projectId}/sprints/`),

  createSprint: (projectId: number, data: Omit<Sprint, 'id'>) =>
    projectsClient.post<Sprint>(`/api/projects/${projectId}/sprints/`, data),

  updateSprint: (projectId: number, sprintId: number, data: Partial<Sprint>) =>
    projectsClient.put<Sprint>(`/api/projects/${projectId}/sprints/${sprintId}/`, data),

  startSprint: (projectId: number, sprintId: number) =>
    projectsClient.post(`/api/projects/${projectId}/sprints/${sprintId}/start/`),

  completeSprint: (projectId: number, sprintId: number) =>
    projectsClient.post(`/api/projects/${projectId}/sprints/${sprintId}/complete/`),

  // Milestones — /api/projects/{project_pk}/milestones/
  getMilestones: (projectId: number) =>
    projectsClient.get<{ results: Milestone[] }>(`/api/projects/${projectId}/milestones/`),

  createMilestone: (projectId: number, data: Omit<Milestone, 'id'>) =>
    projectsClient.post<Milestone>(`/api/projects/${projectId}/milestones/`, data),

  updateMilestone: (projectId: number, milestoneId: number, data: Partial<Milestone>) =>
    projectsClient.put<Milestone>(`/api/projects/${projectId}/milestones/${milestoneId}/`, data),

  deleteMilestone: (projectId: number, milestoneId: number) =>
    projectsClient.delete(`/api/projects/${projectId}/milestones/${milestoneId}/`),

  // Tasks — /api/tasks/{project_pk}/
  getTasks: (projectId: number, params?: Record<string, unknown>) =>
    projectsClient.get<TaskListResponse>(`/api/tasks/${projectId}/`, { params }),

  getTask: (projectId: number, taskId: number) =>
    projectsClient.get<Task>(`/api/tasks/${projectId}/${taskId}/`),

  createTask: (projectId: number, data: Omit<Task, 'id' | 'created_at' | 'project_name' | 'actual_hours'>) =>
    projectsClient.post<Task>(`/api/tasks/${projectId}/`, data),

  updateTask: (projectId: number, taskId: number, data: Partial<Task>) =>
    projectsClient.put<Task>(`/api/tasks/${projectId}/${taskId}/`, data),

  deleteTask: (projectId: number, taskId: number) =>
    projectsClient.delete(`/api/tasks/${projectId}/${taskId}/`),

  moveTask: (projectId: number, taskId: number, status: string) =>
    projectsClient.post(`/api/tasks/${projectId}/${taskId}/move/`, { status }),

  getKanbanBoard: (projectId: number) =>
    projectsClient.get(`/api/tasks/${projectId}/kanban/`),

  // Task Comments
  getTaskComments: (projectId: number, taskId: number) =>
    projectsClient.get(`/api/tasks/${projectId}/${taskId}/comments/`),

  addTaskComment: (projectId: number, taskId: number, data: Record<string, unknown>) =>
    projectsClient.post(`/api/tasks/${projectId}/${taskId}/comments/`, data),

  // Time Logs — /api/timelog/
  getTimeLogs: (params?: Record<string, unknown>) =>
    projectsClient.get<TimeLogListResponse>('/api/timelog/', { params }),

  getTimeLog: (id: number) =>
    projectsClient.get<TimeLog>(`/api/timelog/${id}/`),

  createTimeLog: (data: Omit<TimeLog, 'id' | 'created_at' | 'task_title' | 'employee_name'>) =>
    projectsClient.post<TimeLog>('/api/timelog/', data),

  updateTimeLog: (id: number, data: Partial<TimeLog>) =>
    projectsClient.put<TimeLog>(`/api/timelog/${id}/`, data),

  deleteTimeLog: (id: number) =>
    projectsClient.delete(`/api/timelog/${id}/`),

  getResourceCapacity: () =>
    projectsClient.get('/api/timelog/capacity/'),

  getResourceAllocations: (params?: Record<string, unknown>) =>
    projectsClient.get('/api/timelog/allocations/', { params }),

  // Issues — /api/issues/{project_pk}/
  getIssues: (projectId: number, params?: Record<string, unknown>) =>
    projectsClient.get<IssueListResponse>(`/api/issues/${projectId}/`, { params }),

  getIssue: (projectId: number, issueId: number) =>
    projectsClient.get<Issue>(`/api/issues/${projectId}/${issueId}/`),

  createIssue: (projectId: number, data: Omit<Issue, 'id' | 'created_at' | 'project_name'>) =>
    projectsClient.post<Issue>(`/api/issues/${projectId}/`, data),

  updateIssue: (projectId: number, issueId: number, data: Partial<Issue>) =>
    projectsClient.put<Issue>(`/api/issues/${projectId}/${issueId}/`, data),

  deleteIssue: (projectId: number, issueId: number) =>
    projectsClient.delete(`/api/issues/${projectId}/${issueId}/`),

  // Notifications — /api/notifications/
  getNotifications: (params?: Record<string, unknown>) =>
    projectsClient.get('/api/notifications/', { params }),

  // Summary
  getSummary: () =>
    projectsClient.get<ProjectsSummary>('/api/projects/'),
};

export default projectsService;
