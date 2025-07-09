import { Module } from '@nestjs/common';
import { AIProcessingController } from './ai-processing.controller';
import { AIProcessingService } from './ai-processing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmployeeModule } from '../employee/employee.module';
import { AbsenceTypeModule } from '../absence-type/absence-type.module';
import { AbsenceRecordModule } from '../absence-record/absence-record.module';

@Module({
  imports: [
    PrismaModule, 
    EmployeeModule, 
    AbsenceTypeModule, 
    AbsenceRecordModule
  ],
  controllers: [AIProcessingController],
  providers: [AIProcessingService],
  exports: [AIProcessingService],
})
export class AIProcessingModule {} 