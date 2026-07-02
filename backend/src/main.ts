import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApp } from './app.config';

/**
 * Local bootstrap: a long-running Node process listening on PORT.
 * The serverless deployment uses `api/index.ts` instead but shares `configureApp`.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  configureApp(app);

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 4000;

  await app.listen(port);
  Logger.log(`TeamBoard API listening on http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
