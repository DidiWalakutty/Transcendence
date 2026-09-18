import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { requireAdmin } from '@/lib/route-guards';

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ context: { session } }) => {
    requireAdmin(session);
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.query({
        ...context.trpc.users.getUsers.queryOptions(),
        staleTime: 'static',
      }),
      context.queryClient.query({
        ...context.trpc.events.getEvents.queryOptions('newest'),
        staleTime: 'static',
      }),
    ]);
  },
  component: AdminPage,
});

function AdminPage() {
  return <AdminDashboard />;
}
