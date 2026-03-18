import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/auth/AuthGuard';
import SuperuserGuard from '@/auth/SuperuserGuard';

export default function SystemAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requirePermission={false}>
      <SuperuserGuard>
        <DashboardLayout>{children}</DashboardLayout>
      </SuperuserGuard>
    </AuthGuard>
  );
}
