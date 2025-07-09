import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseConfig } from '../config/database.config';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly databaseConfig: DatabaseConfig) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async getHealth() {
    try {
      // Check database connection
      const supabase = this.databaseConfig.getClient();
      const { error } = await supabase.from('companies').select('count').limit(1);
      
      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        database: 'disconnected',
      };
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  async getReadiness() {
    // Check if all required services are ready
    try {
      const supabase = this.databaseConfig.getClient();
      const { error } = await supabase.from('companies').select('count').limit(1);
      
      if (error) {
        throw new Error('Database not ready');
      }

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ready',
          // Add other service checks here
        },
      };
    } catch (error) {
      throw new Error('Service not ready');
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check endpoint' })
  async getLiveness() {
    // Simple liveness check
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}