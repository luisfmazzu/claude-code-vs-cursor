# Employee Absenteeism Tracking SaaS - Deployment Guide

## 📋 Deployment Overview

This guide provides comprehensive instructions for deploying the Employee Absenteeism Tracking SaaS platform in production environments. The platform consists of a Next.js frontend, Nest.js backend, and Supabase database.

## 🏗️ Architecture Overview

### Production Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │     Vercel      │    │   Railway       │
│      CDN        │────│   Frontend      │────│   Backend       │
│                 │    │   (Next.js)     │    │   (Nest.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                └───────────────────────┘
                                          │
                                ┌─────────────────┐
                                │   Supabase      │
                                │   Database      │
                                │   (PostgreSQL)  │
                                └─────────────────┘
```

### Key Components
- **Frontend**: Next.js 14 deployed on Vercel
- **Backend**: Nest.js API deployed on Railway
- **Database**: Supabase PostgreSQL
- **CDN**: Cloudflare for static assets
- **Monitoring**: Sentry for error tracking
- **Analytics**: Google Analytics + Mixpanel

## 🚀 Prerequisites

### Required Accounts
- [ ] **Vercel Account**: For frontend deployment
- [ ] **Railway Account**: For backend deployment
- [ ] **Supabase Account**: For database hosting
- [ ] **Cloudflare Account**: For CDN and DNS
- [ ] **Stripe Account**: For payment processing
- [ ] **Sentry Account**: For error monitoring
- [ ] **Google Analytics**: For web analytics

### Development Tools
- [ ] **Node.js**: Version 18+ installed
- [ ] **npm**: Version 8+ installed
- [ ] **Git**: Version control
- [ ] **Docker**: For containerization (optional)
- [ ] **Vercel CLI**: For frontend deployment
- [ ] **Railway CLI**: For backend deployment

## 📦 Environment Setup

### Environment Variables

#### Frontend (.env.local)
```bash
# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token

# External Services
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

#### Backend (.env)
```bash
# Application
NODE_ENV=production
PORT=3001
APP_URL=https://your-domain.com
API_URL=https://api.your-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AI Integration
GROK_API_KEY=your-grok-api-key
GROK_API_URL=https://api.grok.ai/v1

# External Services
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
SENTRY_DSN=https://your-sentry-dsn

# File Storage
SUPABASE_STORAGE_BUCKET=employee-tracking-files
```

## 🗄️ Database Deployment

### Supabase Setup

#### 1. Create Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project (or use existing)
supabase projects create employee-tracking-prod
```

#### 2. Database Schema Migration
```bash
# Initialize Supabase in your project
supabase init

# Create migration files
supabase migration new create_initial_schema

# Apply migrations
supabase db push
```

#### 3. Row Level Security Setup
```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company data isolation" ON companies
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

#### 4. Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_employee_id ON employees(employee_id, company_id);

CREATE INDEX idx_absences_employee_id ON absences(employee_id);
CREATE INDEX idx_absences_start_date ON absences(start_date);
CREATE INDEX idx_absences_type ON absences(type);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_ai_transactions_company_id ON ai_transactions(company_id);
CREATE INDEX idx_ai_transactions_created_at ON ai_transactions(created_at);
```

## 🖥️ Backend Deployment

### Railway Deployment

#### 1. Railway Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new employee-tracking-api
```

#### 2. Backend Configuration
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Build application
npm run build

# Create Dockerfile
cat > Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main.js"]
EOF
```

#### 3. Deploy to Railway
```bash
# Deploy to Railway
railway up

# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set DATABASE_URL=your-database-url
railway variables set JWT_SECRET=your-jwt-secret
railway variables set STRIPE_SECRET_KEY=your-stripe-key
railway variables set GROK_API_KEY=your-grok-key

# Configure custom domain
railway domain add api.your-domain.com
```

#### 4. Health Check Setup
```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
  }
}
```

### Alternative: Docker Deployment

#### 1. Create Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["node", "dist/main.js"]
```

#### 2. Docker Compose for Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=employee_tracking
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## 🌐 Frontend Deployment

### Vercel Deployment

#### 1. Vercel Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build application
npm run build
```

#### 2. Vercel Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.your-domain.com/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://your-domain.com",
    "NEXT_PUBLIC_API_URL": "https://api.your-domain.com"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### 3. Deploy to Vercel
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add NEXT_PUBLIC_GA_ID
vercel env add NEXT_PUBLIC_RECAPTCHA_SITE_KEY

# Configure custom domain
vercel domains add your-domain.com
```

#### 4. Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/overview',
        permanent: true,
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
```

## 🔧 Infrastructure Configuration

### Cloudflare Setup

#### 1. DNS Configuration
```
# A Records
@       1.2.3.4    (your-domain.com)
www     1.2.3.4    (www.your-domain.com)

# CNAME Records
api     api.your-domain.com.vercel.app
cdn     cdn.your-domain.com
```

#### 2. Cloudflare Settings
```javascript
// Cloudflare Workers (optional)
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Security headers
  const headers = new Headers({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  });

  // Cache static assets
  if (url.pathname.startsWith('/static/')) {
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000');
    return newResponse;
  }

  return fetch(request);
}
```

### SSL/TLS Configuration
```bash
# Cloudflare SSL/TLS settings
- SSL/TLS encryption mode: Full (strict)
- Always Use HTTPS: On
- Minimum TLS Version: 1.2
- TLS 1.3: On
- Automatic HTTPS Rewrites: On
- Certificate Transparency Monitoring: On
```

## 📊 Monitoring & Analytics

### Sentry Setup

#### 1. Frontend Sentry Configuration
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production
  tracesSampleRate: 1.0,
  
  // Capture unhandled promise rejections
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', 'your-domain.com', /^\//],
    }),
  ],
  
  // Environment
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    if (event.exception) {
      const error = hint.originalException;
      console.error('Sentry Error:', error);
    }
    return event;
  },
});
```

#### 2. Backend Sentry Configuration
```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error filter
app.use(Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Only send 500 errors to Sentry
    return error.status >= 500;
  },
}));
```

### Google Analytics Setup
```javascript
// lib/analytics.js
import { GoogleAnalytics } from 'nextjs-google-analytics';

export function Analytics() {
  return (
    <GoogleAnalytics 
      gaMeasurementId={process.env.NEXT_PUBLIC_GA_ID}
      trackPageViews={true}
    />
  );
}

// Track custom events
export function trackEvent(eventName, parameters = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}
```

### Uptime Monitoring
```javascript
// monitoring/uptime.js
const axios = require('axios');

const endpoints = [
  'https://your-domain.com/health',
  'https://api.your-domain.com/health',
];

async function checkUptime() {
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, { timeout: 5000 });
      
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      console.log(`✅ ${endpoint} - OK`);
    } catch (error) {
      console.error(`❌ ${endpoint} - ${error.message}`);
      
      // Send alert (email, Slack, etc.)
      await sendAlert(endpoint, error.message);
    }
  }
}

// Run every 5 minutes
setInterval(checkUptime, 5 * 60 * 1000);
```

## 🔐 Security Configuration

### Security Headers
```javascript
// security.middleware.js
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.stripe.com https://your-project.supabase.co; " +
    "frame-src https://js.stripe.com;"
  );
  next();
}
```

### Rate Limiting
```typescript
// rate-limit.middleware.ts
import { rateLimit } from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});
```

## 📈 Performance Optimization

### Caching Strategy
```javascript
// lib/cache.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class CacheService {
  static async get(key) {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  static async set(key, value, ttl = 3600) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  static async del(key) {
    await redis.del(key);
  }

  static async invalidatePattern(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

### Database Query Optimization
```typescript
// database/queries.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export class QueryService {
  static async getEmployeesWithAbsences(companyId: string) {
    const query = `
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        e.department,
        COUNT(a.id) as absence_count,
        MAX(a.start_date) as last_absence_date
      FROM employees e
      LEFT JOIN absences a ON e.id = a.employee_id
      WHERE e.company_id = $1
      GROUP BY e.id, e.first_name, e.last_name, e.department
      ORDER BY absence_count DESC, e.last_name ASC
    `;
    
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }
}
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] **Code Review**: All code reviewed and approved
- [ ] **Tests**: All tests passing (unit, integration, e2e)
- [ ] **Security**: Security audit completed
- [ ] **Performance**: Performance testing completed
- [ ] **Documentation**: All documentation updated

### Environment Setup
- [ ] **Domains**: Domain names configured and verified
- [ ] **SSL Certificates**: SSL/TLS certificates installed
- [ ] **Environment Variables**: All environment variables set
- [ ] **Database**: Database migrations applied
- [ ] **Secrets**: All secrets securely stored

### Infrastructure
- [ ] **Hosting**: Production hosting configured
- [ ] **CDN**: CDN configured for static assets
- [ ] **Load Balancing**: Load balancer configured (if needed)
- [ ] **Monitoring**: Monitoring and alerting set up
- [ ] **Backup**: Backup strategy implemented

### Security
- [ ] **Security Headers**: Security headers configured
- [ ] **Rate Limiting**: Rate limiting implemented
- [ ] **CORS**: CORS properly configured
- [ ] **Authentication**: Authentication system tested
- [ ] **Authorization**: Role-based access control verified

### Performance
- [ ] **Caching**: Caching strategy implemented
- [ ] **Database Optimization**: Database queries optimized
- [ ] **Asset Optimization**: Assets minified and compressed
- [ ] **CDN**: Static assets served from CDN
- [ ] **Monitoring**: Performance monitoring enabled

### Post-Deployment
- [ ] **Health Checks**: All health checks passing
- [ ] **Monitoring**: Monitoring systems operational
- [ ] **Alerts**: Alert systems configured
- [ ] **Documentation**: Runbook and incident response procedures
- [ ] **Rollback Plan**: Rollback procedures documented

## 🔄 Continuous Deployment

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run security audit
      run: npm audit --audit-level high

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Railway
      uses: railway/cli@v2
      with:
        command: up
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

## 📝 Maintenance & Operations

### Regular Maintenance Tasks
```bash
# Weekly maintenance script
#!/bin/bash

# Update dependencies
npm update

# Run security audit
npm audit

# Check for outdated packages
npm outdated

# Database maintenance
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Clear old logs
find /var/log -name "*.log" -mtime +30 -delete

# Generate backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz

# Upload backup to S3
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://your-backup-bucket/
```

### Monitoring Dashboard
```javascript
// monitoring/dashboard.js
const express = require('express');
const app = express();

app.get('/status', async (req, res) => {
  const status = {
    timestamp: new Date().toISOString(),
    services: {
      api: await checkApiHealth(),
      database: await checkDatabaseHealth(),
      cache: await checkCacheHealth(),
      email: await checkEmailHealth(),
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    },
  };

  res.json(status);
});

async function checkApiHealth() {
  try {
    const response = await fetch('https://api.your-domain.com/health');
    return { status: 'healthy', responseTime: response.time };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

This comprehensive deployment guide provides all the necessary steps and configurations for successfully deploying the Employee Absenteeism Tracking SaaS platform to production.