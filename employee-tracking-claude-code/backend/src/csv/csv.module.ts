import { Module } from '@nestjs/common';
import { CSVService } from './csv.service';
import { CSVController } from './csv.controller';
import { DatabaseConfig } from '../config/database.config';
import { AuthModule } from '../auth/auth.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AuthModule, AIModule],
  controllers: [CSVController],
  providers: [CSVService, DatabaseConfig],
  exports: [CSVService],
})
export class CSVModule {}