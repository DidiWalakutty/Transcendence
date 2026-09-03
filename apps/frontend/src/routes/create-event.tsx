import { createFileRoute, redirect } from '@tanstack/react-router';
import { EventForm } from '@/components/events/EventForm';
import { getAuthSession } from '@/lib/auth-session.functions';

export const Route = createFileRoute('/create-event')({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session) {
      throw redirect({
        to: '/login',
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
