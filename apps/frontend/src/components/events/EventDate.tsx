import { getLocale } from '@/@generated/paraglide/runtime';

type EventDateProps = {
  date: string;
};

export function EventDate({ date }: EventDateProps) {
  // Convert the ISO date string into a JavaScript Date object
  const eventDate = new Date(date);
  const locale = getLocale();

  return (
    <div className="flex flex-col items-center justify-center text-white">
      {/* Day of the week */}
      <span className="text-sm font-semibold uppercase">
        {eventDate.toLocaleDateString(locale, {
          weekday: 'short',
        })}
      </span>

      {/* Day of the month */}
      <span className="text-5xl font-bold">{eventDate.getDate()}</span>

      {/* Month */}
      <span className="text-sm font-semibold uppercase">
        {eventDate.toLocaleDateString(locale, {
          month: 'short',
        })}
      </span>
    </div>
  );
}
