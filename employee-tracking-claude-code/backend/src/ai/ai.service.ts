import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseConfig } from '../config/database.config';

export interface ParseEmailDto {
  emailContent: string;
  emailSubject?: string;
  emailFrom?: string;
  emailDate?: string;
}

export interface ParseCSVDto {
  csvData: string;
  headers?: string[];
  mappingHints?: Record<string, string>;
}

export interface ParsedEmailResult {
  employees: {
    employeeId?: string;
    name?: string;
    email?: string;
  }[];
  absenceInfo: {
    type: 'sick' | 'vacation' | 'personal' | 'bereavement' | 'jury_duty' | 'maternity' | 'paternity' | 'other';
    startDate: string;
    endDate?: string;
    reason?: string;
    status: 'pending' | 'approved';
  };
  confidence: number;
  rawData: any;
}

export interface ParsedCSVResult {
  columnMapping: Record<string, string>;
  employees: {
    employeeId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    department?: string;
    position?: string;
    hireDate?: string;
    status?: string;
  }[];
  confidence: number;
  errors: string[];
  warnings: string[];
}

export interface AITransaction {
  id: string;
  type: 'email_parsing' | 'csv_parsing' | 'data_analysis';
  inputData: any;
  outputData?: any;
  tokensUsed: number;
  processingTime: number;
  status: 'pending' | 'success' | 'error' | 'timeout';
  errorMessage?: string;
  createdAt: string;
}

@Injectable()
export class AIService {
  constructor(private readonly databaseConfig: DatabaseConfig) {}

  async parseEmailContent(parseEmailDto: ParseEmailDto, companyId: string): Promise<ParsedEmailResult> {
    const startTime = Date.now();
    let tokensUsed = 0;

    try {
      // Create AI transaction record
      const transactionId = await this.createAITransaction(
        companyId,
        'email_parsing',
        parseEmailDto
      );

      // Simulate Grok v3 API call
      const grokResponse = await this.callGrokAPI('email-parsing', {
        content: parseEmailDto.emailContent,
        subject: parseEmailDto.emailSubject,
        from: parseEmailDto.emailFrom,
        date: parseEmailDto.emailDate,
      });

      tokensUsed = grokResponse.tokensUsed || 0;

      // Parse the AI response
      const parsedResult = this.parseEmailResponse(grokResponse.data);

      // Update transaction with results
      await this.updateAITransaction(transactionId, {
        outputData: parsedResult,
        tokensUsed,
        processingTime: Date.now() - startTime,
        status: 'success',
      });

      return parsedResult;
    } catch (error) {
      console.error('Email parsing error:', error);
      
      // Update transaction with error
      await this.updateAITransaction(transactionId!, {
        tokensUsed,
        processingTime: Date.now() - startTime,
        status: 'error',
        errorMessage: error.message,
      });

      throw new InternalServerErrorException('Failed to parse email content');
    }
  }

  async parseCSVData(parseCSVDto: ParseCSVDto, companyId: string): Promise<ParsedCSVResult> {
    const startTime = Date.now();
    let tokensUsed = 0;

    try {
      // Create AI transaction record
      const transactionId = await this.createAITransaction(
        companyId,
        'csv_parsing',
        parseCSVDto
      );

      // Simulate Grok v3 API call for column mapping
      const grokResponse = await this.callGrokAPI('csv-parsing', {
        csvData: parseCSVDto.csvData,
        headers: parseCSVDto.headers,
        mappingHints: parseCSVDto.mappingHints,
      });

      tokensUsed = grokResponse.tokensUsed || 0;

      // Parse the AI response
      const parsedResult = this.parseCSVResponse(grokResponse.data, parseCSVDto.csvData);

      // Update transaction with results
      await this.updateAITransaction(transactionId, {
        outputData: parsedResult,
        tokensUsed,
        processingTime: Date.now() - startTime,
        status: 'success',
      });

      return parsedResult;
    } catch (error) {
      console.error('CSV parsing error:', error);
      
      // Update transaction with error
      await this.updateAITransaction(transactionId!, {
        tokensUsed,
        processingTime: Date.now() - startTime,
        status: 'error',
        errorMessage: error.message,
      });

      throw new InternalServerErrorException('Failed to parse CSV data');
    }
  }

  async getAITransactions(companyId: string, limit = 50): Promise<AITransaction[]> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      const { data: transactions, error } = await supabase
        .from('ai_transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new BadRequestException(`Failed to fetch AI transactions: ${error.message}`);
      }

      return transactions || [];
    } catch (error) {
      console.error('Error fetching AI transactions:', error);
      throw error;
    }
  }

  async getAIUsageStats(companyId: string, startDate?: string, endDate?: string): Promise<{
    totalTransactions: number;
    totalTokensUsed: number;
    avgProcessingTime: number;
    successRate: number;
    transactionsByType: Record<string, number>;
    dailyUsage: { date: string; transactions: number; tokens: number }[];
  }> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      let query = supabase
        .from('ai_transactions')
        .select('*')
        .eq('company_id', companyId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: transactions, error } = await query;

      if (error) {
        throw new BadRequestException(`Failed to fetch AI usage stats: ${error.message}`);
      }

      const totalTransactions = transactions?.length || 0;
      const totalTokensUsed = transactions?.reduce((sum, t) => sum + (t.tokens_used || 0), 0) || 0;
      const avgProcessingTime = totalTransactions > 0 
        ? transactions.reduce((sum, t) => sum + (t.processing_time || 0), 0) / totalTransactions
        : 0;
      
      const successfulTransactions = transactions?.filter(t => t.status === 'success').length || 0;
      const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

      const transactionsByType = transactions?.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Generate daily usage (last 30 days)
      const dailyUsage = this.generateDailyUsage(transactions || []);

      return {
        totalTransactions,
        totalTokensUsed,
        avgProcessingTime: Math.round(avgProcessingTime),
        successRate: Math.round(successRate * 100) / 100,
        transactionsByType,
        dailyUsage,
      };
    } catch (error) {
      console.error('Error fetching AI usage stats:', error);
      throw error;
    }
  }

  private async callGrokAPI(type: string, data: any): Promise<{ data: any; tokensUsed: number }> {
    // Simulate Grok v3 API call
    // In a real implementation, this would make an HTTP request to Grok v3
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // Simulate API delay

    if (type === 'email-parsing') {
      return {
        data: this.generateMockEmailParsingResponse(data),
        tokensUsed: Math.floor(Math.random() * 500) + 100,
      };
    } else if (type === 'csv-parsing') {
      return {
        data: this.generateMockCSVParsingResponse(data),
        tokensUsed: Math.floor(Math.random() * 300) + 50,
      };
    }

    throw new Error('Unknown AI operation type');
  }

  private generateMockEmailParsingResponse(data: any) {
    // Mock response from Grok v3 for email parsing
    return {
      employees: [
        {
          name: 'John Doe',
          employeeId: 'EMP001',
          email: 'john.doe@company.com',
        }
      ],
      absenceInfo: {
        type: 'sick',
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        reason: 'Flu symptoms',
        status: 'pending',
      },
      confidence: 0.92,
      extractedEntities: [
        { type: 'PERSON', text: 'John Doe', confidence: 0.95 },
        { type: 'DATE', text: 'today', confidence: 0.88 },
        { type: 'REASON', text: 'flu symptoms', confidence: 0.85 },
      ],
    };
  }

  private generateMockCSVParsingResponse(data: any) {
    // Mock response from Grok v3 for CSV parsing
    return {
      columnMapping: {
        'Employee ID': 'employeeId',
        'First Name': 'firstName',
        'Last Name': 'lastName',
        'Email Address': 'email',
        'Phone': 'phone',
        'Dept': 'department',
        'Job Title': 'position',
        'Start Date': 'hireDate',
        'Status': 'status',
      },
      confidence: 0.95,
      suggestions: [
        {
          column: 'Dept',
          suggestedMapping: 'department',
          confidence: 0.9,
        }
      ],
    };
  }

  private parseEmailResponse(aiResponse: any): ParsedEmailResult {
    return {
      employees: aiResponse.employees || [],
      absenceInfo: aiResponse.absenceInfo || {
        type: 'other',
        startDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      },
      confidence: aiResponse.confidence || 0,
      rawData: aiResponse,
    };
  }

  private parseCSVResponse(aiResponse: any, csvData: string): ParsedCSVResult {
    // Parse CSV data based on AI-suggested column mapping
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataLines = lines.slice(1);

    const columnMapping = aiResponse.columnMapping || {};
    const employees: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    dataLines.forEach((line, index) => {
      try {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const employee: any = {};

        headers.forEach((header, headerIndex) => {
          const mappedField = columnMapping[header];
          if (mappedField && values[headerIndex]) {
            employee[mappedField] = values[headerIndex];
          }
        });

        // Validate required fields
        if (!employee.employeeId || !employee.firstName || !employee.lastName) {
          errors.push(`Row ${index + 2}: Missing required fields (Employee ID, First Name, Last Name)`);
        } else {
          employees.push(employee);
        }
      } catch (error) {
        errors.push(`Row ${index + 2}: Failed to parse - ${error.message}`);
      }
    });

    return {
      columnMapping,
      employees,
      confidence: aiResponse.confidence || 0,
      errors,
      warnings,
    };
  }

  private async createAITransaction(companyId: string, type: string, inputData: any): Promise<string> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      const { data: transaction, error } = await supabase
        .from('ai_transactions')
        .insert({
          company_id: companyId,
          type,
          input_data: inputData,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create AI transaction: ${error.message}`);
      }

      return transaction.id;
    } catch (error) {
      console.error('Error creating AI transaction:', error);
      throw error;
    }
  }

  private async updateAITransaction(transactionId: string, updates: any): Promise<void> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      const { error } = await supabase
        .from('ai_transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) {
        console.error('Failed to update AI transaction:', error);
      }
    } catch (error) {
      console.error('Error updating AI transaction:', error);
    }
  }

  private generateDailyUsage(transactions: any[]) {
    const dailyData: Record<string, { transactions: number; tokens: number }> = {};

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { transactions: 0, tokens: 0 };
    }

    // Aggregate transaction data
    transactions.forEach(transaction => {
      const date = transaction.created_at.split('T')[0];
      if (dailyData[date]) {
        dailyData[date].transactions++;
        dailyData[date].tokens += transaction.tokens_used || 0;
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      transactions: data.transactions,
      tokens: data.tokens,
    }));
  }
}