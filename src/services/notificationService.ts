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
  /** GET /notifications/ - List notifications with pagination */
  getNotifications: (params?: {
    is_read?: boolean;
    notification_type?: string;
    page?: number;
    page_size?: number;
  }) =>
    gatewayClient.get<NotificationListResponse>('/notifications/', { params }),

  /** GET /notifications/unread-count/ - Get count of unread notifications */
  getUnreadCount: () =>
    gatewayClient.get<UnreadCountResponse>('/notifications/unread-count/'),

  /** POST /notifications/<id>/mark-read/ - Mark a notification as read */
  markAsRead: (notificationId: string) =>
    gatewayClient.post<{ message: string }>(`/notifications/${notificationId}/mark-read/`),

  /** POST /notifications/mark-all-read/ - Mark all notifications as read */
  markAllAsRead: () =>
    gatewayClient.post<{ message: string; count: number }>('/notifications/mark-all-read/'),
};

export default notificationService;
