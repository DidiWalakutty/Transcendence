import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';

export abstract class BaseHealthIndicator {
  constructor(
    protected readonly healthIndicator: HealthIndicatorService,
    protected readonly config: ConfigService,
  ) {}

  protected fixturesSkip(name: string) {
    return this.healthIndicator.check(name).up({ mode: 'fixtures', skipped: true });
  }

  protected isFixtureMode(): boolean {
    try {
      return this.config.getOrThrow<boolean>('DEV_FIXTURES');
    } catch {
      return false;
    }
  }

  protected async pingCheck(name: string, ping: () => Promise<unknown>, downMessage: string) {
    const check = this.healthIndicator.check(name);
    if (this.isFixtureMode()) {
      return check.up({ mode: 'fixtures', skipped: true });
    }
    try {
      await ping();
      return check.up();
    } catch {
      return check.down(downMessage);
    }
  }
}
