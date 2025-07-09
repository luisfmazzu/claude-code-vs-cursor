# Employee Absenteeism Tracking SaaS - System Architecture

## 📋 Architecture Overview

This document outlines the comprehensive system architecture for the Employee Absenteeism Tracking SaaS platform, designed to handle AI-powered email parsing, real-time analytics, and scalable multi-tenant operations.

## 🏗️ High-Level Architecture

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Web App (Next.js)   │   Mobile App    │   Email Clients   │   Third-party APIs │
│  - React Components  │   - iOS/Android │   - Gmail         │   - Webhooks       │
│  - Tailwind CSS      │   - React Native│   - Outlook       │   - Integrations   │
│  - TypeScript        │   - Expo        │   - Exchange      │   - CSV Upload     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                             CDN & Load Balancer                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │
│  │   Cloudflare    │  │   Vercel Edge   │  │   Railway LB    │               │
│  │   - CDN         │  │   - Static      │  │   - API Gateway │               │
│  │   - DNS         │  │   - Caching     │  │   - Rate Limit  │               │
│  │   - Security    │  │   - Compression │  │   - Auth        │               │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                APPLICATION LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          FRONTEND (Next.js)                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │    Pages    │  │ Components  │  │   Hooks     │  │   Context   │        │ │
│  │  │ - Dashboard │  │ - UI Lib    │  │ - API Calls │  │ - Auth      │        │ │
│  │  │ - Auth      │  │ - Charts    │  │ - Forms     │  │ - Theme     │        │ │
│  │  │ - Settings  │  │ - Tables    │  │ - Validation│  │ - State     │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           BACKEND (Nest.js)                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │   Auth      │  │  Companies  │  │  Employees  │  │    Email    │        │ │
│  │  │ - JWT       │  │ - CRUD      │  │ - CRUD      │  │ - IMAP      │        │ │
│  │  │ - Roles     │  │ - Settings  │  │ - Import    │  │ - Parsing   │        │ │
│  │  │ - Guards    │  │ - Billing   │  │ - Analytics │  │ - Queue     │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  │                                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │  Absences   │  │   Reports   │  │  Payments   │  │   AI Core   │        │ │
│  │  │ - Tracking  │  │ - Analytics │  │ - Stripe    │  │ - Grok API  │        │ │
│  │  │ - Approval  │  │ - Export    │  │ - Billing   │  │ - Parsing   │        │ │
│  │  │ - History   │  │ - Dashboard │  │ - Invoices  │  │ - Queue     │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 BUSINESS LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            BUSINESS SERVICES                                │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │   Auth      │  │  Employee   │  │  Absence    │  │   Email     │        │ │
│  │  │ Service     │  │  Service    │  │  Service    │  │  Service    │        │ │
│  │  │ - Login     │  │ - Mgmt      │  │ - Tracking  │  │ - Fetch     │        │ │
│  │  │ - Roles     │  │ - Import    │  │ - Approval  │  │ - Parse     │        │ │
│  │  │ - Tokens    │  │ - Export    │  │ - Reports   │  │ - Process   │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  │                                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │  Company    │  │  Billing    │  │  Analytics  │  │   AI Core   │        │ │
│  │  │ Service     │  │  Service    │  │  Service    │  │  Service    │        │ │
│  │  │ - Profile   │  │ - Stripe    │  │ - Reports   │  │ - Grok      │        │ │
│  │  │ - Settings  │  │ - Subscr.   │  │ - Metrics   │  │ - Parsing   │        │ │
│  │  │ - Multi-ten │  │ - Invoices  │  │ - Export    │  │ - Learning  │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           PROCESSING QUEUES                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │   Email     │  │    CSV      │  │   Report    │  │   Notif     │        │ │
│  │  │ Processing  │  │ Processing  │  │ Generation  │  │ Delivery    │        │ │
│  │  │ - Redis     │  │ - Bull      │  │ - Cron      │  │ - Email     │        │ │
│  │  │ - Workers   │  │ - Batch     │  │ - Schedule  │  │ - Webhook   │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              PRIMARY DATA                                   │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │  Supabase   │  │    Redis    │  │  File       │  │   Logs      │        │ │
│  │  │ PostgreSQL  │  │   Cache     │  │ Storage     │  │ Monitoring  │        │ │
│  │  │ - Tables    │  │ - Sessions  │  │ - Uploads   │  │ - Sentry    │        │ │
│  │  │ - RLS       │  │ - Temp Data │  │ - Exports   │  │ - Analytics │        │ │
│  │  │ - Backups   │  │ - Queue     │  │ - Backups   │  │ - Metrics   │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               EXTERNAL SERVICES                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Stripe    │  │   Grok AI   │  │   Email     │  │  Monitoring │            │
│  │ - Payments  │  │ - Parsing   │  │ - SMTP      │  │ - Sentry    │            │
│  │ - Billing   │  │ - Analysis  │  │ - IMAP      │  │ - Uptime    │            │
│  │ - Webhooks  │  │ - API       │  │ - OAuth     │  │ - Alerts    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Architecture Principles

### 1. **Scalability**
- **Horizontal Scaling**: Microservices architecture allowing independent scaling
- **Database Sharding**: Multi-tenant architecture with company-based isolation
- **Queue Processing**: Asynchronous processing for heavy operations
- **Caching Strategy**: Multi-layer caching (CDN, Redis, Browser)

### 2. **Security**
- **Zero Trust**: No implicit trust, verify everything
- **Row Level Security**: Database-level access control
- **JWT Authentication**: Stateless authentication with refresh tokens
- **API Security**: Rate limiting, input validation, CORS

### 3. **Reliability**
- **Fault Tolerance**: Graceful degradation and error handling
- **Circuit Breakers**: Prevent cascade failures
- **Redundancy**: Multiple deployment zones and backups
- **Monitoring**: Comprehensive logging and alerting

### 4. **Performance**
- **Lazy Loading**: Load resources on demand
- **Optimistic Updates**: Instant UI feedback
- **Database Optimization**: Proper indexing and query optimization
- **CDN Distribution**: Global content delivery

## 📊 Data Architecture

### Database Schema Design

#### Core Tables Structure
```sql
-- Companies table (tenant isolation)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    subscription_status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table (multi-user support)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Employees table (main entity)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, employee_id)
);

-- Absences table (tracking records)
CREATE TABLE absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Email integrations table
CREATE TABLE email_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    credentials JSONB NOT NULL,
    active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    sync_errors JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI transactions table (usage tracking)
CREATE TABLE ai_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB,
    tokens_used INTEGER DEFAULT 0,
    processing_time FLOAT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_department ON employees(department);

CREATE INDEX idx_absences_employee_id ON absences(employee_id);
CREATE INDEX idx_absences_start_date ON absences(start_date);
CREATE INDEX idx_absences_type ON absences(type);
CREATE INDEX idx_absences_status ON absences(status);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active);

CREATE INDEX idx_ai_transactions_company_id ON ai_transactions(company_id);
CREATE INDEX idx_ai_transactions_type ON ai_transactions(type);
CREATE INDEX idx_ai_transactions_created_at ON ai_transactions(created_at);
```

### Multi-Tenant Architecture

#### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company isolation" ON companies
    USING (id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "User company access" ON users
    USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Employee company access" ON employees
    USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Absence company access" ON absences
    USING (employee_id IN (
        SELECT id FROM employees 
        WHERE company_id = current_setting('app.current_company_id')::uuid
    ));
```

## 🔄 Processing Architecture

### Queue System Design

#### Email Processing Queue
```typescript
// email-processing.service.ts
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class EmailProcessingService {
  constructor(
    @InjectQueue('email-processing') private emailQueue: Queue,
  ) {}

  async processEmail(emailData: EmailData) {
    return this.emailQueue.add(
      'parse-email',
      { emailData },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
  }
}

// email-processing.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email-processing')
export class EmailProcessingProcessor {
  @Process('parse-email')
  async handleEmailParsing(job: Job<{ emailData: EmailData }>) {
    const { emailData } = job.data;
    
    try {
      // Step 1: Extract email content
      const content = await this.extractEmailContent(emailData);
      
      // Step 2: Parse with AI
      const parsedData = await this.aiService.parseEmailContent(content);
      
      // Step 3: Update database
      await this.updateAbsenceRecords(parsedData);
      
      // Step 4: Send notifications
      await this.sendNotifications(parsedData);
      
      return { success: true, processed: parsedData.length };
    } catch (error) {
      throw new Error(`Email processing failed: ${error.message}`);
    }
  }
}
```

#### CSV Processing Queue
```typescript
// csv-processing.service.ts
@Injectable()
export class CSVProcessingService {
  constructor(
    @InjectQueue('csv-processing') private csvQueue: Queue,
  ) {}

  async processCSVImport(file: Express.Multer.File, companyId: string) {
    return this.csvQueue.add(
      'import-csv',
      { 
        fileBuffer: file.buffer,
        fileName: file.originalname,
        companyId,
      },
      {
        attempts: 2,
        backoff: 'fixed',
        delay: 5000,
      },
    );
  }
}
```

### AI Integration Architecture

#### AI Service Layer
```typescript
// ai-core.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AICoreService {
  private grokClient: GrokClient;

  constructor(private configService: ConfigService) {
    this.grokClient = new GrokClient({
      apiKey: this.configService.get('GROK_API_KEY'),
      baseURL: this.configService.get('GROK_API_URL'),
    });
  }

  async parseEmailContent(content: string): Promise<ParsedEmailData> {
    const prompt = this.buildEmailParsingPrompt(content);
    
    const response = await this.grokClient.completion({
      model: 'grok-3',
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.1,
    });

    return this.validateAndParseResponse(response);
  }

  private buildEmailParsingPrompt(content: string): string {
    return `
      Parse the following email content and extract employee absence information:
      
      Email Content:
      ${content}
      
      Extract the following information if present:
      - Employee name
      - Absence type (sick, vacation, personal, etc.)
      - Start date
      - End date (if specified)
      - Reason (if provided)
      
      Return the information in JSON format.
    `;
  }

  private getSystemPrompt(): string {
    return `
      You are an AI assistant specialized in parsing employee absence information from emails.
      Your task is to accurately extract structured data from unstructured email content.
      
      Rules:
      1. Only extract information that is explicitly stated
      2. Use ISO date format (YYYY-MM-DD) for dates
      3. Categorize absence types as: sick, vacation, personal, bereavement, jury_duty, other
      4. Return valid JSON format
      5. If no absence information is found, return empty array
    `;
  }
}
```

## 🔐 Security Architecture

### Authentication & Authorization

#### JWT Token Strategy
```typescript
// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);
    
    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Set company context for RLS
    await this.setCompanyContext(user.companyId);
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };
  }

  private async setCompanyContext(companyId: string) {
    // Set PostgreSQL context for RLS
    await this.databaseService.query(
      'SET app.current_company_id = $1',
      [companyId],
    );
  }
}
```

#### Role-Based Access Control
```typescript
// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some(role => this.hasRole(user.role, role));
  }

  private hasRole(userRole: string, requiredRole: Role): boolean {
    const hierarchy = {
      owner: ['owner', 'administrator', 'user'],
      administrator: ['administrator', 'user'],
      user: ['user'],
    };

    return hierarchy[userRole]?.includes(requiredRole) || false;
  }
}
```

### Input Validation & Sanitization

#### DTO Validation
```typescript
// create-employee.dto.ts
import { IsEmail, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEmployeeDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  employeeId: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  firstName: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @IsEnum(['active', 'inactive', 'on_leave'])
  @IsOptional()
  status?: string;
}
```

## 📈 Performance Architecture

### Caching Strategy

#### Multi-Layer Caching
```typescript
// cache.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }
}
```

#### Database Query Optimization
```typescript
// employee.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeeRepository {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  async findByCompanyWithAbsences(companyId: string, filters: EmployeeFilters) {
    const query = this.employeeRepo
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.absences', 'absence')
      .where('employee.companyId = :companyId', { companyId })
      .orderBy('employee.lastName', 'ASC');

    if (filters.department) {
      query.andWhere('employee.department = :department', {
        department: filters.department,
      });
    }

    if (filters.status) {
      query.andWhere('employee.status = :status', { status: filters.status });
    }

    if (filters.search) {
      query.andWhere(
        '(employee.firstName ILIKE :search OR employee.lastName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return query
      .skip(filters.offset)
      .take(filters.limit)
      .getMany();
  }
}
```

## 🔄 API Architecture

### RESTful API Design

#### Controller Structure
```typescript
// employees.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private employeeService: EmployeeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved employees' })
  async findAll(@Query() filters: EmployeeFiltersDto) {
    return this.employeeService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new employee' })
  @Roles('administrator', 'owner')
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  @Roles('administrator', 'owner')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  @Roles('owner')
  async remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
```

### WebSocket Architecture

#### Real-time Updates
```typescript
// websocket.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class WebSocketGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-company')
  handleJoinCompany(client: Socket, companyId: string) {
    client.join(`company-${companyId}`);
    client.emit('joined-company', { companyId });
  }

  @SubscribeMessage('leave-company')
  handleLeaveCompany(client: Socket, companyId: string) {
    client.leave(`company-${companyId}`);
    client.emit('left-company', { companyId });
  }

  // Broadcast to specific company
  broadcastToCompany(companyId: string, event: string, data: any) {
    this.server.to(`company-${companyId}`).emit(event, data);
  }

  // Broadcast absence updates
  broadcastAbsenceUpdate(companyId: string, absence: any) {
    this.broadcastToCompany(companyId, 'absence-updated', absence);
  }

  // Broadcast email processing status
  broadcastEmailProcessing(companyId: string, status: any) {
    this.broadcastToCompany(companyId, 'email-processing-status', status);
  }
}
```

## 🚀 Deployment Architecture

### Containerization Strategy

#### Docker Configuration
```dockerfile
# Backend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]
```

#### Kubernetes Configuration
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: employee-tracking-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: employee-tracking-api
  template:
    metadata:
      labels:
        app: employee-tracking-api
    spec:
      containers:
      - name: api
        image: employee-tracking-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: employee-tracking-api-service
spec:
  selector:
    app: employee-tracking-api
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

## 📊 Monitoring Architecture

### Observability Stack

#### Logging Configuration
```typescript
// logging.service.ts
import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class LoggingService {
  private logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' }),
    ],
  });

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta?: any) {
    this.logger.error(message, { error: error?.stack, ...meta });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }
}
```

#### Metrics Collection
```typescript
// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  private httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  private aiTransactionsTotal = new Counter({
    name: 'ai_transactions_total',
    help: 'Total number of AI transactions',
    labelNames: ['type', 'status'],
  });

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration,
    );
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
  }

  recordAITransaction(type: string, status: string) {
    this.aiTransactionsTotal.inc({ type, status });
  }

  getMetrics() {
    return register.metrics();
  }
}
```

This comprehensive architecture document provides the foundation for building a scalable, secure, and maintainable Employee Absenteeism Tracking SaaS platform.