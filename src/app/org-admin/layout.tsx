import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/auth/AuthGuard';
import OrgAdminGuard from '@/auth/OrgAdminGuard';

export default function OrgAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <OrgAdminGuard>
        <DashboardLayout>{children}</DashboardLayout>
      </OrgAdminGuard>
    </AuthGuard>
  );
}
