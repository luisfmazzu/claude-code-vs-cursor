import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseConfig } from '../config/database.config';

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  absentToday: number;
  absentThisWeek: number;
  absentThisMonth: number;
  absenteeismRate: number;
  trendsData: {
    labels: string[];
    absenteeism: number[];
    attendance: number[];
  };
  departmentBreakdown: {
    department: string;
    totalEmployees: number;
    absentToday: number;
    absenteeismRate: number;
  }[];
  recentActivity: {
    id: string;
    type: 'absence' | 'email' | 'csv' | 'system';
    employee?: string;
    action: string;
    timestamp: string;
    status: string;
  }[];
  absenceTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

export interface AbsenceAnalytics {
  totalAbsences: number;
  avgAbsenceDuration: number;
  topAbsenceReasons: {
    type: string;
    count: number;
    percentage: number;
  }[];
  absenteeismTrends: {
    period: string;
    absences: number;
    employees: number;
    rate: number;
  }[];
  employeeAbsenceRanking: {
    employeeId: string;
    employeeName: string;
    department: string;
    totalAbsences: number;
    totalDays: number;
    lastAbsence: string;
  }[];
  seasonalPatterns: {
    month: string;
    absences: number;
    rate: number;
  }[];
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly databaseConfig: DatabaseConfig) {}

  async getDashboardStats(companyId: string): Promise<DashboardStats> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Get basic employee stats
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, status, department')
        .eq('company_id', companyId);

      if (empError) {
        throw new BadRequestException(`Failed to fetch employee stats: ${empError.message}`);
      }

      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(emp => emp.status === 'active').length || 0;

      // Get today's absences
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAbsences, error: todayError } = await supabase
        .from('absences')
        .select(`
          id,
          employee_id,
          employees!inner(company_id, first_name, last_name)
        `)
        .eq('employees.company_id', companyId)
        .lte('start_date', today)
        .or(`end_date.gte.${today},end_date.is.null`);

      if (todayError) {
        throw new BadRequestException(`Failed to fetch today's absences: ${todayError.message}`);
      }

      const absentToday = todayAbsences?.length || 0;

      // Get this week's absences
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weekAbsences, error: weekError } = await supabase
        .from('absences')
        .select(`
          id,
          employee_id,
          employees!inner(company_id)
        `)
        .eq('employees.company_id', companyId)
        .gte('start_date', weekStartStr);

      if (weekError) {
        throw new BadRequestException(`Failed to fetch week absences: ${weekError.message}`);
      }

      const absentThisWeek = new Set(weekAbsences?.map(abs => abs.employee_id)).size || 0;

      // Get this month's absences
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split('T')[0];

      const { data: monthAbsences, error: monthError } = await supabase
        .from('absences')
        .select(`
          id,
          employee_id,
          type,
          employees!inner(company_id)
        `)
        .eq('employees.company_id', companyId)
        .gte('start_date', monthStartStr);

      if (monthError) {
        throw new BadRequestException(`Failed to fetch month absences: ${monthError.message}`);
      }

      const absentThisMonth = new Set(monthAbsences?.map(abs => abs.employee_id)).size || 0;
      const absenteeismRate = totalEmployees > 0 ? (absentThisMonth / totalEmployees) * 100 : 0;

      // Generate trends data (last 30 days)
      const trendsData = this.generateTrendsData();

      // Get department breakdown
      const departmentBreakdown = this.calculateDepartmentBreakdown(employees || [], todayAbsences || []);

      // Get recent activity (mock data for now)
      const recentActivity = this.generateRecentActivity();

      // Get absence types breakdown
      const absenceTypes = this.calculateAbsenceTypes(monthAbsences || []);

      return {
        totalEmployees,
        activeEmployees,
        absentToday,
        absentThisWeek,
        absentThisMonth,
        absenteeismRate: Math.round(absenteeismRate * 100) / 100,
        trendsData,
        departmentBreakdown,
        recentActivity,
        absenceTypes,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getAbsenceAnalytics(companyId: string, startDate?: string, endDate?: string): Promise<AbsenceAnalytics> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Set default date range (last 12 months)
      if (!startDate) {
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        startDate = start.toISOString().split('T')[0];
      }

      if (!endDate) {
        endDate = new Date().toISOString().split('T')[0];
      }

      // Get absences in date range
      const { data: absences, error } = await supabase
        .from('absences')
        .select(`
          *,
          employees!inner(
            company_id,
            employee_id,
            first_name,
            last_name,
            department
          )
        `)
        .eq('employees.company_id', companyId)
        .gte('start_date', startDate)
        .lte('start_date', endDate);

      if (error) {
        throw new BadRequestException(`Failed to fetch absence analytics: ${error.message}`);
      }

      const totalAbsences = absences?.length || 0;

      // Calculate average absence duration
      const avgAbsenceDuration = this.calculateAverageAbsenceDuration(absences || []);

      // Get top absence reasons
      const topAbsenceReasons = this.calculateTopAbsenceReasons(absences || []);

      // Generate absenteeism trends (by month)
      const absenteeismTrends = this.calculateAbsenteeismTrends(absences || []);

      // Get employee absence ranking
      const employeeAbsenceRanking = this.calculateEmployeeAbsenceRanking(absences || []);

      // Calculate seasonal patterns
      const seasonalPatterns = this.calculateSeasonalPatterns(absences || []);

      return {
        totalAbsences,
        avgAbsenceDuration,
        topAbsenceReasons,
        absenteeismTrends,
        employeeAbsenceRanking,
        seasonalPatterns,
      };
    } catch (error) {
      console.error('Error getting absence analytics:', error);
      throw error;
    }
  }

  private generateTrendsData() {
    const labels: string[] = [];
    const absenteeism: number[] = [];
    const attendance: number[] = [];

    // Generate last 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Mock data - replace with actual database queries
      absenteeism.push(Math.floor(Math.random() * 20) + 5);
      attendance.push(Math.floor(Math.random() * 10) + 85);
    }

    return { labels, absenteeism, attendance };
  }

  private calculateDepartmentBreakdown(employees: any[], todayAbsences: any[]) {
    const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
    
    return departments.map(department => {
      const deptEmployees = employees.filter(emp => emp.department === department && emp.status === 'active');
      const deptAbsent = todayAbsences.filter(abs => {
        const employee = employees.find(emp => emp.id === abs.employee_id);
        return employee?.department === department;
      });

      const totalEmployees = deptEmployees.length;
      const absentToday = deptAbsent.length;
      const absenteeismRate = totalEmployees > 0 ? (absentToday / totalEmployees) * 100 : 0;

      return {
        department,
        totalEmployees,
        absentToday,
        absenteeismRate: Math.round(absenteeismRate * 100) / 100,
      };
    });
  }

  private generateRecentActivity() {
    return [
      {
        id: '1',
        type: 'absence' as const,
        employee: 'John Doe',
        action: 'Sick leave request approved',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
      },
      {
        id: '2',
        type: 'email' as const,
        employee: 'Jane Smith',
        action: 'Email processed - Vacation request',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'processed',
      },
      {
        id: '3',
        type: 'csv' as const,
        action: 'CSV import completed - 25 records',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: '4',
        type: 'absence' as const,
        employee: 'Bob Johnson',
        action: 'Personal leave request pending',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
      },
    ];
  }

  private calculateAbsenceTypes(absences: any[]) {
    const typeCounts = absences.reduce((acc, absence) => {
      acc[absence.type] = (acc[absence.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = absences.length;

    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0,
    }));
  }

  private calculateAverageAbsenceDuration(absences: any[]): number {
    if (absences.length === 0) return 0;

    const durations = absences.map(absence => {
      if (absence.end_date && absence.start_date) {
        const start = new Date(absence.start_date);
        const end = new Date(absence.end_date);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
      return 1; // Single day absence
    });

    const total = durations.reduce((sum, duration) => sum + duration, 0);
    return Math.round((total / durations.length) * 100) / 100;
  }

  private calculateTopAbsenceReasons(absences: any[]) {
    const typeCounts = absences.reduce((acc, absence) => {
      acc[absence.type] = (acc[absence.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = absences.length;

    return Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateAbsenteeismTrends(absences: any[]) {
    // Group by month
    const monthlyData = absences.reduce((acc, absence) => {
      const month = new Date(absence.start_date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { absences: 0, employees: new Set() };
      }
      acc[month].absences++;
      acc[month].employees.add(absence.employee_id);
      return acc;
    }, {} as Record<string, { absences: number; employees: Set<string> }>);

    return Object.entries(monthlyData).map(([period, data]) => ({
      period,
      absences: data.absences,
      employees: data.employees.size,
      rate: data.employees.size > 0 ? Math.round((data.absences / data.employees.size) * 100) / 100 : 0,
    }));
  }

  private calculateEmployeeAbsenceRanking(absences: any[]) {
    const employeeData = absences.reduce((acc, absence) => {
      const empId = absence.employee_id;
      if (!acc[empId]) {
        acc[empId] = {
          employeeId: absence.employees.employee_id,
          employeeName: `${absence.employees.first_name} ${absence.employees.last_name}`,
          department: absence.employees.department,
          absences: [],
        };
      }
      acc[empId].absences.push(absence);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(employeeData)
      .map((emp: any) => ({
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        department: emp.department,
        totalAbsences: emp.absences.length,
        totalDays: emp.absences.reduce((sum: number, abs: any) => {
          if (abs.end_date && abs.start_date) {
            const start = new Date(abs.start_date);
            const end = new Date(abs.end_date);
            return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          }
          return sum + 1;
        }, 0),
        lastAbsence: emp.absences.sort((a: any, b: any) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        )[0]?.start_date || '',
      }))
      .sort((a, b) => b.totalAbsences - a.totalAbsences)
      .slice(0, 10);
  }

  private calculateSeasonalPatterns(absences: any[]) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlyData = absences.reduce((acc, absence) => {
      const month = new Date(absence.start_date).getMonth();
      if (!acc[month]) {
        acc[month] = { count: 0, employees: new Set() };
      }
      acc[month].count++;
      acc[month].employees.add(absence.employee_id);
      return acc;
    }, {} as Record<number, { count: number; employees: Set<string> }>);

    return monthNames.map((month, index) => {
      const data = monthlyData[index] || { count: 0, employees: new Set() };
      return {
        month,
        absences: data.count,
        rate: data.employees.size > 0 ? Math.round((data.count / data.employees.size) * 100) / 100 : 0,
      };
    });
  }
}