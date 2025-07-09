# Employee Absenteeism Tracking SaaS

A comprehensive SaaS platform for HR teams to automatically track employee absenteeism by parsing emails with AI (Grok v3).

## 🚀 Features

- **AI-Powered Email Parsing**: Automatically detect and parse absence requests from emails
- **Multi-Tenant Architecture**: Secure company-based data isolation
- **Real-time Dashboard**: Live updates on absence trends and statistics
- **Role-Based Access Control**: Owner, Administrator, and User roles
- **Email Integration**: Connect with Outlook, Gmail, and other email providers
- **CSV Import/Export**: Bulk employee and absence data management
- **Advanced Analytics**: Comprehensive reporting and insights
- **Subscription Management**: Stripe-powered billing and subscription handling
- **Modern UI**: Built with Next.js, TypeScript, and Tailwind CSS

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Query
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL with Row Level Security
- **AI Processing**: Grok v3 (primary), OpenAI (fallback)
- **Caching**: Redis
- **Email**: Nodemailer with multiple provider support
- **Payments**: Stripe
- **File Storage**: AWS S3 or local storage
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSockets for live updates

### Project Structure

```
employee-tracking-cursor/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── company/        # Company management
│   │   ├── user/           # User management
│   │   ├── employee/       # Employee management
│   │   ├── absence-record/ # Absence tracking
│   │   ├── ai-processing/  # AI email parsing
│   │   ├── analytics/      # Reports and analytics
│   │   ├── common/         # Shared utilities
│   │   └── prisma/         # Database service
│   ├── prisma/             # Database schema and migrations
│   └── test/               # Test files
├── frontend/               # Next.js web application
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utilities and configurations
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript types
├── shared/                 # Shared types and constants
│   └── src/
│       ├── types/          # Common TypeScript types
│       └── constants.ts    # Shared constants
├── docs/                   # Documentation
└── docker-compose.yml     # Development services
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm 8+
- Docker and Docker Compose (recommended)
- PostgreSQL 14+ (if not using Docker)
- Redis 6+ (if not using Docker)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd employee-tracking-cursor
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy template and update with your values
   cp docs/development/env-template.env backend/.env
   ```

4. **Start development services**:
   ```bash
   # Start PostgreSQL, Redis, and other services
   docker-compose up -d
   ```

5. **Set up the database**:
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   npm run db:seed
   cd ..
   ```

6. **Start the development servers**:
   ```bash
   npm run dev
   ```

This will start:
- Backend API on http://localhost:3000
- Frontend on http://localhost:3001
- API Documentation on http://localhost:3000/api/docs

## 🔧 Development

### Available Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build all packages for production
- `npm run test` - Run all tests
- `npm run lint` - Run linting on all packages
- `npm run type-check` - Run TypeScript type checking
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with sample data

### Database Management

```bash
# Run migrations
npm run db:migrate

# Reset database
cd backend && npx prisma migrate reset

# Open Prisma Studio
cd backend && npx prisma studio

# Generate Prisma client
cd backend && npx prisma generate
```

### Docker Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Access services
# PostgreSQL: localhost:5432
# Redis: localhost:6379
# pgAdmin: http://localhost:5050
# Mailhog: http://localhost:8025
```

## 📊 Key Features

### AI-Powered Email Processing

The system uses Grok v3 AI to automatically parse employee absence requests from emails:

- **Smart Detection**: Identifies absence requests in natural language
- **Data Extraction**: Extracts employee name, dates, reason, and type
- **Confidence Scoring**: Provides confidence levels for manual review
- **Multi-Provider Support**: Works with various email providers

### Multi-Tenant Architecture

- **Company Isolation**: Each company's data is completely isolated
- **Row Level Security**: Database-level security policies
- **Subscription Management**: Per-company billing and limits
- **Role-Based Access**: Fine-grained permissions within companies

### Real-Time Dashboard

- **Live Updates**: WebSocket-powered real-time notifications
- **Interactive Charts**: Absence trends and analytics
- **Export Capabilities**: PDF and CSV export options
- **Mobile Responsive**: Works on all devices

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Owner, Administrator, User roles
- **Data Encryption**: Sensitive data encrypted at rest
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input sanitization
- **CSRF Protection**: Cross-site request forgery protection

## 🚀 Deployment

### Environment Variables

Key environment variables to configure:

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key

# AI Providers
OPENAI_API_KEY=your-openai-key
GROK_API_KEY=your-grok-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-key

# Email
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

### Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set up production database**:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. **Start production server**:
   ```bash
   npm run start:prod
   ```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run with coverage
npm run test:cov
```

### E2E Tests

```bash
# Run end-to-end tests
npm run test:e2e
```

## 📖 API Documentation

The API documentation is available at `/api/docs` when running in development mode.

### Key Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Company registration
- `GET /api/employees` - List employees
- `POST /api/absence-records` - Create absence record
- `POST /api/ai/process-email` - Process email with AI
- `GET /api/analytics/dashboard` - Dashboard statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please contact [support@employeetracking.com](mailto:support@employeetracking.com) or create an issue on GitHub.

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI analytics
- [ ] Integration with HR systems
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] API rate limiting improvements
- [ ] Enhanced security features

---

**Made with ❤️ by Your Organization** 