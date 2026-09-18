import { Inject, Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type { UserDto } from '@repo/schemas/users';
import { resolveUserDisplayName, resolveUserLocale } from '@repo/schemas/users';
import { fromEventDateTime } from '@repo/schemas/events';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { users, events } from '@repo/schemas/database';
import { eq } from 'drizzle-orm';
import { NotificationService } from './notification.service';
import { APP_EVENTS, offAppEvent, onAppEvent } from '../events/app-events';

@Injectable()
export class NotificationListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationListener.name);

  private readonly welcomeRef = (user: any) => this.handleUserCreated(user);
  private readonly ticketRef = (payload: any) => this.handleTicketRegistration(payload);
  private readonly cancelRef = (payload: any) => this.handleEventBroadcast(payload, 'cancel');
  private readonly modifyRef = (payload: any) => this.handleEventBroadcast(payload, 'modify');

  constructor(
    private readonly notificationService: NotificationService,
    @Inject(DATABASE) private readonly db: Database,
  ) {}

  onModuleInit() {
    onAppEvent(APP_EVENTS.userCreated, this.welcomeRef);
    onAppEvent(APP_EVENTS.registrationCreated, this.ticketRef);
    onAppEvent(APP_EVENTS.eventCancelled, this.cancelRef);
    onAppEvent(APP_EVENTS.eventModified, this.modifyRef);
  }

  onModuleDestroy() {
    offAppEvent(APP_EVENTS.userCreated, this.welcomeRef);
    offAppEvent(APP_EVENTS.registrationCreated, this.ticketRef);
    offAppEvent(APP_EVENTS.eventCancelled, this.cancelRef);
    offAppEvent(APP_EVENTS.eventModified, this.modifyRef);
  }

  private async getNotificationUser(userId: string) {
    const userRecord = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!userRecord) return null;
    return {
      email: userRecord.email,
      name: resolveUserDisplayName(
        userRecord as { name?: string | null; username?: string | null },
      ),
      lang: resolveUserLocale((userRecord as { preferedLanguage?: unknown }).preferedLanguage),
    };
  }

  private formatEventDateTime(dateTime: Date): { dateString: string; timeString: string } {
    const { date, time } = fromEventDateTime(dateTime);
    return { dateString: date, timeString: time };
  }

  private async handleUserCreated(user: UserDto) {
    this.logger.log(`Intercepted signup signal event for recipient inbox: ${user.email}`);

    try {
      const userLang = resolveUserLocale((user as { preferedLanguage?: unknown }).preferedLanguage);
      const userName = resolveUserDisplayName(user);

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

      const userLang = resolveUserLocale(
        (userRecord as { preferedLanguage?: unknown }).preferedLanguage,
      );
      const userName = resolveUserDisplayName(
        userRecord as { name?: string | null; username?: string | null },
      );
      const { dateString, timeString } = this.formatEventDateTime(eventRecord.dateTime);

      await this.notificationService.sendTicketConfirmationEmail(
        userRecord.email,
        userName,
        eventRecord.title,
        dateString,
        timeString,
        eventRecord.location,
        eventRecord.address,
        userLang,
      );
    } catch (error) {
      this.logger.error(`Failed to dispatch ticket confirmation mail route`, error);
    }
  }

  private async handleEventBroadcast(
    payload: { event: any; attendees: any[]; oldEvent?: any },
    mode: 'cancel' | 'modify',
  ) {
    const { event, attendees, oldEvent } = payload;

    if (!attendees || attendees.length === 0) return;

    let highlights = { title: false, dateTime: false, location: false, address: false };

    if (mode === 'modify' && oldEvent) {
      const hasTitleChanged = oldEvent.title !== event.title;
      const hasDateTimeChanged = oldEvent.date !== event.date || oldEvent.time !== event.time;
      const hasLocationChanged = oldEvent.location !== event.location;
      const hasAddressChanged = oldEvent.address !== event.address;

      if (!hasTitleChanged && !hasDateTimeChanged && !hasLocationChanged && !hasAddressChanged) {
        this.logger.log(
          `Skipping notification broadcast. Changes are isolated to non-impactful fields.`,
        );
        return;
      }

      highlights = {
        title: hasTitleChanged,
        dateTime: hasDateTimeChanged,
        location: hasLocationChanged,
        address: hasAddressChanged,
      };
    }

    this.logger.log(
      `Executing background ${mode} broadcasts for event: ${event.title} (${attendees.length} attendees)`,
    );

    const dateString = event.date || 'N/A';
    const timeString = event.time || 'N/A';

    await Promise.all(
      attendees.map(async (attendee) => {
        try {
          const notified = await this.getNotificationUser(attendee.id);

          if (!notified) return;

          if (mode === 'cancel') {
            await this.notificationService.sendEventCancellationEmail(
              notified.email,
              notified.name,
              event.title,
              dateString,
              timeString,
              event.location,
              event.address,
              notified.lang,
            );
          } else if (mode === 'modify') {
            await this.notificationService.sendEventModificationEmail(
              notified.email,
              notified.name,
              event.title,
              dateString,
              timeString,
              event.location,
              event.address,
              notified.lang,
              highlights,
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
