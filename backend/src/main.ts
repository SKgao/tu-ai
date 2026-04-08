import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { json, static as serveStatic, urlencoded } from 'express';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { LegacyApiExceptionFilter } from './modules/auth/legacy-api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true,
      allowedHeaders: ['Content-Type', 'token'],
    },
  });
  app.use(json({ strict: false }));
  app.use(urlencoded({ extended: true }));
  const uploadDir = join(process.cwd(), 'uploads');
  mkdirSync(uploadDir, { recursive: true });
  app.use('/uploads', serveStatic(uploadDir));
  app.useGlobalFilters(new LegacyApiExceptionFilter());

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Nest API listening on http://localhost:${port}`);
}

void bootstrap();
