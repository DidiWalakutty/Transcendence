import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { environment } from './config/environment';
import { AUTH } from './auth/auth.constants';
import type { Auth } from './auth/auth.instance';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // CORS must be registered before the Better Auth handler so its preflight
  // OPTIONS responses aren't shadowed by Better Auth's own router.
  app.enableCors({
    origin: environment.CORS_ORIGINS,
    credentials: true,
  });

  // Better Auth reads the raw request body itself, so its handler must be
  // mounted before Nest's own body parser middleware consumes the stream.
  app.use('/api/auth', toNodeHandler(app.get<Auth>(AUTH)));
  // Event images are currently submitted as compressed data URLs by the shared
  // image picker. Leave headroom for the rest of the batched tRPC payload.
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  app.enableShutdownHooks();

  await app.listen(environment.PORT, '0.0.0.0');
}

void bootstrap().catch((error: unknown) => {
  Logger.error(error, 'Bootstrap');
  process.exitCode = 1;
});
