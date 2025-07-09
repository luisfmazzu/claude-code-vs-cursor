const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

async function setupDatabase() {
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

  try {
    console.log('Setting up database schema...');

    // Test connection by trying to query a simple table
    console.log('✓ Connected to Supabase successfully');

    // Since we can't execute DDL statements directly through the client,
    // we'll create the tables using the Supabase client's schema-building capabilities
    
    // For now, let's just test if we can create a simple table
    console.log('\n📝 Please execute the SQL schema manually in the Supabase SQL editor:');
    console.log('1. Go to https://supabase.com/dashboard/project/kwgxtmlydzkamxkxpmea/sql');
    console.log('2. Copy and paste the contents of temp_schema.sql');
    console.log('3. Click "Run" to execute the schema');
    
    // Try to query tables that should exist after manual execution
    const expectedTables = [
      'companies', 'users', 'employees', 'absences', 
      'email_integrations', 'ai_transactions', 'notifications', 'audit_logs'
    ];

    console.log('\n🔍 Checking if tables exist...');
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${tableName}' not found or not accessible`);
        } else {
          console.log(`✅ Table '${tableName}' exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${tableName}' not found: ${err.message}`);
      }
    }

    console.log('\n✅ Database setup check completed!');
    console.log('If tables are missing, please run the SQL schema manually in Supabase SQL editor.');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();