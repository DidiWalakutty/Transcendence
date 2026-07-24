import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DATABASE } from './database.constants';
import { DatabaseService } from './database.service';

@Module({
  imports: [ConfigModule],
  providers: [
    DatabaseService,
    {
      provide: DATABASE,
      inject: [DatabaseService],
      useFactory: (database: DatabaseService) => database.client,
    },
  ],
  exports: [DATABASE, DatabaseService],
})
export class DatabaseModule {}
