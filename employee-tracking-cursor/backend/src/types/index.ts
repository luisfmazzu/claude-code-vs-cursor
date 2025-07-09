// Basic types for the backend

export type UserRole = 'owner' | 'administrator' | 'user';

export interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    companyId: string;
  };
  company: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  timezone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

// Company DTOs
export interface UpdateCompanyDto {
  name?: string;
  industry?: string;
  sizeRange?: string;
  emailDomain?: string;
  logoUrl?: string;
  timezone?: string;
}

export interface CompanySettingsDto {
  notifications?: {
    emailEnabled?: boolean;
    slackEnabled?: boolean;
    webhookUrl?: string;
  };
  absencePolicy?: {
    requireApproval?: boolean;
    advanceNoticeDays?: number;
    maxConsecutiveDays?: number;
  };
  workingHours?: {
    startTime?: string;
    endTime?: string;
    workingDays?: number[];
  };
  holidays?: Array<{
    name: string;
    date: string;
    recurring: boolean;
  }>;
}

export interface CompanyStatsDto {
  totalUsers: number;
  activeUsers: number;
  totalEmployees: number;
  activeEmployees: number;
  totalAbsenceRecords: number;
  pendingAbsences: number;
  recentAbsences: number;
  yearToDateAbsences: number;
  monthlyTrends: Array<{
    month: string;
    count: number;
  }>;
  topAbsenceTypes: Array<{
    id: string;
    name: string;
    color: string;
    count: number;
  }>;
}

// Employee DTOs
export interface CreateEmployeeDto {
  employeeId?: string;
  email?: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  managerId?: string;
  employmentType?: string;
  workLocation?: string;
  salaryCurrency?: string;
  salaryAmount?: number;
  metadata?: Record<string, any>;
}

export interface UpdateEmployeeDto {
  employeeId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  terminationDate?: Date;
  status?: string;
  managerId?: string;
  employmentType?: string;
  workLocation?: string;
  salaryCurrency?: string;
  salaryAmount?: number;
  metadata?: Record<string, any>;
}

export interface EmployeeQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BulkEmployeeDto {
  employees: CreateEmployeeDto[];
}

export interface EmployeeSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  department: string;
  position: string;
}

// Absence Record DTOs
export interface CreateAbsenceRecordDto {
  employeeId: string;
  absenceTypeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  notes?: string;
  source?: string;
  sourceReference?: string;
  confidenceScore?: number;
  attachments?: any[];
}

export interface UpdateAbsenceRecordDto {
  startDate?: Date;
  endDate?: Date;
  reason?: string;
  notes?: string;
  attachments?: any[];
}

export interface AbsenceRecordQueryDto {
  page?: number;
  limit?: number;
  employeeId?: string;
  absenceTypeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApprovalDto {
  status: 'approved' | 'rejected';
  notes?: string;
  rejectionReason?: string;
}

export interface AbsenceRecordStatsDto {
  totalRecords: number;
  pendingRecords: number;
  approvedRecords: number;
  rejectedRecords: number;
  yearToDateRecords: number;
  monthToDateRecords: number;
  avgDaysPerRecord: number;
}

// Absence Type DTOs
export interface CreateAbsenceTypeDto {
  name: string;
  code: string;
  description?: string;
  isPaid?: boolean;
  requiresApproval?: boolean;
  maxDaysPerYear?: number;
  advanceNoticeDays?: number;
  color?: string;
}

export interface UpdateAbsenceTypeDto {
  name?: string;
  code?: string;
  description?: string;
  isPaid?: boolean;
  requiresApproval?: boolean;
  maxDaysPerYear?: number;
  advanceNoticeDays?: number;
  color?: string;
  isActive?: boolean;
}

// AI Processing DTOs
export interface ProcessEmailDto {
  subject: string;
  body: string;
  sender: string;
  timestamp: Date;
  autoCreate?: boolean;
}

export interface ParsedAbsenceRequest {
  isAbsenceRequest: boolean;
  confidenceScore: number;
  employee: {
    id?: string;
    name?: string;
    matchingMethod?: string;
  } | null;
  absenceType: {
    id?: string;
    name?: string;
    matchingKeywords?: string[];
  } | null;
  startDate: string | null;
  endDate: string | null;
  reason: string | null;
  duration: string | null;
  requiresApproval: boolean;
  extractedData: Record<string, any>;
  metadata?: {
    provider?: string;
    tokensUsed?: number;
    costUsd?: number;
  };
}

export interface AIProcessingResult {
  success: boolean;
  parsedRequest?: ParsedAbsenceRequest;
  absenceRecord?: any;
  processingLogId?: string;
  processingTimeMs: number;
  autoCreated: boolean;
  error?: string;
}

export interface AIProcessingStatsDto {
  totalProcessed: number;
  successfulProcessed: number;
  autoCreatedRecords: number;
  avgConfidenceScore: number;
  totalCost: number;
  recentProcessing: number;
  successRate: number;
  autoCreationRate: number;
}

export interface TrainAIDto {
  emails: Array<{
    subject: string;
    body: string;
    sender: string;
    expectedResult: ParsedAbsenceRequest;
  }>;
}

export interface FeedbackDto {
  processingLogId: string;
  isCorrect: boolean;
  corrections?: Partial<ParsedAbsenceRequest>;
  comments?: string;
  originalData?: any;
} 