import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import express, { Express, Request, Response } from 'express';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.config';

/**
 * Vercel serverless entry (docs/00 · ADR-008, docs/09).
 *
 * The bootstrapped Express instance is cached at module scope. Vercel keeps a warm
 * function container alive between invocations, so both the Nest app AND the
 * underlying Mongoose connection are reused across requests instead of being
 * rebuilt on every call — this is the connection-reuse detail that keeps a
 * serverless app from exhausting Atlas's connection limit (docs/09 §5).
 */
let cachedApp: Express | null = null;

async function bootstrapServerless(): Promise<Express> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  configureApp(app);
  await app.init(); // initialise the app WITHOUT binding a port
  return expressApp;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (!cachedApp) {
    cachedApp = await bootstrapServerless();
  }
  cachedApp(req, res);
}
