import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/auth/AuthGuard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requirePermission={false}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
