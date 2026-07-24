import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Backend (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.DEV_FIXTURES = 'true';
    const { AppModule } = await import('../src/app.module');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('reports backend health', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({
        status: 'ok',
        info: {
          postgres: {
            status: 'up',
            mode: 'fixtures',
            skipped: true,
          },
          redis: {
            status: 'up',
            mode: 'fixtures',
            skipped: true,
          },
        },
        error: {},
        details: {
          postgres: {
            status: 'up',
            mode: 'fixtures',
            skipped: true,
          },
          redis: {
            status: 'up',
            mode: 'fixtures',
            skipped: true,
          },
        },
      });
  });

  it('serves users from the fixture-backed tRPC router', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/trpc/users.getUsers')
      .query({
        input: JSON.stringify({
          json: null,
        }),
      })
      .expect(200);

    expect(response.body.result.data.json).toHaveLength(3);
  });

  afterAll(async () => {
    await app?.close();
  });
});
