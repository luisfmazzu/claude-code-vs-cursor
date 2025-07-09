import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseConfig, Employee } from '../config/database.config';

export interface CreateEmployeeDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  metadata?: Record<string, any>;
}

export interface UpdateEmployeeDto {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  metadata?: Record<string, any>;
}

export interface EmployeeFilters {
  status?: string;
  department?: string;
  position?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface BulkImportDto {
  employees: CreateEmployeeDto[];
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseConfig: DatabaseConfig) {}

  async findAll(companyId: string, filters: EmployeeFilters = {}): Promise<{ employees: Employee[]; total: number }> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      let query = supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.department) {
        query = query.eq('department', filters.department);
      }

      if (filters.position) {
        query = query.eq('position', filters.position);
      }

      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_id.ilike.%${filters.search}%`);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 25) - 1);
      }

      const { data: employees, error, count } = await query;

      if (error) {
        throw new BadRequestException(`Failed to fetch employees: ${error.message}`);
      }

      return {
        employees: employees || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string): Promise<Employee> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .single();

      if (error || !employee) {
        throw new NotFoundException('Employee not found');
      }

      return employee;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching employee:', error);
      throw new BadRequestException('Failed to fetch employee');
    }
  }

  async findByEmployeeId(employeeId: string, companyId: string): Promise<Employee> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('company_id', companyId)
        .single();

      if (error || !employee) {
        throw new NotFoundException('Employee not found');
      }

      return employee;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching employee by employee ID:', error);
      throw new BadRequestException('Failed to fetch employee');
    }
  }

  async create(createEmployeeDto: CreateEmployeeDto, companyId: string): Promise<Employee> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Check if employee ID already exists in company
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', createEmployeeDto.employeeId)
        .eq('company_id', companyId)
        .single();

      if (existingEmployee) {
        throw new ConflictException('Employee ID already exists in this company');
      }

      // Check if email already exists (if provided)
      if (createEmployeeDto.email) {
        const { data: existingEmailEmployee } = await supabase
          .from('employees')
          .select('id')
          .eq('email', createEmployeeDto.email)
          .eq('company_id', companyId)
          .single();

        if (existingEmailEmployee) {
          throw new ConflictException('Employee with this email already exists');
        }
      }

      // Create employee
      const { data: newEmployee, error } = await supabase
        .from('employees')
        .insert({
          company_id: companyId,
          employee_id: createEmployeeDto.employeeId,
          first_name: createEmployeeDto.firstName,
          last_name: createEmployeeDto.lastName,
          email: createEmployeeDto.email,
          phone: createEmployeeDto.phone,
          department: createEmployeeDto.department,
          position: createEmployeeDto.position,
          hire_date: createEmployeeDto.hireDate,
          status: createEmployeeDto.status || 'active',
          metadata: createEmployeeDto.metadata || {},
        })
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Failed to create employee: ${error.message}`);
      }

      return newEmployee;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating employee:', error);
      throw new BadRequestException('Failed to create employee');
    }
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, companyId: string): Promise<Employee> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Check if employee exists
      await this.findOne(id, companyId);

      // Check if employee ID is being updated and if it conflicts
      if (updateEmployeeDto.employeeId) {
        const { data: existingEmployee } = await supabase
          .from('employees')
          .select('id')
          .eq('employee_id', updateEmployeeDto.employeeId)
          .eq('company_id', companyId)
          .neq('id', id)
          .single();

        if (existingEmployee) {
          throw new ConflictException('Employee ID already exists in this company');
        }
      }

      // Check if email is being updated and if it conflicts
      if (updateEmployeeDto.email) {
        const { data: existingEmailEmployee } = await supabase
          .from('employees')
          .select('id')
          .eq('email', updateEmployeeDto.email)
          .eq('company_id', companyId)
          .neq('id', id)
          .single();

        if (existingEmailEmployee) {
          throw new ConflictException('Employee with this email already exists');
        }
      }

      // Update employee
      const { data: updatedEmployee, error } = await supabase
        .from('employees')
        .update(updateEmployeeDto)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Failed to update employee: ${error.message}`);
      }

      return updatedEmployee;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error updating employee:', error);
      throw new BadRequestException('Failed to update employee');
    }
  }

  async remove(id: string, companyId: string): Promise<void> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Check if employee exists
      await this.findOne(id, companyId);

      // Delete employee (this will cascade delete absences due to FK constraint)
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) {
        throw new BadRequestException(`Failed to delete employee: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting employee:', error);
      throw new BadRequestException('Failed to delete employee');
    }
  }

  async bulkImport(bulkImportDto: BulkImportDto, companyId: string): Promise<{ 
    success: number; 
    failed: number; 
    updated: number; 
    errors: string[] 
  }> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      let success = 0;
      let failed = 0;
      let updated = 0;
      const errors: string[] = [];

      for (const employeeData of bulkImportDto.employees) {
        try {
          // Check if employee already exists
          const { data: existingEmployee } = await supabase
            .from('employees')
            .select('id')
            .eq('employee_id', employeeData.employeeId)
            .eq('company_id', companyId)
            .single();

          if (existingEmployee) {
            if (bulkImportDto.updateExisting) {
              // Update existing employee
              await this.update(existingEmployee.id, employeeData, companyId);
              updated++;
            } else if (bulkImportDto.skipDuplicates) {
              // Skip duplicate
              continue;
            } else {
              // Report as error
              errors.push(`Employee ID ${employeeData.employeeId} already exists`);
              failed++;
            }
          } else {
            // Create new employee
            await this.create(employeeData, companyId);
            success++;
          }
        } catch (error) {
          errors.push(`Employee ID ${employeeData.employeeId}: ${error.message}`);
          failed++;
        }
      }

      return { success, failed, updated, errors };
    } catch (error) {
      console.error('Error in bulk import:', error);
      throw new BadRequestException('Failed to process bulk import');
    }
  }

  async getDepartments(companyId: string): Promise<string[]> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      const { data, error } = await supabase
        .from('employees')
        .select('department')
        .eq('company_id', companyId)
        .not('department', 'is', null)
        .order('department');

      if (error) {
        throw new BadRequestException(`Failed to fetch departments: ${error.message}`);
      }

      // Extract unique departments
      const departments = [...new Set(data?.map(item => item.department).filter(Boolean))];
      return departments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  async getPositions(companyId: string): Promise<string[]> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      const { data, error } = await supabase
        .from('employees')
        .select('position')
        .eq('company_id', companyId)
        .not('position', 'is', null)
        .order('position');

      if (error) {
        throw new BadRequestException(`Failed to fetch positions: ${error.message}`);
      }

      // Extract unique positions
      const positions = [...new Set(data?.map(item => item.position).filter(Boolean))];
      return positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  async getStats(companyId: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    onLeaveEmployees: number;
    terminatedEmployees: number;
    departmentBreakdown: { department: string; count: number }[];
  }> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Get total counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('employees')
        .select('status')
        .eq('company_id', companyId);

      if (statusError) {
        throw new BadRequestException(`Failed to fetch employee stats: ${statusError.message}`);
      }

      const statusBreakdown = statusCounts?.reduce((acc, { status }) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get department breakdown
      const { data: departmentCounts, error: deptError } = await supabase
        .from('employees')
        .select('department')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .not('department', 'is', null);

      if (deptError) {
        throw new BadRequestException(`Failed to fetch department stats: ${deptError.message}`);
      }

      const departmentBreakdown = Object.entries(
        departmentCounts?.reduce((acc, { department }) => {
          if (department) {
            acc[department] = (acc[department] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>) || {}
      ).map(([department, count]) => ({ department, count }));

      return {
        totalEmployees: statusCounts?.length || 0,
        activeEmployees: statusBreakdown.active || 0,
        inactiveEmployees: statusBreakdown.inactive || 0,
        onLeaveEmployees: statusBreakdown.on_leave || 0,
        terminatedEmployees: statusBreakdown.terminated || 0,
        departmentBreakdown,
      };
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      throw error;
    }
  }
}