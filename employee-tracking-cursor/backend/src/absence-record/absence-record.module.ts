import { Module } from '@nestjs/common';
import { AbsenceRecordController } from './absence-record.controller';
import { AbsenceRecordService } from './absence-record.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [PrismaModule, EmployeeModule],
  controllers: [AbsenceRecordController],
  providers: [AbsenceRecordService],
  exports: [AbsenceRecordService],
})
export class AbsenceRecordModule {} 