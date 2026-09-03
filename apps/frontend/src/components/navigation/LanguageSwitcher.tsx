import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { locales, setLocale } from '@/@generated/paraglide/runtime';

const languageNames = {
  en: 'English',
  nl: 'Nederlands',
} satisfies Record<(typeof locales)[number], string>;

export function LanguageSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Languages className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => void setLocale(locale)}>
            {languageNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
