import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request, 
  Query,
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIService, ParseEmailDto, ParseCSVDto } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('parse-email')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Parse email content for absence information' })
  @ApiResponse({ status: 200, description: 'Email parsed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email content' })
  async parseEmail(@Body() parseEmailDto: ParseEmailDto, @Request() req) {
    if (!parseEmailDto.emailContent || parseEmailDto.emailContent.trim().length === 0) {
      throw new BadRequestException('Email content is required');
    }

    return this.aiService.parseEmailContent(parseEmailDto, req.user.companyId);
  }

  @Post('parse-csv')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Parse CSV data with AI-powered column mapping' })
  @ApiResponse({ status: 200, description: 'CSV parsed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid CSV data' })
  async parseCSV(@Body() parseCSVDto: ParseCSVDto, @Request() req) {
    if (!parseCSVDto.csvData || parseCSVDto.csvData.trim().length === 0) {
      throw new BadRequestException('CSV data is required');
    }

    return this.aiService.parseCSVData(parseCSVDto, req.user.companyId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get AI transaction history' })
  @ApiResponse({ status: 200, description: 'AI transactions retrieved successfully' })
  async getTransactions(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    
    if (limitNum > 200) {
      throw new BadRequestException('Limit cannot exceed 200');
    }

    return this.aiService.getAITransactions(req.user.companyId, limitNum);
  }

  @Get('usage-stats')
  @ApiOperation({ summary: 'Get AI usage statistics' })
  @ApiResponse({ status: 200, description: 'AI usage statistics retrieved successfully' })
  async getUsageStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Validate date format if provided
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new BadRequestException('Invalid start date format. Use YYYY-MM-DD');
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      throw new BadRequestException('Invalid end date format. Use YYYY-MM-DD');
    }

    return this.aiService.getAIUsageStats(req.user.companyId, startDate, endDate);
  }

  @Post('test-email-parsing')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Test email parsing with sample data' })
  @ApiResponse({ status: 200, description: 'Test email parsing completed' })
  async testEmailParsing(@Request() req) {
    const sampleEmail = {
      emailContent: `
        Hi HR Team,
        
        I'm writing to inform you that John Doe (Employee ID: EMP001) will be absent from work today due to flu symptoms. 
        He expects to return tomorrow if he feels better.
        
        Please let me know if you need any additional information.
        
        Best regards,
        Manager
      `,
      emailSubject: 'Sick Leave Notification - John Doe',
      emailFrom: 'manager@company.com',
      emailDate: new Date().toISOString(),
    };

    return this.aiService.parseEmailContent(sampleEmail, req.user.companyId);
  }

  @Post('test-csv-parsing')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Test CSV parsing with sample data' })
  @ApiResponse({ status: 200, description: 'Test CSV parsing completed' })
  async testCSVParsing(@Request() req) {
    const sampleCSV = {
      csvData: `Employee ID,First Name,Last Name,Email Address,Phone,Dept,Job Title,Start Date,Status
EMP001,John,Doe,john.doe@company.com,555-0123,Engineering,Software Developer,2023-01-15,Active
EMP002,Jane,Smith,jane.smith@company.com,555-0124,Marketing,Marketing Manager,2023-02-01,Active
EMP003,Bob,Johnson,bob.johnson@company.com,555-0125,Engineering,Senior Developer,2022-11-10,Active`,
      headers: ['Employee ID', 'First Name', 'Last Name', 'Email Address', 'Phone', 'Dept', 'Job Title', 'Start Date', 'Status'],
    };

    return this.aiService.parseCSVData(sampleCSV, req.user.companyId);
  }
}