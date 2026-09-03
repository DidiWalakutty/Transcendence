import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { localizeHref, locales } from '@/@generated/paraglide/runtime';
import { useRouter } from '@tanstack/react-router';

const languageNames = {
  en: 'English',
  nl: 'Nederlands',
} satisfies Record<(typeof locales)[number], string>;

export function LanguageSwitcher() {
  const router = useRouter();

  async function changeLanguage(locale: (typeof locales)[number]) {
    const localizedHref = localizeHref(router.state.location.href, { locale });

    if (localizedHref === router.state.location.publicHref) {
      return;
    }

    router.history.replace(localizedHref, router.state.location.state);
    await router.invalidate();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Languages className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => void changeLanguage(locale)}>
            {languageNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
