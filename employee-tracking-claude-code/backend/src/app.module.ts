import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { EmailModule } from './email/email.module';
import { AIModule } from './ai/ai.module';
import { CSVModule } from './csv/csv.module';
import { BillingModule } from './billing/billing.module';
import { HealthModule } from './health/health.module';
import { DatabaseConfig } from './config/database.config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    EmployeesModule,
    EmailModule,
    AIModule,
    CSVModule,
    BillingModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    DatabaseConfig,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
