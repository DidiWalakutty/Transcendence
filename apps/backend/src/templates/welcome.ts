import type { NotificationLanguage } from '@repo/schemas/users';
import { WelcomeEmailDictionary } from './welcome.i18n';
import { EmailCta, EmailShell } from './email-layout';

interface WelcomeEmailProps {
  userName: string;
  lang: NotificationLanguage;
  dictionary: WelcomeEmailDictionary;
}

/**
 * Eventra Multilingual Welcome Email Component
 */
export const WelcomeEmail = ({ userName, lang, dictionary }: WelcomeEmailProps): string => {
  return EmailShell({
    lang,
    title: dictionary.previewText,
    greeting: dictionary.greeting.replace('{userName}', userName),
    description: dictionary.description,
    children: EmailCta({
      href: `https://localhost:3000/${lang}/events`,
      label: dictionary.buttonLabel,
    }),
    footer: dictionary.footerNotice,
  });
};
