import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee } from '@prisma/client';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto, BulkEmployeeDto, EmployeeSearchResult } from '../types';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async createEmployee(
    companyId: string,
    createDto: CreateEmployeeDto,
  ): Promise<Employee> {
    // Check if employee ID is unique within company
    if (createDto.employeeId) {
      const existingEmployee = await this.prisma.employee.findFirst({
        where: {
          companyId,
          employeeId: createDto.employeeId,
        },
      });

      if (existingEmployee) {
        throw new ConflictException('Employee ID already exists in this company');
      }
    }

    // Check if email is unique within company
    if (createDto.email) {
      const existingEmployee = await this.prisma.employee.findFirst({
        where: {
          companyId,
          email: createDto.email,
        },
      });

      if (existingEmployee) {
        throw new ConflictException('Employee email already exists in this company');
      }
    }

    return this.prisma.employee.create({
      data: {
        ...createDto,
        companyId,
      },
    });
  }

  async findAll(
    companyId: string,
    query: EmployeeQueryDto,
  ): Promise<{ employees: Employee[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          subordinates: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          absenceRecords: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              totalDays: true,
              status: true,
              absenceType: {
                select: {
                  name: true,
                  color: true,
                },
              },
            },
            orderBy: {
              startDate: 'desc',
            },
            take: 5,
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { employees, total };
  }

  async findById(id: string, companyId: string): Promise<Employee | null> {
    return this.prisma.employee.findFirst({
      where: { id, companyId },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        absenceRecords: {
          include: {
            absenceType: {
              select: {
                name: true,
                color: true,
                isPaid: true,
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        },
      },
    });
  }

  async updateEmployee(
    id: string,
    companyId: string,
    updateDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if employee ID is unique within company (if being updated)
    if (updateDto.employeeId && updateDto.employeeId !== employee.employeeId) {
      const existingEmployee = await this.prisma.employee.findFirst({
        where: {
          companyId,
          employeeId: updateDto.employeeId,
          id: { not: id },
        },
      });

      if (existingEmployee) {
        throw new ConflictException('Employee ID already exists in this company');
      }
    }

    // Check if email is unique within company (if being updated)
    if (updateDto.email && updateDto.email !== employee.email) {
      const existingEmployee = await this.prisma.employee.findFirst({
        where: {
          companyId,
          email: updateDto.email,
          id: { not: id },
        },
      });

      if (existingEmployee) {
        throw new ConflictException('Employee email already exists in this company');
      }
    }

    return this.prisma.employee.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteEmployee(id: string, companyId: string): Promise<void> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if employee has any absence records
    const absenceRecords = await this.prisma.absenceRecord.count({
      where: { employeeId: id },
    });

    if (absenceRecords > 0) {
      // Soft delete by updating status to 'terminated'
      await this.prisma.employee.update({
        where: { id },
        data: {
          status: 'terminated',
          terminationDate: new Date(),
        },
      });
    } else {
      // Hard delete if no absence records
      await this.prisma.employee.delete({
        where: { id },
      });
    }
  }

  async bulkCreateEmployees(
    companyId: string,
    bulkDto: BulkEmployeeDto,
  ): Promise<{ created: number; errors: string[] }> {
    const { employees } = bulkDto;
    const errors: string[] = [];
    let created = 0;

    for (const [index, employeeData] of employees.entries()) {
      try {
        await this.createEmployee(companyId, employeeData);
        created++;
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    return { created, errors };
  }

  async getEmployeeStats(companyId: string): Promise<any> {
    const [
      totalEmployees,
      activeEmployees,
      terminatedEmployees,
      departmentCounts,
      newHiresThisMonth,
    ] = await Promise.all([
      this.prisma.employee.count({
        where: { companyId },
      }),
      this.prisma.employee.count({
        where: { companyId, status: 'active' },
      }),
      this.prisma.employee.count({
        where: { companyId, status: 'terminated' },
      }),
      this.prisma.employee.groupBy({
        by: ['department'],
        where: { companyId, status: 'active' },
        _count: { id: true },
      }),
      this.prisma.employee.count({
        where: {
          companyId,
          status: 'active',
          hireDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      terminatedEmployees,
      departmentCounts: departmentCounts.map((dept) => ({
        department: dept.department || 'Unassigned',
        count: dept._count.id,
      })),
      newHiresThisMonth,
    };
  }

  async findByEmail(email: string, companyId: string): Promise<Employee | null> {
    return this.prisma.employee.findFirst({
      where: {
        email,
        companyId,
      },
    });
  }

  async findByEmployeeId(employeeId: string, companyId: string): Promise<Employee | null> {
    return this.prisma.employee.findFirst({
      where: {
        employeeId,
        companyId,
      },
    });
  }

  async searchEmployees(
    companyId: string,
    searchTerm: string,
    limit: number = 10,
  ): Promise<EmployeeSearchResult[]> {
    return this.prisma.employee.findMany({
      where: {
        companyId,
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { employeeId: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeId: true,
        department: true,
        position: true,
      },
      take: limit,
    });
  }
} 