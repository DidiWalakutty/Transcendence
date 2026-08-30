// Connects all registration components together.
// The router handles API requests, the service contains the registration logic,
// and the repository handles database operations through Drizzle ORM.

import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { RegistrationsRouter } from './registrations.router';
import { RegistrationsService } from './registrations.service';
import { RegistrationsRepository } from './repositories/registrations.repository';
import { DrizzleRegistrationsRepository } from './repositories/drizzle-registrations.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    RegistrationsRouter,
    RegistrationsService,
    {
      provide: RegistrationsRepository,
      useClass: DrizzleRegistrationsRepository,
    },
  ],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
