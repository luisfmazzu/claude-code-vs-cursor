-- Employee Absenteeism Tracking SaaS Database Schema
-- Supabase PostgreSQL Database Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- ================================================
-- CORE TABLES
-- ================================================

-- Companies table (tenant isolation)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    plan VARCHAR(50) DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
    subscription_tier VARCHAR(50) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (multi-user support)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('owner', 'administrator', 'user')),
    active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table (main entity)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, employee_id)
);

-- Absences table (tracking records)
CREATE TABLE absences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sick', 'vacation', 'personal', 'bereavement', 'jury_duty', 'maternity', 'paternity', 'other')),
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Email integrations table
CREATE TABLE email_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('gmail', 'outlook', 'exchange', 'custom')),
    email_address VARCHAR(255) NOT NULL,
    credentials JSONB NOT NULL,
    active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_errors JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI transactions table (usage tracking)
CREATE TABLE ai_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email_parsing', 'csv_parsing', 'data_analysis')),
    input_data JSONB NOT NULL,
    output_data JSONB,
    tokens_used INTEGER DEFAULT 0,
    processing_time FLOAT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error', 'timeout')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Companies indexes
CREATE INDEX idx_companies_subscription_tier ON companies(subscription_tier);
CREATE INDEX idx_companies_subscription_status ON companies(subscription_status);

-- Users indexes
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_role ON users(role);

-- Employees indexes
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_name ON employees(first_name, last_name);

-- Absences indexes
CREATE INDEX idx_absences_employee_id ON absences(employee_id);
CREATE INDEX idx_absences_start_date ON absences(start_date);
CREATE INDEX idx_absences_type ON absences(type);
CREATE INDEX idx_absences_status ON absences(status);
CREATE INDEX idx_absences_date_range ON absences(start_date, end_date);

-- Email integrations indexes
CREATE INDEX idx_email_integrations_company_id ON email_integrations(company_id);
CREATE INDEX idx_email_integrations_provider ON email_integrations(provider);
CREATE INDEX idx_email_integrations_active ON email_integrations(active);

-- AI transactions indexes
CREATE INDEX idx_ai_transactions_company_id ON ai_transactions(company_id);
CREATE INDEX idx_ai_transactions_type ON ai_transactions(type);
CREATE INDEX idx_ai_transactions_status ON ai_transactions(status);
CREATE INDEX idx_ai_transactions_created_at ON ai_transactions(created_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_company_id ON notifications(company_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Companies RLS policies
CREATE POLICY "Company isolation" ON companies
    FOR ALL
    USING (id = (current_setting('app.current_company_id', true))::uuid);

-- Users RLS policies
CREATE POLICY "User company access" ON users
    FOR ALL
    USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- Employees RLS policies
CREATE POLICY "Employee company access" ON employees
    FOR ALL
    USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- Absences RLS policies
CREATE POLICY "Absence company access" ON absences
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE employees.id = absences.employee_id 
            AND employees.company_id = (current_setting('app.current_company_id', true))::uuid
        )
    );

-- Email integrations RLS policies
CREATE POLICY "Email integration company access" ON email_integrations
    FOR ALL
    USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- AI transactions RLS policies
CREATE POLICY "AI transaction company access" ON ai_transactions
    FOR ALL
    USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- Notifications RLS policies
CREATE POLICY "Notification company access" ON notifications
    FOR ALL
    USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- Audit logs RLS policies
CREATE POLICY "Audit log company access" ON audit_logs
    FOR ALL
    USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_absences_updated_at BEFORE UPDATE ON absences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_integrations_updated_at BEFORE UPDATE ON email_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_transactions_updated_at BEFORE UPDATE ON ai_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for audit logging
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        company_id,
        user_id,
        action,
        entity_type,
        entity_id,
        old_data,
        new_data,
        created_at
    ) VALUES (
        COALESCE(NEW.company_id, OLD.company_id),
        (current_setting('app.current_user_id', true))::uuid,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Audit triggers
CREATE TRIGGER audit_companies AFTER INSERT OR UPDATE OR DELETE ON companies
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_employees AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_absences AFTER INSERT OR UPDATE OR DELETE ON absences
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ================================================
-- SEED DATA (Optional - for development)
-- ================================================

-- Insert a demo company
INSERT INTO companies (id, name, email, subscription_tier) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo Company Inc.', 'admin@democompany.com', 'professional');

-- Insert a demo admin user
INSERT INTO users (id, company_id, email, password_hash, name, role, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@democompany.com', '$2b$10$K8BQxP6.nlhV/aG3T7l.M.o8rG1vRlAR4dJvQ9kZg4SyQGgz7dQWm', 'Demo Admin', 'owner', true);

-- Insert demo employees
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, position, hire_date) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'EMP001', 'John', 'Doe', 'john.doe@democompany.com', 'Engineering', 'Software Developer', '2023-01-15'),
('550e8400-e29b-41d4-a716-446655440000', 'EMP002', 'Jane', 'Smith', 'jane.smith@democompany.com', 'Marketing', 'Marketing Manager', '2023-02-01'),
('550e8400-e29b-41d4-a716-446655440000', 'EMP003', 'Bob', 'Johnson', 'bob.johnson@democompany.com', 'Engineering', 'Senior Developer', '2022-11-10');

-- ================================================
-- VIEWS FOR COMMON QUERIES
-- ================================================

-- Employee absence summary view
CREATE VIEW employee_absence_summary AS
SELECT 
    e.id,
    e.company_id,
    e.employee_id,
    e.first_name,
    e.last_name,
    e.email,
    e.department,
    e.position,
    e.status,
    COUNT(a.id) as total_absences,
    COUNT(CASE WHEN a.type = 'sick' THEN 1 END) as sick_days,
    COUNT(CASE WHEN a.type = 'vacation' THEN 1 END) as vacation_days,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_absences,
    MAX(a.start_date) as last_absence_date
FROM employees e
LEFT JOIN absences a ON e.id = a.employee_id
GROUP BY e.id, e.company_id, e.employee_id, e.first_name, e.last_name, e.email, e.department, e.position, e.status;

-- Company dashboard stats view
CREATE VIEW company_dashboard_stats AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT e.id) as total_employees,
    COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) as active_employees,
    COUNT(DISTINCT CASE WHEN a.start_date <= CURRENT_DATE AND (a.end_date IS NULL OR a.end_date >= CURRENT_DATE) THEN e.id END) as employees_absent_today,
    COUNT(DISTINCT CASE WHEN a.start_date >= CURRENT_DATE - INTERVAL '30 days' THEN a.id END) as absences_last_30_days,
    COUNT(DISTINCT CASE WHEN ai.created_at >= CURRENT_DATE - INTERVAL '24 hours' THEN ai.id END) as ai_transactions_today
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
LEFT JOIN absences a ON e.id = a.employee_id
LEFT JOIN ai_transactions ai ON c.id = ai.company_id
GROUP BY c.id, c.name;

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;