// Core entity types for Employee Absenteeism Tracking

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  sizeRange?: CompanySizeRange;
  emailDomain?: string;
  logoUrl?: string;
  timezone: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier?: SubscriptionTier;
  stripeCustomerId?: string;
  trialEndsAt?: Date;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
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
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
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
  manager?: Employee;
  employmentType?: EmploymentType;
  workLocation?: string;
  salaryCurrency: string;
  salaryAmount?: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbsenceType {
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

export interface AbsenceRecord {
  id: string;
  companyId: string;
  employeeId: string;
  employee?: Employee;
  absenceTypeId: string;
  absenceType?: AbsenceType;
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
  attachments: AttachmentData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailIntegration {
  id: string;
  companyId: string;
  name: string;
  provider: EmailProvider;
  configuration: Record<string, any>;
  encryptedCredentials: string;
  isActive: boolean;
  lastSync?: Date;
  syncStatus: EmailSyncStatus;
  errorMessage?: string;
  syncFrequencyMinutes: number;
  totalEmailsProcessed: number;
  lastEmailProcessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIProcessingLog {
  id: string;
  companyId: string;
  processingType: AIProcessingType;
  provider: AIProvider;
  inputData?: Record<string, any>;
  aiResponse?: Record<string, any>;
  confidenceScore?: number;
  status: AIProcessingStatus;
  errorMessage?: string;
  processingTimeMs?: number;
  costUsd?: number;
  tokensUsed?: number;
  relatedRecordId?: string;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  companyId: string;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  planName: string;
  planPrice: number;
  planInterval: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageMetrics {
  id: string;
  companyId: string;
  metricType: UsageMetricType;
  metricValue: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  companyId: string;
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedBy?: string;
  changedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface Notification {
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

// Enums and Types
export type UserRole = 'owner' | 'administrator' | 'user';

export type EmployeeStatus = 'active' | 'inactive' | 'terminated' | 'on_leave';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';

export type AbsenceStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_review';

export type AbsenceSource = 'manual' | 'email' | 'import' | 'api';

export type EmailProvider = 'outlook' | 'gmail' | 'exchange' | 'imap' | 'pop3';

export type EmailSyncStatus = 'connected' | 'disconnected' | 'error' | 'syncing' | 'rate_limited';

export type AIProcessingType = 'email_parsing' | 'csv_parsing' | 'pattern_analysis' | 'anomaly_detection';

export type AIProvider = 'grok' | 'openai' | 'claude' | 'local';

export type AIProcessingStatus = 'processing' | 'completed' | 'failed' | 'manual_review' | 'timeout';

export type SubscriptionStatus = 'trial' | 'active' | 'suspended' | 'cancelled' | 'past_due';

export type SubscriptionTier = 'basic' | 'professional' | 'enterprise';

export type CompanySizeRange = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export type UsageMetricType = 'ai_calls' | 'emails_processed' | 'employees_managed' | 'api_requests';

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

export type NotificationType = 'absence_detected' | 'absence_approved' | 'absence_rejected' | 'system_alert' | 'billing_alert';

// Helper interfaces
export interface AttachmentData {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
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

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface SearchParams {
  query?: string;
  filters?: FilterParams;
  sort?: SortParams;
  pagination?: PaginationParams;
} 