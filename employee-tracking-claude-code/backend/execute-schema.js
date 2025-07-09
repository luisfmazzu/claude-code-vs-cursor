const fs = require('fs');
const path = require('path');

function formatSQLForSupabase() {
  console.log('🔧 Preparing SQL schema for Supabase execution...\n');
  
  const sqlFilePath = path.join(__dirname, 'temp_schema.sql');
  const outputPath = path.join(__dirname, 'supabase-ready-schema.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error('❌ temp_schema.sql not found!');
    return;
  }
  
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  // Clean up the SQL for Supabase
  let cleanedSQL = sqlContent;
  
  // Remove or modify problematic statements
  cleanedSQL = cleanedSQL.replace(
    /ALTER DATABASE postgres SET "app\.jwt_secret" TO 'your-jwt-secret-here';/g,
    '-- Note: JWT secret is managed by Supabase automatically'
  );
  
  // Add helpful comments
  const header = `-- ===============================================
-- Employee Absenteeism Tracking SaaS Database Schema
-- Generated for Supabase PostgreSQL Database
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire file content
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and execute this schema
-- 4. Run the verification script: node database-verify.js
-- ===============================================

`;
  
  cleanedSQL = header + cleanedSQL;
  
  // Write the cleaned SQL
  fs.writeFileSync(outputPath, cleanedSQL);
  
  console.log('✅ SQL schema prepared successfully!');
  console.log(`📝 File created: ${outputPath}`);
  console.log(`📊 Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
  
  // Count statements
  const statements = cleanedSQL.split(';').filter(stmt => 
    stmt.trim().length > 0 && !stmt.trim().startsWith('--')
  );
  
  console.log(`📋 Total statements: ${statements.length}`);
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Go to: https://supabase.com/dashboard/project/kwgxtmlydzkamxkxpmea/sql');
  console.log('2. Copy the contents of supabase-ready-schema.sql');
  console.log('3. Paste into SQL Editor and click "Run"');
  console.log('4. Run verification: node database-verify.js');
  
  // Display the first few lines as a preview
  console.log('\n📖 Preview (first 10 lines):');
  const lines = cleanedSQL.split('\n');
  lines.slice(0, 10).forEach((line, i) => {
    console.log(`${i + 1}. ${line}`);
  });
  
  if (lines.length > 10) {
    console.log(`... and ${lines.length - 10} more lines`);
  }
}

formatSQLForSupabase();