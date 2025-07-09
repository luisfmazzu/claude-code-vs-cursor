# System Architecture - Employee Absenteeism Tracking SaaS

## Overview

This document provides a detailed technical architecture for the Employee Absenteeism Tracking SaaS platform, expanding on the high-level design from the PRD with specific implementation details.

## Architecture Principles

### 1. Multi-Tenancy
- **Tenant Isolation**: Row Level Security (RLS) at database level
- **Data Segregation**: Company-based data partitioning
- **Resource Sharing**: Shared infrastructure with isolated data

### 2. Microservices Design
- **Domain-Driven Design**: Services organized by business domains
- **Loose Coupling**: Services communicate via well-defined APIs
- **Independent Deployment**: Each service can be deployed independently

### 3. Event-Driven Architecture
- **Async Processing**: Email parsing and AI operations run asynchronously
- **Event Sourcing**: Critical business events are stored for audit trails
- **Real-time Updates**: WebSocket connections for live dashboard updates

## System Components

### Frontend Architecture (Next.js)

#### Application Structure
```
src/
├── app/                     # App Router pages
│   ├── (auth)/             # Auth layout group
│   ├── (dashboard)/        # Dashboard layout group
│   ├── admin/              # Admin panel
│   └── api/                # API routes
├── components/             # Reusable components
│   ├── ui/                 # Base UI components
│   ├── forms/              # Form components
│   ├── charts/             # Chart components
│   └── layout/             # Layout components
├── lib/                    # Utility libraries
│   ├── auth.ts             # Authentication config
│   ├── db.ts               # Database client
│   ├── api.ts              # API client
│   └── utils.ts            # Helper functions
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── types/                  # TypeScript definitions
└── styles/                 # Global styles
```

#### State Management Strategy
```typescript
// Global State (React Context)
interface AppContext {
  user: User | null;
  company: Company | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

// Local State (Zustand)
interface DashboardStore {
  selectedDateRange: DateRange;
  selectedDepartments: string[];
  chartData: ChartData;
  isLoading: boolean;
  filters: FilterState;
}

interface EmployeeStore {
  employees: Employee[];
  searchQuery: string;
  sortConfig: SortConfig;
  selectedEmployees: string[];
  pagination: PaginationState;
}
```

#### Component Architecture
```typescript
// Base UI Components
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// Compound Components
export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onSelect: (items: T[]) => void;
  pagination: PaginationProps;
}
```

### Backend Architecture (NestJS)

#### Service Layer Design
```typescript
// Domain Services
@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly aiService: AIService,
    private readonly eventBus: EventBus,
  ) {}

  async importEmployeesFromCSV(file: Buffer, companyId: string): Promise<ImportResult> {
    // AI-powered CSV parsing
    const parsedData = await this.aiService.parseCSV(file, 'employees');
    
    // Validation and processing
    const validatedEmployees = await this.validateEmployeeData(parsedData);
    
    // Bulk insert with transaction
    const result = await this.employeeRepository.bulkCreate(validatedEmployees, companyId);
    
    // Emit domain event
    this.eventBus.publish(new EmployeesImportedEvent(companyId, result));
    
    return result;
  }
}
```

#### Event System
```typescript
// Domain Events
export class AbsenceDetectedEvent {
  constructor(
    public readonly companyId: string,
    public readonly employeeId: string,
    public readonly absenceData: AbsenceData,
    public readonly confidence: number,
  ) {}
}

// Event Handlers
@EventsHandler(AbsenceDetectedEvent)
export class AbsenceDetectedHandler implements IEventHandler<AbsenceDetectedEvent> {
  async handle(event: AbsenceDetectedEvent) {
    if (event.confidence > 0.9) {
      await this.autoApproveAbsence(event.absenceData);
    } else {
      await this.queueForManualReview(event.absenceData);
    }
    
    await this.notifyRelevantUsers(event.companyId, event.absenceData);
  }
}
```

#### API Gateway Pattern
```typescript
@Controller('api')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class APIGatewayController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly absenceService: AbsenceService,
    private readonly aiService: AIService,
  ) {}

  @Post('employees/import')
  @UseInterceptors(FileInterceptor('file'))
  async importEmployees(
    @UploadedFile() file: Express.Multer.File,
    @CurrentCompany() company: Company,
  ) {
    return this.employeeService.importEmployeesFromCSV(file.buffer, company.id);
  }
}
```

### Database Architecture

#### Multi-Tenant Data Model
```sql
-- Row Level Security Setup
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_records ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY tenant_isolation_companies ON companies
  FOR ALL USING (id = current_setting('app.current_company_id')::UUID);

CREATE POLICY tenant_isolation_users ON users
  FOR ALL USING (company_id = current_setting('app.current_company_id')::UUID);

-- Audit Trail Tables
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Data Partitioning Strategy
```sql
-- Partition absence_records by company for better performance
CREATE TABLE absence_records_partitioned (
  LIKE absence_records INCLUDING ALL
) PARTITION BY HASH (company_id);

-- Create partitions
CREATE TABLE absence_records_p1 PARTITION OF absence_records_partitioned
  FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE absence_records_p2 PARTITION OF absence_records_partitioned
  FOR VALUES WITH (modulus 4, remainder 1);
CREATE TABLE absence_records_p3 PARTITION OF absence_records_partitioned
  FOR VALUES WITH (modulus 4, remainder 2);
CREATE TABLE absence_records_p4 PARTITION OF absence_records_partitioned
  FOR VALUES WITH (modulus 4, remainder 3);
```

### AI Processing Architecture

#### AI Service Abstraction
```typescript
interface AIProvider {
  parseEmail(content: EmailContent): Promise<AIParseResult>;
  parseCSV(data: Buffer, type: 'employees' | 'absences'): Promise<AIParseResult>;
  analyzeAbsencePattern(data: AbsenceData[]): Promise<AIAnalysisResult>;
}

@Injectable()
export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  
  constructor(
    private readonly grokProvider: GrokProvider,
    private readonly openaiProvider: OpenAIProvider,
    private readonly configService: ConfigService,
  ) {
    this.providers.set('grok', this.grokProvider);
    this.providers.set('openai', this.openaiProvider);
  }

  async parseEmail(content: EmailContent): Promise<AIParseResult> {
    const primaryProvider = this.configService.get('AI_PRIMARY_PROVIDER');
    const fallbackProvider = this.configService.get('AI_FALLBACK_PROVIDER');
    
    try {
      return await this.providers.get(primaryProvider).parseEmail(content);
    } catch (error) {
      this.logger.warn(`Primary AI provider failed, using fallback: ${error.message}`);
      return await this.providers.get(fallbackProvider).parseEmail(content);
    }
  }
}
```

#### Queue Processing System
```typescript
@Processor('email-processing')
export class EmailProcessingProcessor {
  constructor(
    private readonly aiService: AIService,
    private readonly absenceService: AbsenceService,
    private readonly notificationService: NotificationService,
  ) {}

  @Process('parse-email')
  async handleEmailParsing(job: Job<EmailProcessingJob>) {
    const { emailContent, companyId, integrationId } = job.data;
    
    try {
      // Parse email with AI
      const result = await this.aiService.parseEmail(emailContent);
      
      // Create absence record if confidence is high enough
      if (result.confidence > 0.7) {
        const absence = await this.absenceService.createFromAI(result, companyId);
        
        // Notify relevant users
        await this.notificationService.notifyAbsenceDetected(absence, result.confidence);
      }
      
      // Log processing result
      await this.logProcessingResult(result, companyId);
      
    } catch (error) {
      this.logger.error(`Email processing failed: ${error.message}`);
      throw error; // Will trigger retry
    }
  }
}
```

### Real-time Communication

#### WebSocket Implementation
```typescript
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
  namespace: '/dashboard',
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  private companyRooms = new Map<string, Set<string>>();
  
  handleConnection(client: Socket) {
    const companyId = this.extractCompanyId(client);
    
    // Join company-specific room
    client.join(`company:${companyId}`);
    
    // Track connection
    if (!this.companyRooms.has(companyId)) {
      this.companyRooms.set(companyId, new Set());
    }
    this.companyRooms.get(companyId).add(client.id);
  }

  @SubscribeMessage('subscribe-to-metrics')
  handleMetricsSubscription(client: Socket, data: { metrics: string[] }) {
    // Subscribe to specific metric updates
    data.metrics.forEach(metric => {
      client.join(`metric:${metric}`);
    });
  }

  // Emit real-time updates
  async broadcastAbsenceUpdate(companyId: string, absence: AbsenceRecord) {
    this.server.to(`company:${companyId}`).emit('absence-updated', absence);
  }
}
```

## Security Architecture

### Authentication Flow
```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Set company context for RLS
    await this.setCompanyContext(payload.companyId);
    
    return {
      userId: payload.sub,
      email: payload.email,
      companyId: payload.companyId,
      role: payload.role,
    };
  }
}
```

### Authorization Guards
```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.role?.includes(role));
  }
}

// Usage
@Post('employees')
@Roles(Role.ADMINISTRATOR, Role.OWNER)
@UseGuards(JwtAuthGuard, RoleGuard)
async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
  return this.employeeService.create(createEmployeeDto);
}
```

## Performance Optimization

### Caching Strategy
```typescript
@Injectable()
export class CacheService {
  constructor(private readonly redis: Redis) {}

  // Dashboard metrics caching
  async getDashboardMetrics(companyId: string): Promise<DashboardMetrics> {
    const cacheKey = `dashboard:metrics:${companyId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const metrics = await this.calculateMetrics(companyId);
    await this.redis.setex(cacheKey, 300, JSON.stringify(metrics)); // 5 min cache
    
    return metrics;
  }

  // Invalidate cache on data changes
  async invalidateDashboardCache(companyId: string) {
    await this.redis.del(`dashboard:metrics:${companyId}`);
  }
}
```

### Database Optimization
```sql
-- Materialized views for complex queries
CREATE MATERIALIZED VIEW company_absence_summary AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  COUNT(e.id) as total_employees,
  COUNT(ar.id) as total_absences,
  AVG(CASE WHEN ar.start_date >= CURRENT_DATE - INTERVAL '30 days' 
           THEN 1 ELSE 0 END) as monthly_absence_rate
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id AND e.status = 'active'
LEFT JOIN absence_records ar ON e.id = ar.employee_id
GROUP BY c.id, c.name;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_company_summaries()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY company_absence_summary;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on data changes
CREATE TRIGGER refresh_summaries_trigger
  AFTER INSERT OR UPDATE OR DELETE ON absence_records
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_company_summaries();
```

## Monitoring and Observability

### Application Metrics
```typescript
@Injectable()
export class MetricsService {
  private registry = new Registry();
  
  // Custom metrics
  private readonly apiRequestDuration = new Histogram({
    name: 'api_request_duration_seconds',
    help: 'Duration of API requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [this.registry],
  });

  private readonly aiProcessingDuration = new Histogram({
    name: 'ai_processing_duration_seconds',
    help: 'Duration of AI processing operations',
    labelNames: ['operation', 'provider', 'success'],
    registers: [this.registry],
  });

  recordAPIRequest(method: string, route: string, statusCode: number, duration: number) {
    this.apiRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }

  recordAIProcessing(operation: string, provider: string, success: boolean, duration: number) {
    this.aiProcessingDuration
      .labels(operation, provider, success.toString())
      .observe(duration);
  }
}
```

### Health Checks
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: HealthIndicator,
    private aiService: AIService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
      () => this.checkAIServices(),
      () => this.checkEmailIntegrations(),
    ]);
  }

  private async checkAIServices(): Promise<HealthIndicatorResult> {
    try {
      await this.aiService.healthCheck();
      return { ai_services: { status: 'up' } };
    } catch (error) {
      return { ai_services: { status: 'down', error: error.message } };
    }
  }
}
```

## Error Handling and Recovery

### Global Error Handling
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getMessage();
    } else if (exception instanceof AIServiceException) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'AI service temporarily unavailable';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
      requestId: request.headers['x-request-id'],
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'GlobalExceptionFilter',
    );

    response.status(status).json(errorResponse);
  }
}
```

### Circuit Breaker Pattern
```typescript
@Injectable()
export class AIServiceWithCircuitBreaker {
  private circuitBreaker: CircuitBreaker;

  constructor(private aiService: AIService) {
    this.circuitBreaker = new CircuitBreaker(
      this.aiService.parseEmail.bind(this.aiService),
      {
        timeout: 30000, // 30 second timeout
        errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
        resetTimeout: 60000, // Try again after 1 minute
      },
    );

    this.circuitBreaker.fallback(() => this.fallbackParsing());
  }

  async parseEmail(content: EmailContent): Promise<AIParseResult> {
    return this.circuitBreaker.fire(content);
  }

  private fallbackParsing(): AIParseResult {
    return {
      confidence: 0,
      extractedData: null,
      requiresManualReview: true,
      fallbackUsed: true,
    };
  }
}
```

This architecture provides a solid foundation for building a scalable, secure, and maintainable Employee Absenteeism Tracking SaaS platform with proper separation of concerns, multi-tenancy support, and robust error handling. 