import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseModule } from '../database/database.module';
import { HealthController } from './health.controller';
import { PostgresHealthIndicator } from './indicators/postgres.health-indicator';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';

export interface HealthModuleOptions {
  useFixtures: boolean;
}

@Module({})
export class HealthModule {
  static register({ useFixtures }: HealthModuleOptions): DynamicModule {
    return {
      module: HealthModule,
      imports: [TerminusModule, ...(useFixtures ? [] : [DatabaseModule])],
      controllers: [HealthController],
      providers: [PostgresHealthIndicator, RedisHealthIndicator],
    };
  }
}
