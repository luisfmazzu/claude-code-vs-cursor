import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseConfig } from '../config/database.config';
import { AIService } from '../ai/ai.service';
import * as nodemailer from 'nodemailer';

export interface CreateEmailIntegrationDto {
  provider: 'gmail' | 'outlook' | 'exchange' | 'custom';
  emailAddress: string;
  credentials: {
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
  };
}

export interface UpdateEmailIntegrationDto {
  emailAddress?: string;
  credentials?: Record<string, any>;
  active?: boolean;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  date: string;
  processed: boolean;
  processedAt?: string;
  parsedData?: any;
}

export interface ProcessEmailsResult {
  totalEmails: number;
  processedEmails: number;
  failedEmails: number;
  errors: string[];
  parsedAbsences: {
    employeeId?: string;
    employeeName?: string;
    type: string;
    startDate: string;
    endDate?: string;
    status: string;
  }[];
}

@Injectable()
export class EmailService {
  constructor(
    private readonly databaseConfig: DatabaseConfig,
    private readonly aiService: AIService,
  ) {}

  async createEmailIntegration(
    createDto: CreateEmailIntegrationDto,
    companyId: string,
  ): Promise<any> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Check if email integration already exists for this email
      const { data: existingIntegration } = await supabase
        .from('email_integrations')
        .select('id')
        .eq('company_id', companyId)
        .eq('email_address', createDto.emailAddress)
        .single();

      if (existingIntegration) {
        throw new ConflictException('Email integration already exists for this email address');
      }

      // Test email connection before saving
      await this.testEmailConnection(createDto);

      // Encrypt credentials (in a real app, use proper encryption)
      const encryptedCredentials = this.encryptCredentials(createDto.credentials);

      // Create email integration
      const { data: integration, error } = await supabase
        .from('email_integrations')
        .insert({
          company_id: companyId,
          provider: createDto.provider,
          email_address: createDto.emailAddress,
          credentials: encryptedCredentials,
          active: true,
        })
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Failed to create email integration: ${error.message}`);
      }

      // Remove sensitive data from response
      const { credentials, ...safeIntegration } = integration;
      return safeIntegration;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating email integration:', error);
      throw new BadRequestException('Failed to create email integration');
    }
  }

  async getEmailIntegrations(companyId: string): Promise<any[]> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      const { data: integrations, error } = await supabase
        .from('email_integrations')
        .select('id, provider, email_address, active, last_sync, created_at, updated_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new BadRequestException(`Failed to fetch email integrations: ${error.message}`);
      }

      return integrations || [];
    } catch (error) {
      console.error('Error fetching email integrations:', error);
      throw error;
    }
  }

  async updateEmailIntegration(
    id: string,
    updateDto: UpdateEmailIntegrationDto,
    companyId: string,
  ): Promise<any> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Check if integration exists
      const { data: existingIntegration, error: fetchError } = await supabase
        .from('email_integrations')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .single();

      if (fetchError || !existingIntegration) {
        throw new NotFoundException('Email integration not found');
      }

      // Prepare update data
      const updateData: any = {};
      
      if (updateDto.emailAddress) {
        updateData.email_address = updateDto.emailAddress;
      }
      
      if (updateDto.credentials) {
        updateData.credentials = this.encryptCredentials(updateDto.credentials);
      }
      
      if (updateDto.active !== undefined) {
        updateData.active = updateDto.active;
      }

      // Update integration
      const { data: updatedIntegration, error } = await supabase
        .from('email_integrations')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select('id, provider, email_address, active, last_sync, created_at, updated_at')
        .single();

      if (error) {
        throw new BadRequestException(`Failed to update email integration: ${error.message}`);
      }

      return updatedIntegration;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error updating email integration:', error);
      throw new BadRequestException('Failed to update email integration');
    }
  }

  async deleteEmailIntegration(id: string, companyId: string): Promise<void> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Check if integration exists
      const { data: existingIntegration } = await supabase
        .from('email_integrations')
        .select('id')
        .eq('id', id)
        .eq('company_id', companyId)
        .single();

      if (!existingIntegration) {
        throw new NotFoundException('Email integration not found');
      }

      // Delete integration
      const { error } = await supabase
        .from('email_integrations')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) {
        throw new BadRequestException(`Failed to delete email integration: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting email integration:', error);
      throw new BadRequestException('Failed to delete email integration');
    }
  }

  async testEmailConnection(integrationData: CreateEmailIntegrationDto): Promise<boolean> {
    try {
      // Create test transporter
      const transporter = this.createTransporter(integrationData);
      
      // Verify connection
      const verified = await transporter.verify();
      
      if (!verified) {
        throw new Error('Email connection verification failed');
      }

      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      throw new BadRequestException(`Email connection test failed: ${error.message}`);
    }
  }

  async fetchEmails(integrationId: string, companyId: string): Promise<EmailMessage[]> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Get integration details
      const { data: integration, error } = await supabase
        .from('email_integrations')
        .select('*')
        .eq('id', integrationId)
        .eq('company_id', companyId)
        .single();

      if (error || !integration) {
        throw new NotFoundException('Email integration not found');
      }

      if (!integration.active) {
        throw new BadRequestException('Email integration is not active');
      }

      // Decrypt credentials
      const credentials = this.decryptCredentials(integration.credentials);

      // Fetch emails using IMAP (simplified simulation)
      const emails = await this.fetchEmailsFromProvider(integration.provider, credentials);

      // Update last sync time
      await supabase
        .from('email_integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', integrationId);

      return emails;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error fetching emails:', error);
      throw new BadRequestException('Failed to fetch emails');
    }
  }

  async processEmails(integrationId: string, companyId: string): Promise<ProcessEmailsResult> {
    try {
      // Fetch emails
      const emails = await this.fetchEmails(integrationId, companyId);

      let processedEmails = 0;
      let failedEmails = 0;
      const errors: string[] = [];
      const parsedAbsences: any[] = [];

      // Process each email with AI
      for (const email of emails) {
        try {
          if (email.processed) {
            continue; // Skip already processed emails
          }

          // Use AI service to parse email content
          const parseResult = await this.aiService.parseEmailContent({
            emailContent: email.content,
            emailSubject: email.subject,
            emailFrom: email.from,
            emailDate: email.date,
          }, companyId);

          if (parseResult.confidence > 0.7) { // Only process high-confidence results
            parsedAbsences.push({
              employeeId: parseResult.employees[0]?.employeeId,
              employeeName: parseResult.employees[0]?.name,
              type: parseResult.absenceInfo.type,
              startDate: parseResult.absenceInfo.startDate,
              endDate: parseResult.absenceInfo.endDate,
              status: parseResult.absenceInfo.status,
            });

            // TODO: Create absence record in database
          }

          processedEmails++;
        } catch (error) {
          failedEmails++;
          errors.push(`Email ${email.id}: ${error.message}`);
        }
      }

      return {
        totalEmails: emails.length,
        processedEmails,
        failedEmails,
        errors,
        parsedAbsences,
      };
    } catch (error) {
      console.error('Error processing emails:', error);
      throw error;
    }
  }

  private createTransporter(integrationData: CreateEmailIntegrationDto) {
    const { credentials } = integrationData;

    const config: any = {
      host: credentials.host,
      port: credentials.port || 587,
      secure: credentials.secure || false,
    };

    if (credentials.username && credentials.password) {
      config.auth = {
        user: credentials.username,
        pass: credentials.password,
      };
    } else if (credentials.accessToken) {
      config.auth = {
        type: 'OAuth2',
        user: integrationData.emailAddress,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
      };
    }

    return nodemailer.createTransporter(config);
  }

  private async fetchEmailsFromProvider(provider: string, credentials: any): Promise<EmailMessage[]> {
    // Simulate fetching emails from email provider
    // In a real implementation, this would use IMAP to connect and fetch emails
    
    const mockEmails: EmailMessage[] = [
      {
        id: '1',
        from: 'john.doe@company.com',
        to: 'hr@company.com',
        subject: 'Sick Leave Request',
        content: 'Hi HR, I am feeling unwell today and need to take a sick day. I expect to return tomorrow. Thanks, John Doe (EMP001)',
        date: new Date().toISOString(),
        processed: false,
      },
      {
        id: '2',
        from: 'jane.smith@company.com',
        to: 'hr@company.com',
        subject: 'Vacation Request',
        content: 'Hi Team, I would like to request vacation time from December 20th to December 30th. Please let me know if this is approved. Best, Jane Smith (EMP002)',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        processed: false,
      },
    ];

    return mockEmails;
  }

  private encryptCredentials(credentials: any): any {
    // In a real implementation, use proper encryption (AES, etc.)
    // For demo purposes, we'll just encode with base64
    return {
      encrypted: Buffer.from(JSON.stringify(credentials)).toString('base64'),
    };
  }

  private decryptCredentials(encryptedCredentials: any): any {
    // In a real implementation, use proper decryption
    // For demo purposes, we'll just decode from base64
    try {
      const decrypted = Buffer.from(encryptedCredentials.encrypted, 'base64').toString();
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Failed to decrypt credentials');
    }
  }
}