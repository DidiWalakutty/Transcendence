import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { getAuthSession } from '@/lib/auth-session.functions';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }
    const hasAdminRole = session.user.role?.split(',').includes('admin');
    if (!hasAdminRole) {
      throw redirect({ to: '/' });
    }
  },
  component: AdminPage,
});

function AdminPage() {
  return <AdminDashboard />;
}
