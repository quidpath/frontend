import { gatewayClient } from './apiClient';

export interface Activity {
  id: string;
  message: string;
  type: 'auth' | 'finance' | 'accounting' | 'banking' | 'procurement' | 'sales' | 'payment' | 'admin' | 'general';
  category: string;
  user: {
    id: string | null;
    username: string;
    email: string | null;
  };
  transaction_type: string;
  state: string;
  created_at: string;
  source_ip: string;
}

export interface ActivityListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Activity[];
}

export interface ActivityStats {
  total: number;
  by_category: Record<string, number>;
}

const activityService = {
  /** GET /activity/recent/ - Get recent activity feed */
  getRecentActivity: (params?: {
    page?: number;
    page_size?: number;
    category?: string;
  }) =>
    gatewayClient.get<ActivityListResponse>('/activity/recent/', { params }),

  /** GET /activity/stats/ - Get activity statistics */
  getActivityStats: () =>
    gatewayClient.get<ActivityStats>('/activity/stats/'),
};

export default activityService;
