import { createFileRoute } from '@tanstack/react-router';
import { CalendarDays } from 'lucide-react';
import { LoginForm } from '@/components/LoginForm';
import * as m from '@/@generated/paraglide/messages';

export const Route = createFileRoute('/$locale/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-lg">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CalendarDays className="size-4" />
          </div>
          {m.button_eventra()}
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
