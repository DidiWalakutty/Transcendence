import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/my-events')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/my-events"!</div>;
}
