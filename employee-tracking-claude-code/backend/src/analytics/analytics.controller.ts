import { 
  Controller, 
  Get, 
  UseGuards, 
  Request, 
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getDashboardStats(@Request() req) {
    return this.analyticsService.getDashboardStats(req.user.companyId);
  }

  @Get('absences')
  @ApiOperation({ summary: 'Get absence analytics' })
  @ApiResponse({ status: 200, description: 'Absence analytics retrieved successfully' })
  async getAbsenceAnalytics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAbsenceAnalytics(
      req.user.companyId,
      startDate,
      endDate,
    );
  }
}