import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';

import { DatabaseService } from '../../database/database.service';
import { BaseHealthIndicator } from './base.health-indicator';

@Injectable()
export class PostgresHealthIndicator extends BaseHealthIndicator {
  constructor(
    healthIndicator: HealthIndicatorService,
    config: ConfigService,
    @Optional() private readonly database?: DatabaseService,
  ) {
    super(healthIndicator, config);
  }

  async isHealthy() {
    return this.pingCheck('postgres', () => this.database!.ping(), 'PostgreSQL ping failed');
  }
}
