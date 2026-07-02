import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Single source of truth for how the Nest application is configured, shared by the
 * local bootstrap (`main.ts`) and the serverless handler (`api/index.ts`) so the two
 * environments behave identically. (docs/00 · ADR-008)
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  // All routes are served under /api (matches the frontend's VITE_API_URL).
  app.setGlobalPrefix('api');

  // DTO validation everywhere: strip unknown props, reject extras, coerce types.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS: only the configured frontend origin(s) may call the API.
  const origins = (config.get<string>('corsOrigin') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins.length ? origins : true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
}
