import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/events')({
  component: EventsLayout,
});

function EventsLayout() {
  return <Outlet />;
}
