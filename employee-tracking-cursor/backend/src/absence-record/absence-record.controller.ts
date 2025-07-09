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
import { AbsenceRecordService } from './absence-record.service';
import { 
  CreateAbsenceRecordDto, 
  UpdateAbsenceRecordDto, 
  AbsenceRecordQueryDto,
  ApprovalDto,
  ApiResponse as ApiResponseType 
} from '../types';

@ApiTags('absence-records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('absence-records')
export class AbsenceRecordController {
  constructor(private readonly absenceRecordService: AbsenceRecordService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new absence record' })
  @ApiResponse({ status: 201, description: 'Absence record created successfully' })
  async createAbsenceRecord(
    @Request() req,
    @Body(ValidationPipe) createDto: CreateAbsenceRecordDto,
  ): Promise<ApiResponseType> {
    const record = await this.absenceRecordService.createAbsenceRecord(
      req.user.companyId, 
      createDto, 
      req.user.id
    );
    return {
      success: true,
      data: record,
      timestamp: new Date(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all absence records' })
  @ApiResponse({ status: 200, description: 'Absence records retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiQuery({ name: 'absenceTypeId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getAbsenceRecords(
    @Request() req,
    @Query() query: AbsenceRecordQueryDto,
  ): Promise<ApiResponseType> {
    const result = await this.absenceRecordService.findAll(req.user.companyId, query);
    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get absence record statistics' })
  @ApiResponse({ status: 200, description: 'Absence record statistics retrieved successfully' })
  async getAbsenceRecordStats(@Request() req): Promise<ApiResponseType> {
    const stats = await this.absenceRecordService.getAbsenceRecordStats(req.user.companyId);
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming absence records' })
  @ApiResponse({ status: 200, description: 'Upcoming absence records retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUpcomingAbsences(
    @Request() req,
    @Query('limit') limit?: number,
  ): Promise<ApiResponseType> {
    const records = await this.absenceRecordService.getUpcomingAbsences(
      req.user.companyId,
      limit,
    );
    return {
      success: true,
      data: records,
      timestamp: new Date(),
    };
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current absence records' })
  @ApiResponse({ status: 200, description: 'Current absence records retrieved successfully' })
  async getCurrentAbsences(@Request() req): Promise<ApiResponseType> {
    const records = await this.absenceRecordService.getCurrentAbsences(req.user.companyId);
    return {
      success: true,
      data: records,
      timestamp: new Date(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get absence record by ID' })
  @ApiResponse({ status: 200, description: 'Absence record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Absence record not found' })
  async getAbsenceRecordById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseType> {
    const record = await this.absenceRecordService.findById(id, req.user.companyId);
    
    if (!record) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Absence record not found',
        },
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: record,
      timestamp: new Date(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update absence record' })
  @ApiResponse({ status: 200, description: 'Absence record updated successfully' })
  @ApiResponse({ status: 404, description: 'Absence record not found' })
  async updateAbsenceRecord(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateAbsenceRecordDto,
  ): Promise<ApiResponseType> {
    const record = await this.absenceRecordService.updateAbsenceRecord(
      id,
      req.user.companyId,
      updateDto,
      req.user.id,
    );
    return {
      success: true,
      data: record,
      timestamp: new Date(),
    };
  }

  @Put(':id/approval')
  @ApiOperation({ summary: 'Approve or reject absence record' })
  @ApiResponse({ status: 200, description: 'Absence record approval status updated successfully' })
  @ApiResponse({ status: 404, description: 'Absence record not found' })
  async approveAbsenceRecord(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) approvalDto: ApprovalDto,
  ): Promise<ApiResponseType> {
    const record = await this.absenceRecordService.approveAbsenceRecord(
      id,
      req.user.companyId,
      approvalDto,
      req.user.id,
    );
    return {
      success: true,
      data: record,
      timestamp: new Date(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete absence record' })
  @ApiResponse({ status: 204, description: 'Absence record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Absence record not found' })
  async deleteAbsenceRecord(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.absenceRecordService.deleteAbsenceRecord(id, req.user.companyId);
  }
} 