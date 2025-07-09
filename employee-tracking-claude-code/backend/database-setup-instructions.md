# Database Setup Instructions

## Automatic Setup Using Supabase SQL Editor

Since direct SQL execution via API is not available, please follow these steps to set up the database:

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/kwgxtmlydzkamxkxpmea/sql)
2. Log in to your Supabase account
3. Navigate to the SQL Editor

### Step 2: Execute the Database Schema

1. Open the file `temp_schema.sql` in this directory
2. Copy the entire contents (387 lines)
3. Paste into the Supabase SQL Editor
4. Click "Run" button to execute the schema

### Step 3: Verify Setup

After executing the schema, run the verification script:

```bash
node database-verify.js
```

## What Will Be Created

The database schema includes:

### Core Tables (8 tables)
- **companies**: Tenant isolation and subscription management
- **users**: Multi-user support with roles
- **employees**: Main employee records
- **absences**: Absence tracking with types and status
- **email_integrations**: Email provider configurations
- **ai_transactions**: AI usage tracking
- **notifications**: In-app notifications
- **audit_logs**: Complete audit trail

### Features
- **Performance Indexes**: Optimized queries on all tables
- **Row Level Security (RLS)**: Tenant isolation and security
- **Triggers**: Automatic timestamp updates and audit logging
- **Sample Data**: Demo company with test employees
- **Views**: Common queries for dashboard stats

### Security Features
- RLS policies for multi-tenant isolation
- Audit logging for all data changes
- Proper foreign key constraints
- Role-based access control

## Troubleshooting

If you encounter any issues:

1. **Permission Errors**: Ensure you're using the service role key
2. **Table Already Exists**: Drop existing tables if needed
3. **Function Errors**: Check PostgreSQL version compatibility

## Testing After Setup

The verification script will:
1. Check all tables exist
2. Verify sample data is present
3. Test views and functions
4. Confirm RLS policies are active
5. Validate indexes are created

## Next Steps

After successful setup:
1. Update your application's database connection
2. Test the API endpoints
3. Run the application test suite
4. Configure any additional settings needed