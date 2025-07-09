import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Company, User } from '@prisma/client';
import { UpdateCompanyDto, CompanySettingsDto, CompanyStatsDto } from '../types';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
          },
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            status: true,
          },
        },
        absenceTypes: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            code: true,
            isPaid: true,
            requiresApproval: true,
            color: true,
          },
        },
        _count: {
          select: {
            users: true,
            employees: true,
            absenceRecords: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { slug },
    });
  }

  async updateCompany(
    id: string,
    updateDto: UpdateCompanyDto,
    userId: string,
  ): Promise<Company> {
    // Verify user has permission to update company
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.companyId !== id) {
      throw new ForbiddenException('You do not have permission to update this company');
    }

    if (user.role !== 'owner' && user.role !== 'administrator') {
      throw new ForbiddenException('Only owners and administrators can update company settings');
    }

    // Update slug if name is changing
    let slug = undefined;
    if (updateDto.name) {
      const baseSlug = updateDto.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').trim('-');
      slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (await this.prisma.company.findFirst({
        where: { slug, id: { not: id } },
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        ...updateDto,
        slug,
      },
    });
  }

  async updateSettings(
    id: string,
    settingsDto: CompanySettingsDto,
    userId: string,
  ): Promise<Company> {
    // Verify user has permission
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.companyId !== id) {
      throw new ForbiddenException('You do not have permission to update company settings');
    }

    if (user.role !== 'owner' && user.role !== 'administrator') {
      throw new ForbiddenException('Only owners and administrators can update company settings');
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        settings: settingsDto,
      },
    });
  }

  async getCompanyStats(id: string, userId: string): Promise<CompanyStatsDto> {
    // Verify user has access to company
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.companyId !== id) {
      throw new ForbiddenException('You do not have access to this company');
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get basic counts
    const [
      totalUsers,
      activeUsers,
      totalEmployees,
      activeEmployees,
      totalAbsenceRecords,
      pendingAbsences,
      recentAbsences,
      yearToDateAbsences,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { companyId: id },
      }),
      this.prisma.user.count({
        where: { companyId: id, isActive: true },
      }),
      this.prisma.employee.count({
        where: { companyId: id },
      }),
      this.prisma.employee.count({
        where: { companyId: id, status: 'active' },
      }),
      this.prisma.absenceRecord.count({
        where: { companyId: id },
      }),
      this.prisma.absenceRecord.count({
        where: { companyId: id, status: 'pending' },
      }),
      this.prisma.absenceRecord.count({
        where: {
          companyId: id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.absenceRecord.count({
        where: {
          companyId: id,
          startDate: { gte: startOfYear },
        },
      }),
    ]);

    // Get absence trends by month
    const absencesByMonth = await this.prisma.absenceRecord.groupBy({
      by: ['startDate'],
      where: {
        companyId: id,
        startDate: { gte: startOfYear },
      },
      _count: {
        id: true,
      },
    });

    // Process monthly trends
    const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(now.getFullYear(), i, 1);
      const monthData = absencesByMonth.filter(
        (record) => record.startDate.getMonth() === i,
      );
      return {
        month: month.toISOString().substring(0, 7),
        count: monthData.reduce((sum, record) => sum + record._count.id, 0),
      };
    });

    // Get top absence types
    const topAbsenceTypes = await this.prisma.absenceRecord.groupBy({
      by: ['absenceTypeId'],
      where: {
        companyId: id,
        startDate: { gte: startOfYear },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Get absence type names
    const absenceTypeIds = topAbsenceTypes.map((type) => type.absenceTypeId);
    const absenceTypes = await this.prisma.absenceType.findMany({
      where: { id: { in: absenceTypeIds } },
      select: { id: true, name: true, color: true },
    });

    const absenceTypeMap = new Map(
      absenceTypes.map((type) => [type.id, type]),
    );

    const topAbsenceTypesWithNames = topAbsenceTypes.map((type) => ({
      ...absenceTypeMap.get(type.absenceTypeId),
      count: type._count.id,
    }));

    return {
      totalUsers,
      activeUsers,
      totalEmployees,
      activeEmployees,
      totalAbsenceRecords,
      pendingAbsences,
      recentAbsences,
      yearToDateAbsences,
      monthlyTrends,
      topAbsenceTypes: topAbsenceTypesWithNames,
    };
  }

  async deleteCompany(id: string, userId: string): Promise<void> {
    // Verify user is company owner
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.companyId !== id || user.role !== 'owner') {
      throw new ForbiddenException('Only company owners can delete companies');
    }

    // Delete company (cascade will handle related records)
    await this.prisma.company.delete({
      where: { id },
    });
  }

  async getUserCompanies(userId: string): Promise<Company[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.company ? [user.company] : [];
  }
} 