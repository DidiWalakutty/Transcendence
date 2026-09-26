import type { BaseEventEmailProps } from './email.types';
import { EventModificationEmailDictionary } from './event-modification.i18n';
import { EmailCta, EmailShell, EventDetailsCard } from './email-layout';

interface EventModificationEmailProps extends BaseEventEmailProps {
  dictionary: EventModificationEmailDictionary;
  highlights: {
    title: boolean;
    dateTime: boolean;
    location: boolean;
    address: boolean;
  };
}

export const EventModificationEmail = ({
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventAddress,
  lang,
  dictionary,
  highlights,
}: EventModificationEmailProps): string => {
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
        highlightTitle: highlights.title,
        highlightDateTime: highlights.dateTime,
        highlightLocation: highlights.location,
        highlightAddress: highlights.address,
      }),
      EmailCta({ href: `https://localhost:3000/${lang}/events`, label: dictionary.buttonLabel }),
    ].join(''),
    footer: dictionary.footerNotice,
  });
};
