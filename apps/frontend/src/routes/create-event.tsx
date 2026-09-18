import { createFileRoute } from '@tanstack/react-router';
import { EventForm } from '@/components/events/EventForm';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/create-event')({
  beforeLoad: ({ context: { session } }) => {
    requireAuth(session);
  },
  component: CreateEventPage,
});

function CreateEventPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex justify-center">
        <EventForm />
      </div>
    </div>
  );
}
