import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmployeesService, CreateEmployeeDto, UpdateEmployeeDto } from './employees.service';
import { DatabaseConfig } from '../config/database.config';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
};

const mockDatabaseConfig = {
  getClient: jest.fn().mockReturnValue(mockSupabaseClient),
  setCompanyContext: jest.fn(),
};

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: DatabaseConfig,
          useValue: mockDatabaseConfig,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmployee', () => {
    const createDto: CreateEmployeeDto = {
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '555-0123',
      department: 'Engineering',
      position: 'Software Developer',
      startDate: '2023-01-15',
      status: 'active',
    };

    const companyId = 'company-id';

    it('should successfully create an employee', async () => {
      const mockEmployee = {
        id: 'employee-id',
        company_id: companyId,
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        phone: '555-0123',
        department: 'Engineering',
        position: 'Software Developer',
        start_date: '2023-01-15',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock checking for existing employee (not found)
      mockSupabaseClient.single
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })
        .mockResolvedValueOnce({ data: mockEmployee, error: null });

      const result = await service.createEmployee(createDto, companyId);

      expect(result).toEqual(mockEmployee);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('employees');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        company_id: companyId,
        employee_id: createDto.employeeId,
        first_name: createDto.firstName,
        last_name: createDto.lastName,
        email: createDto.email,
        phone: createDto.phone,
        department: createDto.department,
        position: createDto.position,
        start_date: createDto.startDate,
        status: createDto.status,
      });
    });

    it('should throw BadRequestException when employee ID already exists', async () => {
      const existingEmployee = {
        id: 'existing-employee-id',
        employee_id: 'EMP001',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: existingEmployee,
        error: null,
      });

      await expect(service.createEmployee(createDto, companyId)).rejects.toThrow(BadRequestException);
      await expect(service.createEmployee(createDto, companyId)).rejects.toThrow('Employee with this ID already exists');
    });

    it('should throw BadRequestException when database insert fails', async () => {
      mockSupabaseClient.single
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })
        .mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      await expect(service.createEmployee(createDto, companyId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getEmployees', () => {
    const companyId = 'company-id';

    it('should return paginated employees with default parameters', async () => {
      const mockEmployees = [
        {
          id: 'employee-1',
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@company.com',
          department: 'Engineering',
          position: 'Software Developer',
          status: 'active',
        },
        {
          id: 'employee-2',
          employee_id: 'EMP002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@company.com',
          department: 'Marketing',
          position: 'Marketing Manager',
          status: 'active',
        },
      ];

      mockSupabaseClient.single.mockResolvedValue({
        data: mockEmployees,
        error: null,
      });

      const result = await service.getEmployees(companyId);

      expect(result).toEqual(mockEmployees);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('employees');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('company_id', companyId);
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should apply search filter when provided', async () => {
      const searchTerm = 'john';
      mockSupabaseClient.single.mockResolvedValue({
        data: [],
        error: null,
      });

      await service.getEmployees(companyId, 1, 10, searchTerm);

      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`
      );
    });

    it('should apply department filter when provided', async () => {
      const department = 'Engineering';
      mockSupabaseClient.single.mockResolvedValue({
        data: [],
        error: null,
      });

      await service.getEmployees(companyId, 1, 10, undefined, department);

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('department', department);
    });

    it('should apply status filter when provided', async () => {
      const status = 'active';
      mockSupabaseClient.single.mockResolvedValue({
        data: [],
        error: null,
      });

      await service.getEmployees(companyId, 1, 10, undefined, undefined, status);

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', status);
    });
  });

  describe('getEmployeeById', () => {
    const employeeId = 'employee-id';
    const companyId = 'company-id';

    it('should return employee when found', async () => {
      const mockEmployee = {
        id: employeeId,
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        position: 'Software Developer',
        status: 'active',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockEmployee,
        error: null,
      });

      const result = await service.getEmployeeById(employeeId, companyId);

      expect(result).toEqual(mockEmployee);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('employees');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', employeeId);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('company_id', companyId);
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(service.getEmployeeById(employeeId, companyId)).rejects.toThrow(NotFoundException);
      await expect(service.getEmployeeById(employeeId, companyId)).rejects.toThrow('Employee not found');
    });
  });

  describe('updateEmployee', () => {
    const employeeId = 'employee-id';
    const companyId = 'company-id';
    const updateDto: UpdateEmployeeDto = {
      firstName: 'Jane',
      lastName: 'Doe',
      department: 'Marketing',
    };

    it('should successfully update an employee', async () => {
      const mockExistingEmployee = {
        id: employeeId,
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockUpdatedEmployee = {
        ...mockExistingEmployee,
        first_name: 'Jane',
        department: 'Marketing',
      };

      mockSupabaseClient.single
        .mockResolvedValueOnce({ data: mockExistingEmployee, error: null })
        .mockResolvedValueOnce({ data: mockUpdatedEmployee, error: null });

      const result = await service.updateEmployee(employeeId, updateDto, companyId);

      expect(result).toEqual(mockUpdatedEmployee);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        first_name: updateDto.firstName,
        last_name: updateDto.lastName,
        department: updateDto.department,
      });
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(service.updateEmployee(employeeId, updateDto, companyId)).rejects.toThrow(NotFoundException);
      await expect(service.updateEmployee(employeeId, updateDto, companyId)).rejects.toThrow('Employee not found');
    });
  });

  describe('deleteEmployee', () => {
    const employeeId = 'employee-id';
    const companyId = 'company-id';

    it('should successfully delete an employee', async () => {
      const mockEmployee = {
        id: employeeId,
        employee_id: 'EMP001',
      };

      mockSupabaseClient.single
        .mockResolvedValueOnce({ data: mockEmployee, error: null });

      mockSupabaseClient.delete = jest.fn().mockReturnThis();
      mockSupabaseClient.eq = jest.fn().mockResolvedValue({ error: null });

      await service.deleteEmployee(employeeId, companyId);

      expect(mockSupabaseClient.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(service.deleteEmployee(employeeId, companyId)).rejects.toThrow(NotFoundException);
      await expect(service.deleteEmployee(employeeId, companyId)).rejects.toThrow('Employee not found');
    });
  });

  describe('getEmployeeStats', () => {
    const companyId = 'company-id';

    it('should return employee statistics', async () => {
      // Mock count queries
      mockSupabaseClient.single
        .mockResolvedValueOnce({ count: 150, error: null }) // total
        .mockResolvedValueOnce({ count: 130, error: null }) // active
        .mockResolvedValueOnce({ count: 15, error: null })  // inactive
        .mockResolvedValueOnce({ count: 5, error: null });  // on_leave

      const result = await service.getEmployeeStats(companyId);

      expect(result).toEqual({
        total: 150,
        active: 130,
        inactive: 15,
        on_leave: 5,
        terminated: 0, // total - active - inactive - on_leave
      });
    });

    it('should handle database errors gracefully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        count: null,
        error: { message: 'Database error' },
      });

      await expect(service.getEmployeeStats(companyId)).rejects.toThrow(BadRequestException);
    });
  });
});