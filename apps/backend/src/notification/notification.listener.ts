import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type { UserDto } from '@repo/schemas/users';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationListener.name);

  private readonly listenerRef = (user: any) => this.handleUserCreated(user);

  constructor(private readonly notificationService: NotificationService) {}

  onModuleInit() {
    process.on('user.created' as any, this.listenerRef);
  }

  onModuleDestroy() {
    process.off('user.created' as any, this.listenerRef);
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
}
