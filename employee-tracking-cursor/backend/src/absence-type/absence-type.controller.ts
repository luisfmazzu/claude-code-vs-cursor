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
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AbsenceTypeService } from './absence-type.service';
import { 
  CreateAbsenceTypeDto, 
  UpdateAbsenceTypeDto, 
  ApiResponse as ApiResponseType 
} from '../types';

@ApiTags('absence-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('absence-types')
export class AbsenceTypeController {
  constructor(private readonly absenceTypeService: AbsenceTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new absence type' })
  @ApiResponse({ status: 201, description: 'Absence type created successfully' })
  async createAbsenceType(
    @Request() req,
    @Body(ValidationPipe) createDto: CreateAbsenceTypeDto,
  ): Promise<ApiResponseType> {
    const absenceType = await this.absenceTypeService.createAbsenceType(
      req.user.companyId,
      createDto,
    );
    return {
      success: true,
      data: absenceType,
      timestamp: new Date(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all absence types' })
  @ApiResponse({ status: 200, description: 'Absence types retrieved successfully' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  async getAbsenceTypes(
    @Request() req,
    @Query('includeInactive', new ParseBoolPipe({ optional: true })) includeInactive?: boolean,
  ): Promise<ApiResponseType> {
    const absenceTypes = await this.absenceTypeService.findAll(
      req.user.companyId,
      includeInactive,
    );
    return {
      success: true,
      data: absenceTypes,
      timestamp: new Date(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get absence type statistics' })
  @ApiResponse({ status: 200, description: 'Absence type statistics retrieved successfully' })
  async getAbsenceTypeStats(@Request() req): Promise<ApiResponseType> {
    const stats = await this.absenceTypeService.getAbsenceTypeStats(req.user.companyId);
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  @Post('default')
  @ApiOperation({ summary: 'Create default absence types' })
  @ApiResponse({ status: 201, description: 'Default absence types created successfully' })
  async createDefaultAbsenceTypes(@Request() req): Promise<ApiResponseType> {
    const absenceTypes = await this.absenceTypeService.createDefaultAbsenceTypes(
      req.user.companyId,
    );
    return {
      success: true,
      data: absenceTypes,
      timestamp: new Date(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get absence type by ID' })
  @ApiResponse({ status: 200, description: 'Absence type retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Absence type not found' })
  async getAbsenceTypeById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseType> {
    const absenceType = await this.absenceTypeService.findById(id, req.user.companyId);
    
    if (!absenceType) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Absence type not found',
        },
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: absenceType,
      timestamp: new Date(),
    };
  }

  @Get('by-code/:code')
  @ApiOperation({ summary: 'Get absence type by code' })
  @ApiResponse({ status: 200, description: 'Absence type retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Absence type not found' })
  async getAbsenceTypeByCode(
    @Request() req,
    @Param('code') code: string,
  ): Promise<ApiResponseType> {
    const absenceType = await this.absenceTypeService.findByCode(code, req.user.companyId);
    
    if (!absenceType) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Absence type not found',
        },
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: absenceType,
      timestamp: new Date(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update absence type' })
  @ApiResponse({ status: 200, description: 'Absence type updated successfully' })
  @ApiResponse({ status: 404, description: 'Absence type not found' })
  async updateAbsenceType(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateAbsenceTypeDto,
  ): Promise<ApiResponseType> {
    const absenceType = await this.absenceTypeService.updateAbsenceType(
      id,
      req.user.companyId,
      updateDto,
    );
    return {
      success: true,
      data: absenceType,
      timestamp: new Date(),
    };
  }

  @Put(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle absence type active status' })
  @ApiResponse({ status: 200, description: 'Absence type status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Absence type not found' })
  async toggleAbsenceTypeStatus(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseType> {
    const absenceType = await this.absenceTypeService.toggleAbsenceTypeStatus(
      id,
      req.user.companyId,
    );
    return {
      success: true,
      data: absenceType,
      timestamp: new Date(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete absence type' })
  @ApiResponse({ status: 204, description: 'Absence type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Absence type not found' })
  async deleteAbsenceType(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.absenceTypeService.deleteAbsenceType(id, req.user.companyId);
  }
} 