import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { validationExceptionFactory } from './common/validation-exception-factory';
import { UPLOADS_DIR } from './common/image-upload';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  // Uploaded listing photos, served outside the /api prefix at /uploads/<file>.
  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads' });

  const corsOrigins = (config.get<string>('CORS_ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  const port = config.get<string>('PORT') ?? 8000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`DUMarket API listening on http://localhost:${port}/api`);
}

bootstrap();
