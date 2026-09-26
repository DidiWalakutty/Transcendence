import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { resolveUserDisplayName, resolveUserLocale } from '@repo/schemas/users';
import { fromEventDateTime } from '@repo/schemas/events';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { users, events, registrations } from '@repo/schemas/database';
import { and, eq, gte, lte } from 'drizzle-orm';
import { NotificationService } from './notification.service';
import { isActiveRegistration } from '../registrations/registration.conditions';

@Injectable()
export class NotificationScheduler implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(NotificationScheduler.name);
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private readonly notificationService: NotificationService,
    @Inject(DATABASE) private readonly db: Database,
  ) {}

  onApplicationBootstrap() {
    this.logger.log('Background 24-Hour Pre-Event Friendly Reminder scheduler activated.');
    void this.runReminderCheckSweep();

    this.intervalId = setInterval(
      () => {
        void this.runReminderCheckSweep();
      },
      60 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private formatEventDateTime(dateTime: Date): { dateString: string; timeString: string } {
    const { date, time } = fromEventDateTime(dateTime);
    return { dateString: date, timeString: time };
  }

  private async runReminderCheckSweep() {
    try {
      const now = new Date();
      const targetStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
      const targetEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

      const records = await this.db
        .select({
          eventId: registrations.eventId,
          userEmail: users.email,
          userPreferedLanguage: users.preferedLanguage,
          userName: users.name,
          userUsername: users.username,
          eventTitle: events.title,
          eventDateTime: events.dateTime,
          eventLocation: events.location,
          eventAddress: events.address,
        })
        .from(registrations)
        .innerJoin(events, eq(registrations.eventId, events.id))
        .innerJoin(users, eq(registrations.userId, users.id))
        .where(
          and(
            isActiveRegistration,
            gte(events.dateTime, targetStart),
            lte(events.dateTime, targetEnd),
          ),
        );

      if (records.length === 0) {
        return;
      }

      this.logger.log(
        `Found ${records.length} upcoming active registrations matching reminder window bounds.`,
      );

      for (const record of records) {
        const userLang = resolveUserLocale(record.userPreferedLanguage);
        const userName = resolveUserDisplayName({
          name: record.userName,
          username: record.userUsername,
        });
        const { dateString, timeString } = this.formatEventDateTime(record.eventDateTime);

        await this.notificationService.sendFriendlyReminderEmail(
          record.userEmail,
          userName,
          record.eventTitle,
          dateString,
          timeString,
          record.eventLocation,
          record.eventAddress,
          userLang,
        );
      }
    } catch (error) {
      this.logger.error('Failed to execute background reminder check database query sweep:', error);
    }
  }
}
