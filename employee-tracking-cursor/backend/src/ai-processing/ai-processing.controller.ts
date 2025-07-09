import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIProcessingService } from './ai-processing.service';
import { 
  ProcessEmailDto, 
  FeedbackDto,
  ApiResponse as ApiResponseType 
} from '../types';

@ApiTags('ai-processing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-processing')
export class AIProcessingController {
  constructor(private readonly aiProcessingService: AIProcessingService) {}

  @Post('process-email')
  @ApiOperation({ summary: 'Process email with AI to extract absence request' })
  @ApiResponse({ status: 200, description: 'Email processed successfully' })
  async processEmail(
    @Request() req,
    @Body(ValidationPipe) processEmailDto: ProcessEmailDto,
  ): Promise<ApiResponseType> {
    const result = await this.aiProcessingService.processEmail(
      req.user.companyId,
      processEmailDto,
      req.user.id,
    );
    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get AI processing statistics' })
  @ApiResponse({ status: 200, description: 'AI processing statistics retrieved successfully' })
  async getProcessingStats(@Request() req): Promise<ApiResponseType> {
    const stats = await this.aiProcessingService.getProcessingStats(req.user.companyId);
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get AI processing history' })
  @ApiResponse({ status: 200, description: 'AI processing history retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProcessingHistory(
    @Request() req,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<ApiResponseType> {
    const history = await this.aiProcessingService.getProcessingHistory(
      req.user.companyId,
      limit,
    );
    return {
      success: true,
      data: history,
      timestamp: new Date(),
    };
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Provide feedback on AI processing results' })
  @ApiResponse({ status: 200, description: 'Feedback submitted successfully' })
  async provideFeedback(
    @Request() req,
    @Body(ValidationPipe) feedbackDto: FeedbackDto,
  ): Promise<ApiResponseType> {
    await this.aiProcessingService.provideFeedback(req.user.companyId, feedbackDto);
    return {
      success: true,
      data: { message: 'Feedback submitted successfully' },
      timestamp: new Date(),
    };
  }

  @Post('test-parsing')
  @ApiOperation({ summary: 'Test email parsing without creating records' })
  @ApiResponse({ status: 200, description: 'Email parsing test completed' })
  async testParsing(
    @Request() req,
    @Body(ValidationPipe) processEmailDto: ProcessEmailDto,
  ): Promise<ApiResponseType> {
    // Force auto-create to false for testing
    const testDto = { ...processEmailDto, autoCreate: false };
    
    const result = await this.aiProcessingService.processEmail(
      req.user.companyId,
      testDto,
      req.user.id,
    );
    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }
} 