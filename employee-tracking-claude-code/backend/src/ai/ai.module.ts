import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { DatabaseConfig } from '../config/database.config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AIController],
  providers: [AIService, DatabaseConfig],
  exports: [AIService],
})
export class AIModule {}