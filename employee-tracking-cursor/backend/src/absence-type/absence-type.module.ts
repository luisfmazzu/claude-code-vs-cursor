import { Module } from '@nestjs/common';
import { AbsenceTypeController } from './absence-type.controller';
import { AbsenceTypeService } from './absence-type.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AbsenceTypeController],
  providers: [AbsenceTypeService],
  exports: [AbsenceTypeService],
})
export class AbsenceTypeModule {} 