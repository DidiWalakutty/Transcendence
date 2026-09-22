import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import type { NotificationLanguage } from '@repo/schemas/users';

import {
  WelcomeEmail,
  welcomeTranslations,
  TicketConfirmationEmail,
  ticketConfirmationTranslations,
  EventCancellationEmail,
  eventCancellationTranslations,
  EventModificationEmail,
  eventModificationTranslations,
  FriendlyReminderEmail,
  friendlyReminderTranslations,
  pickDictionary,
} from '../templates/index';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly mailerService: MailerService) {}

  private pick<T>(maps: Record<NotificationLanguage, T>, lang: NotificationLanguage): T {
    return pickDictionary(maps, lang);
  }

  private async dispatch({
    to,
    subject,
    html,
    successLog,
    failureLog,
  }: {
    to: string;
    subject: string;
    html: string;
    successLog: string;
    failureLog: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({ to, subject, html });
      this.logger.log(successLog);
    } catch (error) {
      this.logger.error(failureLog, error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  /**
   * Compiles and dispatches a themed welcome notification
   * @param toEmail Recipient inbox address
   * @param userName Recipient display profile name
   * @param lang Preferred locale choice. Defaults to 'en' if not specified or unrecognized.
   */
  async sendWelcomeEmail(
    toEmail: string,
    userName: string,
    lang: NotificationLanguage = 'en',
  ): Promise<void> {
    const selectedDictionary = this.pick(welcomeTranslations, lang);
    const htmlContent = WelcomeEmail({ userName, lang, dictionary: selectedDictionary });
    await this.dispatch({
      to: toEmail,
      subject: selectedDictionary.previewText,
      html: htmlContent,
      successLog: `Welcome email (${lang.toUpperCase()}) successfully dispatched to ${toEmail}`,
      failureLog: `Failed to execute welcome email routine for ${toEmail}`,
    });
  }

  /**
   * Compiles and dispatches an event ticket confirmation notice
   */
  async sendTicketConfirmationEmail(
    toEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventLocation: string,
    eventAddress: string,
    lang: NotificationLanguage = 'en',
  ): Promise<void> {
    const selectedDictionary = this.pick(ticketConfirmationTranslations, lang);
    const htmlContent = TicketConfirmationEmail({
      userName,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      eventAddress,
      lang,
      dictionary: selectedDictionary,
    });
    await this.dispatch({
      to: toEmail,
      subject: `${selectedDictionary.subjectText} ${eventTitle}`,
      html: htmlContent,
      successLog: `Ticket confirmation email (${lang.toUpperCase()}) successfully dispatched to ${toEmail}`,
      failureLog: `Failed to execute ticket confirmation routine for ${toEmail}`,
    });
  }

  /**
   * Compiles and dispatches an event cancellation notice to a registered user
   */
  async sendEventCancellationEmail(
    toEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventLocation: string,
    eventAddress: string,
    lang: NotificationLanguage = 'en',
  ): Promise<void> {
    const selectedDictionary = this.pick(eventCancellationTranslations, lang);
    const htmlContent = EventCancellationEmail({
      userName,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      eventAddress,
      lang,
      dictionary: selectedDictionary,
    });
    await this.dispatch({
      to: toEmail,
      subject: `${selectedDictionary.subjectText} ${eventTitle}`,
      html: htmlContent,
      successLog: `Event cancellation email (${lang.toUpperCase()}) successfully dispatched to ${toEmail}`,
      failureLog: `Failed to execute event cancellation notification routine for ${toEmail}`,
    });
  }

  /**
   * Compiles and dispatches an event modification notice with conditional red highlights
   */
  async sendEventModificationEmail(
    toEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventLocation: string,
    eventAddress: string,
    lang: NotificationLanguage = 'en',
    highlights: { title: boolean; dateTime: boolean; location: boolean; address: boolean } = {
      title: false,
      dateTime: false,
      location: false,
      address: false,
    },
  ): Promise<void> {
    const selectedDictionary = this.pick(eventModificationTranslations, lang);
    const htmlContent = EventModificationEmail({
      userName,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      eventAddress,
      lang,
      dictionary: selectedDictionary,
      highlights,
    });
    await this.dispatch({
      to: toEmail,
      subject: `${selectedDictionary.subjectText} ${eventTitle}`,
      html: htmlContent,
      successLog: `Event modification email (${lang.toUpperCase()}) sent to ${toEmail}`,
      failureLog: `Failed to execute modification notification routine for ${toEmail}`,
    });
  }

  /**
   * Compiles and dispatches a friendly 24-hour pre-event reminder notice
   */
  async sendFriendlyReminderEmail(
    toEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventLocation: string,
    eventAddress: string,
    lang: NotificationLanguage = 'en',
  ): Promise<void> {
    const selectedDictionary = this.pick(friendlyReminderTranslations, lang);
    const htmlContent = FriendlyReminderEmail({
      userName,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      eventAddress,
      lang,
      dictionary: selectedDictionary,
    });
    await this.dispatch({
      to: toEmail,
      subject: `${selectedDictionary.subjectText} ${eventTitle}`,
      html: htmlContent,
      successLog: `Friendly 24h reminder email (${lang.toUpperCase()}) successfully sent to ${toEmail}`,
      failureLog: `Failed to execute 24h friendly reminder notification routine for ${toEmail}`,
    });
  }
}
