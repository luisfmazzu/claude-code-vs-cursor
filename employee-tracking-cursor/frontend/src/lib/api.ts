import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                { refreshToken }
              );

              const { accessToken } = response.data.data;
              Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day

              // Retry the original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.logout();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          }
        }

        // Handle other errors
        if (error.response?.data?.error) {
          const errorMessage = error.response.data.error.message || 'An error occurred';
          toast.error(errorMessage);
        } else {
          toast.error('Network error. Please try again.');
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    params?: any
  ): Promise<T> {
    try {
      const response = await this.client.request<ApiResponse<T>>({
        method,
        url,
        data,
        params,
      });

      if (response.data.success) {
        return response.data.data as T;
      } else {
        throw new Error(response.data.error?.message || 'Request failed');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{
      accessToken: string;
      refreshToken: string;
      user: any;
      company: any;
    }>('POST', '/auth/login', { email, password });

    // Store tokens
    Cookies.set('accessToken', response.accessToken, { expires: 1 }); // 1 day
    Cookies.set('refreshToken', response.refreshToken, { expires: 30 }); // 30 days

    return response;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    timezone?: string;
  }) {
    const response = await this.request<{
      accessToken: string;
      refreshToken: string;
      user: any;
      company: any;
    }>('POST', '/auth/register', data);

    // Store tokens
    Cookies.set('accessToken', response.accessToken, { expires: 1 });
    Cookies.set('refreshToken', response.refreshToken, { expires: 30 });

    return response;
  }

  logout() {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  }

  async getProfile() {
    return this.request<{ user: any; company: any }>('GET', '/auth/profile');
  }

  // Company methods
  async getCompany() {
    return this.request('GET', '/companies/current');
  }

  async updateCompany(data: any) {
    return this.request('PUT', '/companies/current', data);
  }

  async getCompanyStats() {
    return this.request('GET', '/companies/stats');
  }

  // Employee methods
  async getEmployees(params?: any) {
    return this.request('GET', '/employees', null, params);
  }

  async getEmployee(id: string) {
    return this.request('GET', `/employees/${id}`);
  }

  async createEmployee(data: any) {
    return this.request('POST', '/employees', data);
  }

  async updateEmployee(id: string, data: any) {
    return this.request('PUT', `/employees/${id}`, data);
  }

  async deleteEmployee(id: string) {
    return this.request('DELETE', `/employees/${id}`);
  }

  async searchEmployees(searchTerm: string) {
    return this.request('GET', '/employees/search', null, { q: searchTerm });
  }

  async bulkCreateEmployees(data: any) {
    return this.request('POST', '/employees/bulk', data);
  }

  // Absence Type methods
  async getAbsenceTypes() {
    return this.request('GET', '/absence-types');
  }

  async getAbsenceType(id: string) {
    return this.request('GET', `/absence-types/${id}`);
  }

  async createAbsenceType(data: any) {
    return this.request('POST', '/absence-types', data);
  }

  async updateAbsenceType(id: string, data: any) {
    return this.request('PUT', `/absence-types/${id}`, data);
  }

  async deleteAbsenceType(id: string) {
    return this.request('DELETE', `/absence-types/${id}`);
  }

  async createDefaultAbsenceTypes() {
    return this.request('POST', '/absence-types/default');
  }

  // Absence Record methods
  async getAbsenceRecords(params?: any) {
    return this.request('GET', '/absence-records', null, params);
  }

  async getAbsenceRecord(id: string) {
    return this.request('GET', `/absence-records/${id}`);
  }

  async createAbsenceRecord(data: any) {
    return this.request('POST', '/absence-records', data);
  }

  async updateAbsenceRecord(id: string, data: any) {
    return this.request('PUT', `/absence-records/${id}`, data);
  }

  async deleteAbsenceRecord(id: string) {
    return this.request('DELETE', `/absence-records/${id}`);
  }

  async approveAbsenceRecord(id: string, data: any) {
    return this.request('PUT', `/absence-records/${id}/approval`, data);
  }

  async getAbsenceRecordStats() {
    return this.request('GET', '/absence-records/stats');
  }

  async getUpcomingAbsences() {
    return this.request('GET', '/absence-records/upcoming');
  }

  async getCurrentAbsences() {
    return this.request('GET', '/absence-records/current');
  }

  // AI Processing methods
  async processEmail(data: any) {
    return this.request('POST', '/ai-processing/process-email', data);
  }

  async testEmailParsing(data: any) {
    return this.request('POST', '/ai-processing/test-parsing', data);
  }

  async getProcessingStats() {
    return this.request('GET', '/ai-processing/stats');
  }

  async getProcessingHistory(limit?: number) {
    return this.request('GET', '/ai-processing/history', null, { limit });
  }

  async provideFeedback(data: any) {
    return this.request('POST', '/ai-processing/feedback', data);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
export default apiClient; 