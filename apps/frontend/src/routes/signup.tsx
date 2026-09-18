import { createFileRoute, redirect } from '@tanstack/react-router';

// Kept as an alias of /create-account so old links and bookmarks still work.
export const Route = createFileRoute('/signup')({
  beforeLoad: () => {
    throw redirect({ to: '/create-account' });
  },
});
