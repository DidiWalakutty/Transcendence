import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/my-events')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$locale/my-events"!</div>;
}
