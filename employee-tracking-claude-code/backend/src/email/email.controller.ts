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
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  EmailService, 
  CreateEmailIntegrationDto, 
  UpdateEmailIntegrationDto 
} from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('email')
@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('integrations')
  @ApiOperation({ summary: 'Get all email integrations' })
  @ApiResponse({ status: 200, description: 'Email integrations retrieved successfully' })
  async getIntegrations(@Request() req) {
    return this.emailService.getEmailIntegrations(req.user.companyId);
  }

  @Post('integrations')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Create new email integration' })
  @ApiResponse({ status: 201, description: 'Email integration created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid integration data' })
  @ApiResponse({ status: 409, description: 'Email integration already exists' })
  async createIntegration(
    @Body() createDto: CreateEmailIntegrationDto,
    @Request() req,
  ) {
    // Validate required fields
    if (!createDto.emailAddress || !createDto.provider) {
      throw new BadRequestException('Email address and provider are required');
    }

    if (!createDto.credentials || Object.keys(createDto.credentials).length === 0) {
      throw new BadRequestException('Email credentials are required');
    }

    return this.emailService.createEmailIntegration(createDto, req.user.companyId);
  }

  @Patch('integrations/:id')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Update email integration' })
  @ApiResponse({ status: 200, description: 'Email integration updated successfully' })
  @ApiResponse({ status: 404, description: 'Email integration not found' })
  async updateIntegration(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmailIntegrationDto,
    @Request() req,
  ) {
    return this.emailService.updateEmailIntegration(id, updateDto, req.user.companyId);
  }

  @Delete('integrations/:id')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Delete email integration' })
  @ApiResponse({ status: 200, description: 'Email integration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Email integration not found' })
  async deleteIntegration(@Param('id') id: string, @Request() req) {
    await this.emailService.deleteEmailIntegration(id, req.user.companyId);
    return { message: 'Email integration deleted successfully' };
  }

  @Post('integrations/test')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Test email connection' })
  @ApiResponse({ status: 200, description: 'Email connection test successful' })
  @ApiResponse({ status: 400, description: 'Email connection test failed' })
  async testConnection(@Body() testDto: CreateEmailIntegrationDto) {
    const result = await this.emailService.testEmailConnection(testDto);
    return { success: result, message: 'Email connection test successful' };
  }

  @Post('integrations/:id/fetch')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Fetch emails from integration' })
  @ApiResponse({ status: 200, description: 'Emails fetched successfully' })
  @ApiResponse({ status: 404, description: 'Email integration not found' })
  async fetchEmails(@Param('id') id: string, @Request() req) {
    const emails = await this.emailService.fetchEmails(id, req.user.companyId);
    return { 
      message: 'Emails fetched successfully', 
      count: emails.length,
      emails: emails.slice(0, 10) // Return first 10 for preview
    };
  }

  @Post('integrations/:id/process')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Process emails with AI parsing' })
  @ApiResponse({ status: 200, description: 'Emails processed successfully' })
  @ApiResponse({ status: 404, description: 'Email integration not found' })
  async processEmails(@Param('id') id: string, @Request() req) {
    return this.emailService.processEmails(id, req.user.companyId);
  }
}