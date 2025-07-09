import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbsenceType } from '@prisma/client';
import { CreateAbsenceTypeDto, UpdateAbsenceTypeDto } from '../types';

@Injectable()
export class AbsenceTypeService {
  constructor(private prisma: PrismaService) {}

  async createAbsenceType(
    companyId: string,
    createDto: CreateAbsenceTypeDto,
  ): Promise<AbsenceType> {
    // Check if code is unique within company
    const existingType = await this.prisma.absenceType.findFirst({
      where: {
        companyId,
        code: createDto.code,
      },
    });

    if (existingType) {
      throw new ConflictException('Absence type code already exists in this company');
    }

    return this.prisma.absenceType.create({
      data: {
        ...createDto,
        companyId,
      },
    });
  }

  async findAll(companyId: string, includeInactive = false): Promise<AbsenceType[]> {
    const where: any = { companyId };
    
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.absenceType.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string, companyId: string): Promise<AbsenceType | null> {
    return this.prisma.absenceType.findFirst({
      where: { id, companyId },
    });
  }

  async findByCode(code: string, companyId: string): Promise<AbsenceType | null> {
    return this.prisma.absenceType.findFirst({
      where: { code, companyId },
    });
  }

  async updateAbsenceType(
    id: string,
    companyId: string,
    updateDto: UpdateAbsenceTypeDto,
  ): Promise<AbsenceType> {
    const absenceType = await this.prisma.absenceType.findFirst({
      where: { id, companyId },
    });

    if (!absenceType) {
      throw new NotFoundException('Absence type not found');
    }

    // Check if code is unique within company (if being updated)
    if (updateDto.code && updateDto.code !== absenceType.code) {
      const existingType = await this.prisma.absenceType.findFirst({
        where: {
          companyId,
          code: updateDto.code,
          id: { not: id },
        },
      });

      if (existingType) {
        throw new ConflictException('Absence type code already exists in this company');
      }
    }

    return this.prisma.absenceType.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteAbsenceType(id: string, companyId: string): Promise<void> {
    const absenceType = await this.prisma.absenceType.findFirst({
      where: { id, companyId },
    });

    if (!absenceType) {
      throw new NotFoundException('Absence type not found');
    }

    // Check if absence type is being used
    const usageCount = await this.prisma.absenceRecord.count({
      where: { absenceTypeId: id },
    });

    if (usageCount > 0) {
      // Soft delete by marking as inactive
      await this.prisma.absenceType.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      // Hard delete if not used
      await this.prisma.absenceType.delete({
        where: { id },
      });
    }
  }

  async getAbsenceTypeStats(companyId: string): Promise<any> {
    const [totalTypes, activeTypes, inactiveTypes, usageStats] = await Promise.all([
      this.prisma.absenceType.count({
        where: { companyId },
      }),
      this.prisma.absenceType.count({
        where: { companyId, isActive: true },
      }),
      this.prisma.absenceType.count({
        where: { companyId, isActive: false },
      }),
      this.prisma.absenceRecord.groupBy({
        by: ['absenceTypeId'],
        where: { companyId },
        _count: { id: true },
        orderBy: {
          _count: { id: 'desc' },
        },
        take: 5,
      }),
    ]);

    // Get absence type names for usage stats
    const absenceTypeIds = usageStats.map((stat) => stat.absenceTypeId);
    const absenceTypes = await this.prisma.absenceType.findMany({
      where: { id: { in: absenceTypeIds } },
      select: { id: true, name: true, color: true },
    });

    const absenceTypeMap = new Map(
      absenceTypes.map((type) => [type.id, type]),
    );

    const topUsedTypes = usageStats.map((stat) => ({
      ...absenceTypeMap.get(stat.absenceTypeId),
      usageCount: stat._count.id,
    }));

    return {
      totalTypes,
      activeTypes,
      inactiveTypes,
      topUsedTypes,
    };
  }

  async createDefaultAbsenceTypes(companyId: string): Promise<AbsenceType[]> {
    const defaultTypes = [
      {
        name: 'Annual Leave',
        code: 'ANNUAL',
        description: 'Paid annual vacation leave',
        isPaid: true,
        requiresApproval: true,
        maxDaysPerYear: 25,
        advanceNoticeDays: 7,
        color: '#3b82f6',
      },
      {
        name: 'Sick Leave',
        code: 'SICK',
        description: 'Medical leave for illness',
        isPaid: true,
        requiresApproval: false,
        maxDaysPerYear: 10,
        advanceNoticeDays: 0,
        color: '#ef4444',
      },
      {
        name: 'Personal Leave',
        code: 'PERSONAL',
        description: 'Personal time off',
        isPaid: false,
        requiresApproval: true,
        maxDaysPerYear: 5,
        advanceNoticeDays: 3,
        color: '#f59e0b',
      },
      {
        name: 'Maternity Leave',
        code: 'MATERNITY',
        description: 'Maternity leave',
        isPaid: true,
        requiresApproval: true,
        maxDaysPerYear: 90,
        advanceNoticeDays: 30,
        color: '#ec4899',
      },
      {
        name: 'Paternity Leave',
        code: 'PATERNITY',
        description: 'Paternity leave',
        isPaid: true,
        requiresApproval: true,
        maxDaysPerYear: 14,
        advanceNoticeDays: 30,
        color: '#8b5cf6',
      },
      {
        name: 'Emergency Leave',
        code: 'EMERGENCY',
        description: 'Emergency leave',
        isPaid: false,
        requiresApproval: false,
        advanceNoticeDays: 0,
        color: '#dc2626',
      },
    ];

    const createdTypes: AbsenceType[] = [];

    for (const typeData of defaultTypes) {
      try {
        const createdType = await this.createAbsenceType(companyId, typeData);
        createdTypes.push(createdType);
      } catch (error) {
        // Skip if type already exists
        console.warn(`Skipping existing absence type: ${typeData.code}`);
      }
    }

    return createdTypes;
  }

  async toggleAbsenceTypeStatus(id: string, companyId: string): Promise<AbsenceType> {
    const absenceType = await this.prisma.absenceType.findFirst({
      where: { id, companyId },
    });

    if (!absenceType) {
      throw new NotFoundException('Absence type not found');
    }

    return this.prisma.absenceType.update({
      where: { id },
      data: { isActive: !absenceType.isActive },
    });
  }
} 