import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { AUTH } from './auth.constants';
import { createAuth } from './auth.instance';
import { AuthContext } from './auth.context';
import { ProtectedMiddleware } from './protected.middleware';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [
    {
      provide: AUTH,
      inject: [DATABASE, ConfigService],
      useFactory: (database: Database, config: ConfigService) => createAuth(database, config),
    },
    AuthContext,
    ProtectedMiddleware,
  ],
  exports: [AUTH, AuthContext, ProtectedMiddleware],
})
export class AuthModule {}
