import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { render } from 'react-email';
import * as React from 'react';

import { WelcomeEmail } from './templates/welcome';
import { welcomeTranslations } from './templates/welcome.i18n';

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
    lang: 'en' | 'nl' | 'es' = 'en',
  ): Promise<void> {
    try {
      const selectedDictionary = welcomeTranslations[lang] || welcomeTranslations.en;

      const htmlContent = await render(
        React.createElement(WelcomeEmail, {
          userName,
          dictionary: selectedDictionary,
        }),
      );

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
}
