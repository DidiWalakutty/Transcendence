import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema } from '@repo/schemas/database';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;
  readonly client;

  constructor(config: ConfigService) {
    this.pool = new Pool({
      connectionString: config.getOrThrow<string>('DATABASE_URL'),
      connectionTimeoutMillis: 2_000,
    });
    this.pool.on('error', (error) => {
      this.logger.error('Unexpected error on an idle PostgreSQL client', error.stack);
    });
    this.client = drizzle({
      client: this.pool,
      schema,
    });
  }

  async ping() {
    await this.pool.query('SELECT 1');
  }

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
