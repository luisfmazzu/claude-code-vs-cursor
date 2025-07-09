// Application constants

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  COMPANIES: {
    GET_CURRENT: '/companies/current',
    UPDATE: '/companies/:id',
    SETTINGS: '/companies/:id/settings',
    USERS: '/companies/:id/users',
    INVITE_USER: '/companies/:id/invite',
    STATISTICS: '/companies/:id/statistics',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: '/users/:id',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
    PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/upload-avatar',
    CHANGE_PASSWORD: '/users/change-password',
  },
  EMPLOYEES: {
    LIST: '/employees',
    CREATE: '/employees',
    GET: '/employees/:id',
    UPDATE: '/employees/:id',
    DELETE: '/employees/:id',
    IMPORT: '/employees/import',
    EXPORT: '/employees/export',
    BULK_UPDATE: '/employees/bulk-update',
    BULK_DELETE: '/employees/bulk-delete',
  },
  ABSENCE_TYPES: {
    LIST: '/absence-types',
    CREATE: '/absence-types',
    GET: '/absence-types/:id',
    UPDATE: '/absence-types/:id',
    DELETE: '/absence-types/:id',
    BULK_UPDATE: '/absence-types/bulk-update',
  },
  ABSENCE_RECORDS: {
    LIST: '/absence-records',
    CREATE: '/absence-records',
    GET: '/absence-records/:id',
    UPDATE: '/absence-records/:id',
    DELETE: '/absence-records/:id',
    APPROVE: '/absence-records/:id/approve',
    REJECT: '/absence-records/:id/reject',
    BULK_ACTION: '/absence-records/bulk-action',
    IMPORT: '/absence-records/import',
    EXPORT: '/absence-records/export',
  },
  EMAIL_INTEGRATIONS: {
    LIST: '/email-integrations',
    CREATE: '/email-integrations',
    GET: '/email-integrations/:id',
    UPDATE: '/email-integrations/:id',
    DELETE: '/email-integrations/:id',
    TEST: '/email-integrations/test',
    SYNC: '/email-integrations/:id/sync',
    SYNC_STATUS: '/email-integrations/:id/sync-status',
  },
  AI_PROCESSING: {
    PROCESS_EMAIL: '/ai/process-email',
    PROCESS_CSV: '/ai/process-csv',
    LOGS: '/ai/logs',
    STATS: '/ai/stats',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    ABSENCE_ANALYTICS: '/analytics/absence-analytics',
    EMPLOYEE_ANALYTICS: '/analytics/employee-analytics',
    TRENDS: '/analytics/trends',
    EXPORT: '/analytics/export',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    CREATE: '/notifications',
    GET: '/notifications/:id',
    MARK_READ: '/notifications/mark-read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: '/notifications/:id',
    SETTINGS: '/notifications/settings',
  },
  BILLING: {
    SUBSCRIPTION: '/billing/subscription',
    PLANS: '/billing/plans',
    USAGE: '/billing/usage',
    INVOICES: '/billing/invoices',
    PAYMENT_METHODS: '/billing/payment-methods',
    UPDATE_SUBSCRIPTION: '/billing/update-subscription',
    CANCEL_SUBSCRIPTION: '/billing/cancel-subscription',
  },
  FILES: {
    UPLOAD: '/files/upload',
    GET: '/files/:id',
    DELETE: '/files/:id',
  },
  ADMIN: {
    COMPANIES: '/admin/companies',
    USERS: '/admin/users',
    STATISTICS: '/admin/statistics',
    LOGS: '/admin/logs',
    SYSTEM_HEALTH: '/admin/health',
  },
} as const;

export const FRONTEND_ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  CONTACT: '/contact',
  PRICING: '/pricing',

  // Protected routes
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAILS: '/employees/:id',
  ABSENCE_RECORDS: '/absence-records',
  ABSENCE_RECORD_DETAILS: '/absence-records/:id',
  ABSENCE_TYPES: '/absence-types',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_USERS: '/settings/users',
  SETTINGS_BILLING: '/settings/billing',
  SETTINGS_EMAIL: '/settings/email',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  PROFILE: '/profile',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_COMPANIES: '/admin/companies',
  ADMIN_USERS: '/admin/users',
  ADMIN_STATISTICS: '/admin/statistics',
  ADMIN_LOGS: '/admin/logs',
} as const;

export const ROLES = {
  OWNER: 'owner',
  ADMINISTRATOR: 'administrator',
  USER: 'user',
} as const;

export const EMPLOYEE_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TERMINATED: 'terminated',
  ON_LEAVE: 'on_leave',
} as const;

export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERN: 'intern',
} as const;

export const ABSENCE_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  IN_REVIEW: 'in_review',
} as const;

export const ABSENCE_SOURCES = {
  MANUAL: 'manual',
  EMAIL: 'email',
  IMPORT: 'import',
  API: 'api',
} as const;

export const EMAIL_PROVIDERS = {
  OUTLOOK: 'outlook',
  GMAIL: 'gmail',
  EXCHANGE: 'exchange',
  IMAP: 'imap',
  POP3: 'pop3',
} as const;

export const AI_PROVIDERS = {
  GROK: 'grok',
  OPENAI: 'openai',
  CLAUDE: 'claude',
  LOCAL: 'local',
} as const;

export const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const;

export const SUBSCRIPTION_STATUSES = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
} as const;

export const NOTIFICATION_TYPES = {
  ABSENCE_DETECTED: 'absence_detected',
  ABSENCE_APPROVED: 'absence_approved',
  ABSENCE_REJECTED: 'absence_rejected',
  SYSTEM_ALERT: 'system_alert',
  BILLING_ALERT: 'billing_alert',
} as const;

export const COMPANY_SIZE_RANGES = {
  SMALL: '1-10',
  MEDIUM: '11-50',
  LARGE: '51-200',
  ENTERPRISE: '201-500',
  VERY_LARGE: '500+',
} as const;

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  AUD: 'AUD',
  JPY: 'JPY',
  CHF: 'CHF',
  SEK: 'SEK',
  NOK: 'NOK',
  DKK: 'DKK',
} as const;

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Copenhagen',
  'Europe/Oslo',
  'Europe/Zurich',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Seoul',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
] as const;

export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  NL: 'nl',
  SV: 'sv',
  DA: 'da',
  NO: 'no',
  JA: 'ja',
  KO: 'ko',
  ZH: 'zh',
} as const;

export const DEFAULT_ABSENCE_TYPES = [
  {
    name: 'Sick Leave',
    code: 'SICK',
    description: 'Time off due to illness or medical appointments',
    isPaid: true,
    requiresApproval: false,
    maxDaysPerYear: 10,
    advanceNoticeDays: 0,
    color: '#ef4444',
  },
  {
    name: 'Vacation',
    code: 'VACATION',
    description: 'Planned time off for rest and relaxation',
    isPaid: true,
    requiresApproval: true,
    maxDaysPerYear: 25,
    advanceNoticeDays: 14,
    color: '#22c55e',
  },
  {
    name: 'Personal Leave',
    code: 'PERSONAL',
    description: 'Time off for personal matters',
    isPaid: false,
    requiresApproval: true,
    maxDaysPerYear: 5,
    advanceNoticeDays: 3,
    color: '#3b82f6',
  },
  {
    name: 'Maternity Leave',
    code: 'MATERNITY',
    description: 'Time off for maternity leave',
    isPaid: true,
    requiresApproval: true,
    maxDaysPerYear: 120,
    advanceNoticeDays: 30,
    color: '#ec4899',
  },
  {
    name: 'Paternity Leave',
    code: 'PATERNITY',
    description: 'Time off for paternity leave',
    isPaid: true,
    requiresApproval: true,
    maxDaysPerYear: 14,
    advanceNoticeDays: 30,
    color: '#06b6d4',
  },
  {
    name: 'Bereavement Leave',
    code: 'BEREAVEMENT',
    description: 'Time off due to death of a family member',
    isPaid: true,
    requiresApproval: false,
    maxDaysPerYear: 5,
    advanceNoticeDays: 0,
    color: '#64748b',
  },
] as const;

export const PAGINATION_LIMITS = {
  DEFAULT: 20,
  MIN: 1,
  MAX: 100,
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD: {
    MIN_LENGTH: 8,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  COMPANY_SLUG: /^[a-z0-9-]+$/,
  EMPLOYEE_ID: /^[A-Z0-9-]+$/,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  CATEGORIES: {
    AVATAR: 'avatar',
    COMPANY_LOGO: 'company-logo',
    ABSENCE_ATTACHMENT: 'absence-attachment',
    EMPLOYEE_DOCUMENT: 'employee-document',
    IMPORT_FILE: 'import-file',
  },
} as const;

export const RATE_LIMITS = {
  LOGIN: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  API: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  FILE_UPLOAD: {
    MAX_REQUESTS: 20,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
} as const;

export const REDIS_KEYS = {
  SESSION: 'session:',
  RATE_LIMIT: 'rate_limit:',
  EMAIL_QUEUE: 'email_queue',
  AI_PROCESSING_QUEUE: 'ai_processing_queue',
  NOTIFICATION_QUEUE: 'notification_queue',
  CACHE_USER: 'cache:user:',
  CACHE_COMPANY: 'cache:company:',
  CACHE_ANALYTICS: 'cache:analytics:',
} as const;

export const QUEUE_NAMES = {
  EMAIL_PROCESSING: 'email-processing',
  AI_PROCESSING: 'ai-processing',
  NOTIFICATION: 'notification',
  ANALYTICS: 'analytics',
  EXPORT: 'export',
} as const;

export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_COMPANY: 'join-company',
  LEAVE_COMPANY: 'leave-company',
  ABSENCE_CREATED: 'absence-created',
  ABSENCE_UPDATED: 'absence-updated',
  ABSENCE_APPROVED: 'absence-approved',
  ABSENCE_REJECTED: 'absence-rejected',
  EMPLOYEE_UPDATED: 'employee-updated',
  NOTIFICATION_CREATED: 'notification-created',
  ANALYTICS_UPDATED: 'analytics-updated',
  SYSTEM_ALERT: 'system-alert',
} as const;

export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  
  // Authorization errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  COMPANY_ACCESS_DENIED: 'COMPANY_ACCESS_DENIED',
  RESOURCE_ACCESS_DENIED: 'RESOURCE_ACCESS_DENIED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_SLUG: 'DUPLICATE_SLUG',
  INVALID_EMAIL: 'INVALID_EMAIL',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Business logic errors
  ABSENCE_OVERLAP: 'ABSENCE_OVERLAP',
  ABSENCE_LIMIT_EXCEEDED: 'ABSENCE_LIMIT_EXCEEDED',
  EMPLOYEE_INACTIVE: 'EMPLOYEE_INACTIVE',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  USAGE_LIMIT_EXCEEDED: 'USAGE_LIMIT_EXCEEDED',
  
  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  EMAIL_SEND_ERROR: 'EMAIL_SEND_ERROR',
  AI_PROCESSING_ERROR: 'AI_PROCESSING_ERROR',
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  EMPLOYEE_CREATED: 'Employee created successfully',
  EMPLOYEE_UPDATED: 'Employee updated successfully',
  EMPLOYEE_DELETED: 'Employee deleted successfully',
  ABSENCE_CREATED: 'Absence record created successfully',
  ABSENCE_UPDATED: 'Absence record updated successfully',
  ABSENCE_APPROVED: 'Absence record approved successfully',
  ABSENCE_REJECTED: 'Absence record rejected successfully',
  ABSENCE_DELETED: 'Absence record deleted successfully',
  EMAIL_INTEGRATION_CREATED: 'Email integration created successfully',
  EMAIL_INTEGRATION_UPDATED: 'Email integration updated successfully',
  EMAIL_INTEGRATION_DELETED: 'Email integration deleted successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  COMPANY_UPDATED: 'Company updated successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  IMPORT_SUCCESSFUL: 'Import completed successfully',
  EXPORT_SUCCESSFUL: 'Export completed successfully',
} as const; 