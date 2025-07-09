// Core types for the frontend application

// Additional frontend types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'administrator' | 'user';
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  sizeRange?: string;
  timezone: string;
  subscriptionStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  employeeId?: string;
  department?: string;
  position?: string;
  status: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbsenceType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isPaid: boolean;
  requiresApproval: boolean;
  maxDaysPerYear?: number;
  color: string;
  isActive: boolean;
  companyId: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  timezone?: string;
}

// Frontend-specific types
export interface AuthContextType {
  user: User | null;
  company: Company | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardStats {
  totalEmployees: number;
  activeAbsences: number;
  pendingApprovals: number;
  monthlyAbsences: number;
  absencesByType: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'absence_created' | 'absence_approved' | 'absence_rejected';
    message: string;
    timestamp: Date;
  }>;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => any;
  width?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterOptions {
  employees?: Employee[];
  absenceTypes?: AbsenceType[];
  departments?: string[];
  statuses?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'checkbox' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: any; // Zod schema
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ToastConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
} 