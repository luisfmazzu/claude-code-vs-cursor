import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Query,
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  EmployeesService, 
  CreateEmployeeDto, 
  UpdateEmployeeDto, 
  EmployeeFilters,
  BulkImportDto 
} from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('position') position?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters: EmployeeFilters = {
      status,
      department,
      position,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    return this.employeesService.findAll(req.user.companyId, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get employee statistics' })
  @ApiResponse({ status: 200, description: 'Employee statistics retrieved successfully' })
  async getStats(@Request() req) {
    return this.employeesService.getStats(req.user.companyId);
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  async getDepartments(@Request() req) {
    const departments = await this.employeesService.getDepartments(req.user.companyId);
    return { departments };
  }

  @Get('positions')
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({ status: 200, description: 'Positions retrieved successfully' })
  async getPositions(@Request() req) {
    const positions = await this.employeesService.getPositions(req.user.companyId);
    return { positions };
  }

  @Get('employee-id/:employeeId')
  @ApiOperation({ summary: 'Get employee by employee ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findByEmployeeId(@Param('employeeId') employeeId: string, @Request() req) {
    return this.employeesService.findByEmployeeId(employeeId, req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.employeesService.findOne(id, req.user.companyId);
  }

  @Post()
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Create new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Employee ID or email already exists' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto, @Request() req) {
    // Validate required fields
    if (!createEmployeeDto.employeeId || !createEmployeeDto.firstName || !createEmployeeDto.lastName) {
      throw new BadRequestException('Employee ID, first name, and last name are required');
    }

    return this.employeesService.create(createEmployeeDto, req.user.companyId);
  }

  @Post('bulk-import')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Bulk import employees' })
  @ApiResponse({ status: 200, description: 'Bulk import completed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkImport(@Body() bulkImportDto: BulkImportDto, @Request() req) {
    if (!bulkImportDto.employees || !Array.isArray(bulkImportDto.employees)) {
      throw new BadRequestException('Employees array is required');
    }

    if (bulkImportDto.employees.length === 0) {
      throw new BadRequestException('At least one employee is required');
    }

    if (bulkImportDto.employees.length > 1000) {
      throw new BadRequestException('Maximum 1000 employees can be imported at once');
    }

    return this.employeesService.bulkImport(bulkImportDto, req.user.companyId);
  }

  @Patch(':id')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'Employee ID or email already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Request() req,
  ) {
    return this.employeesService.update(id, updateEmployeeDto, req.user.companyId);
  }

  @Delete(':id')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.employeesService.remove(id, req.user.companyId);
    return { message: 'Employee deleted successfully' };
  }
}