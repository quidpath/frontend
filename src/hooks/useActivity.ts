import { useQuery } from '@tanstack/react-query';
import activityService, { type Activity, type ActivityStats } from '@/services/activityService';

export function useRecentActivity(params?: { page?: number; page_size?: number; category?: string }) {
  return useQuery({
    queryKey: ['activity', 'recent', params],
    queryFn: async () => {
      const { data } = await activityService.getRecentActivity(params);
      return data;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for live updates
  });
}

export function useActivityStats() {
  return useQuery({
    queryKey: ['activity', 'stats'],
    queryFn: async () => {
      const { data } = await activityService.getActivityStats();
      return data;
    },
    staleTime: 60000, // 1 minute
  });
}

// Helper to format relative time
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Helper to get activity color
export function getActivityColor(type: Activity['type']): string {
  const colors: Record<Activity['type'], string> = {
    auth: '#3182CE',
    finance: '#27AE60',
    accounting: '#2E7D32',
    banking: '#1565C0',
    procurement: '#6A1B9A',
    sales: '#00695C',
    payment: '#E65100',
    admin: '#C62828',
    general: '#64748B',
  };
  return colors[type] || colors.general;
}
