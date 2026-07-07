import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const sentryDsn = configService.get<string>('sentryDsn');
  if (sentryDsn) {
    Sentry.init({ dsn: sentryDsn, environment: configService.get<string>('nodeEnv') });
  }

  if (configService.get<string>('storage.provider') === 'local') {
    app.useStaticAssets(
      join(process.cwd(), configService.get<string>('storage.localDir') ?? 'uploads'),
      { prefix: '/uploads' },
    );
  }

  app.set('trust proxy', 1);
  app.use(helmet());
  app.enableCors({ origin: configService.get<string>('corsOrigin'), credentials: true });
  app.setGlobalPrefix(configService.get<string>('apiPrefix') ?? 'api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((err) => {
  Logger.error('Failed to bootstrap application', err);
  process.exit(1);
});
