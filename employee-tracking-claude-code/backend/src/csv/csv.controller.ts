import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request, 
  Res, 
  Query,
  BadRequestException 
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CSVService, CSVImportDto, CSVExportDto } from './csv.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('csv')
@Controller('csv')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CSVController {
  constructor(private readonly csvService: CSVService) {}

  @Post('import/employees')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Import employees from CSV data' })
  @ApiResponse({ status: 200, description: 'CSV import completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid CSV data or format' })
  async importEmployees(
    @Body() importDto: CSVImportDto,
    @Request() req,
  ) {
    if (!importDto.csvData || !importDto.columnMapping) {
      throw new BadRequestException('CSV data and column mapping are required');
    }

    const result = await this.csvService.importEmployeesFromCSV(
      importDto,
      req.user.companyId,
    );

    return {
      message: 'CSV import completed',
      result,
    };
  }

  @Get('export/employees')
  @ApiOperation({ summary: 'Export employees to CSV' })
  @ApiResponse({ status: 200, description: 'CSV export completed successfully' })
  async exportEmployees(
    @Query() exportDto: CSVExportDto,
    @Request() req,
    @Res() res: Response,
  ) {
    const result = await this.csvService.exportEmployeesToCSV(
      exportDto,
      req.user.companyId,
    );

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.data);
  }

  @Get('template/employees')
  @ApiOperation({ summary: 'Download employee CSV import template' })
  @ApiResponse({ status: 200, description: 'Template downloaded successfully' })
  async downloadTemplate(@Res() res: Response) {
    const result = await this.csvService.generateCSVTemplate();

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.data);
  }

  @Post('suggest-mapping')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Get AI-suggested column mapping for CSV headers' })
  @ApiResponse({ status: 200, description: 'Column mapping suggestions generated' })
  @ApiResponse({ status: 400, description: 'Invalid headers provided' })
  async suggestMapping(
    @Body() body: { headers: string[] },
    @Request() req,
  ) {
    if (!body.headers || !Array.isArray(body.headers) || body.headers.length === 0) {
      throw new BadRequestException('Headers array is required');
    }

    const mapping = await this.csvService.suggestColumnMapping(
      body.headers,
      req.user.companyId,
    );

    return {
      message: 'Column mapping suggestions generated',
      mapping,
    };
  }

  @Post('validate')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Validate CSV data before import' })
  @ApiResponse({ status: 200, description: 'CSV validation completed' })
  @ApiResponse({ status: 400, description: 'Invalid CSV data' })
  async validateCSV(
    @Body() validateDto: { csvData: string; columnMapping: Record<string, string> },
    @Request() req,
  ) {
    if (!validateDto.csvData || !validateDto.columnMapping) {
      throw new BadRequestException('CSV data and column mapping are required');
    }

    // Perform dry-run validation
    const validationDto: CSVImportDto = {
      ...validateDto,
      validateData: true,
    };

    try {
      const result = await this.csvService.importEmployeesFromCSV(
        validationDto,
        req.user.companyId,
      );

      return {
        message: 'CSV validation completed',
        validation: {
          valid: result.success,
          totalRows: result.imported + result.errors,
          validRows: result.imported,
          invalidRows: result.errors,
          warnings: result.warnings,
          errors: result.failedRows,
        },
      };
    } catch (error) {
      throw new BadRequestException(`CSV validation failed: ${error.message}`);
    }
  }

  @Get('import/status')
  @ApiOperation({ summary: 'Get import job status' })
  @ApiResponse({ status: 200, description: 'Import status retrieved' })
  async getImportStatus(
    @Query('jobId') jobId: string,
    @Request() req,
  ) {
    // In a real implementation, this would check the status of a background job
    // For demo purposes, we'll return a mock status
    return {
      jobId,
      status: 'completed',
      progress: 100,
      message: 'Import completed successfully',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }
}