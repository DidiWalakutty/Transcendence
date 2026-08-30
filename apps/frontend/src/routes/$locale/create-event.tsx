import { createFileRoute, redirect } from '@tanstack/react-router';
import { EventForm } from '@/components/events/EventForm';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/$locale/create-event')({
  beforeLoad: async ({ params }) => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({
        to: '/$locale/login',
        params: {
          locale: params.locale,
        },
      });
    }
  },
  component: CreateEventPage,
});

function CreateEventPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 pb-20 pt-20 md:pd-24">
        <div className="flex justify-center">
          <EventForm />
        </div>
      </main>
    </div>
  );
}
