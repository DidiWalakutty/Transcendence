import type { BaseEventEmailProps } from './email.types';
import { FriendlyReminderEmailDictionary } from './friendly-reminder.i18n';
import { EmailCta, EmailShell, EventDetailsCard } from './email-layout';

interface FriendlyReminderEmailProps extends BaseEventEmailProps {
  dictionary: FriendlyReminderEmailDictionary;
}

export const FriendlyReminderEmail = ({
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventAddress,
  lang,
  dictionary,
}: FriendlyReminderEmailProps): string => {
  const formattedGreeting = dictionary.greeting.replace('{userName}', userName);
  const formattedDescription = dictionary.description.replace('{eventTitle}', eventTitle);

  return EmailShell({
    lang,
    title: dictionary.previewText,
    greeting: formattedGreeting,
    description: formattedDescription,
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
