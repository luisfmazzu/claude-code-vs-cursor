const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSampleQueries() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🧪 Testing Sample Queries for Employee Absenteeism Tracking\n');
  console.log('Note: These queries will work once the database schema is set up\n');

  // Test queries that will work after setup
  const testQueries = [
    {
      name: 'Companies Overview',
      description: 'Get all companies with their subscription details',
      table: 'companies',
      select: 'id, name, email, subscription_tier, subscription_status, created_at'
    },
    {
      name: 'Active Employees',
      description: 'Get all active employees with their departments',
      table: 'employees',
      select: 'employee_id, first_name, last_name, department, position, status',
      filters: { status: 'active' }
    },
    {
      name: 'Recent Absences',
      description: 'Get absences from the last 30 days',
      table: 'absences',
      select: 'id, type, start_date, end_date, status, reason',
      orderBy: 'start_date',
      descending: true,
      limit: 10
    },
    {
      name: 'Employee Absence Summary',
      description: 'Get employee absence statistics view',
      table: 'employee_absence_summary',
      select: 'first_name, last_name, department, total_absences, sick_days, vacation_days',
      limit: 5
    },
    {
      name: 'Company Dashboard Stats',
      description: 'Get company-wide statistics',
      table: 'company_dashboard_stats',
      select: 'company_name, total_employees, active_employees, employees_absent_today, absences_last_30_days'
    }
  ];

  console.log('📊 SAMPLE QUERIES THAT WILL BE AVAILABLE:\n');
  console.log('==========================================\n');

  for (const query of testQueries) {
    console.log(`🔍 ${query.name}`);
    console.log(`   ${query.description}`);
    console.log(`   Table: ${query.table}`);
    
    // Build query string for display
    let queryString = `supabase.from('${query.table}').select('${query.select}')`;
    
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        queryString += `.eq('${key}', '${value}')`;
      });
    }
    
    if (query.orderBy) {
      queryString += `.order('${query.orderBy}'${query.descending ? ', { ascending: false }' : ''})`;
    }
    
    if (query.limit) {
      queryString += `.limit(${query.limit})`;
    }
    
    console.log(`   Query: ${queryString}`);
    console.log('');
  }

  console.log('🎯 SAMPLE USE CASES:\n');
  console.log('====================\n');

  const useCases = [
    {
      title: 'Employee Dashboard',
      description: 'Show employee\'s own absence history and pending requests',
      queries: ['Recent Absences filtered by employee_id', 'Personal absence summary']
    },
    {
      title: 'Manager Dashboard',
      description: 'Show team absences and approval requests',
      queries: ['Team absences by department', 'Pending approval requests']
    },
    {
      title: 'HR Dashboard',
      description: 'Company-wide absence statistics and trends',
      queries: ['Company Dashboard Stats', 'Employee Absence Summary', 'Monthly absence trends']
    },
    {
      title: 'Automated Reporting',
      description: 'Generate automated absence reports',
      queries: ['Monthly absence reports', 'Department-wise statistics', 'Compliance reporting']
    }
  ];

  useCases.forEach(useCase => {
    console.log(`📋 ${useCase.title}`);
    console.log(`   ${useCase.description}`);
    console.log(`   Queries: ${useCase.queries.join(', ')}`);
    console.log('');
  });

  console.log('🔒 SECURITY FEATURES:\n');
  console.log('=====================\n');
  console.log('✅ Row Level Security (RLS) - Users can only see their company\'s data');
  console.log('✅ Role-based access - Different permissions for owners, admins, and users');
  console.log('✅ Audit logging - All data changes are tracked');
  console.log('✅ Data validation - Check constraints ensure data integrity');
  console.log('✅ Foreign key constraints - Maintain referential integrity');

  console.log('\n⚡ PERFORMANCE FEATURES:\n');
  console.log('========================\n');
  console.log('✅ Optimized indexes on frequently queried columns');
  console.log('✅ Efficient date range queries for absence tracking');
  console.log('✅ Composite indexes for complex multi-column queries');
  console.log('✅ Proper data types to minimize storage and improve performance');

  console.log('\n🧪 TO TEST AFTER SETUP:\n');
  console.log('========================\n');
  console.log('1. Run: node database-verify.js');
  console.log('2. Test individual queries using the Supabase client');
  console.log('3. Verify RLS policies are working correctly');
  console.log('4. Test API endpoints with the backend server');
  console.log('5. Run integration tests');

  console.log('\n📈 EXPECTED SAMPLE DATA:\n');
  console.log('========================\n');
  console.log('After setup, you should have:');
  console.log('• 1 Demo company (Demo Company Inc.)');
  console.log('• 1 Admin user (admin@democompany.com)');
  console.log('• 3 Sample employees (John Doe, Jane Smith, Bob Johnson)');
  console.log('• Various departments (Engineering, Marketing)');
  console.log('• Different positions (Software Developer, Marketing Manager, etc.)');
}

testSampleQueries().catch(console.error);