import ModuleLayout from '@/components/layout/ModuleLayout';
import AuthGuard from '@/auth/AuthGuard';

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ModuleLayout>{children}</ModuleLayout>
    </AuthGuard>
  );
}
