import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseConfig } from '../config/database.config';
import { AIService } from '../ai/ai.service';
import * as Papa from 'papaparse';

export interface CSVImportDto {
  csvData: string;
  columnMapping: Record<string, string>;
  validateData?: boolean;
}

export interface CSVExportDto {
  includeColumns?: string[];
  filters?: Record<string, any>;
  format?: 'csv' | 'xlsx';
}

export interface CSVImportResult {
  success: boolean;
  imported: number;
  errors: number;
  warnings: string[];
  failedRows: Array<{
    row: number;
    data: any;
    errors: string[];
  }>;
}

export interface CSVExportResult {
  data: string;
  filename: string;
  contentType: string;
}

export interface EmployeeCSVRecord {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  startDate?: string;
  status?: string;
}

@Injectable()
export class CSVService {
  constructor(
    private readonly databaseConfig: DatabaseConfig,
    private readonly aiService: AIService,
  ) {}

  async importEmployeesFromCSV(
    importDto: CSVImportDto,
    companyId: string,
  ): Promise<CSVImportResult> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Parse CSV data
      const parseResult = Papa.parse(importDto.csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });

      if (parseResult.errors.length > 0) {
        throw new BadRequestException(`CSV parsing failed: ${parseResult.errors[0].message}`);
      }

      const records = parseResult.data as Record<string, string>[];
      const importResult: CSVImportResult = {
        success: true,
        imported: 0,
        errors: 0,
        warnings: [],
        failedRows: [],
      };

      // Process each record
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        try {
          // Map CSV columns to employee fields
          const mappedEmployee = this.mapCSVRecord(record, importDto.columnMapping);
          
          // Validate required fields
          const validationErrors = this.validateEmployeeRecord(mappedEmployee);
          if (validationErrors.length > 0) {
            importResult.errors++;
            importResult.failedRows.push({
              row: i + 1,
              data: record,
              errors: validationErrors,
            });
            continue;
          }

          // Check for duplicate employee ID
          const { data: existingEmployee } = await supabase
            .from('employees')
            .select('id')
            .eq('company_id', companyId)
            .eq('employee_id', mappedEmployee.employeeId)
            .single();

          if (existingEmployee) {
            importResult.warnings.push(
              `Row ${i + 1}: Employee ID ${mappedEmployee.employeeId} already exists, skipping`,
            );
            continue;
          }

          // Insert employee
          const { error } = await supabase
            .from('employees')
            .insert({
              company_id: companyId,
              employee_id: mappedEmployee.employeeId,
              first_name: mappedEmployee.firstName,
              last_name: mappedEmployee.lastName,
              email: mappedEmployee.email,
              phone: mappedEmployee.phone,
              department: mappedEmployee.department,
              position: mappedEmployee.position,
              start_date: mappedEmployee.startDate ? new Date(mappedEmployee.startDate).toISOString() : null,
              status: mappedEmployee.status || 'active',
            });

          if (error) {
            importResult.errors++;
            importResult.failedRows.push({
              row: i + 1,
              data: record,
              errors: [`Database error: ${error.message}`],
            });
          } else {
            importResult.imported++;
          }
        } catch (error) {
          importResult.errors++;
          importResult.failedRows.push({
            row: i + 1,
            data: record,
            errors: [`Processing error: ${error.message}`],
          });
        }
      }

      // Determine overall success
      importResult.success = importResult.errors === 0;

      return importResult;
    } catch (error) {
      console.error('CSV import failed:', error);
      throw new BadRequestException(`CSV import failed: ${error.message}`);
    }
  }

  async exportEmployeesToCSV(
    exportDto: CSVExportDto,
    companyId: string,
  ): Promise<CSVExportResult> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Define default columns
      const defaultColumns = [
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'department',
        'position',
        'start_date',
        'status',
      ];

      const columnsToSelect = exportDto.includeColumns || defaultColumns;

      // Build query
      let query = supabase
        .from('employees')
        .select(columnsToSelect.join(', '))
        .eq('company_id', companyId);

      // Apply filters
      if (exportDto.filters) {
        Object.entries(exportDto.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Fetch data
      const { data: employees, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new BadRequestException(`Export failed: ${error.message}`);
      }

      // Convert to CSV
      const csvData = Papa.unparse(employees || [], {
        header: true,
        columns: columnsToSelect,
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `employees-export-${timestamp}.csv`;

      return {
        data: csvData,
        filename,
        contentType: 'text/csv',
      };
    } catch (error) {
      console.error('CSV export failed:', error);
      throw new BadRequestException(`CSV export failed: ${error.message}`);
    }
  }

  async generateCSVTemplate(): Promise<CSVExportResult> {
    // Create sample CSV template
    const templateData = [
      {
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        phone: '555-0123',
        department: 'Engineering',
        position: 'Software Developer',
        start_date: '2023-01-15',
        status: 'active',
      },
      {
        employee_id: 'EMP002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@company.com',
        phone: '555-0124',
        department: 'Marketing',
        position: 'Marketing Manager',
        start_date: '2023-02-01',
        status: 'active',
      },
    ];

    const csvData = Papa.unparse(templateData, {
      header: true,
    });

    return {
      data: csvData,
      filename: 'employee-import-template.csv',
      contentType: 'text/csv',
    };
  }

  async suggestColumnMapping(
    csvHeaders: string[],
    companyId: string,
  ): Promise<Record<string, { mappedTo: string; confidence: number }>> {
    try {
      // Use AI service to suggest column mapping
      const aiResult = await this.aiService.parseCSVData(
        {
          csvData: csvHeaders.join(','),
          headers: csvHeaders,
        },
        companyId,
      );

      // Convert AI result to mapping format
      const mapping: Record<string, { mappedTo: string; confidence: number }> = {};

      csvHeaders.forEach((header, index) => {
        const aiMapping = aiResult.columnMapping?.[index];
        if (aiMapping) {
          mapping[header] = {
            mappedTo: aiMapping.mappedTo,
            confidence: aiMapping.confidence,
          };
        } else {
          // Fallback to simple string matching
          mapping[header] = this.simpleColumnMapping(header);
        }
      });

      return mapping;
    } catch (error) {
      console.error('AI column mapping failed, using fallback:', error);
      
      // Fallback to simple mapping
      const mapping: Record<string, { mappedTo: string; confidence: number }> = {};
      csvHeaders.forEach(header => {
        mapping[header] = this.simpleColumnMapping(header);
      });
      
      return mapping;
    }
  }

  private mapCSVRecord(
    record: Record<string, string>,
    columnMapping: Record<string, string>,
  ): EmployeeCSVRecord {
    const mapped: any = {};

    Object.entries(columnMapping).forEach(([csvColumn, employeeField]) => {
      if (record[csvColumn] !== undefined) {
        mapped[employeeField] = record[csvColumn]?.trim() || '';
      }
    });

    return mapped as EmployeeCSVRecord;
  }

  private validateEmployeeRecord(record: EmployeeCSVRecord): string[] {
    const errors: string[] = [];

    // Required fields
    if (!record.employeeId) {
      errors.push('Employee ID is required');
    }

    if (!record.firstName) {
      errors.push('First name is required');
    }

    if (!record.lastName) {
      errors.push('Last name is required');
    }

    if (!record.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
      errors.push('Invalid email format');
    }

    // Date validation
    if (record.startDate) {
      const date = new Date(record.startDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid start date format');
      }
    }

    // Status validation
    if (record.status && !['active', 'inactive', 'terminated'].includes(record.status.toLowerCase())) {
      errors.push('Invalid status. Must be active, inactive, or terminated');
    }

    return errors;
  }

  private simpleColumnMapping(header: string): { mappedTo: string; confidence: number } {
    const lowerHeader = header.toLowerCase();

    const mappings = [
      { pattern: /^(employee_?id|emp_?id|id)$/i, field: 'employeeId', confidence: 0.9 },
      { pattern: /^(first_?name|fname|given_?name)$/i, field: 'firstName', confidence: 0.9 },
      { pattern: /^(last_?name|lname|surname|family_?name)$/i, field: 'lastName', confidence: 0.9 },
      { pattern: /^(email|email_?address|e_?mail)$/i, field: 'email', confidence: 0.9 },
      { pattern: /^(phone|phone_?number|tel|telephone)$/i, field: 'phone', confidence: 0.8 },
      { pattern: /^(department|dept|division)$/i, field: 'department', confidence: 0.8 },
      { pattern: /^(position|title|job_?title|role)$/i, field: 'position', confidence: 0.8 },
      { pattern: /^(start_?date|hire_?date|employment_?date)$/i, field: 'startDate', confidence: 0.8 },
      { pattern: /^(status|employment_?status|state)$/i, field: 'status', confidence: 0.8 },
    ];

    for (const mapping of mappings) {
      if (mapping.pattern.test(lowerHeader)) {
        return { mappedTo: mapping.field, confidence: mapping.confidence };
      }
    }

    return { mappedTo: '', confidence: 0 };
  }
}