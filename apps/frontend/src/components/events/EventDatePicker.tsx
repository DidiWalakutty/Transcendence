import { format } from 'date-fns';
import { enUS, nl } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { getLocale } from '@/@generated/paraglide/runtime';
import * as m from '@/@generated/paraglide/messages';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { parseEventDate, formatEventDate } from '@repo/schemas/events';

export function EventDatePicker({
  id,
  name,
  value,
  onValueChange,
}: {
  id: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const selectedDate = value ? parseEventDate(value) : undefined;
  const [open, setOpen] = useState(false);
  const calendarLocale = getLocale() === 'nl' ? nl : enUS;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          type="button"
          className={cn(
            'inline-flex h-9 w-full items-center justify-start rounded-md border border-input bg-white px-3 py-2 text-left text-sm font-normal shadow-xs outline-none transition-colors hover:bg-white focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            !selectedDate && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {selectedDate
            ? format(selectedDate, 'dd/MM/yyyy', { locale: calendarLocale })
            : m.create_event_date()}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onValueChange(date ? formatEventDate(date) : '');
              // One date is all the field takes, so the pick is the end of
              // the interaction. Left open, the calendar follows the page while
              // the user scrolls on to the next fields, which Firefox flags as
              // a scroll-linked positioning effect (BS-14).
              setOpen(false);
            }}
            locale={calendarLocale}
          />
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={value} required />
    </>
  );
}
