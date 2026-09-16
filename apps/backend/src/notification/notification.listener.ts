import { Inject, Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type { UserDto } from '@repo/schemas/users';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { users, events } from '@repo/schemas/database';
import { eq } from 'drizzle-orm';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationListener.name);

  private readonly welcomeRef = (user: any) => this.handleUserCreated(user);
  private readonly ticketRef = (payload: any) => this.handleTicketRegistration(payload);
  private readonly cancelRef = (payload: any) => this.handleEventBroadcast(payload, 'cancel');

  constructor(
    private readonly notificationService: NotificationService,
    @Inject(DATABASE) private readonly db: Database,
  ) {}

  onModuleInit() {
    process.on('user.created' as any, this.welcomeRef);
    process.on('registration.created' as any, this.ticketRef);
    process.on('event.cancelled' as any, this.cancelRef);
  }

  onModuleDestroy() {
    process.off('user.created' as any, this.welcomeRef);
    process.off('registration.created' as any, this.ticketRef);
    process.off('event.cancelled' as any, this.cancelRef);
  }

  private async handleUserCreated(user: UserDto) {
    this.logger.log(`Intercepted signup signal event for recipient inbox: ${user.email}`);

    try {
      const dbLang = (user as any).preferedLanguage;
      const userLang = ['nl', 'es', 'ru'].includes(dbLang)
        ? (dbLang as 'en' | 'nl' | 'es' | 'ru')
        : 'en';

      const userName = user.name || user.username || 'User';

      await this.notificationService.sendWelcomeEmail(user.email, userName, userLang);
    } catch (error) {
      this.logger.error(
        `Failed to execute notification dispatch routine for user event ${user.email}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async handleTicketRegistration(payload: { userId: string; eventId: string }) {
    this.logger.log(
      `Intercepted ticket booking confirmation signal for user ID: ${payload.userId}`,
    );
    try {
      const [userRecord, eventRecord] = await Promise.all([
        this.db.query.users.findFirst({ where: eq(users.id, payload.userId) }),
        this.db.query.events.findFirst({ where: eq(events.id, payload.eventId) }),
      ]);

      if (!userRecord || !eventRecord) {
        this.logger.warn(
          `Could not compile ticket email. User or Event data missing from DB record lines.`,
        );
        return;
      }

      const dbLang = (userRecord as any).preferedLanguage;
      const userLang = ['nl', 'es', 'ru'].includes(dbLang)
        ? (dbLang as 'en' | 'nl' | 'es' | 'ru')
        : 'en';

      const userName = userRecord.name || (userRecord as any).username || 'User';

      const dateString = eventRecord.dateTime.toISOString().slice(0, 10);
      const timeString = eventRecord.dateTime.toISOString().slice(11, 16);

      await this.notificationService.sendTicketConfirmationEmail(
        userRecord.email,
        userName,
        eventRecord.title,
        dateString,
        timeString,
        eventRecord.location,
        userLang,
      );
    } catch (error) {
      this.logger.error(`Failed to dispatch ticket confirmation mail route`, error);
    }
  }

  private async handleEventBroadcast(
    payload: { event: any; attendees: any[] },
    mode: 'cancel' | 'modify',
  ) {
    const { event, attendees } = payload;
    this.logger.log(
      `Executing background ${mode} broadcasts for event: ${event.title} (${attendees?.length || 0} attendees)`,
    );

    if (!attendees || attendees.length === 0) return;

    const dateString = event.date || 'N/A';
    const timeString = event.time || 'N/A';

    await Promise.all(
      attendees.map(async (attendee) => {
        try {
          const userRecord = await this.db.query.users.findFirst({
            where: eq(users.id, attendee.id),
          });

          if (!userRecord) return;

          const dbLang = (userRecord as any).preferedLanguage;
          const userLang = ['nl', 'es', 'ru'].includes(dbLang) ? (dbLang as any) : 'en';
          const userName = userRecord.name || (userRecord as any).username || 'User';

          if (mode === 'cancel') {
            await this.notificationService.sendEventCancellationEmail(
              userRecord.email,
              userName,
              event.title,
              dateString,
              timeString,
              event.location,
              userLang,
            );
          } else if (mode === 'modify') {
            this.logger.debug(
              `Modification mode triggered for user: ${userRecord.email}. Action skipped for Task 3 boundary.`,
            );
          }
        } catch (mailError) {
          this.logger.error(
            `Failed to dispatch ${mode} email notice to attendee ID ${attendee.id}`,
            mailError,
          );
        }
      }),
    );
  }
}
