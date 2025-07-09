# Employee Absenteeism Tracking SaaS - API Documentation

## 📋 API Overview

### Base Information
- **Base URL**: `https://api.employeetracking.com/v1`
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`
- **Rate Limiting**: 1000 requests/hour per user

### Authentication
All API endpoints require authentication via JWT tokens obtained through the login endpoint.

```http
Authorization: Bearer <jwt_token>
```

## 🔐 Authentication Endpoints

### POST /auth/login
**Description**: Authenticate user and obtain JWT token

**Request Body**:
```json
{
  "email": "user@company.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "name": "John Doe",
      "role": "administrator",
      "companyId": "uuid"
    }
  }
}
```

### POST /auth/refresh
**Description**: Refresh JWT token using refresh token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/logout
**Description**: Invalidate current session

**Response**:
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### POST /auth/forgot-password
**Description**: Request password reset

**Request Body**:
```json
{
  "email": "user@company.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST /auth/reset-password
**Description**: Reset password using token

**Request Body**:
```json
{
  "token": "reset_token",
  "password": "newSecurePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## 🏢 Company Endpoints

### GET /companies/profile
**Description**: Get current user's company profile

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Corporation",
    "email": "admin@acme.com",
    "phone": "+1-555-0123",
    "address": "123 Business St, City, State 12345",
    "subscriptionTier": "professional",
    "employeeCount": 150,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /companies/profile
**Description**: Update company profile

**Request Body**:
```json
{
  "name": "Acme Corporation Updated",
  "email": "admin@acme.com",
  "phone": "+1-555-0123",
  "address": "123 Business St, City, State 12345"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Corporation Updated",
    "email": "admin@acme.com",
    "phone": "+1-555-0123",
    "address": "123 Business St, City, State 12345",
    "subscriptionTier": "professional",
    "employeeCount": 150,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /companies/dashboard
**Description**: Get company dashboard data

**Response**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalEmployees": 150,
      "absentToday": 8,
      "absentThisWeek": 25,
      "absentThisMonth": 67
    },
    "trends": {
      "daily": [
        { "date": "2024-01-01", "count": 5 },
        { "date": "2024-01-02", "count": 8 }
      ],
      "weekly": [
        { "week": "2024-01", "count": 25 },
        { "week": "2024-02", "count": 30 }
      ],
      "monthly": [
        { "month": "2024-01", "count": 67 },
        { "month": "2024-02", "count": 72 }
      ]
    },
    "recentActivity": [
      {
        "id": "uuid",
        "type": "absence_detected",
        "employeeName": "John Doe",
        "reason": "Sick leave",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ],
    "lastEmailProcessed": {
      "timestamp": "2024-01-01T00:00:00Z",
      "count": 3,
      "status": "success"
    }
  }
}
```

## 👥 User Management Endpoints

### GET /users
**Description**: Get all users in company (Admin/Owner only)

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by name or email
- `role`: Filter by role

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@company.com",
        "name": "John Doe",
        "role": "administrator",
        "active": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLogin": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### POST /users
**Description**: Create new user (Admin/Owner only)

**Request Body**:
```json
{
  "email": "newuser@company.com",
  "name": "Jane Smith",
  "role": "user",
  "sendInvitation": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "newuser@company.com",
    "name": "Jane Smith",
    "role": "user",
    "active": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /users/:id
**Description**: Update user (Admin/Owner only)

**Request Body**:
```json
{
  "name": "Jane Smith Updated",
  "role": "administrator",
  "active": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "newuser@company.com",
    "name": "Jane Smith Updated",
    "role": "administrator",
    "active": true,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /users/:id
**Description**: Delete user (Owner only)

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 👨‍💼 Employee Management Endpoints

### GET /employees
**Description**: Get all employees with pagination and filtering

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by name or employee ID
- `department`: Filter by department
- `status`: Filter by status (active, inactive, on_leave)
- `sortBy`: Sort field (name, hireDate, department)
- `sortOrder`: Sort order (asc, desc)

**Response**:
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "uuid",
        "employeeId": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com",
        "department": "Engineering",
        "position": "Software Engineer",
        "hireDate": "2024-01-01",
        "status": "active",
        "recentAbsences": 2,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### GET /employees/:id
**Description**: Get employee details with absence history

**Response**:
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "uuid",
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "department": "Engineering",
      "position": "Software Engineer",
      "hireDate": "2024-01-01",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "absenceHistory": [
      {
        "id": "uuid",
        "type": "sick",
        "startDate": "2024-01-15",
        "endDate": "2024-01-16",
        "reason": "Flu symptoms",
        "status": "approved",
        "createdAt": "2024-01-15T00:00:00Z"
      }
    ],
    "statistics": {
      "totalAbsences": 5,
      "sickDays": 3,
      "vacationDays": 2,
      "personalDays": 0
    }
  }
}
```

### POST /employees
**Description**: Create new employee

**Request Body**:
```json
{
  "employeeId": "EMP002",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "department": "Marketing",
  "position": "Marketing Manager",
  "hireDate": "2024-01-01",
  "status": "active"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "EMP002",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    "department": "Marketing",
    "position": "Marketing Manager",
    "hireDate": "2024-01-01",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /employees/:id
**Description**: Update employee information

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith-Johnson",
  "email": "jane.smith-johnson@company.com",
  "department": "Marketing",
  "position": "Senior Marketing Manager",
  "status": "active"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "EMP002",
    "firstName": "Jane",
    "lastName": "Smith-Johnson",
    "email": "jane.smith-johnson@company.com",
    "department": "Marketing",
    "position": "Senior Marketing Manager",
    "status": "active",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /employees/:id
**Description**: Delete employee

**Response**:
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

### POST /employees/bulk-import
**Description**: Import employees from CSV file

**Request Body** (multipart/form-data):
```
file: CSV file
mapping: JSON object with column mapping
```

**Response**:
```json
{
  "success": true,
  "data": {
    "importId": "uuid",
    "status": "processing",
    "totalRows": 100,
    "processedRows": 0,
    "errors": []
  }
}
```

### GET /employees/import-status/:importId
**Description**: Check import status

**Response**:
```json
{
  "success": true,
  "data": {
    "importId": "uuid",
    "status": "completed",
    "totalRows": 100,
    "processedRows": 98,
    "successCount": 95,
    "errorCount": 3,
    "errors": [
      {
        "row": 5,
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## 📅 Absence Management Endpoints

### GET /absences
**Description**: Get absences with filtering and pagination

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `employeeId`: Filter by employee
- `type`: Filter by absence type
- `status`: Filter by status
- `startDate`: Filter by start date range
- `endDate`: Filter by end date range

**Response**:
```json
{
  "success": true,
  "data": {
    "absences": [
      {
        "id": "uuid",
        "employeeId": "uuid",
        "employeeName": "John Doe",
        "type": "sick",
        "startDate": "2024-01-15",
        "endDate": "2024-01-16",
        "reason": "Flu symptoms",
        "status": "approved",
        "createdBy": "uuid",
        "createdAt": "2024-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 250,
      "pages": 13
    }
  }
}
```

### GET /absences/:id
**Description**: Get absence details

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "employee": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "department": "Engineering"
    },
    "type": "sick",
    "startDate": "2024-01-15",
    "endDate": "2024-01-16",
    "reason": "Flu symptoms",
    "status": "approved",
    "createdBy": "uuid",
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
}
```

### POST /absences
**Description**: Create new absence record

**Request Body**:
```json
{
  "employeeId": "uuid",
  "type": "sick",
  "startDate": "2024-01-15",
  "endDate": "2024-01-16",
  "reason": "Flu symptoms",
  "status": "pending"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "type": "sick",
    "startDate": "2024-01-15",
    "endDate": "2024-01-16",
    "reason": "Flu symptoms",
    "status": "pending",
    "createdBy": "uuid",
    "createdAt": "2024-01-15T00:00:00Z"
  }
}
```

### PUT /absences/:id
**Description**: Update absence record

**Request Body**:
```json
{
  "type": "sick",
  "startDate": "2024-01-15",
  "endDate": "2024-01-17",
  "reason": "Flu symptoms - extended",
  "status": "approved"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "type": "sick",
    "startDate": "2024-01-15",
    "endDate": "2024-01-17",
    "reason": "Flu symptoms - extended",
    "status": "approved",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
}
```

### DELETE /absences/:id
**Description**: Delete absence record

**Response**:
```json
{
  "success": true,
  "message": "Absence record deleted successfully"
}
```

## 📧 Email Integration Endpoints

### GET /email-integrations
**Description**: Get email integration settings

**Response**:
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "uuid",
        "provider": "gmail",
        "emailAddress": "hr@company.com",
        "active": true,
        "lastSync": "2024-01-01T00:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### POST /email-integrations
**Description**: Create new email integration

**Request Body**:
```json
{
  "provider": "gmail",
  "emailAddress": "hr@company.com",
  "credentials": {
    "accessToken": "encrypted_token",
    "refreshToken": "encrypted_refresh_token"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "provider": "gmail",
    "emailAddress": "hr@company.com",
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /email-integrations/:id
**Description**: Update email integration

**Request Body**:
```json
{
  "active": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "provider": "gmail",
    "emailAddress": "hr@company.com",
    "active": false,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /email-integrations/:id
**Description**: Delete email integration

**Response**:
```json
{
  "success": true,
  "message": "Email integration deleted successfully"
}
```

### POST /email-integrations/:id/test
**Description**: Test email integration connection

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "lastTest": "2024-01-01T00:00:00Z",
    "messageCount": 156
  }
}
```

### GET /email-integrations/:id/sync-status
**Description**: Get email sync status

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "syncing",
    "lastSync": "2024-01-01T00:00:00Z",
    "processedEmails": 45,
    "totalEmails": 100,
    "errors": []
  }
}
```

## 🤖 AI Processing Endpoints

### GET /ai-transactions
**Description**: Get AI processing transaction history

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: Filter by transaction type
- `status`: Filter by status
- `startDate`: Filter by date range
- `endDate`: Filter by date range

**Response**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "email_parsing",
        "status": "success",
        "tokensUsed": 1250,
        "processingTime": 2.5,
        "createdAt": "2024-01-01T00:00:00Z",
        "result": {
          "employeesProcessed": 3,
          "absencesDetected": 2
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "pages": 25
    },
    "summary": {
      "totalTransactions": 500,
      "totalTokensUsed": 125000,
      "averageProcessingTime": 2.1,
      "successRate": 0.98
    }
  }
}
```

### GET /ai-transactions/:id
**Description**: Get AI transaction details

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "email_parsing",
    "status": "success",
    "tokensUsed": 1250,
    "processingTime": 2.5,
    "inputData": {
      "emailContent": "Subject: Sick Leave Request...",
      "emailFrom": "john.doe@company.com"
    },
    "outputData": {
      "employeesProcessed": [
        {
          "name": "John Doe",
          "absence": {
            "type": "sick",
            "startDate": "2024-01-15",
            "endDate": "2024-01-16",
            "reason": "Flu symptoms"
          }
        }
      ]
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### POST /ai-transactions/process-email
**Description**: Manually process email content

**Request Body**:
```json
{
  "emailContent": "Subject: Sick Leave Request\n\nHi, I will be out sick today and tomorrow...",
  "emailFrom": "john.doe@company.com",
  "emailDate": "2024-01-15T00:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "status": "processing",
    "estimatedTime": 30
  }
}
```

### POST /ai-transactions/process-csv
**Description**: Process CSV data with AI

**Request Body** (multipart/form-data):
```
file: CSV file
type: "employees" or "absences"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "status": "processing",
    "estimatedTime": 60
  }
}
```

## 💳 Billing & Subscription Endpoints

### GET /billing/subscription
**Description**: Get current subscription details

**Response**:
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_1234567890",
      "status": "active",
      "plan": "professional",
      "currentPeriodStart": "2024-01-01T00:00:00Z",
      "currentPeriodEnd": "2024-02-01T00:00:00Z",
      "cancelAtPeriodEnd": false,
      "trialEnd": null
    },
    "usage": {
      "employees": 150,
      "maxEmployees": 500,
      "aiTransactions": 1250,
      "maxAiTransactions": 5000
    }
  }
}
```

### POST /billing/subscription/upgrade
**Description**: Upgrade subscription plan

**Request Body**:
```json
{
  "planId": "enterprise",
  "prorationBehavior": "create_prorations"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_1234567890",
      "status": "active",
      "plan": "enterprise",
      "currentPeriodStart": "2024-01-01T00:00:00Z",
      "currentPeriodEnd": "2024-02-01T00:00:00Z"
    },
    "prorationAmount": 250.00
  }
}
```

### POST /billing/subscription/cancel
**Description**: Cancel subscription

**Request Body**:
```json
{
  "cancelAtPeriodEnd": true,
  "cancellationReason": "Company downsizing"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_1234567890",
      "status": "active",
      "cancelAtPeriodEnd": true,
      "canceledAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### GET /billing/invoices
**Description**: Get billing invoices

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "inv_1234567890",
        "number": "INV-2024-001",
        "status": "paid",
        "amount": 99.00,
        "currency": "usd",
        "periodStart": "2024-01-01T00:00:00Z",
        "periodEnd": "2024-02-01T00:00:00Z",
        "paidAt": "2024-01-01T00:00:00Z",
        "invoiceUrl": "https://..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "pages": 1
    }
  }
}
```

### GET /billing/payment-methods
**Description**: Get payment methods

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentMethods": [
      {
        "id": "pm_1234567890",
        "type": "card",
        "card": {
          "brand": "visa",
          "last4": "4242",
          "expMonth": 12,
          "expYear": 2025
        },
        "isDefault": true
      }
    ]
  }
}
```

### POST /billing/payment-methods
**Description**: Add new payment method

**Request Body**:
```json
{
  "paymentMethodId": "pm_1234567890",
  "setAsDefault": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentMethod": {
      "id": "pm_1234567890",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "expMonth": 12,
        "expYear": 2025
      },
      "isDefault": true
    }
  }
}
```

## 📊 Analytics & Reporting Endpoints

### GET /analytics/dashboard
**Description**: Get dashboard analytics

**Query Parameters**:
- `period`: Time period (7d, 30d, 90d, 1y)
- `startDate`: Custom start date
- `endDate`: Custom end date

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "metrics": {
      "totalAbsences": 245,
      "averageAbsencesPerEmployee": 1.6,
      "absenteeismRate": 0.032,
      "trendDirection": "up",
      "trendPercentage": 12.5
    },
    "breakdown": {
      "byType": {
        "sick": 120,
        "vacation": 85,
        "personal": 25,
        "bereavement": 10,
        "other": 5
      },
      "byDepartment": {
        "Engineering": 45,
        "Sales": 38,
        "Marketing": 25,
        "HR": 12,
        "Finance": 8
      }
    },
    "trends": {
      "daily": [
        { "date": "2024-01-01", "absences": 8 },
        { "date": "2024-01-02", "absences": 12 }
      ],
      "weekly": [
        { "week": "2024-01", "absences": 65 },
        { "week": "2024-02", "absences": 58 }
      ]
    }
  }
}
```

### GET /analytics/reports
**Description**: Get available reports

**Response**:
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "absence-summary",
        "name": "Absence Summary Report",
        "description": "Monthly absence summary by department",
        "type": "scheduled",
        "frequency": "monthly"
      },
      {
        "id": "employee-attendance",
        "name": "Employee Attendance Report",
        "description": "Individual employee attendance patterns",
        "type": "on-demand",
        "frequency": null
      }
    ]
  }
}
```

### POST /analytics/reports/:id/generate
**Description**: Generate report

**Request Body**:
```json
{
  "format": "pdf",
  "parameters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "departments": ["Engineering", "Sales"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "status": "generating",
    "estimatedTime": 120,
    "downloadUrl": null
  }
}
```

### GET /analytics/reports/:reportId/status
**Description**: Check report generation status

**Response**:
```json
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "status": "completed",
    "generatedAt": "2024-01-01T00:00:00Z",
    "downloadUrl": "https://api.employeetracking.com/reports/download/uuid",
    "expiresAt": "2024-01-08T00:00:00Z"
  }
}
```

## ⚙️ Settings Endpoints

### GET /settings
**Description**: Get company settings

**Response**:
```json
{
  "success": true,
  "data": {
    "general": {
      "companyName": "Acme Corporation",
      "timezone": "America/New_York",
      "dateFormat": "MM/DD/YYYY",
      "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    },
    "notifications": {
      "emailNotifications": true,
      "absenceAlerts": true,
      "weeklyReports": true,
      "marketingEmails": false
    },
    "privacy": {
      "dataRetentionDays": 2555,
      "allowDataExport": true,
      "requireTwoFactor": false
    }
  }
}
```

### PUT /settings
**Description**: Update company settings

**Request Body**:
```json
{
  "general": {
    "timezone": "America/Los_Angeles",
    "dateFormat": "DD/MM/YYYY"
  },
  "notifications": {
    "emailNotifications": false,
    "absenceAlerts": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "general": {
      "companyName": "Acme Corporation",
      "timezone": "America/Los_Angeles",
      "dateFormat": "DD/MM/YYYY",
      "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    },
    "notifications": {
      "emailNotifications": false,
      "absenceAlerts": true,
      "weeklyReports": true,
      "marketingEmails": false
    }
  }
}
```

## 🔍 Search Endpoints

### GET /search
**Description**: Global search across employees, absences, and transactions

**Query Parameters**:
- `q`: Search query
- `type`: Search type (employees, absences, transactions, all)
- `limit`: Results limit (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "results": {
      "employees": [
        {
          "id": "uuid",
          "name": "John Doe",
          "department": "Engineering",
          "relevance": 0.95
        }
      ],
      "absences": [
        {
          "id": "uuid",
          "employeeName": "John Doe",
          "type": "sick",
          "startDate": "2024-01-15",
          "relevance": 0.85
        }
      ],
      "transactions": []
    },
    "total": 2,
    "query": "John Doe"
  }
}
```

## 📤 Export Endpoints

### POST /export/employees
**Description**: Export employee data

**Request Body**:
```json
{
  "format": "csv",
  "filters": {
    "department": "Engineering",
    "status": "active"
  },
  "fields": ["name", "email", "department", "hireDate"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "exportId": "uuid",
    "status": "processing",
    "estimatedTime": 60
  }
}
```

### POST /export/absences
**Description**: Export absence data

**Request Body**:
```json
{
  "format": "xlsx",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "type": "sick"
  },
  "fields": ["employeeName", "type", "startDate", "endDate", "reason"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "exportId": "uuid",
    "status": "processing",
    "estimatedTime": 90
  }
}
```

### GET /export/:exportId/status
**Description**: Check export status

**Response**:
```json
{
  "success": true,
  "data": {
    "exportId": "uuid",
    "status": "completed",
    "generatedAt": "2024-01-01T00:00:00Z",
    "downloadUrl": "https://api.employeetracking.com/exports/download/uuid",
    "expiresAt": "2024-01-08T00:00:00Z",
    "fileSize": 2048576,
    "recordCount": 1250
  }
}
```

## 🔔 Webhooks

### Webhook Events
The API supports webhooks for real-time notifications:

- `employee.created`
- `employee.updated`
- `employee.deleted`
- `absence.created`
- `absence.updated`
- `absence.deleted`
- `email.processed`
- `ai.transaction.completed`
- `subscription.updated`
- `subscription.cancelled`

### Webhook Payload Format
```json
{
  "event": "employee.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": "uuid",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "department": "Engineering",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## 📋 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `SUBSCRIPTION_REQUIRED`: Feature requires active subscription
- `INTERNAL_ERROR`: Internal server error

## 📋 Rate Limiting

### Rate Limits
- **Standard Users**: 1000 requests/hour
- **Premium Users**: 5000 requests/hour
- **Enterprise Users**: 10000 requests/hour

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200
```

## 🔐 Security

### Authentication
- JWT tokens with 1-hour expiration
- Refresh tokens with 30-day expiration
- Secure token storage required

### API Security
- HTTPS required for all requests
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- CORS properly configured

### Data Privacy
- PII encryption at rest
- Audit logging for sensitive operations
- GDPR compliance features
- Data retention policies

## 📚 SDK Examples

### JavaScript/Node.js
```javascript
const EmployeeTrackingAPI = require('@employeetracking/api-client');

const client = new EmployeeTrackingAPI({
  baseURL: 'https://api.employeetracking.com/v1',
  apiKey: 'your-api-key'
});

// Get employees
const employees = await client.employees.list({
  page: 1,
  limit: 20,
  department: 'Engineering'
});

// Create absence
const absence = await client.absences.create({
  employeeId: 'uuid',
  type: 'sick',
  startDate: '2024-01-15',
  endDate: '2024-01-16',
  reason: 'Flu symptoms'
});
```

### Python
```python
from employee_tracking_api import EmployeeTrackingClient

client = EmployeeTrackingClient(
    base_url='https://api.employeetracking.com/v1',
    api_key='your-api-key'
)

# Get employees
employees = client.employees.list(
    page=1,
    limit=20,
    department='Engineering'
)

# Create absence
absence = client.absences.create(
    employee_id='uuid',
    type='sick',
    start_date='2024-01-15',
    end_date='2024-01-16',
    reason='Flu symptoms'
)
```

This comprehensive API documentation provides all the necessary endpoints and examples for integrating with the Employee Absenteeism Tracking SaaS platform.