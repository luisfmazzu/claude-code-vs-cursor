-- Employee Absenteeism Tracking SaaS Database Schema
-- PostgreSQL with Supabase Extensions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Companies table (tenant root)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    size_range VARCHAR(50) CHECK (size_range IN ('1-10', '11-50', '51-200', '201-500', '500+')),
    email_domain VARCHAR(255),
    logo_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    subscription_status VARCHAR(50) DEFAULT 'trial' CHECK (
        subscription_status IN ('trial', 'active', 'suspended', 'cancelled', 'past_due')
    ),
    subscription_tier VARCHAR(50) CHECK (
        subscription_tier IN ('basic', 'professional', 'enterprise')
    ),
    stripe_customer_id VARCHAR(255) UNIQUE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'administrator', 'user')),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_email UNIQUE (company_id, email)
);

-- Employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id VARCHAR(100),
    email VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    termination_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'terminated', 'on_leave')
    ),
    manager_id UUID REFERENCES employees(id),
    employment_type VARCHAR(50) CHECK (
        employment_type IN ('full_time', 'part_time', 'contract', 'intern')
    ),
    work_location VARCHAR(100),
    salary_currency VARCHAR(3) DEFAULT 'USD',
    salary_amount DECIMAL(12,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_employee_id UNIQUE (company_id, employee_id),
    CONSTRAINT check_termination_after_hire CHECK (
        termination_date IS NULL OR termination_date >= hire_date
    )
);

-- Absence types configuration
CREATE TABLE absence_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    is_paid BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT true,
    max_days_per_year INTEGER,
    advance_notice_days INTEGER DEFAULT 0,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_absence_type UNIQUE (company_id, code)
);

-- Absence records table
CREATE TABLE absence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    absence_type_id UUID NOT NULL REFERENCES absence_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,2) GENERATED ALWAYS AS (
        CASE 
            WHEN start_date = end_date THEN 1.0
            ELSE end_date - start_date + 1
        END
    ) STORED,
    reason TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'rejected', 'cancelled', 'in_review')
    ),
    source VARCHAR(50) DEFAULT 'manual' CHECK (
        source IN ('manual', 'email', 'import', 'api')
    ),
    source_reference TEXT, -- Email ID, import batch ID, etc.
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_by UUID REFERENCES users(id),
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT check_confidence_when_ai CHECK (
        (source != 'email' AND source != 'import') OR confidence_score IS NOT NULL
    )
);

-- Email integrations table
CREATE TABLE email_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (
        provider IN ('outlook', 'gmail', 'exchange', 'imap', 'pop3')
    ),
    configuration JSONB NOT NULL,
    encrypted_credentials TEXT, -- Encrypted with app key
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50) DEFAULT 'disconnected' CHECK (
        sync_status IN ('connected', 'disconnected', 'error', 'syncing', 'rate_limited')
    ),
    error_message TEXT,
    sync_frequency_minutes INTEGER DEFAULT 5,
    total_emails_processed INTEGER DEFAULT 0,
    last_email_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI processing logs table
CREATE TABLE ai_processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    processing_type VARCHAR(50) NOT NULL CHECK (
        processing_type IN ('email_parsing', 'csv_parsing', 'pattern_analysis', 'anomaly_detection')
    ),
    provider VARCHAR(50) NOT NULL CHECK (
        provider IN ('grok', 'openai', 'claude', 'local')
    ),
    input_data JSONB,
    ai_response JSONB,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    status VARCHAR(50) NOT NULL CHECK (
        status IN ('processing', 'completed', 'failed', 'manual_review', 'timeout')
    ),
    error_message TEXT,
    processing_time_ms INTEGER,
    cost_usd DECIMAL(10,4),
    tokens_used INTEGER,
    related_record_id UUID, -- absence_record.id, employee.id, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing and subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    plan_price DECIMAL(10,2) NOT NULL,
    plan_interval VARCHAR(20) NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking for billing
CREATE TABLE usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (
        metric_type IN ('ai_calls', 'emails_processed', 'employees_managed', 'api_requests')
    ),
    metric_value INTEGER NOT NULL DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_metric_period UNIQUE (company_id, metric_type, period_start)
);

-- =====================================================
-- AUDIT AND NOTIFICATIONS
-- =====================================================

-- Audit log for compliance
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Notifications system
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (
        type IN ('absence_detected', 'absence_approved', 'absence_rejected', 'system_alert', 'billing_alert')
    ),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Companies
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_subscription_status ON companies(subscription_status);

-- Users
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Employees
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_manager ON employees(manager_id);

-- Absence Records
CREATE INDEX idx_absence_records_company_id ON absence_records(company_id);
CREATE INDEX idx_absence_records_employee_id ON absence_records(employee_id);
CREATE INDEX idx_absence_records_date_range ON absence_records(start_date, end_date);
CREATE INDEX idx_absence_records_status ON absence_records(status);
CREATE INDEX idx_absence_records_source ON absence_records(source);
CREATE INDEX idx_absence_records_created_at ON absence_records(created_at);

-- AI Processing Logs
CREATE INDEX idx_ai_logs_company_date ON ai_processing_logs(company_id, created_at);
CREATE INDEX idx_ai_logs_status ON ai_processing_logs(status);
CREATE INDEX idx_ai_logs_type ON ai_processing_logs(processing_type);
CREATE INDEX idx_ai_logs_provider ON ai_processing_logs(provider);

-- Email Integrations
CREATE INDEX idx_email_integrations_company_id ON email_integrations(company_id);
CREATE INDEX idx_email_integrations_active ON email_integrations(is_active) WHERE is_active = true;

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Audit Log
CREATE INDEX idx_audit_log_company_id ON audit_log(company_id);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Company isolation policies
CREATE POLICY tenant_isolation_companies ON companies
    FOR ALL USING (id = (current_setting('app.current_company_id', true))::UUID);

CREATE POLICY tenant_isolation_users ON users
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::UUID);

CREATE POLICY tenant_isolation_employees ON employees
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::UUID);

CREATE POLICY tenant_isolation_absence_types ON absence_types
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::UUID);

CREATE POLICY tenant_isolation_absence_records ON absence_records
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::UUID);

CREATE POLICY tenant_isolation_email_integrations ON email_integrations
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::UUID);

CREATE POLICY tenant_isolation_ai_processing_logs ON ai_processing_logs
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::UUID);

CREATE POLICY tenant_isolation_subscriptions ON subscriptions
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::UUID);

CREATE POLICY tenant_isolation_usage_metrics ON usage_metrics
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::UUID);

CREATE POLICY tenant_isolation_audit_log ON audit_log
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::UUID);

CREATE POLICY tenant_isolation_notifications ON notifications
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::UUID);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_absence_types_updated_at 
    BEFORE UPDATE ON absence_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_absence_records_updated_at 
    BEFORE UPDATE ON absence_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_integrations_updated_at 
    BEFORE UPDATE ON email_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION audit_log_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (company_id, table_name, record_id, action, old_values, changed_by, ip_address)
        VALUES (
            OLD.company_id,
            TG_TABLE_NAME,
            OLD.id,
            TG_OP,
            row_to_json(OLD),
            (current_setting('app.current_user_id', true))::UUID,
            (current_setting('app.client_ip', true))::INET
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (company_id, table_name, record_id, action, old_values, new_values, changed_by, ip_address)
        VALUES (
            NEW.company_id,
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            row_to_json(OLD),
            row_to_json(NEW),
            (current_setting('app.current_user_id', true))::UUID,
            (current_setting('app.client_ip', true))::INET
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (company_id, table_name, record_id, action, new_values, changed_by, ip_address)
        VALUES (
            NEW.company_id,
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            row_to_json(NEW),
            (current_setting('app.current_user_id', true))::UUID,
            (current_setting('app.client_ip', true))::INET
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_absence_records 
    AFTER INSERT OR UPDATE OR DELETE ON absence_records
    FOR EACH ROW EXECUTE FUNCTION audit_log_function();

CREATE TRIGGER audit_employees 
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION audit_log_function();

CREATE TRIGGER audit_users 
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_log_function();

-- =====================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =====================================================

-- Company dashboard summary
CREATE MATERIALIZED VIEW company_dashboard_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT e.id) as total_employees,
    COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) as active_employees,
    COUNT(DISTINCT ar.id) as total_absences,
    COUNT(DISTINCT CASE 
        WHEN ar.start_date >= CURRENT_DATE - INTERVAL '30 days' 
        THEN ar.id 
    END) as absences_last_30_days,
    ROUND(
        COUNT(DISTINCT CASE 
            WHEN ar.start_date >= CURRENT_DATE - INTERVAL '30 days' 
            THEN ar.id 
        END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END), 0) * 100,
        2
    ) as monthly_absence_rate,
    COALESCE(SUM(usage.metric_value), 0) as ai_calls_this_month
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
LEFT JOIN absence_records ar ON e.id = ar.employee_id AND ar.status = 'approved'
LEFT JOIN usage_metrics usage ON c.id = usage.company_id 
    AND usage.metric_type = 'ai_calls'
    AND usage.period_start >= DATE_TRUNC('month', CURRENT_DATE)
WHERE c.subscription_status IN ('trial', 'active')
GROUP BY c.id, c.name;

-- Department absence summary
CREATE MATERIALIZED VIEW department_absence_summary AS
SELECT 
    e.company_id,
    COALESCE(e.department, 'Unassigned') as department,
    COUNT(DISTINCT e.id) as total_employees,
    COUNT(DISTINCT ar.id) as total_absences,
    ROUND(AVG(ar.total_days), 2) as avg_absence_days,
    COUNT(DISTINCT CASE 
        WHEN ar.start_date >= CURRENT_DATE - INTERVAL '30 days' 
        THEN ar.id 
    END) as recent_absences
FROM employees e
LEFT JOIN absence_records ar ON e.id = ar.employee_id AND ar.status = 'approved'
WHERE e.status = 'active'
GROUP BY e.company_id, e.department;

-- Refresh materialized views function
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY company_dashboard_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY department_absence_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Default absence types (will be copied for each company)
CREATE TABLE default_absence_types (
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL PRIMARY KEY,
    description TEXT,
    is_paid BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT true,
    advance_notice_days INTEGER DEFAULT 0,
    color VARCHAR(7) DEFAULT '#6B7280'
);

INSERT INTO default_absence_types (name, code, description, is_paid, requires_approval, advance_notice_days, color) VALUES
('Sick Leave', 'SICK', 'Medical illness or injury', true, false, 0, '#EF4444'),
('Personal Leave', 'PERSONAL', 'Personal time off', false, true, 1, '#8B5CF6'),
('Vacation', 'VACATION', 'Paid time off for vacation', true, true, 7, '#10B981'),
('Bereavement', 'BEREAVEMENT', 'Time off for family loss', true, false, 0, '#6B7280'),
('Maternity Leave', 'MATERNITY', 'Maternity leave', true, false, 30, '#F59E0B'),
('Paternity Leave', 'PATERNITY', 'Paternity leave', true, false, 30, '#3B82F6'),
('Emergency Leave', 'EMERGENCY', 'Unexpected emergency', false, false, 0, '#DC2626'),
('Training', 'TRAINING', 'Professional development', true, true, 3, '#059669'),
('Jury Duty', 'JURY', 'Legal obligation', true, false, 1, '#4B5563'),
('Mental Health', 'MENTAL_HEALTH', 'Mental health support', true, false, 0, '#8B5CF6');

-- Function to create default absence types for new companies
CREATE OR REPLACE FUNCTION create_default_absence_types_for_company(company_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO absence_types (company_id, name, code, description, is_paid, requires_approval, advance_notice_days, color)
    SELECT 
        company_id,
        name,
        code,
        description,
        is_paid,
        requires_approval,
        advance_notice_days,
        color
    FROM default_absence_types;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create default absence types for new companies
CREATE OR REPLACE FUNCTION setup_new_company()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default absence types
    PERFORM create_default_absence_types_for_company(NEW.id);
    
    -- Initialize usage metrics for current month
    INSERT INTO usage_metrics (company_id, metric_type, metric_value, period_start, period_end)
    VALUES 
        (NEW.id, 'ai_calls', 0, DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE),
        (NEW.id, 'emails_processed', 0, DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE),
        (NEW.id, 'employees_managed', 0, DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER setup_new_company_trigger
    AFTER INSERT ON companies
    FOR EACH ROW EXECUTE FUNCTION setup_new_company();

-- =====================================================
-- HELPER FUNCTIONS FOR APPLICATION
-- =====================================================

-- Function to get company context for RLS
CREATE OR REPLACE FUNCTION set_company_context(company_uuid UUID, user_uuid UUID DEFAULT NULL, client_ip INET DEFAULT NULL)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_company_id', company_uuid::TEXT, true);
    IF user_uuid IS NOT NULL THEN
        PERFORM set_config('app.current_user_id', user_uuid::TEXT, true);
    END IF;
    IF client_ip IS NOT NULL THEN
        PERFORM set_config('app.client_ip', client_ip::TEXT, true);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate absence statistics
CREATE OR REPLACE FUNCTION calculate_absence_statistics(
    company_uuid UUID,
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_absences BIGINT,
    total_absence_days DECIMAL,
    average_absence_duration DECIMAL,
    most_common_absence_type VARCHAR,
    absence_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as abs_count,
            SUM(ar.total_days) as total_days,
            AVG(ar.total_days) as avg_days,
            COUNT(DISTINCT ar.employee_id) as unique_employees,
            COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') as total_active_employees
        FROM absence_records ar
        JOIN employees e ON ar.employee_id = e.id
        WHERE ar.company_id = company_uuid
        AND ar.start_date >= start_date
        AND ar.end_date <= end_date
        AND ar.status = 'approved'
    ),
    most_common AS (
        SELECT at.name
        FROM absence_records ar
        JOIN absence_types at ON ar.absence_type_id = at.id
        WHERE ar.company_id = company_uuid
        AND ar.start_date >= start_date
        AND ar.end_date <= end_date
        AND ar.status = 'approved'
        GROUP BY at.name
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    SELECT 
        s.abs_count,
        s.total_days,
        ROUND(s.avg_days, 2),
        COALESCE(mc.name, 'N/A')::VARCHAR,
        CASE 
            WHEN s.total_active_employees > 0 
            THEN ROUND((s.unique_employees::DECIMAL / s.total_active_employees) * 100, 2)
            ELSE 0 
        END
    FROM stats s
    CROSS JOIN most_common mc;
END;
$$ LANGUAGE plpgsql; 