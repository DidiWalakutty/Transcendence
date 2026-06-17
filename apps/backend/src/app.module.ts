import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import superjson from 'superjson';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleRouter } from './trpc.router';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        'apps/backend/.env',
        '.env',
        'apps/backend/.env.development',
        '.env.development',
      ],
      isGlobal: true,
    }),
    EventsModule,
    UsersModule,
    TRPCModule.forRoot({
      basePath: '/api/trpc',
      transformer: superjson,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ExampleRouter],
})
export class AppModule {}
