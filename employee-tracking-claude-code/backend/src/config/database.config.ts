import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseConfig {
  private supabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });
  }

  getClient() {
    return this.supabaseClient;
  }

  async setCompanyContext(companyId: string): Promise<void> {
    const { error } = await this.supabaseClient.rpc('set_config', {
      setting_name: 'app.current_company_id',
      setting_value: companyId,
      is_local: true
    });

    if (error) {
      throw new Error(`Failed to set company context: ${error.message}`);
    }
  }

  async setUserContext(userId: string): Promise<void> {
    const { error } = await this.supabaseClient.rpc('set_config', {
      setting_name: 'app.current_user_id',
      setting_value: userId,
      is_local: true
    });

    if (error) {
      throw new Error(`Failed to set user context: ${error.message}`);
    }
  }

  async query(query: string, params?: any[]): Promise<any> {
    try {
      const { data, error } = await this.supabaseClient.rpc('execute_sql', {
        query,
        params: params || []
      });

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
}

// Database table interfaces for TypeScript
export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  stripe_customer_id?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  company_id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'owner' | 'administrator' | 'user';
  active: boolean;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Absence {
  id: string;
  employee_id: string;
  type: 'sick' | 'vacation' | 'personal' | 'bereavement' | 'jury_duty' | 'maternity' | 'paternity' | 'other';
  start_date: string;
  end_date?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailIntegration {
  id: string;
  company_id: string;
  provider: 'gmail' | 'outlook' | 'exchange' | 'custom';
  email_address: string;
  credentials: Record<string, any>;
  active: boolean;
  last_sync?: string;
  sync_errors: any[];
  created_at: string;
  updated_at: string;
}

export interface AITransaction {
  id: string;
  company_id: string;
  type: 'email_parsing' | 'csv_parsing' | 'data_analysis';
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  tokens_used: number;
  processing_time: number;
  status: 'pending' | 'success' | 'error' | 'timeout';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  company_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  data: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}