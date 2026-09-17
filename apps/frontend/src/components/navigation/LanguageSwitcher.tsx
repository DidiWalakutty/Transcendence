import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { locales, setLocale } from '@/@generated/paraglide/runtime';

function getLanguageName(locale: string) {
  try {
    const nativeName = new Intl.DisplayNames([locale], { type: 'language' }).of(locale);
    if (nativeName) {
      return nativeName.charAt(0).toUpperCase() + nativeName.slice(1);
    }
  } catch {
    // Ignore and fall through to the code fallback below.
  }
  return locale.toUpperCase();
}

export function LanguageSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button aria-label="Change Language" variant="ghost" size="icon" />}
      >
        <Languages className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => void setLocale(locale)}>
            {getLanguageName(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
