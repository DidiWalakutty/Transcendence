import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/@generated/paraglide/messages';

export const Route = createFileRoute('/$locale/admin')({
  component: AdminPage,
});

function AdminPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] items-center justify-center">
      <h1 className="text-3xl font-bold">{m.button_admin_panel()}</h1>
    </section>
  );
}
