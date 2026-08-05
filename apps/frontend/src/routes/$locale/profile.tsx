import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$locale/profile"!</div>;
}
