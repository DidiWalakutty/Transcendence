import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/create-event')({
  component: CreateEventPage,
});

function CreateEventPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] items-center justify-center">
      <h1 className="text-3xl font-bold">Create Event</h1>
    </section>
  );
}
