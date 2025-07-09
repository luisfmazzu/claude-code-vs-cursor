import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { WinstonModule } from 'nest-winston';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { EmployeeModule } from './employee/employee.module';
import { AbsenceTypeModule } from './absence-type/absence-type.module';
import { AbsenceRecordModule } from './absence-record/absence-record.module';
import { EmailIntegrationModule } from './email-integration/email-integration.module';
import { AIProcessingModule } from './ai-processing/ai-processing.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationModule } from './notification/notification.module';
import { BillingModule } from './billing/billing.module';
import { FileModule } from './file/file.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';

// Common modules
import { LoggerModule } from './common/logger/logger.module';
import { MailModule } from './common/mail/mail.module';
import { WebSocketModule } from './common/websocket/websocket.module';

// Middleware
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { createLogger } from './common/logger/logger.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Logging
    WinstonModule.forRootAsync({
      useFactory: () => createLogger(),
    }),

    // Caching
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
          },
          password: configService.get('REDIS_PASSWORD'),
          database: configService.get('REDIS_DB', 0),
        }),
        ttl: 60 * 60 * 1000, // 1 hour
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('THROTTLE_TTL', 60000),
        limit: configService.get('THROTTLE_LIMIT', 100),
      }),
      inject: [ConfigService],
    }),

    // Bull queues
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Event emitter
    EventEmitterModule.forRoot(),

    // Core modules
    PrismaModule,
    LoggerModule,
    MailModule,
    WebSocketModule,
    HealthModule,

    // Business modules
    AuthModule,
    CompanyModule,
    UserModule,
    EmployeeModule,
    AbsenceTypeModule,
    AbsenceRecordModule,
    EmailIntegrationModule,
    AIProcessingModule,
    AnalyticsModule,
    NotificationModule,
    BillingModule,
    FileModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
} 