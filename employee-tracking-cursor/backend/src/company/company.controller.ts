import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyService } from './company.service';
import { UpdateCompanyDto, CompanySettingsDto, ApiResponse as ApiResponseType } from '../types';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current user company' })
  @ApiResponse({ status: 200, description: 'Company details retrieved successfully' })
  async getCurrentCompany(@Request() req): Promise<ApiResponseType> {
    const company = await this.companyService.findById(req.user.companyId);
    return {
      success: true,
      data: company,
      timestamp: new Date(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get company statistics' })
  @ApiResponse({ status: 200, description: 'Company statistics retrieved successfully' })
  async getCompanyStats(@Request() req): Promise<ApiResponseType> {
    const stats = await this.companyService.getCompanyStats(req.user.companyId, req.user.id);
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  @Put('current')
  @ApiOperation({ summary: 'Update current company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  async updateCurrentCompany(
    @Request() req,
    @Body(ValidationPipe) updateDto: UpdateCompanyDto,
  ): Promise<ApiResponseType> {
    const company = await this.companyService.updateCompany(
      req.user.companyId,
      updateDto,
      req.user.id,
    );
    return {
      success: true,
      data: company,
      timestamp: new Date(),
    };
  }

  @Put('current/settings')
  @ApiOperation({ summary: 'Update company settings' })
  @ApiResponse({ status: 200, description: 'Company settings updated successfully' })
  async updateCompanySettings(
    @Request() req,
    @Body(ValidationPipe) settingsDto: CompanySettingsDto,
  ): Promise<ApiResponseType> {
    const company = await this.companyService.updateSettings(
      req.user.companyId,
      settingsDto,
      req.user.id,
    );
    return {
      success: true,
      data: company,
      timestamp: new Date(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  async getCompanyById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<ApiResponseType> {
    // Users can only access their own company
    if (id !== req.user.companyId) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own company',
        },
        timestamp: new Date(),
      };
    }

    const company = await this.companyService.findById(id);
    return {
      success: true,
      data: company,
      timestamp: new Date(),
    };
  }

  @Delete('current')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current company' })
  @ApiResponse({ status: 204, description: 'Company deleted successfully' })
  async deleteCurrentCompany(@Request() req): Promise<void> {
    await this.companyService.deleteCompany(req.user.companyId, req.user.id);
  }

  @Get('user/companies')
  @ApiOperation({ summary: 'Get user companies' })
  @ApiResponse({ status: 200, description: 'User companies retrieved successfully' })
  async getUserCompanies(@Request() req): Promise<ApiResponseType> {
    const companies = await this.companyService.getUserCompanies(req.user.id);
    return {
      success: true,
      data: companies,
      timestamp: new Date(),
    };
  }
} 