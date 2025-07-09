# Employee Absenteeism Tracking SaaS - Deployment Guide

## 🚀 Production Deployment Checklist

### **Prerequisites**
- [ ] Domain name configured with DNS
- [ ] SSL certificate (Let's Encrypt recommended)
- [ ] Server with Docker and Docker Compose
- [ ] Supabase project created
- [ ] Stripe account configured
- [ ] Email service configured (Gmail/SMTP)

### **1. Environment Setup**

#### **Supabase Setup**
1. Create project at [supabase.com](https://supabase.com)
2. Run the `database.sql` script in SQL Editor
3. Copy Project URL and API keys

#### **Environment Variables**

**Backend (.env)**
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Service role key
SUPABASE_ANON_KEY=eyJ... # Anon key

# Security
JWT_SECRET=your-complex-jwt-secret-key-min-32-chars
BCRYPT_SALT_ROUNDS=12

# Stripe (LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-business-email@company.com
SMTP_PASS=your-app-password

# AI Integration
GROK_API_KEY=your-grok-api-key
GROK_API_URL=https://api.x.ai/v1

# Production Settings
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### **2. Server Setup**

#### **Install Dependencies**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose git nginx certbot python3-certbot-nginx

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

#### **Clone Repository**
```bash
cd /opt
sudo git clone https://github.com/your-username/employee-tracking-claude-code.git
sudo chown -R $USER:$USER employee-tracking-claude-code
cd employee-tracking-claude-code
```

#### **Configure Environment**
```bash
# Copy and edit environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit the files with your actual values
nano backend/.env
nano frontend/.env.local
```

### **3. SSL Certificate Setup**

```bash
# Install SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Update nginx.conf with your domain
sed -i 's/your-domain.com/actual-domain.com/g' nginx.conf
```

### **4. Database Setup**

1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste the entire contents of `database.sql`
3. Run the script to create all tables, policies, and sample data
4. Verify tables are created in Table Editor

### **5. Stripe Configuration**

1. Create Stripe account and get API keys
2. Configure webhook endpoint: `https://your-domain.com/api/billing/webhook`
3. Subscribe to these events:
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### **6. Deploy Application**

```bash
# Build and start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f

# Test health endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/health
```

### **7. Monitoring Setup (Optional)**

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access dashboards
# Grafana: http://your-domain.com:3030 (admin/admin123)
# Prometheus: http://your-domain.com:9090
```

### **8. Post-Deployment Verification**

#### **Frontend Tests**
- [ ] Landing page loads
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard displays
- [ ] Employee management works
- [ ] CSV import works
- [ ] Billing page loads

#### **Backend Tests**
- [ ] Health endpoint: `GET /health`
- [ ] API documentation: `GET /api`
- [ ] Authentication: `POST /auth/login`
- [ ] Employee CRUD: `GET /employees`

#### **Database Tests**
- [ ] Tables created with proper structure
- [ ] RLS policies working
- [ ] Sample data inserted
- [ ] Company isolation working

### **9. Security Checklist**

- [ ] HTTPS enabled with valid SSL
- [ ] Environment variables secured
- [ ] Database RLS policies active
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] File upload restrictions
- [ ] JWT secrets are strong
- [ ] CORS properly configured

### **10. Backup Strategy**

#### **Database Backup**
```bash
# Automated daily backups
0 2 * * * pg_dump "postgresql://postgres:[PASSWORD]@db.supabase.co:5432/postgres" | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

#### **Application Backup**
```bash
# Backup uploaded files and logs
0 3 * * * tar -czf /backups/app_$(date +\%Y\%m\%d).tar.gz /opt/employee-tracking-claude-code/backend/uploads /opt/employee-tracking-claude-code/backend/logs
```

## 🔧 **Alternative Deployment Options**

### **Vercel (Frontend) + Railway/Render (Backend)**

#### **Frontend on Vercel**
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### **Backend on Railway**
1. Connect GitHub repo to Railway
2. Add environment variables
3. Configure custom domain

### **AWS/GCP/Azure Deployment**

#### **Using Container Services**
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances

#### **Using Kubernetes**
- Create Kubernetes manifests
- Deploy to EKS/GKE/AKS
- Configure ingress and load balancers

## 🚨 **Troubleshooting**

### **Common Issues**

**Database Connection Errors**
- Verify Supabase URL and keys
- Check network connectivity
- Ensure RLS policies are correct

**Authentication Issues**
- Verify JWT secret
- Check token expiration
- Validate user permissions

**File Upload Problems**
- Check file size limits
- Verify upload directory permissions
- Ensure multipart parsing is enabled

**Performance Issues**
- Enable Redis caching
- Optimize database queries
- Configure CDN for static assets

### **Monitoring Commands**

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check resource usage
docker stats

# Database connections
docker-compose exec backend npm run db:status
```

## 📞 **Support**

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Test health endpoints
4. Review security settings
5. Contact support if needed

---

**🎉 Congratulations! Your Employee Absenteeism Tracking SaaS is now live in production!**