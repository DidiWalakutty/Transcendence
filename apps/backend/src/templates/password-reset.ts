import type { NotificationLanguage } from '@repo/schemas/users';
import { PasswordResetEmailDictionary } from './password-reset.i18n';
import { EmailCta, EmailShell } from './email-layout';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  lang: NotificationLanguage;
  dictionary: PasswordResetEmailDictionary;
}

/**
 * Eventra Multilingual Password Recovery Email Component
 */
export const PasswordResetEmail = ({
  userName,
  resetUrl,
  lang,
  dictionary,
}: PasswordResetEmailProps): string => {
  return EmailShell({
    lang,
    title: dictionary.previewText,
    greeting: dictionary.greeting.replace('{userName}', userName),
    description: dictionary.description,
    children: EmailCta({
      href: resetUrl,
      label: dictionary.buttonLabel,
    }),
    footer: dictionary.footerNotice,
  });
};
