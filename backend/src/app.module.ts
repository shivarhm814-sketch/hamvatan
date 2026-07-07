import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { RedisService } from './modules/redis/redis.service';
import { SmsModule } from './modules/sms/sms.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { StorageModule } from './modules/storage/storage.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { AdminServiceRequestsModule } from './modules/admin-service-requests/admin-service-requests.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ContactRequestsModule } from './modules/contact-requests/contact-requests.module';
import { HealthModule } from './modules/health/health.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    RedisModule,
    ThrottlerModule.forRootAsync({
      // Reuses the app-wide RedisService connection (lifecycle-managed via its own
      // onModuleDestroy) instead of opening a second, untracked ioredis connection
      // that Nest would never close on shutdown.
      inject: [ConfigService, RedisService],
      useFactory: (configService: ConfigService, redisService: RedisService) => ({
        throttlers: [
          {
            ttl: (configService.get<number>('throttle.ttl') ?? 60) * 1000,
            limit: configService.get<number>('throttle.limit') ?? 10,
          },
        ],
        storage: new ThrottlerStorageRedisService(redisService),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
        },
      }),
    }),
    PrismaModule,
    SmsModule,
    UsersModule,
    AuthModule,
    StorageModule,
    PropertiesModule,
    AdminServiceRequestsModule,
    NotificationsModule,
    ContactRequestsModule,
    HealthModule,
    SettingsModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
