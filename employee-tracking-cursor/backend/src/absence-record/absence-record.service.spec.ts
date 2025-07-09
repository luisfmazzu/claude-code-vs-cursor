import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AbsenceRecordService } from './absence-record.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmployeeService } from '../employee/employee.service';

describe('AbsenceRecordService', () => {
  let service: AbsenceRecordService;
  let prismaService: PrismaService;
  let employeeService: EmployeeService;

  const mockPrismaService = {
    absenceRecord: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    absenceType: {
      findFirst: jest.fn(),
    },
    employee: {
      findFirst: jest.fn(),
    },
  };

  const mockEmployeeService = {
    findById: jest.fn(),
  };

  const mockEmployee = {
    id: 'employee-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    companyId: 'company-1',
    status: 'active',
  };

  const mockAbsenceType = {
    id: 'absence-type-1',
    name: 'Sick Leave',
    code: 'SICK',
    requiresApproval: false,
    companyId: 'company-1',
  };

  const mockAbsenceRecord = {
    id: 'absence-record-1',
    companyId: 'company-1',
    employeeId: 'employee-1',
    absenceTypeId: 'absence-type-1',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-17'),
    totalDays: 3,
    reason: 'Flu symptoms',
    status: 'approved',
    source: 'manual',
    createdBy: 'user-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbsenceRecordService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    service = module.get<AbsenceRecordService>(AbsenceRecordService);
    prismaService = module.get<PrismaService>(PrismaService);
    employeeService = module.get<EmployeeService>(EmployeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAbsenceRecord', () => {
    const createDto = {
      employeeId: 'employee-1',
      absenceTypeId: 'absence-type-1',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-17'),
      reason: 'Flu symptoms',
    };

    it('should create absence record successfully', async () => {
      mockEmployeeService.findById.mockResolvedValue(mockEmployee);
      mockPrismaService.absenceType.findFirst.mockResolvedValue(mockAbsenceType);
      mockPrismaService.absenceRecord.findMany.mockResolvedValue([]); // No overlapping records
      mockPrismaService.absenceRecord.create.mockResolvedValue(mockAbsenceRecord);

      const result = await service.createAbsenceRecord('company-1', createDto, 'user-1');

      expect(result).toEqual(mockAbsenceRecord);
      expect(mockPrismaService.absenceRecord.create).toHaveBeenCalledWith({
        data: {
          companyId: 'company-1',
          employeeId: 'employee-1',
          absenceTypeId: 'absence-type-1',
          startDate: createDto.startDate,
          endDate: createDto.endDate,
          totalDays: 3,
          reason: 'Flu symptoms',
          notes: undefined,
          status: 'approved', // Because requiresApproval is false
          source: 'manual',
          sourceReference: undefined,
          confidenceScore: undefined,
          createdBy: 'user-1',
          attachments: [],
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockEmployeeService.findById.mockResolvedValue(null);

      await expect(
        service.createAbsenceRecord('company-1', createDto, 'user-1')
      ).rejects.toThrow(NotFoundException);

      expect(mockEmployeeService.findById).toHaveBeenCalledWith('employee-1', 'company-1');
    });

    it('should throw NotFoundException when absence type not found', async () => {
      mockEmployeeService.findById.mockResolvedValue(mockEmployee);
      mockPrismaService.absenceType.findFirst.mockResolvedValue(null);

      await expect(
        service.createAbsenceRecord('company-1', createDto, 'user-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when start date is after end date', async () => {
      const invalidDto = {
        ...createDto,
        startDate: new Date('2024-01-17'),
        endDate: new Date('2024-01-15'),
      };

      mockEmployeeService.findById.mockResolvedValue(mockEmployee);
      mockPrismaService.absenceType.findFirst.mockResolvedValue(mockAbsenceType);

      await expect(
        service.createAbsenceRecord('company-1', invalidDto, 'user-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when there are overlapping absences', async () => {
      mockEmployeeService.findById.mockResolvedValue(mockEmployee);
      mockPrismaService.absenceType.findFirst.mockResolvedValue(mockAbsenceType);
      mockPrismaService.absenceRecord.findMany.mockResolvedValue([mockAbsenceRecord]);

      await expect(
        service.createAbsenceRecord('company-1', createDto, 'user-1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const query = {
      page: 1,
      limit: 10,
      status: 'approved',
    };

    it('should return paginated absence records', async () => {
      const records = [mockAbsenceRecord];
      const total = 1;

      mockPrismaService.absenceRecord.findMany.mockResolvedValue(records);
      mockPrismaService.absenceRecord.count.mockResolvedValue(total);

      const result = await service.findAll('company-1', query);

      expect(result).toEqual({ records, total });
      expect(mockPrismaService.absenceRecord.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'company-1',
          status: 'approved',
        },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should handle date range filtering', async () => {
      const queryWithDates = {
        ...query,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      mockPrismaService.absenceRecord.findMany.mockResolvedValue([]);
      mockPrismaService.absenceRecord.count.mockResolvedValue(0);

      await service.findAll('company-1', queryWithDates);

      expect(mockPrismaService.absenceRecord.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'company-1',
          status: 'approved',
          startDate: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          },
        },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('updateAbsenceRecord', () => {
    const updateDto = {
      reason: 'Updated reason',
      notes: 'Additional notes',
    };

    it('should update absence record successfully', async () => {
      const updatedRecord = { ...mockAbsenceRecord, ...updateDto };
      
      mockPrismaService.absenceRecord.findFirst.mockResolvedValue(mockAbsenceRecord);
      mockPrismaService.absenceRecord.update.mockResolvedValue(updatedRecord);

      const result = await service.updateAbsenceRecord(
        'absence-record-1',
        'company-1',
        updateDto,
        'user-1'
      );

      expect(result).toEqual(updatedRecord);
      expect(mockPrismaService.absenceRecord.update).toHaveBeenCalledWith({
        where: { id: 'absence-record-1' },
        data: {
          ...updateDto,
          totalDays: mockAbsenceRecord.totalDays,
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when record not found', async () => {
      mockPrismaService.absenceRecord.findFirst.mockResolvedValue(null);

      await expect(
        service.updateAbsenceRecord('non-existent', 'company-1', updateDto, 'user-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('approveAbsenceRecord', () => {
    const approvalDto = {
      status: 'approved' as const,
      notes: 'Approved by manager',
    };

    it('should approve absence record successfully', async () => {
      const pendingRecord = { ...mockAbsenceRecord, status: 'pending' };
      const approvedRecord = { ...pendingRecord, status: 'approved' };
      
      mockPrismaService.absenceRecord.findFirst.mockResolvedValue(pendingRecord);
      mockPrismaService.absenceRecord.update.mockResolvedValue(approvedRecord);

      const result = await service.approveAbsenceRecord(
        'absence-record-1',
        'company-1',
        approvalDto,
        'approver-1'
      );

      expect(result).toEqual(approvedRecord);
      expect(mockPrismaService.absenceRecord.update).toHaveBeenCalledWith({
        where: { id: 'absence-record-1' },
        data: {
          status: 'approved',
          approvedBy: 'approver-1',
          approvedAt: expect.any(Date),
          notes: 'Approved by manager',
        },
        include: expect.any(Object),
      });
    });

    it('should throw BadRequestException when record is not pending', async () => {
      const approvedRecord = { ...mockAbsenceRecord, status: 'approved' };
      
      mockPrismaService.absenceRecord.findFirst.mockResolvedValue(approvedRecord);

      await expect(
        service.approveAbsenceRecord('absence-record-1', 'company-1', approvalDto, 'approver-1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAbsenceRecordStats', () => {
    it('should return absence record statistics', async () => {
      const expectedStats = {
        totalRecords: 100,
        pendingRecords: 5,
        approvedRecords: 85,
        rejectedRecords: 10,
        yearToDateRecords: 75,
        monthToDateRecords: 8,
        avgDaysPerRecord: 2.5,
      };

      // Mock all the count and aggregate calls
      mockPrismaService.absenceRecord.count
        .mockResolvedValueOnce(100) // totalRecords
        .mockResolvedValueOnce(5)   // pendingRecords
        .mockResolvedValueOnce(85)  // approvedRecords
        .mockResolvedValueOnce(10)  // rejectedRecords
        .mockResolvedValueOnce(75)  // yearToDateRecords
        .mockResolvedValueOnce(8);  // monthToDateRecords

      mockPrismaService.absenceRecord.aggregate.mockResolvedValue({
        _avg: { totalDays: 2.5 },
      });

      const result = await service.getAbsenceRecordStats('company-1');

      expect(result).toEqual(expectedStats);
    });
  });

  describe('deleteAbsenceRecord', () => {
    it('should delete absence record successfully', async () => {
      mockPrismaService.absenceRecord.findFirst.mockResolvedValue(mockAbsenceRecord);
      mockPrismaService.absenceRecord.delete.mockResolvedValue(mockAbsenceRecord);

      await service.deleteAbsenceRecord('absence-record-1', 'company-1');

      expect(mockPrismaService.absenceRecord.delete).toHaveBeenCalledWith({
        where: { id: 'absence-record-1' },
      });
    });

    it('should throw NotFoundException when record not found', async () => {
      mockPrismaService.absenceRecord.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteAbsenceRecord('non-existent', 'company-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateWorkingDays', () => {
    it('should calculate working days correctly', async () => {
      // Test the private method indirectly through createAbsenceRecord
      const createDto = {
        employeeId: 'employee-1',
        absenceTypeId: 'absence-type-1',
        startDate: new Date('2024-01-15'), // Monday
        endDate: new Date('2024-01-17'),   // Wednesday
        reason: 'Test',
      };

      mockEmployeeService.findById.mockResolvedValue(mockEmployee);
      mockPrismaService.absenceType.findFirst.mockResolvedValue(mockAbsenceType);
      mockPrismaService.absenceRecord.findMany.mockResolvedValue([]);
      mockPrismaService.absenceRecord.create.mockResolvedValue(mockAbsenceRecord);

      await service.createAbsenceRecord('company-1', createDto, 'user-1');

      // Verify that totalDays was calculated correctly (3 working days)
      expect(mockPrismaService.absenceRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalDays: 3,
          }),
        })
      );
    });
  });
}); 