import type { BaseEventEmailProps } from './email.types';
import { TicketConfirmationEmailDictionary } from './ticket-confirmation.i18n';
import { EmailCta, EmailShell, EventDetailsCard } from './email-layout';

interface TicketConfirmationEmailProps extends BaseEventEmailProps {
  dictionary: TicketConfirmationEmailDictionary;
}

export const TicketConfirmationEmail = ({
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventAddress,
  lang,
  dictionary,
}: TicketConfirmationEmailProps): string => {
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
      EmailCta({
        href: `https://localhost:3000/${lang}/my-tickets`,
        label: dictionary.buttonLabel,
      }),
    ].join(''),
    footer: dictionary.footerNotice,
  });
};
