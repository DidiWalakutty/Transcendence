import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { setLocale } from '@/@generated/paraglide/runtime';

export function LanguageSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        {/* Imports Icon */}
        <Languages className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" cursor="pointer" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setLocale('en')}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('nl')}>Nederlands</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
