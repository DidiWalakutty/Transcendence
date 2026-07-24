type EventDateProps = {
  date: string;
};

export function EventDate({ date }: EventDateProps) {
  // Convert the ISO date string into a JavaScript Date object
  const eventDate = new Date(date);

  return (
    <div className="flex flex-col items-center justify-ceter text-white">
      {/* Day of the month */}
      <span className="text-sm font-semibold uppercase">
        {eventDate.toLocaleDateString('en-GB', {
          weekday: 'short',
        })}
      </span>

      <span className="text-5xl font-bold">{eventDate.getDate()}</span>

      {/* Month */}
      <span className="text-sm font-semibold uppercase">
        {eventDate.toLocaleDateString('en-GB', {
          month: 'short',
        })}
      </span>
    </div>
  );
}
