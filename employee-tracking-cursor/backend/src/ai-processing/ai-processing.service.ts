import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmployeeService } from '../employee/employee.service';
import { AbsenceTypeService } from '../absence-type/absence-type.service';
import { AbsenceRecordService } from '../absence-record/absence-record.service';
import { 
  ProcessEmailDto, 
  AIProcessingResult, 
  ParsedAbsenceRequest,
  AIProcessingStatsDto,
  TrainAIDto,
  FeedbackDto 
} from '../types';

@Injectable()
export class AIProcessingService {
  private readonly logger = new Logger(AIProcessingService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private employeeService: EmployeeService,
    private absenceTypeService: AbsenceTypeService,
    private absenceRecordService: AbsenceRecordService,
  ) {}

  async processEmail(
    companyId: string,
    processEmailDto: ProcessEmailDto,
    userId: string,
  ): Promise<AIProcessingResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Processing email for company ${companyId}`);

      // Log the processing attempt
      const processingLog = await this.prisma.aIProcessingLog.create({
        data: {
          companyId,
          processingType: 'email_parsing',
          provider: 'grok-v3',
          inputData: {
            subject: processEmailDto.subject,
            body: processEmailDto.body,
            sender: processEmailDto.sender,
            timestamp: processEmailDto.timestamp,
          },
          status: 'processing',
        },
      });

      // Parse email with AI
      const parsedRequest = await this.parseEmailWithAI(
        processEmailDto,
        companyId,
      );

      const processingTimeMs = Date.now() - startTime;

      // Update processing log with results
      await this.prisma.aIProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          aiResponse: parsedRequest,
          confidenceScore: parsedRequest.confidenceScore,
          status: 'completed',
          processingTimeMs,
          tokensUsed: parsedRequest.metadata?.tokensUsed || 0,
          costUsd: parsedRequest.metadata?.costUsd || 0,
        },
      });

      // If confidence is high enough and auto-create is enabled, create the absence record
      let absenceRecord = null;
      if (
        parsedRequest.confidenceScore >= 0.8 &&
        parsedRequest.employee &&
        parsedRequest.absenceType &&
        processEmailDto.autoCreate
      ) {
        try {
          absenceRecord = await this.absenceRecordService.createAbsenceRecord(
            companyId,
            {
              employeeId: parsedRequest.employee.id,
              absenceTypeId: parsedRequest.absenceType.id,
              startDate: new Date(parsedRequest.startDate),
              endDate: new Date(parsedRequest.endDate),
              reason: parsedRequest.reason,
              notes: `Auto-created from email: ${processEmailDto.subject}`,
              source: 'ai_email_parsing',
              sourceReference: processingLog.id,
              confidenceScore: parsedRequest.confidenceScore,
            },
            userId,
          );

          await this.prisma.aIProcessingLog.update({
            where: { id: processingLog.id },
            data: { relatedRecordId: absenceRecord.id },
          });
        } catch (error) {
          this.logger.error('Failed to auto-create absence record', error);
        }
      }

      return {
        success: true,
        parsedRequest,
        absenceRecord,
        processingLogId: processingLog.id,
        processingTimeMs,
        autoCreated: !!absenceRecord,
      };
    } catch (error) {
      this.logger.error('AI processing failed', error);
      
      const processingTimeMs = Date.now() - startTime;
      
      return {
        success: false,
        error: error.message,
        processingTimeMs,
        autoCreated: false,
      };
    }
  }

  private async parseEmailWithAI(
    emailData: ProcessEmailDto,
    companyId: string,
  ): Promise<ParsedAbsenceRequest> {
    // Get company context
    const [employees, absenceTypes] = await Promise.all([
      this.employeeService.findAll(companyId, { limit: 1000 }),
      this.absenceTypeService.findAll(companyId),
    ]);

    // Prepare context for AI
    const context = {
      employees: employees.employees.map(emp => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        employeeId: emp.employeeId,
        department: emp.department,
      })),
      absenceTypes: absenceTypes.map(type => ({
        id: type.id,
        name: type.name,
        code: type.code,
        keywords: this.generateKeywords(type.name, type.code),
      })),
    };

    // Primary AI call (Grok v3)
    try {
      const grokResult = await this.callGrokAPI(emailData, context);
      if (grokResult) {
        return grokResult;
      }
    } catch (error) {
      this.logger.warn('Grok API failed, falling back to OpenAI', error);
    }

    // Fallback to OpenAI
    try {
      const openAIResult = await this.callOpenAIAPI(emailData, context);
      if (openAIResult) {
        return openAIResult;
      }
    } catch (error) {
      this.logger.error('Both AI providers failed', error);
      throw new BadRequestException('AI processing failed');
    }

    throw new BadRequestException('Unable to parse email with AI');
  }

  private async callGrokAPI(
    emailData: ProcessEmailDto,
    context: any,
  ): Promise<ParsedAbsenceRequest | null> {
    const grokApiKey = this.configService.get<string>('GROK_API_KEY');
    const grokBaseUrl = this.configService.get<string>('GROK_BASE_URL', 'https://api.x.ai/v1');

    if (!grokApiKey) {
      throw new Error('Grok API key not configured');
    }

    const prompt = this.buildPrompt(emailData, context);

    const response = await fetch(`${grokBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are an expert assistant that parses emails to extract absence/leave requests. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return null;
    }

    return this.parseAIResponse(content, context, {
      provider: 'grok-v3',
      tokensUsed: data.usage?.total_tokens,
      costUsd: this.calculateCost(data.usage?.total_tokens, 'grok'),
    });
  }

  private async callOpenAIAPI(
    emailData: ProcessEmailDto,
    context: any,
  ): Promise<ParsedAbsenceRequest | null> {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildPrompt(emailData, context);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert assistant that parses emails to extract absence/leave requests. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return null;
    }

    return this.parseAIResponse(content, context, {
      provider: 'openai-gpt4',
      tokensUsed: data.usage?.total_tokens,
      costUsd: this.calculateCost(data.usage?.total_tokens, 'openai'),
    });
  }

  private buildPrompt(emailData: ProcessEmailDto, context: any): string {
    return `
Parse this email to extract an absence/leave request. 

Email Details:
Subject: ${emailData.subject}
From: ${emailData.sender}
Body: ${emailData.body}
Timestamp: ${emailData.timestamp}

Available Employees:
${JSON.stringify(context.employees, null, 2)}

Available Absence Types:
${JSON.stringify(context.absenceTypes, null, 2)}

Please extract the following information and respond with JSON:
{
  "isAbsenceRequest": boolean,
  "confidenceScore": number (0-1),
  "employee": {
    "id": "employee_id_if_found",
    "name": "employee_name",
    "matchingMethod": "email|name|employeeId"
  },
  "absenceType": {
    "id": "absence_type_id_if_found",
    "name": "absence_type_name",
    "matchingKeywords": ["keyword1", "keyword2"]
  },
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "reason": "extracted_reason",
  "duration": "extracted_duration_description",
  "requiresApproval": boolean,
  "extractedData": {
    "originalText": "relevant_email_excerpt"
  }
}

Rules:
1. Only return isAbsenceRequest=true if you're confident this is actually a leave/absence request
2. Match employees by exact email, similar name, or employee ID
3. Match absence types by keywords (vacation, sick, personal, etc.)
4. Extract specific dates or calculate from relative terms like "next week"
5. Set confidenceScore based on how certain you are about the extraction
6. If you can't find a clear match, set the field to null but explain in extractedData
`;
  }

  private parseAIResponse(
    content: string,
    context: any,
    metadata: any,
  ): ParsedAbsenceRequest {
    try {
      // Clean up the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        isAbsenceRequest: parsed.isAbsenceRequest || false,
        confidenceScore: parsed.confidenceScore || 0,
        employee: parsed.employee || null,
        absenceType: parsed.absenceType || null,
        startDate: parsed.startDate || null,
        endDate: parsed.endDate || null,
        reason: parsed.reason || null,
        duration: parsed.duration || null,
        requiresApproval: parsed.requiresApproval || true,
        extractedData: parsed.extractedData || {},
        metadata,
      };
    } catch (error) {
      this.logger.error('Failed to parse AI response', { content, error });
      
      return {
        isAbsenceRequest: false,
        confidenceScore: 0,
        employee: null,
        absenceType: null,
        startDate: null,
        endDate: null,
        reason: null,
        duration: null,
        requiresApproval: true,
        extractedData: { rawResponse: content, error: error.message },
        metadata,
      };
    }
  }

  private generateKeywords(name: string, code: string): string[] {
    const keywords = [name.toLowerCase(), code.toLowerCase()];
    
    // Add common variations
    const variations = {
      'annual': ['vacation', 'holiday', 'leave', 'pto', 'time off'],
      'sick': ['illness', 'medical', 'doctor', 'unwell', 'health'],
      'personal': ['family', 'emergency', 'appointment'],
      'maternity': ['pregnancy', 'baby', 'birth'],
      'paternity': ['father', 'dad', 'newborn'],
    };

    Object.entries(variations).forEach(([key, values]) => {
      if (name.toLowerCase().includes(key)) {
        keywords.push(...values);
      }
    });

    return [...new Set(keywords)];
  }

  private calculateCost(tokens: number, provider: string): number {
    if (!tokens) return 0;

    const costs = {
      'grok': 0.00015, // $0.00015 per 1K tokens (estimated)
      'openai': 0.03,  // $0.03 per 1K tokens for GPT-4
    };

    return (tokens / 1000) * (costs[provider] || 0);
  }

  async getProcessingStats(companyId: string): Promise<AIProcessingStatsDto> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalProcessed,
      successfulProcessed,
      autoCreatedRecords,
      avgConfidenceScore,
      totalCost,
      recentProcessing,
    ] = await Promise.all([
      this.prisma.aIProcessingLog.count({
        where: { companyId },
      }),
      this.prisma.aIProcessingLog.count({
        where: { companyId, status: 'completed' },
      }),
      this.prisma.aIProcessingLog.count({
        where: { 
          companyId, 
          status: 'completed',
          relatedRecordId: { not: null },
        },
      }),
      this.prisma.aIProcessingLog.aggregate({
        where: { companyId, status: 'completed' },
        _avg: { confidenceScore: true },
      }),
      this.prisma.aIProcessingLog.aggregate({
        where: { companyId },
        _sum: { costUsd: true },
      }),
      this.prisma.aIProcessingLog.count({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return {
      totalProcessed,
      successfulProcessed,
      autoCreatedRecords,
      avgConfidenceScore: avgConfidenceScore._avg.confidenceScore || 0,
      totalCost: totalCost._sum.costUsd || 0,
      recentProcessing,
      successRate: totalProcessed > 0 ? successfulProcessed / totalProcessed : 0,
      autoCreationRate: successfulProcessed > 0 ? autoCreatedRecords / successfulProcessed : 0,
    };
  }

  async provideFeedback(
    companyId: string,
    feedbackDto: FeedbackDto,
  ): Promise<void> {
    // Update the processing log with feedback
    await this.prisma.aIProcessingLog.update({
      where: { id: feedbackDto.processingLogId },
      data: {
        inputData: {
          ...feedbackDto.originalData,
          feedback: {
            isCorrect: feedbackDto.isCorrect,
            corrections: feedbackDto.corrections,
            comments: feedbackDto.comments,
          },
        },
      },
    });

    // TODO: Use feedback to improve AI model (future enhancement)
    this.logger.log(`Feedback received for processing log ${feedbackDto.processingLogId}`);
  }

  async getProcessingHistory(
    companyId: string,
    limit: number = 50,
  ): Promise<any[]> {
    return this.prisma.aIProcessingLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
} 