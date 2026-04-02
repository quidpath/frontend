import { gatewayClient } from './apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  destination: string;
  notification_type: 'EMAIL' | 'SMS' | 'PUSH' | 'SYSTEM';
  state: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface UnreadCountResponse {
  unread_count: number;
}

const notificationService = {
  getNotifications: (params?: {
    is_read?: boolean;
    notification_type?: string;
    page?: number;
    page_size?: number;
  }) =>
    gatewayClient.get<NotificationListResponse>('/api/auth/notifications/', { params }),

  getUnreadCount: () =>
    gatewayClient.get<UnreadCountResponse>('/api/auth/notifications/unread-count/'),

  markAsRead: (notificationId: string) =>
    gatewayClient.post<{ message: string }>(`/api/auth/notifications/${notificationId}/mark-read/`),

  markAllAsRead: () =>
    gatewayClient.post<{ message: string; count: number }>('/api/auth/notifications/mark-all-read/'),
};

export default notificationService;
