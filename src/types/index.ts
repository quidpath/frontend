export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  detail?: string;
  code?: string;
  status?: number;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: number;
}

export interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

export interface ActivityItem {
  id: string | number;
  title: string;
  description?: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  user?: string;
  avatar?: string;
}

export interface TableColumn<T = object> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
}
