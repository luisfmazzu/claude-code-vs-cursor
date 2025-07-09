// Data Transfer Objects (DTOs) for API requests and responses

import { 
  UserRole, 
  EmployeeStatus, 
  EmploymentType, 
  AbsenceStatus, 
  AbsenceSource, 
  EmailProvider,
  CompanySizeRange,
  SubscriptionTier,
  NotificationType,
  AIProcessingType
} from './entities';

// Authentication DTOs
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
  company: CompanyResponseDto;
  expiresIn: number;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  industry?: string;
  sizeRange?: CompanySizeRange;
  timezone: string;
}

export interface RegisterResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
  company: CompanyResponseDto;
  expiresIn: number;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

// Company DTOs
export interface CompanyResponseDto {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  sizeRange?: CompanySizeRange;
  emailDomain?: string;
  logoUrl?: string;
  timezone: string;
  subscriptionStatus: string;
  subscriptionTier?: SubscriptionTier;
  trialEndsAt?: Date;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateCompanyRequestDto {
  name?: string;
  industry?: string;
  sizeRange?: CompanySizeRange;
  emailDomain?: string;
  logoUrl?: string;
  timezone?: string;
  settings?: Record<string, any>;
}

export interface CompanySettingsDto {
  workingDays?: number[];
  workingHours?: {
    start: string;
    end: string;
  };
  defaultCurrency?: string;
  dateFormat?: string;
  timeFormat?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

// User DTOs
export interface UserResponseDto {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequestDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  sendInvitation?: boolean;
}

export interface UpdateUserRequestDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
  preferences?: Record<string, any>;
}

export interface InviteUserRequestDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  message?: string;
}

// Employee DTOs
export interface EmployeeResponseDto {
  id: string;
  companyId: string;
  employeeId?: string;
  email?: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  terminationDate?: Date;
  status: EmployeeStatus;
  managerId?: string;
  manager?: EmployeeResponseDto;
  employmentType?: EmploymentType;
  workLocation?: string;
  salaryCurrency: string;
  salaryAmount?: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeRequestDto {
  employeeId?: string;
  email?: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  managerId?: string;
  employmentType?: EmploymentType;
  workLocation?: string;
  salaryCurrency: string;
  salaryAmount?: number;
  metadata?: Record<string, any>;
}

export interface UpdateEmployeeRequestDto {
  employeeId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  terminationDate?: Date;
  status?: EmployeeStatus;
  managerId?: string;
  employmentType?: EmploymentType;
  workLocation?: string;
  salaryCurrency?: string;
  salaryAmount?: number;
  metadata?: Record<string, any>;
}

export interface ImportEmployeesRequestDto {
  employees: CreateEmployeeRequestDto[];
  validateOnly?: boolean;
}

export interface ImportEmployeesResponseDto {
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    employee: CreateEmployeeRequestDto;
    errors: string[];
  }>;
}

// Absence DTOs
export interface AbsenceTypeResponseDto {
  id: string;
  companyId: string;
  name: string;
  code: string;
  description?: string;
  isPaid: boolean;
  requiresApproval: boolean;
  maxDaysPerYear?: number;
  advanceNoticeDays: number;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAbsenceTypeRequestDto {
  name: string;
  code: string;
  description?: string;
  isPaid: boolean;
  requiresApproval: boolean;
  maxDaysPerYear?: number;
  advanceNoticeDays: number;
  color: string;
}

export interface UpdateAbsenceTypeRequestDto {
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

export interface AbsenceRecordResponseDto {
  id: string;
  companyId: string;
  employeeId: string;
  employee?: EmployeeResponseDto;
  absenceTypeId: string;
  absenceType?: AbsenceTypeResponseDto;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  notes?: string;
  status: AbsenceStatus;
  source: AbsenceSource;
  sourceReference?: string;
  confidenceScore?: number;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdBy?: string;
  attachments: AttachmentResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAbsenceRecordRequestDto {
  employeeId: string;
  absenceTypeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  notes?: string;
  attachments?: string[]; // File IDs
}

export interface UpdateAbsenceRecordRequestDto {
  employeeId?: string;
  absenceTypeId?: string;
  startDate?: Date;
  endDate?: Date;
  reason?: string;
  notes?: string;
  status?: AbsenceStatus;
  rejectionReason?: string;
  attachments?: string[]; // File IDs
}

export interface ApproveAbsenceRequestDto {
  notes?: string;
}

export interface RejectAbsenceRequestDto {
  rejectionReason: string;
  notes?: string;
}

export interface BulkAbsenceActionRequestDto {
  absenceIds: string[];
  action: 'approve' | 'reject';
  notes?: string;
  rejectionReason?: string;
}

// Email Integration DTOs
export interface EmailIntegrationResponseDto {
  id: string;
  companyId: string;
  name: string;
  provider: EmailProvider;
  isActive: boolean;
  lastSync?: Date;
  syncStatus: string;
  errorMessage?: string;
  syncFrequencyMinutes: number;
  totalEmailsProcessed: number;
  lastEmailProcessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmailIntegrationRequestDto {
  name: string;
  provider: EmailProvider;
  configuration: Record<string, any>;
  credentials: Record<string, any>;
  syncFrequencyMinutes?: number;
}

export interface UpdateEmailIntegrationRequestDto {
  name?: string;
  configuration?: Record<string, any>;
  credentials?: Record<string, any>;
  isActive?: boolean;
  syncFrequencyMinutes?: number;
}

export interface TestEmailIntegrationRequestDto {
  provider: EmailProvider;
  configuration: Record<string, any>;
  credentials: Record<string, any>;
}

export interface TestEmailIntegrationResponseDto {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

// AI Processing DTOs
export interface AIProcessingLogResponseDto {
  id: string;
  companyId: string;
  processingType: AIProcessingType;
  provider: string;
  confidenceScore?: number;
  status: string;
  errorMessage?: string;
  processingTimeMs?: number;
  costUsd?: number;
  tokensUsed?: number;
  relatedRecordId?: string;
  createdAt: Date;
}

export interface ProcessEmailRequestDto {
  emailContent: string;
  emailSubject: string;
  senderEmail: string;
  receivedAt: Date;
  integrationId?: string;
}

export interface ProcessEmailResponseDto {
  absenceRecords: AbsenceRecordResponseDto[];
  processingLog: AIProcessingLogResponseDto;
  confidence: number;
  requiresReview: boolean;
}

export interface ProcessCSVRequestDto {
  csvContent: string;
  mapping: Record<string, string>;
  validateOnly?: boolean;
}

export interface ProcessCSVResponseDto {
  employees?: EmployeeResponseDto[];
  absenceRecords?: AbsenceRecordResponseDto[];
  errors: Array<{
    row: number;
    errors: string[];
  }>;
  processingLog: AIProcessingLogResponseDto;
}

// Analytics DTOs
export interface DashboardStatsResponseDto {
  totalEmployees: number;
  activeEmployees: number;
  totalAbsences: number;
  pendingAbsences: number;
  absenceRate: number;
  topAbsenceTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    absences: number;
    rate: number;
  }>;
  departmentStats: Array<{
    department: string;
    employees: number;
    absences: number;
    rate: number;
  }>;
}

export interface AbsenceAnalyticsRequestDto {
  startDate?: Date;
  endDate?: Date;
  departmentId?: string;
  employeeId?: string;
  absenceTypeId?: string;
}

export interface AbsenceAnalyticsResponseDto {
  summary: {
    totalAbsences: number;
    totalDays: number;
    averageDuration: number;
    absenceRate: number;
  };
  trends: Array<{
    date: string;
    absences: number;
    days: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
    days: number;
    percentage: number;
  }>;
  byDepartment: Array<{
    department: string;
    count: number;
    days: number;
    rate: number;
  }>;
  byEmployee: Array<{
    employee: string;
    count: number;
    days: number;
    rate: number;
  }>;
}

// Notification DTOs
export interface NotificationResponseDto {
  id: string;
  companyId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface CreateNotificationRequestDto {
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  expiresAt?: Date;
}

export interface MarkNotificationReadRequestDto {
  notificationIds: string[];
}

// File Upload DTOs
export interface AttachmentResponseDto {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface UploadFileRequestDto {
  file: File;
  category?: string;
}

// Common DTOs
export interface ApiResponseDto<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

export interface ListResponseDto<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ListRequestDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface BulkActionRequestDto {
  ids: string[];
  action: string;
  params?: Record<string, any>;
}

export interface BulkActionResponseDto {
  successful: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
} 