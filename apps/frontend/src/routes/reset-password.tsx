import { createFileRoute, redirect } from '@tanstack/react-router';
import { CalendarDays } from 'lucide-react';
import { z } from 'zod';
import { ResetPasswordForm } from '@/components/ResetPasswordForm';
import * as m from '@/@generated/paraglide/messages';

export const Route = createFileRoute('/reset-password')({
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  // The page only makes sense with the token from the reset e-mail. Without it
  // (typed URL, stale link) send the user to request a new one instead of
  // failing search validation with a 500.
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({ to: '/forgot-password' });
    }

    return { token: search.token };
  },
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useRouteContext();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 md:px-10">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-lg">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CalendarDays className="size-4" />
          </div>
          {m.button_eventra()}
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
