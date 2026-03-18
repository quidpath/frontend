import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/auth/AuthGuard';
export default function HRMLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><DashboardLayout>{children}</DashboardLayout></AuthGuard>;
}
