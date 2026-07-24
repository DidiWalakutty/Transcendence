import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';

import { DatabaseService } from '../../database/database.service';

@Injectable()
export class PostgresHealthIndicator {
  constructor(
    private readonly healthIndicator: HealthIndicatorService,
    private readonly config: ConfigService,
    @Optional() private readonly database?: DatabaseService,
  ) {}

  async isHealthy() {
    const check = this.healthIndicator.check('postgres');

    if (this.config.getOrThrow<boolean>('DEV_FIXTURES')) {
      return check.up({
        mode: 'fixtures',
        skipped: true,
      });
    }

    try {
      await this.database!.ping();
      return check.up();
    } catch {
      return check.down('PostgreSQL ping failed');
    }
  }
}
