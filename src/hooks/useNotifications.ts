import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService, { Notification, NotificationListResponse } from '@/services/notificationService';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (params?: Record<string, unknown>) => ['notifications', 'list', params] as const,
  unread: () => ['notifications', 'unread'] as const,
};

/** Fetch notifications list with pagination */
export function useNotifications(params?: {
  is_read?: boolean;
  notification_type?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: async () => {
      const { data } = await notificationService.getNotifications(params);
      return data;
    },
    staleTime: 10_000, // 10 seconds
    refetchInterval: 30_000, // Refetch every 30 seconds
  });
}

/** Fetch unread notification count */
export function useUnreadCount() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unread(),
    queryFn: async () => {
      const { data } = await notificationService.getUnreadCount();
      return data.unread_count;
    },
    staleTime: 5_000,
    refetchInterval: 15_000, // Refetch every 15 seconds
  });
}

/** Mark a notification as read */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate both list and unread count
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread() });
    },
  });
}

/** Mark all notifications as read */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread() });
    },
  });
}

/** Helper hook for notification badge count */
export function useNotificationBadge() {
  const { data: unreadCount } = useUnreadCount();
  return {
    count: unreadCount ?? 0,
    hasNotifications: (unreadCount ?? 0) > 0,
  };
}
