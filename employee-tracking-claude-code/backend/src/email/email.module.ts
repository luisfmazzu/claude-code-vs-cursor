import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { DatabaseConfig } from '../config/database.config';
import { AuthModule } from '../auth/auth.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AuthModule, AIModule],
  controllers: [EmailController],
  providers: [EmailService, DatabaseConfig],
  exports: [EmailService],
})
export class EmailModule {}