import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseConfig } from '../config/database.config';

@Module({
  controllers: [HealthController],
  providers: [DatabaseConfig],
})
export class HealthModule {}