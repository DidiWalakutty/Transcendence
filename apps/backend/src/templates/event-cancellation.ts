import type { BaseEventEmailProps } from './email.types';
import { EventCancellationEmailDictionary } from './event-cancellation.i18n';
import { EmailCta, EmailShell, EventDetailsCard } from './email-layout';

interface EventCancellationEmailProps extends BaseEventEmailProps {
  dictionary: EventCancellationEmailDictionary;
}

export const EventCancellationEmail = ({
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventAddress,
  lang,
  dictionary,
}: EventCancellationEmailProps): string => {
  return EmailShell({
    lang,
    title: dictionary.previewText,
    greeting: dictionary.greeting.replace('{userName}', userName),
    description: dictionary.description,
    children: [
      EventDetailsCard({
        detailsHeader: dictionary.detailsHeader,
        labelEvent: dictionary.labelEvent,
        labelDateTime: dictionary.labelDateTime,
        labelLocation: dictionary.labelLocation,
        eventTitle,
        eventDate,
        eventTime,
        eventLocation,
        eventAddress,
      }),
      EmailCta({ href: `https://localhost:3000/${lang}/events`, label: dictionary.buttonLabel }),
    ].join(''),
    footer: dictionary.footerNotice,
  });
};
