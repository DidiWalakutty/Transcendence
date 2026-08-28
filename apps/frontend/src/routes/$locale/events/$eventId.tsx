import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/events/$eventId')({
  component: EventDetailPage,
});

function EventDetailPage() {
  const { eventId } = Route.useParams();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Event detail</h1>
      <p className="mt-4">
        Event ID: <span className="font-mono">{eventId}</span>
      </p>
    </main>
  );
}
