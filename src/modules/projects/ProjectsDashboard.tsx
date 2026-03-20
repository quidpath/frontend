'use client';

import React, { useState } from 'react';
import { Box, Button, Grid, Tab, Tabs, Typography, Chip } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ActionMenu, { commonActions, ActionMenuItem } from '@/components/ui/ActionMenu';
import ContextAwareButton from '@/components/ui/ContextAwareButton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import NotificationToast from '@/components/ui/NotificationToast';
import { useNotification } from '@/hooks/useNotification';
import { useProjects, useTasks, useTimeLogs, useIssues, useProjectsSummary } from '@/hooks/useProjects';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TableColumn } from '@/types';
import { Project, Task, TimeLog, Issue } from '@/services/projectsService';
import projectsService from '@/services/projectsService';
import ProjectModal from './modals/ProjectModal';
import TaskModal from './modals/TaskModal';
import TimeLogModal from './modals/TimeLogModal';
import IssueModal from './modals/IssueModal';

export default function ProjectsDashboard() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [timeLogModalOpen, setTimeLogModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Project | Task | TimeLog | Issue | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    severity?: 'warning' | 'error' | 'info';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const projectParams = statusFilter !== 'all' ? { status: statusFilter } : undefined;
  const { data: summary, isLoading: summaryLoading } = useProjectsSummary();
  const { data: projectsData, isLoading: projectsLoading, refetch: refetchProjects } = useProjects(projectParams);
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { data: timeLogsData, isLoading: timeLogsLoading, refetch: refetchTimeLogs } = useTimeLogs();
  const { data: issuesData, isLoading: issuesLoading, refetch: refetchIssues } = useIssues();

  const buttonContexts = {
    0: { label: 'New Project', onClick: () => { setSelectedItem(null); setProjectModalOpen(true); } },
    1: { label: 'New Task', onClick: () => { setSelectedItem(null); setTaskModalOpen(true); } },
    2: { label: 'Log Time', onClick: () => { setSelectedItem(null); setTimeLogModalOpen(true); } },
    3: { label: 'Report Issue', onClick: () => { setSelectedItem(null); setIssueModalOpen(true); } },
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await projectsService.deleteProject(id);
      showSuccess('Project deleted successfully');
      refetchProjects();
    } catch (error) {
      showError('Failed to delete project');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      await projectsService.deleteTask(task.project_id, task.id);
      showSuccess('Task deleted successfully');
      refetchTasks();
    } catch (error) {
      showError('Failed to delete task');
    }
  };

  const handleDeleteTimeLog = async (id: number) => {
    try {
      await projectsService.deleteTimeLog(id);
      showSuccess('Time log deleted successfully');
      refetchTimeLogs();
    } catch (error) {
      showError('Failed to delete time log');
    }
  };

  const handleDeleteIssue = async (issue: Issue) => {
    try {
      await projectsService.deleteIssue(issue.project_id, issue.id);
      showSuccess('Issue deleted successfully');
      refetchIssues();
    } catch (error) {
      showError('Failed to delete issue');
    }
  };

  const getProjectActions = (project: Project): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(project); setProjectModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(project); setProjectModalOpen(true); }),
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Project',
        message: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
        severity: 'error',
        onConfirm: () => handleDeleteProject(project.id),
      });
    }),
  ];

  const getTaskActions = (task: Task): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(task); setTaskModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(task); setTaskModalOpen(true); }),
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.title}"?`,
        severity: 'error',
        onConfirm: () => handleDeleteTask(task),
      });
    }),
  ];

  const getTimeLogActions = (timeLog: TimeLog): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(timeLog); setTimeLogModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(timeLog); setTimeLogModalOpen(true); }),
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Time Log',
        message: 'Are you sure you want to delete this time log?',
        severity: 'error',
        onConfirm: () => handleDeleteTimeLog(timeLog.id),
      });
    }),
  ];

  const getIssueActions = (issue: Issue): ActionMenuItem[] => [
    commonActions.view(() => { setSelectedItem(issue); setIssueModalOpen(true); }),
    commonActions.edit(() => { setSelectedItem(issue); setIssueModalOpen(true); }),
    commonActions.delete(() => {
      setConfirmDialog({
        open: true,
        title: 'Delete Issue',
        message: `Are you sure you want to delete "${issue.title}"?`,
        severity: 'error',
        onConfirm: () => handleDeleteIssue(issue),
      });
    }),
  ];

  const PROJECT_COLUMNS: TableColumn<Project>[] = [
    { id: 'code', label: 'Code', sortable: true, minWidth: 100 },
    { id: 'name', label: 'Project', sortable: true, minWidth: 200 },
    { id: 'client', label: 'Client', minWidth: 150 },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'budget', label: 'Budget', align: 'right', format: (val) => val ? formatCurrency(Number(val)) : '—' },
    { id: 'spent', label: 'Spent', align: 'right', format: (val) => val ? formatCurrency(Number(val)) : '—' },
    { id: 'start_date', label: 'Start Date', format: (val) => formatDate(val as string) },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getProjectActions(row)} /> },
  ];

  const TASK_COLUMNS: TableColumn<Task>[] = [
    { id: 'title', label: 'Task', sortable: true, minWidth: 200 },
    { id: 'project_name', label: 'Project', sortable: true, minWidth: 150 },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'priority', label: 'Priority', format: (val) => <StatusChip status={val as string} /> },
    { id: 'assigned_to', label: 'Assigned To', minWidth: 130 },
    { id: 'due_date', label: 'Due Date', format: (val) => val ? formatDate(val as string) : '—' },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getTaskActions(row)} /> },
  ];

  const TIMELOG_COLUMNS: TableColumn<TimeLog>[] = [
    { id: 'date', label: 'Date', sortable: true, format: (val) => formatDate(val as string) },
    { id: 'task_title', label: 'Task', sortable: true, minWidth: 180 },
    { id: 'employee_name', label: 'Employee', sortable: true, minWidth: 150 },
    { id: 'hours', label: 'Hours', align: 'right', format: (val) => `${val}h` },
    { id: 'billable', label: 'Billable', format: (val) => <StatusChip status={val ? 'yes' : 'no'} /> },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getTimeLogActions(row)} /> },
  ];

  const ISSUE_COLUMNS: TableColumn<Issue>[] = [
    { id: 'title', label: 'Issue', sortable: true, minWidth: 200 },
    { id: 'project_name', label: 'Project', sortable: true, minWidth: 150 },
    { id: 'type', label: 'Type', format: (val) => <StatusChip status={val as string} /> },
    { id: 'status', label: 'Status', format: (val) => <StatusChip status={val as string} /> },
    { id: 'priority', label: 'Priority', format: (val) => <StatusChip status={val as string} /> },
    { id: 'assigned_to', label: 'Assigned To', minWidth: 130 },
    { id: 'actions', label: 'Actions', align: 'right', format: (_, row) => <ActionMenu actions={getIssueActions(row)} /> },
  ];

  const projectFilters = ['all', 'planning', 'active', 'on_hold', 'completed'];

  return (
    <Box>
      <PageHeader
        title="Projects"
        subtitle="Project management, tasks, time tracking, and issue tracking"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Projects' }]}
        icon={<FolderIcon sx={{ fontSize: 26 }} />}
        color="#7B1FA2"
        actions={
          <>
            <Button startIcon={<DownloadIcon />} variant="outlined" size="small">Export</Button>
            <ContextAwareButton contexts={buttonContexts} currentContext={String(tab)} />
          </>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Projects" value={summary?.total_projects ?? 0} trend="up" color="#7B1FA2" loading={summaryLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Active Projects" value={summary?.active_projects ?? 0} trend="up" color="#2E7D32" loading={summaryLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Total Tasks" value={summary?.total_tasks ?? 0} trend="neutral" color="#1565C0" loading={summaryLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Hours Logged" value={summary?.total_hours_logged ?? 0} trend="up" color="#F2A40E" loading={summaryLoading} />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label="Projects" />
        <Tab label="Tasks" />
        <Tab label="Time Logs" />
        <Tab label="Issues" />
      </Tabs>

      {tab === 0 && (
        <DataTable
          columns={PROJECT_COLUMNS}
          rows={projectsData?.results ?? []}
          loading={projectsLoading}
          total={projectsData?.count ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={setSearch}
          searchPlaceholder="Search projects..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No projects found. Create your first project to get started."
          toolbar={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {projectFilters.map((filter) => (
                <Chip
                  key={filter}
                  label={filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                  size="small"
                  onClick={() => setStatusFilter(filter)}
                  color={statusFilter === filter ? 'primary' : 'default'}
                  variant={statusFilter === filter ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          }
        />
      )}

      {tab === 1 && (
        <DataTable
          columns={TASK_COLUMNS}
          rows={tasksData?.results ?? []}
          loading={tasksLoading}
          total={tasksData?.count ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={setSearch}
          searchPlaceholder="Search tasks..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No tasks found. Create your first task to get started."
        />
      )}

      {tab === 2 && (
        <DataTable
          columns={TIMELOG_COLUMNS}
          rows={timeLogsData?.results ?? []}
          loading={timeLogsLoading}
          total={timeLogsData?.count ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          getRowId={(row) => String(row.id)}
          emptyMessage="No time logs found. Log your first hours to get started."
        />
      )}

      {tab === 3 && (
        <DataTable
          columns={ISSUE_COLUMNS}
          rows={issuesData?.results ?? []}
          loading={issuesLoading}
          total={issuesData?.count ?? 0}
          page={page}
          pageSize={25}
          onPageChange={setPage}
          onSearch={setSearch}
          searchPlaceholder="Search issues..."
          getRowId={(row) => String(row.id)}
          emptyMessage="No issues found."
        />
      )}

      <ProjectModal
        open={projectModalOpen}
        onClose={() => { setProjectModalOpen(false); setSelectedItem(null); }}
        project={selectedItem as Project}
        onSuccess={() => {
          refetchProjects();
          setProjectModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Project updated successfully' : 'Project created successfully');
        }}
      />

      <TaskModal
        open={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setSelectedItem(null); }}
        task={selectedItem as Task}
        onSuccess={() => {
          refetchTasks();
          setTaskModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Task updated successfully' : 'Task created successfully');
        }}
      />

      <TimeLogModal
        open={timeLogModalOpen}
        onClose={() => { setTimeLogModalOpen(false); setSelectedItem(null); }}
        timeLog={selectedItem as TimeLog}
        onSuccess={() => {
          refetchTimeLogs();
          setTimeLogModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Time log updated successfully' : 'Time log created successfully');
        }}
      />

      <IssueModal
        open={issueModalOpen}
        onClose={() => { setIssueModalOpen(false); setSelectedItem(null); }}
        issue={selectedItem as Issue}
        onSuccess={() => {
          refetchIssues();
          setIssueModalOpen(false);
          setSelectedItem(null);
          showSuccess(selectedItem ? 'Issue updated successfully' : 'Issue created successfully');
        }}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        severity={confirmDialog.severity}
      />

      <NotificationToast
        open={notification.open}
        onClose={hideNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
}
