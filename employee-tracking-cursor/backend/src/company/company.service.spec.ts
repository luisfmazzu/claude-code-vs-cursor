import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CompanyService', () => {
  let service: CompanyService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    company: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    employee: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    absenceRecord: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    absenceType: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockCompany = {
    id: 'company-1',
    name: 'Test Company',
    slug: 'test-company',
    industry: 'Technology',
    sizeRange: '50-100',
    timezone: 'UTC',
    emailDomain: 'test.com',
    logoUrl: null,
    settings: {},
    subscriptionStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'user@test.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'owner',
    isActive: true,
    companyId: 'company-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a company when found', async () => {
      mockPrismaService.company.findUnique.mockResolvedValue(mockCompany);

      const result = await service.findById('company-1');

      expect(result).toEqual(mockCompany);
      expect(mockPrismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'company-1' },
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
              email: true,
              department: true,
              status: true,
            },
            where: { status: 'active' },
            take: 10,
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
    });

    it('should return null when company not found', async () => {
      mockPrismaService.company.findUnique.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateCompany', () => {
    const updateDto = {
      name: 'Updated Company',
      industry: 'Healthcare',
    };

    it('should update company successfully when user is owner', async () => {
      const updatedCompany = { ...mockCompany, ...updateDto };
      
      mockPrismaService.company.findUnique.mockResolvedValue(mockCompany);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.company.update.mockResolvedValue(updatedCompany);

      const result = await service.updateCompany('company-1', updateDto, 'user-1');

      expect(result).toEqual(updatedCompany);
      expect(mockPrismaService.company.update).toHaveBeenCalledWith({
        where: { id: 'company-1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when company not found', async () => {
      mockPrismaService.company.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCompany('non-existent', updateDto, 'user-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner or administrator', async () => {
      const nonOwnerUser = { ...mockUser, role: 'user' };
      
      mockPrismaService.company.findUnique.mockResolvedValue(mockCompany);
      mockPrismaService.user.findUnique.mockResolvedValue(nonOwnerUser);

      await expect(
        service.updateCompany('company-1', updateDto, 'user-1')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteCompany', () => {
    it('should delete company successfully when user is owner', async () => {
      mockPrismaService.company.findUnique.mockResolvedValue(mockCompany);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.company.delete.mockResolvedValue(mockCompany);

      await service.deleteCompany('company-1', 'user-1');

      expect(mockPrismaService.company.delete).toHaveBeenCalledWith({
        where: { id: 'company-1' },
      });
    });

    it('should throw NotFoundException when company not found', async () => {
      mockPrismaService.company.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteCompany('non-existent', 'user-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      const nonOwnerUser = { ...mockUser, role: 'administrator' };
      
      mockPrismaService.company.findUnique.mockResolvedValue(mockCompany);
      mockPrismaService.user.findUnique.mockResolvedValue(nonOwnerUser);

      await expect(
        service.deleteCompany('company-1', 'user-1')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getCompanyStats', () => {
    it('should return company statistics', async () => {
      const expectedStats = {
        totalUsers: 5,
        activeUsers: 4,
        totalEmployees: 20,
        activeEmployees: 18,
        totalAbsenceRecords: 50,
        pendingAbsences: 3,
        recentAbsences: 8,
        yearToDateAbsences: 45,
        monthlyTrends: [
          { month: '2024-01', count: 5 },
          { month: '2024-02', count: 8 },
        ],
        topAbsenceTypes: [
          { id: 'type-1', name: 'Sick Leave', color: '#ef4444', count: 15 },
          { id: 'type-2', name: 'Vacation', color: '#22c55e', count: 12 },
        ],
      };

      // Mock all the database calls
      mockPrismaService.user.count
        .mockResolvedValueOnce(5) // totalUsers
        .mockResolvedValueOnce(4); // activeUsers

      mockPrismaService.employee.count
        .mockResolvedValueOnce(20) // totalEmployees
        .mockResolvedValueOnce(18); // activeEmployees

      mockPrismaService.absenceRecord.count
        .mockResolvedValueOnce(50) // totalAbsenceRecords
        .mockResolvedValueOnce(3) // pendingAbsences
        .mockResolvedValueOnce(8) // recentAbsences
        .mockResolvedValueOnce(45); // yearToDateAbsences

      mockPrismaService.absenceRecord.groupBy
        .mockResolvedValueOnce([
          { _count: { id: 5 }, startDate: new Date('2024-01-15') },
          { _count: { id: 8 }, startDate: new Date('2024-02-10') },
        ]) // monthly trends
        .mockResolvedValueOnce([
          { _count: { id: 15 }, absenceTypeId: 'type-1' },
          { _count: { id: 12 }, absenceTypeId: 'type-2' },
        ]); // top absence types

      mockPrismaService.absenceType.findMany.mockResolvedValue([
        { id: 'type-1', name: 'Sick Leave', color: '#ef4444' },
        { id: 'type-2', name: 'Vacation', color: '#22c55e' },
      ]);

      const result = await service.getCompanyStats('company-1', 'user-1');

      expect(result).toMatchObject({
        totalUsers: 5,
        activeUsers: 4,
        totalEmployees: 20,
        activeEmployees: 18,
        totalAbsenceRecords: 50,
        pendingAbsences: 3,
        recentAbsences: 8,
        yearToDateAbsences: 45,
      });

      expect(result.monthlyTrends).toHaveLength(2);
      expect(result.topAbsenceTypes).toHaveLength(2);
    });
  });

  describe('updateSettings', () => {
    const settingsDto = {
      notifications: {
        emailEnabled: true,
        slackEnabled: false,
      },
      absencePolicy: {
        requireApproval: true,
        advanceNoticeDays: 7,
      },
    };

    it('should update company settings successfully', async () => {
      const updatedCompany = { ...mockCompany, settings: settingsDto };
      
      mockPrismaService.company.findUnique.mockResolvedValue(mockCompany);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.company.update.mockResolvedValue(updatedCompany);

      const result = await service.updateSettings('company-1', settingsDto, 'user-1');

      expect(result).toEqual(updatedCompany);
      expect(mockPrismaService.company.update).toHaveBeenCalledWith({
        where: { id: 'company-1' },
        data: { settings: settingsDto },
      });
    });
  });

  describe('getUserCompanies', () => {
    it('should return companies associated with user', async () => {
      const mockCompanies = [mockCompany];
      
      mockPrismaService.user.findMany.mockResolvedValue([
        { company: mockCompany }
      ]);

      const result = await service.getUserCompanies('user-1');

      expect(result).toEqual(mockCompanies);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: { company: true },
      });
    });
  });
}); 