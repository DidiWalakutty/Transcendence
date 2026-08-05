import { createFileRoute } from '@tanstack/react-router';
import { CalendarDays } from 'lucide-react';
import { z } from 'zod';
import { ResetPasswordForm } from '@/components/ResetPasswordForm';

export const Route = createFileRoute('/reset-password')({
  validateSearch: z.object({
    token: z.string(),
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 md:px-10">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-lg">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CalendarDays className="size-4" />
          </div>
          Eventra
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
