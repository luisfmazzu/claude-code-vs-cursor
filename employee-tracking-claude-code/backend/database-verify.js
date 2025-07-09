const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function verifyDatabase() {
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

  console.log('🔍 Verifying Employee Absenteeism Tracking Database Setup...\n');

  const results = {
    tables: [],
    views: [],
    functions: [],
    sampleData: {},
    errors: []
  };

  // Expected tables
  const expectedTables = [
    'companies', 'users', 'employees', 'absences', 
    'email_integrations', 'ai_transactions', 'notifications', 'audit_logs'
  ];

  // Check each table
  console.log('📋 Checking Core Tables...');
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${tableName}': ${error.message}`);
        results.errors.push(`Table ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ Table '${tableName}': Accessible`);
        results.tables.push(tableName);
      }
    } catch (err) {
      console.log(`❌ Table '${tableName}': ${err.message}`);
      results.errors.push(`Table ${tableName}: ${err.message}`);
    }
  }

  // Check sample data
  console.log('\n📊 Checking Sample Data...');
  try {
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.log(`❌ Companies data: ${companiesError.message}`);
      results.errors.push(`Companies data: ${companiesError.message}`);
    } else {
      console.log(`✅ Companies: ${companies.length} records`);
      results.sampleData.companies = companies.length;
      
      if (companies.length > 0) {
        console.log(`   - Sample company: ${companies[0].name}`);
      }
    }
  } catch (err) {
    console.log(`❌ Companies data: ${err.message}`);
    results.errors.push(`Companies data: ${err.message}`);
  }

  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.log(`❌ Users data: ${usersError.message}`);
      results.errors.push(`Users data: ${usersError.message}`);
    } else {
      console.log(`✅ Users: ${users.length} records`);
      results.sampleData.users = users.length;
      
      if (users.length > 0) {
        console.log(`   - Sample user: ${users[0].name} (${users[0].role})`);
      }
    }
  } catch (err) {
    console.log(`❌ Users data: ${err.message}`);
    results.errors.push(`Users data: ${err.message}`);
  }

  try {
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*');
    
    if (employeesError) {
      console.log(`❌ Employees data: ${employeesError.message}`);
      results.errors.push(`Employees data: ${employeesError.message}`);
    } else {
      console.log(`✅ Employees: ${employees.length} records`);
      results.sampleData.employees = employees.length;
      
      if (employees.length > 0) {
        console.log(`   - Sample employee: ${employees[0].first_name} ${employees[0].last_name}`);
      }
    }
  } catch (err) {
    console.log(`❌ Employees data: ${err.message}`);
    results.errors.push(`Employees data: ${err.message}`);
  }

  // Check views
  console.log('\n👁️  Checking Views...');
  const expectedViews = ['employee_absence_summary', 'company_dashboard_stats'];
  
  for (const viewName of expectedViews) {
    try {
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ View '${viewName}': ${error.message}`);
        results.errors.push(`View ${viewName}: ${error.message}`);
      } else {
        console.log(`✅ View '${viewName}': Accessible`);
        results.views.push(viewName);
      }
    } catch (err) {
      console.log(`❌ View '${viewName}': ${err.message}`);
      results.errors.push(`View ${viewName}: ${err.message}`);
    }
  }

  // Test RLS policies
  console.log('\n🔒 Testing Row Level Security...');
  try {
    // This should fail without proper RLS context
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
      
    if (error && error.message.includes('row-level security')) {
      console.log('✅ RLS policies are active');
    } else {
      console.log('⚠️  RLS policies may not be properly configured');
    }
  } catch (err) {
    console.log(`⚠️  RLS test: ${err.message}`);
  }

  // Summary
  console.log('\n📋 Setup Summary:');
  console.log('================');
  console.log(`✅ Tables created: ${results.tables.length}/${expectedTables.length}`);
  console.log(`✅ Views created: ${results.views.length}/${expectedViews.length}`);
  console.log(`📊 Sample companies: ${results.sampleData.companies || 0}`);
  console.log(`👥 Sample users: ${results.sampleData.users || 0}`);
  console.log(`👤 Sample employees: ${results.sampleData.employees || 0}`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors found: ${results.errors.length}`);
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  // Test a complex query
  console.log('\n🧪 Testing Complex Query...');
  try {
    const { data, error } = await supabase
      .from('employee_absence_summary')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log(`❌ Complex query test: ${error.message}`);
    } else {
      console.log(`✅ Complex query test: Retrieved ${data.length} records`);
      if (data.length > 0) {
        console.log(`   - Sample: ${data[0].first_name} ${data[0].last_name} (${data[0].department})`);
      }
    }
  } catch (err) {
    console.log(`❌ Complex query test: ${err.message}`);
  }

  // Final status
  const success = results.tables.length === expectedTables.length && 
                 results.views.length === expectedViews.length &&
                 results.sampleData.companies > 0;

  console.log('\n🎯 Database Setup Status:');
  console.log('==========================');
  if (success) {
    console.log('✅ SUCCESS: Database setup completed successfully!');
    console.log('🚀 Your Employee Absenteeism Tracking system is ready to use.');
    console.log('\nNext steps:');
    console.log('1. Start your backend server: npm run start:dev');
    console.log('2. Test API endpoints');
    console.log('3. Run integration tests');
  } else {
    console.log('❌ INCOMPLETE: Database setup needs attention');
    console.log('Please check the errors above and re-run the SQL schema');
  }
}

verifyDatabase().catch(console.error);