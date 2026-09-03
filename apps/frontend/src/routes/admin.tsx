import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ context: { session } }) => {
    if (!session) {
      throw redirect({ to: '/login' });
    }
    const hasAdminRole = session.user.role?.split(',').includes('admin');
    if (!hasAdminRole) {
      throw redirect({ to: '/' });
    }
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(context.trpc.users.getUsers.queryOptions()),
      context.queryClient.ensureQueryData(context.trpc.events.getEvents.queryOptions('newest')),
    ]);
  },
  component: AdminPage,
});

function AdminPage() {
  return <AdminDashboard />;
}
