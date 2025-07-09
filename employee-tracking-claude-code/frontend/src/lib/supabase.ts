import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'employee-tracking-frontend'
    }
  }
})

// Types for our database tables
export interface Company {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  subscription_tier: 'starter' | 'professional' | 'enterprise'
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
  stripe_customer_id?: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  company_id: string
  email: string
  name: string
  role: 'owner' | 'administrator' | 'user'
  active: boolean
  email_verified: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  company_id: string
  employee_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  department?: string
  position?: string
  hire_date?: string
  status: 'active' | 'inactive' | 'on_leave' | 'terminated'
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Absence {
  id: string
  employee_id: string
  type: 'sick' | 'vacation' | 'personal' | 'bereavement' | 'jury_duty' | 'maternity' | 'paternity' | 'other'
  start_date: string
  end_date?: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: string
  approved_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface EmailIntegration {
  id: string
  company_id: string
  provider: 'gmail' | 'outlook' | 'exchange' | 'custom'
  email_address: string
  credentials: Record<string, any>
  active: boolean
  last_sync?: string
  sync_errors: any[]
  created_at: string
  updated_at: string
}

export interface AITransaction {
  id: string
  company_id: string
  type: 'email_parsing' | 'csv_parsing' | 'data_analysis'
  input_data: Record<string, any>
  output_data?: Record<string, any>
  tokens_used: number
  processing_time: number
  status: 'pending' | 'success' | 'error' | 'timeout'
  error_message?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  company_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  data: Record<string, any>
  created_at: string
}

export interface AuditLog {
  id: string
  company_id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id?: string
  old_data?: Record<string, any>
  new_data?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Database helper functions
export const setCompanyContext = async (companyId: string) => {
  const { error } = await supabase.rpc('set_config', {
    setting_name: 'app.current_company_id',
    setting_value: companyId,
    is_local: true
  })
  
  if (error) {
    console.error('Error setting company context:', error)
    throw error
  }
}

export const setUserContext = async (userId: string) => {
  const { error } = await supabase.rpc('set_config', {
    setting_name: 'app.current_user_id',
    setting_value: userId,
    is_local: true
  })
  
  if (error) {
    console.error('Error setting user context:', error)
    throw error
  }
}

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
}

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting current session:', error)
    return null
  }
  
  return session
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Real-time subscriptions
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  return supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter
      },
      callback
    )
    .subscribe()
}

export default supabase