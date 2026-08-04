import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { localizeHref, setLocale } from '@/@generated/paraglide/runtime';
import { useRouter } from '@tanstack/react-router';

export function LanguageSwitcher() {
  const router = useRouter();

  function changeLanguage(locale: 'en' | 'nl') {
    setLocale(locale);

    const localizedPath = localizeHref(window.location.pathname, {
      locale,
    });

    router.navigate({
      href: localizedPath,
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Languages className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>

        <DropdownMenuItem onClick={() => changeLanguage('nl')}>Nederlands</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
