import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationService } from './notification.service';
import { NotificationListener } from './notification.listener';
import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'mailpit',
        port: Number(process.env.MAIL_PORT) || 1025,
        ...(process.env.MAIL_USER && process.env.MAIL_PASS
          ? {
              auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
              },
            }
          : {}),
      },
      defaults: {
        from: '"Eventra Team" <no-reply@eventra.local>',
      },
    }),
  ],
  providers: [NotificationService, NotificationListener],
  exports: [NotificationService],
})
export class NotificationModule {}
