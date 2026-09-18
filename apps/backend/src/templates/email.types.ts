import type { NotificationLanguage } from '@repo/schemas/users';

export type { NotificationLanguage };

export interface BaseEventEmailProps {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventAddress: string;
  lang: NotificationLanguage;
}

export function pickDictionary<T>(
  maps: Record<NotificationLanguage, T>,
  lang: NotificationLanguage,
): T {
  return maps[lang] || maps.en;
}
