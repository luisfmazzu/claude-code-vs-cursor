import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbsenceRecord } from '@prisma/client';
import { EmployeeService } from '../employee/employee.service';
import { 
  CreateAbsenceRecordDto, 
  UpdateAbsenceRecordDto, 
  AbsenceRecordQueryDto,
  ApprovalDto,
  AbsenceRecordStatsDto 
} from '../types';

@Injectable()
export class AbsenceRecordService {
  constructor(
    private prisma: PrismaService,
    private employeeService: EmployeeService,
  ) {}

  async createAbsenceRecord(
    companyId: string,
    createDto: CreateAbsenceRecordDto,
    createdBy: string,
  ): Promise<AbsenceRecord> {
    // Validate employee exists and belongs to company
    const employee = await this.employeeService.findById(createDto.employeeId, companyId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate absence type exists and belongs to company
    const absenceType = await this.prisma.absenceType.findFirst({
      where: { 
        id: createDto.absenceTypeId, 
        companyId 
      },
    });
    if (!absenceType) {
      throw new NotFoundException('Absence type not found');
    }

    // Calculate total days
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);
    
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const totalDays = this.calculateWorkingDays(startDate, endDate);

    // Check for overlapping absences
    const overlappingAbsences = await this.prisma.absenceRecord.findMany({
      where: {
        employeeId: createDto.employeeId,
        status: { not: 'rejected' },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlappingAbsences.length > 0) {
      throw new BadRequestException('Employee has overlapping absence records');
    }

    // Determine initial status
    let status = 'pending';
    if (!absenceType.requiresApproval) {
      status = 'approved';
    }

    return this.prisma.absenceRecord.create({
      data: {
        companyId,
        employeeId: createDto.employeeId,
        absenceTypeId: createDto.absenceTypeId,
        startDate,
        endDate,
        totalDays,
        reason: createDto.reason,
        notes: createDto.notes,
        status,
        source: createDto.source || 'manual',
        sourceReference: createDto.sourceReference,
        confidenceScore: createDto.confidenceScore,
        createdBy,
        attachments: createDto.attachments || [],
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
            department: true,
          },
        },
        absenceType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            isPaid: true,
            requiresApproval: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(
    companyId: string,
    query: AbsenceRecordQueryDto,
  ): Promise<{ records: AbsenceRecord[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      employeeId,
      absenceTypeId,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (absenceTypeId) {
      where.absenceTypeId = absenceTypeId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    } else if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    const [records, total] = await Promise.all([
      this.prisma.absenceRecord.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              employeeId: true,
              department: true,
            },
          },
          absenceType: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true,
              isPaid: true,
              requiresApproval: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.absenceRecord.count({ where }),
    ]);

    return { records, total };
  }

  async findById(id: string, companyId: string): Promise<AbsenceRecord | null> {
    return this.prisma.absenceRecord.findFirst({
      where: { id, companyId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
            department: true,
          },
        },
        absenceType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            isPaid: true,
            requiresApproval: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updateAbsenceRecord(
    id: string,
    companyId: string,
    updateDto: UpdateAbsenceRecordDto,
    userId: string,
  ): Promise<AbsenceRecord> {
    const record = await this.prisma.absenceRecord.findFirst({
      where: { id, companyId },
    });

    if (!record) {
      throw new NotFoundException('Absence record not found');
    }

    // Only allow updates if record is pending or by the creator
    if (record.status !== 'pending' && record.createdBy !== userId) {
      throw new ForbiddenException('Cannot update approved or rejected absence records');
    }

    let totalDays = record.totalDays;

    // Recalculate total days if dates are changing
    if (updateDto.startDate || updateDto.endDate) {
      const startDate = new Date(updateDto.startDate || record.startDate);
      const endDate = new Date(updateDto.endDate || record.endDate);
      
      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      totalDays = this.calculateWorkingDays(startDate, endDate);

      // Check for overlapping absences (excluding current record)
      const overlappingAbsences = await this.prisma.absenceRecord.findMany({
        where: {
          employeeId: record.employeeId,
          status: { not: 'rejected' },
          id: { not: id },
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      });

      if (overlappingAbsences.length > 0) {
        throw new BadRequestException('Employee has overlapping absence records');
      }
    }

    return this.prisma.absenceRecord.update({
      where: { id },
      data: {
        ...updateDto,
        totalDays,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
            department: true,
          },
        },
        absenceType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            isPaid: true,
            requiresApproval: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async approveAbsenceRecord(
    id: string,
    companyId: string,
    approvalDto: ApprovalDto,
    approverId: string,
  ): Promise<AbsenceRecord> {
    const record = await this.prisma.absenceRecord.findFirst({
      where: { id, companyId },
    });

    if (!record) {
      throw new NotFoundException('Absence record not found');
    }

    if (record.status !== 'pending') {
      throw new BadRequestException('Only pending absence records can be approved/rejected');
    }

    const updateData: any = {
      status: approvalDto.status,
      approvedBy: approverId,
      approvedAt: new Date(),
    };

    if (approvalDto.status === 'rejected') {
      updateData.rejectionReason = approvalDto.rejectionReason;
    }

    if (approvalDto.notes) {
      updateData.notes = approvalDto.notes;
    }

    return this.prisma.absenceRecord.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
            department: true,
          },
        },
        absenceType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            isPaid: true,
            requiresApproval: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteAbsenceRecord(id: string, companyId: string): Promise<void> {
    const record = await this.prisma.absenceRecord.findFirst({
      where: { id, companyId },
    });

    if (!record) {
      throw new NotFoundException('Absence record not found');
    }

    await this.prisma.absenceRecord.delete({
      where: { id },
    });
  }

  async getAbsenceRecordStats(companyId: string): Promise<AbsenceRecordStatsDto> {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRecords,
      pendingRecords,
      approvedRecords,
      rejectedRecords,
      yearToDateRecords,
      monthToDateRecords,
      avgDaysPerRecord,
    ] = await Promise.all([
      this.prisma.absenceRecord.count({
        where: { companyId },
      }),
      this.prisma.absenceRecord.count({
        where: { companyId, status: 'pending' },
      }),
      this.prisma.absenceRecord.count({
        where: { companyId, status: 'approved' },
      }),
      this.prisma.absenceRecord.count({
        where: { companyId, status: 'rejected' },
      }),
      this.prisma.absenceRecord.count({
        where: {
          companyId,
          startDate: { gte: startOfYear },
        },
      }),
      this.prisma.absenceRecord.count({
        where: {
          companyId,
          startDate: { gte: startOfMonth },
        },
      }),
      this.prisma.absenceRecord.aggregate({
        where: { companyId },
        _avg: { totalDays: true },
      }),
    ]);

    return {
      totalRecords,
      pendingRecords,
      approvedRecords,
      rejectedRecords,
      yearToDateRecords,
      monthToDateRecords,
      avgDaysPerRecord: avgDaysPerRecord._avg.totalDays || 0,
    };
  }

  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  async getUpcomingAbsences(
    companyId: string,
    limit: number = 10,
  ): Promise<AbsenceRecord[]> {
    const now = new Date();
    return this.prisma.absenceRecord.findMany({
      where: {
        companyId,
        status: 'approved',
        startDate: { gte: now },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
            department: true,
          },
        },
        absenceType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            isPaid: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: limit,
    });
  }

  async getCurrentAbsences(companyId: string): Promise<AbsenceRecord[]> {
    const now = new Date();
    return this.prisma.absenceRecord.findMany({
      where: {
        companyId,
        status: 'approved',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
            department: true,
          },
        },
        absenceType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            isPaid: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }
} 