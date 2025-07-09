Write a PRD for the following project. Also create tasks, sub-tasks and plan the architecture that will be used for the long term in the docs folder.

# Employee Absenteeism Tracking SaaS PRD

## Project Overview
Employee Absenteeism Tracking is a SaaS platform enabling HR teams to automatically track employee absenteeism status and history by parsing emails with AI (Grok v3). Companies register, select a plan, integrate their email, and import employee data to enable AI-driven data extraction from emails, reducing manual HR work.

## Target Audience
- Primary users: HR professionals in companies.
- UX: Simple, intuitive, using light colors with lilac as the primary color.
- Audience is not tech-savvy; prioritize ease of use.

## Technologies
- Frontend: Next.js
- Backend: TypeScript, Nest.js
- Database: Supabase, SQL
- AI: Grok v3 for parsing emails and CSV imports

## Website Structure
### Pages
1. **Landing Page**:
   - Hero section with modern animations, concise software overview.
   - Sections: About, Why Use, Contact (with Google reCAPTCHA), CTA for registration.
2. **Login Page**: Straightforward login interface.
3. **Register Page**: Collects company and user data (separate entities; one company, multiple users).
4. **Company Dashboard**: Displays graphs of absenteeism changes detected in the past month, last email with status updates.
5. **Employee Absenteeism Tracking Page**:
   - Table showing employee absenteeism status, details, and history.
   - Buttons for CSV import (employee data or absences) with modal offering template download.
   - AI parses CSV data, identifies employee/absence data, and saves to database.
6. **User Management Page**:
   - Lists company users and roles (Owner, Administrator, User).
   - Owner: Can delete company account.
   - Administrator: Can modify email settings, add data in Employee Absenteeism Tracking.
   - User: Can import data, view information (read-only).
7. **Settings Page**:
   - Tabs: General (marketing emails, account deletion for owners), Billing, Email Integration.
8. **Admin Dashboard**:
   - Separate login for admin users (registered via API).
   - Displays: Registered companies, users, daily AI transactions, filters for 1/3/12 months.

### Shared Components
- **Header**:
   - Landing: Navigation to sections, Login, Register buttons.
   - Logged-in: Shows company name, username, Logout button.
- **Footer**: Consistent across all pages.
- **Sidebar** (logged-in users): Buttons for Dashboard, Employee Absenteeism Tracking, User Management, Settings.

## Key Features
- **Email Integration and AI Parsing**: Post-registration, users select a plan, pay via Stripe, and follow an email integration flow. AI (Grok v3) parses incoming emails to detect and update employee absenteeism status automatically.
- **AI Data Import**: CSV imports (employee data/absences) use AI to parse and map data to database, regardless of column names.
- **Role-Based Access**:
   - Owner: Full control, including account deletion.
   - Administrator: Email settings, data addition.
   - User: Data import, view-only access.
- **SEO**: Implement proper SEO across all pages.

## User Flow
1. Register company and user account.
2. Choose plan, pay via Stripe.
3. Complete email integration.
4. Import employee data via CSV (AI-driven parsing).
5. AI parses emails to track and update absenteeism status, viewable in dashboard or Employee Absenteeism Tracking page.