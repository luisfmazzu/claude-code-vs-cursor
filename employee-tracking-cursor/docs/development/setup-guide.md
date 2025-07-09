# Development Setup Guide

This guide will help you set up the Employee Absenteeism Tracking SaaS development environment on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Comes with Node.js
- **Docker** and **Docker Compose** - [Download](https://www.docker.com/)
- **Git** - [Download](https://git-scm.com/)

### Recommended Tools
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - Prettier - Code formatter
  - ESLint
  - Tailwind CSS IntelliSense
  - REST Client (for API testing)
  - Docker
  - Prisma (if using Prisma instead of raw SQL)

## Project Structure

```
employee-tracking-cursor/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   ├── lib/            # Utility libraries
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # NestJS backend API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   └── main.ts         # Application entry point
│   ├── test/               # E2E tests
│   ├── package.json
│   └── Dockerfile
├── shared/                  # Shared types and utilities
│   ├── types/              # TypeScript type definitions
│   └── constants/          # Shared constants
├── docs/                   # Documentation
├── docker-compose.yml      # Local development services
├── .env.example           # Environment variables template
└── README.md
```

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd employee-tracking-cursor
```

### 2. Environment Variables

Copy the environment template and configure your local settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/employee_tracking"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-minimum-32-characters"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# AI Provider API Keys
GROK_API_KEY="your-grok-api-key"
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Email Configuration (for transactional emails)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@your-domain.com"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Frontend Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Development Tools
LOG_LEVEL="debug"
NODE_ENV="development"

# Redis Configuration (for queues)
REDIS_URL="redis://localhost:6379"

# File Upload Configuration
UPLOAD_MAX_SIZE="10485760" # 10MB
ALLOWED_FILE_TYPES="text/csv,application/vnd.ms-excel"
```

### 3. Start Development Services

Use Docker Compose to start the required services:

```bash
# Start PostgreSQL, Redis, and other services
docker-compose up -d

# Verify services are running
docker-compose ps
```

The `docker-compose.yml` includes:
- PostgreSQL database
- Redis for queues and caching
- pgAdmin for database management
- Mailhog for email testing (optional)

## Backend Setup (NestJS)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

Run database migrations and seed data:

```bash
# Run migrations (create tables)
npm run db:migrate

# Seed initial data (optional)
npm run db:seed

# Generate database client (if using Prisma)
npm run db:generate
```

If using raw SQL migrations:

```bash
# Apply schema from docs/database/schema.sql
psql $DATABASE_URL -f ../docs/database/schema.sql
```

### 3. Start Backend Development Server

```bash
# Development mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug
```

The backend will be available at `http://localhost:3001`

### 4. API Documentation

Once the backend is running, you can access:
- Swagger UI: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/docs-json`

## Frontend Setup (Next.js)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Frontend Development Server

```bash
# Development mode
npm run dev

# With specific port
npm run dev -- --port 3000
```

The frontend will be available at `http://localhost:3000`

### 3. Build and Test

```bash
# Build for production
npm run build

# Run built application
npm run start

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## Development Workflow

### Code Quality Tools

Both frontend and backend include:

```bash
# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format

# Type checking
npm run type-check

# Pre-commit hooks (if configured)
npm run pre-commit
```

### Database Management

#### Using Docker PostgreSQL

```bash
# Connect to database
docker exec -it employee-tracking-db psql -U postgres -d employee_tracking

# Backup database
docker exec employee-tracking-db pg_dump -U postgres employee_tracking > backup.sql

# Restore database
docker exec -i employee-tracking-db psql -U postgres employee_tracking < backup.sql
```

#### Using pgAdmin

Access pgAdmin at `http://localhost:5050`:
- Email: `admin@admin.com`
- Password: `admin`

Add server connection:
- Host: `postgres` (container name)
- Port: `5432`
- Username: `postgres`
- Password: `password`

### Testing

#### Backend Testing

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Specific test file
npm run test -- employee.service.spec.ts
```

#### Frontend Testing

```bash
cd frontend

# Run all tests
npm run test

# Run specific test
npm run test -- components/Button.test.tsx

# Run tests with coverage
npm run test:coverage

# E2E tests with Playwright
npm run test:e2e
```

## AI Integration Setup

### Setting Up Grok v3 API

1. Sign up for X AI Platform access
2. Generate API key
3. Add to `.env` file
4. Test connection:

```bash
curl -X POST "http://localhost:3001/ai/test-connection" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Fallback AI Providers

Configure OpenAI as fallback:

1. Get OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to environment variables
3. Test fallback mechanism

## Email Integration Development

### Using Mailhog for Development

Mailhog catches emails sent during development:

```bash
# Start Mailhog (included in docker-compose)
docker-compose up -d mailhog

# Access web interface
open http://localhost:8025
```

Configure SendGrid for production-like testing:

1. Create SendGrid account
2. Generate API key
3. Verify sender identity
4. Update environment variables

## Stripe Integration Setup

### Development Mode

1. Create Stripe test account
2. Get test API keys
3. Install Stripe CLI for webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/billing/webhook
```

### Test Payment Flow

Use Stripe test card numbers:
- Success: `4242424242424242`
- Failure: `4000000000000002`

## Debugging

### Backend Debugging

VS Code launch configuration (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/main.ts",
      "args": ["${workspaceFolder}/backend/src/main.ts"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "sourceMaps": true,
      "envFile": "${workspaceFolder}/.env",
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

### Frontend Debugging

Browser debugging with React DevTools:
1. Install React Developer Tools browser extension
2. Use browser dev tools for component inspection
3. Next.js debugging features are enabled in development

### Database Debugging

Enable query logging:

```env
# In .env
DATABASE_LOG_LEVEL="debug"
```

Monitor queries in development:

```bash
# Watch PostgreSQL logs
docker logs -f employee-tracking-db
```

## Performance Optimization

### Development Mode Optimizations

1. **Enable caching:**
```bash
# Redis caching for development
REDIS_URL="redis://localhost:6379"
CACHE_TTL="300" # 5 minutes
```

2. **Database query optimization:**
```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

3. **Frontend optimization:**
```bash
# Analyze bundle size
cd frontend
npm run build
npm run analyze
```

## Common Issues and Solutions

### Issue: Database Connection Failed

**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart database service
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue: Frontend API Calls Failing

**Solution:**
1. Verify backend is running on correct port
2. Check CORS configuration
3. Verify API endpoints in Swagger UI

### Issue: AI API Quota Exceeded

**Solution:**
1. Check current usage in logs
2. Implement rate limiting
3. Configure fallback providers

### Issue: Email Integration Not Working

**Solution:**
1. Verify email service credentials
2. Check Mailhog for development emails
3. Review email templates and configuration

## Additional Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-azuretools.vscode-docker",
    "rangav.vscode-thunder-client",
    "prisma.prisma",
    "redhat.vscode-yaml"
  ]
}
```

### Database GUI Tools

Alternative to pgAdmin:
- **TablePlus** (macOS/Windows)
- **DBeaver** (Cross-platform)
- **DataGrip** (JetBrains)

### API Testing Tools

- **Thunder Client** (VS Code extension)
- **Postman**
- **Insomnia**
- **HTTPie**

## Production Deployment Preparation

### Environment Variables Checklist

Before deploying to production:

- [ ] Change all default passwords and secrets
- [ ] Use production database URLs
- [ ] Configure production AI API keys
- [ ] Set up production email service
- [ ] Configure production Stripe keys
- [ ] Set proper CORS origins
- [ ] Enable SSL/TLS certificates
- [ ] Configure error tracking (Sentry)
- [ ] Set up monitoring and logging

### Build Verification

```bash
# Backend production build
cd backend
npm run build
npm run start:prod

# Frontend production build
cd frontend
npm run build
npm run start
```

## Getting Help

- Check the [troubleshooting guide](./troubleshooting.md)
- Review API documentation at `/api/docs`
- Check application logs
- Consult the [architecture documentation](../architecture/system-architecture.md)

## Next Steps

Once your development environment is set up:

1. Review the [project tasks](../tasks/implementation-roadmap.md)
2. Read the [coding standards](./coding-standards.md)
3. Understand the [testing strategy](./testing-strategy.md)
4. Familiarize yourself with the [API specifications](../api/openapi-spec.yaml) 