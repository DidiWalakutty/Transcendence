import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationService } from './notification.service';
import { NotificationListener } from './notification.listener';
import { NotificationScheduler } from './notification.scheduler';
import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'mailpit',
        port: Number(process.env.MAIL_PORT) || 1025,
      },
      defaults: {
        from: process.env.MAIL_FROM || '"Eventra Team" <no-reply@eventra.local>',
      },
    }),
  ],
  providers: [NotificationService, NotificationListener, NotificationScheduler],
  exports: [NotificationService],
})
export class NotificationModule {}
