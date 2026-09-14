import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { WelcomeEmail, welcomeTranslations } from '../templates/index';
import { TicketConfirmationEmail, ticketConfirmationTranslations } from '../templates/index';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Compiles and dispatches a themed welcome notification
   * @param toEmail Recipient inbox address
   * @param userName Recipient display profile name
   * @param lang Preferred locale choice. Defaults to 'en' if not specified or unrecognized.
   */
  async sendWelcomeEmail(
    toEmail: string,
    userName: string,
    lang: 'en' | 'nl' | 'es' | 'ru' = 'en',
  ): Promise<void> {
    try {
      const selectedDictionary = welcomeTranslations[lang] || welcomeTranslations.en;

      const htmlContent = WelcomeEmail({
        userName,
        lang,
        dictionary: selectedDictionary,
      });

      await this.mailerService.sendMail({
        to: toEmail,
        subject: selectedDictionary.previewText,
        html: htmlContent,
      });

      this.logger.log(
        `Welcome email (${lang.toUpperCase()}) successfully dispatched to ${toEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to execute welcome email routine for ${toEmail}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
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
    lang: 'en' | 'nl' | 'es' | 'ru' = 'en',
  ): Promise<void> {
    try {
      const selectedDictionary =
        ticketConfirmationTranslations[lang] || ticketConfirmationTranslations.en;

      const htmlContent = TicketConfirmationEmail({
        userName,
        eventTitle,
        eventDate,
        eventTime,
        eventLocation,
        lang,
        dictionary: selectedDictionary,
      });

      await this.mailerService.sendMail({
        to: toEmail,
        subject: `${selectedDictionary.subjectText} ${eventTitle}`,
        html: htmlContent,
      });

      this.logger.log(
        `Ticket confirmation email (${lang.toUpperCase()}) successfully dispatched to ${toEmail}`,
      );
    } catch (error) {
      this.logger.error(`Failed to execute ticket confirmation routine for ${toEmail}`, error);
      throw error;
    }
  }
}
