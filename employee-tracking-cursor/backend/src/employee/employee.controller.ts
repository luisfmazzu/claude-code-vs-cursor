import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmployeeService } from './employee.service';
import { 
  CreateEmployeeDto, 
  UpdateEmployeeDto, 
  EmployeeQueryDto, 
  BulkEmployeeDto, 
  ApiResponse as ApiResponseType 
} from '../types';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async createEmployee(
    @Request() req,
    @Body(ValidationPipe) createDto: CreateEmployeeDto,
  ): Promise<ApiResponseType> {
    const employee = await this.employeeService.createEmployee(req.user.companyId, createDto);
    return {
      success: true,
      data: employee,
      timestamp: new Date(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getEmployees(
    @Request() req,
    @Query() query: EmployeeQueryDto,
  ): Promise<ApiResponseType> {
    const result = await this.employeeService.findAll(req.user.companyId, query);
    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search employees' })
  @ApiResponse({ status: 200, description: 'Employee search results' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchEmployees(
    @Request() req,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ): Promise<ApiResponseType> {
    const employees = await this.employeeService.searchEmployees(
      req.user.companyId,
      searchTerm,
      limit,
    );
    return {
      success: true,
      data: employees,
      timestamp: new Date(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get employee statistics' })
  @ApiResponse({ status: 200, description: 'Employee statistics retrieved successfully' })
  async getEmployeeStats(@Request() req): Promise<ApiResponseType> {
    const stats = await this.employeeService.getEmployeeStats(req.user.companyId);
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getEmployeeById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseType> {
    const employee = await this.employeeService.findById(id, req.user.companyId);
    
    if (!employee) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Employee not found',
        },
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: employee,
      timestamp: new Date(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async updateEmployee(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateEmployeeDto,
  ): Promise<ApiResponseType> {
    const employee = await this.employeeService.updateEmployee(
      id,
      req.user.companyId,
      updateDto,
    );
    return {
      success: true,
      data: employee,
      timestamp: new Date(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async deleteEmployee(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.employeeService.deleteEmployee(id, req.user.companyId);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create employees' })
  @ApiResponse({ status: 201, description: 'Bulk employee creation completed' })
  async bulkCreateEmployees(
    @Request() req,
    @Body(ValidationPipe) bulkDto: BulkEmployeeDto,
  ): Promise<ApiResponseType> {
    const result = await this.employeeService.bulkCreateEmployees(
      req.user.companyId,
      bulkDto,
    );
    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }

  @Get('by-email/:email')
  @ApiOperation({ summary: 'Get employee by email' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getEmployeeByEmail(
    @Request() req,
    @Param('email') email: string,
  ): Promise<ApiResponseType> {
    const employee = await this.employeeService.findByEmail(email, req.user.companyId);
    
    if (!employee) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Employee not found',
        },
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: employee,
      timestamp: new Date(),
    };
  }

  @Get('by-employee-id/:employeeId')
  @ApiOperation({ summary: 'Get employee by employee ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getEmployeeByEmployeeId(
    @Request() req,
    @Param('employeeId') employeeId: string,
  ): Promise<ApiResponseType> {
    const employee = await this.employeeService.findByEmployeeId(employeeId, req.user.companyId);
    
    if (!employee) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Employee not found',
        },
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: employee,
      timestamp: new Date(),
    };
  }
} 