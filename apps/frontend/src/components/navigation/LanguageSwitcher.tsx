import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { locales, setLocale } from '@/@generated/paraglide/runtime';
import * as m from '@/@generated/paraglide/messages';
import { getLanguageName } from '@/lib/i18n';
import { useRouteContext } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/integrations/trpc/react';

export function LanguageSwitcher() {
  const { session } = useRouteContext({ from: '__root__' });
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const updateUser = useMutation(
    trpc.users.updateUser.mutationOptions({
      onSuccess: (updatedUser) => {
        queryClient.setQueryData(trpc.users.getMe.queryKey(), updatedUser);
      },
    }),
  );

  const changeLanguage = (locale: (typeof locales)[number]) => {
    if (!session) {
      void setLocale(locale);
      return;
    }
    if (updateUser.isPending) return;

    updateUser.mutate(
      { id: session.user.id, preferedLanguage: locale },
      { onSuccess: () => void setLocale(locale) },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button aria-label={m.language_label()} variant="ghost" size="icon" />}
      >
        <Languages className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => changeLanguage(locale)}>
            {getLanguageName(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
