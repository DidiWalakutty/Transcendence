import * as m from '@/@generated/paraglide/messages';

type EventDateProps = {
  date: string;
};

export function EventDate({ date }: EventDateProps) {
  const eventDate = new Date(date);

  const weekday = m.event_weekday({
    date: eventDate,
  });

  const day = m.event_day({
    date: eventDate,
  });

  const month = m.event_month({
    date: eventDate,
  });

  return (
    <div className="flex flex-col items-center justify-center text-white [text-shadow:0_1px_2px_#190b02]">
      {/* Day of the week */}
      <span className="text-sm font-semibold uppercase">{weekday}</span>

      {/* Day of the month */}
      <span className="text-5xl font-bold">{day}</span>

      {/* Month */}
      <span className="text-sm font-semibold uppercase">{month}</span>
    </div>
  );
}
