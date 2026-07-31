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
      {/* Imports Icon */}
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Languages className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" cursor="pointer" />
      </DropdownMenuTrigger>

      {/* Dropdown for Language Selection */}
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setLocale('en')}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('nl')}>Nederlands</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
