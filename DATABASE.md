# StudyFlow – Database & Supabase Setup Guide

This guide provides step-by-step instructions to configure your **new Supabase project** for StudyFlow.

---

## 1. Create a New Supabase Project

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New project**.
3. Select your organization, enter a name (e.g., `StudyFlow`), set a strong database password, and pick a region close to your users.
4. Wait 1–2 minutes for the database provisioning to complete.

---

## 2. Obtain Your API Keys & Configure `.env`

1. In your Supabase project dashboard, navigate to **Project Settings** (gear icon) &rarr; **API**.
2. Locate:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **Project API keys** &rarr; `anon` / `public` key (e.g., `eyJhbGci...`)
3. In your local StudyFlow project root, create or edit `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   VITE_APP_URL=http://localhost:5173
   ```
4. Verify `.gitignore` contains `.env` (already configured to prevent accidental leakage).
5. **Security note**: Never use or expose your `service_role` key in frontend code or in the `.env` file.

---

## 3. Run the Database Migration

1. In the Supabase dashboard, click **SQL Editor** from the left navigation.
2. Click **New query**.
3. Open [`supabase/migrations/20241121000000_initial_schema.sql`](file:///supabase/migrations/20241121000000_initial_schema.sql) in this repository and copy its entire contents.
4. Paste the SQL into the Supabase SQL Editor and click **Run**.
5. Confirm the query completes with `Success. No rows returned`.

### What This Migration Configures:
- **10 Application Tables**:
  - `profiles`: User profiles linked to `auth.users(id)` with unique username constraint.
  - `user_settings`: Student preferences (daily study target, notifications, recovery engine threshold).
  - `subjects`: Courses/subjects with colors and credit hours.
  - `syllabus_units`: Subject units and chapters.
  - `syllabus_topics`: Granular topics with completion status.
  - `tasks`: Deadlines, assignments, exams, and priority tracking.
  - `schedule_items`: Recurring timetable and lecture blocks.
  - `goals`: Long-term targets and target dates.
  - `plans`: Weekly/monthly academic study plans.
  - `focus_sessions`: Pomodoro and deep work logs linked to subjects and tasks.
- **Row Level Security (RLS)**:
  - Enabled on **all 10 tables**.
  - Policies enforce `auth.uid() = user_id` for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
  - Storage bucket `avatars` with RLS allowing users to update their own avatar and public read access.
- **Automated Triggers**:
  - `on_auth_user_created`: Automatically creates a `profiles` row and default `user_settings` when a new student signs up in `auth.users`.
- **Secure Stored Procedures (RPC)**:
  - `is_username_available(check_username)`: Safe lookup to check handle availability without exposing any user data.
  - `resolve_username_to_email(p_username)`: Secure `SECURITY DEFINER` lookup allowing users to log in with their username without public email enumeration.

---

## 4. Configure Authentication in Supabase

In the Supabase dashboard, go to **Authentication** &rarr; **URL Configuration**:

1. **Site URL**:
   Set to `http://localhost:5173` (or your production URL when deployed).
2. **Redirect URLs**:
   Add the following redirect URLs:
   - `http://localhost:5173/**`
   - `http://localhost:5173/reset-password`
   - `http://localhost:5173/verify-email`

Under **Authentication** &rarr; **Email Templates**:
- For local testing with real emails, Supabase includes a default email service (rate-limited to 3 emails per hour for development).
- For production, configure custom SMTP (e.g., SendGrid, Resend, AWS SES) under **Authentication** &rarr; **SMTP Settings**.

---

## 5. Storage Verification

1. Go to **Storage** in the Supabase dashboard.
2. Verify that the `avatars` bucket exists.
3. If it is not listed, click **New bucket**:
   - Bucket name: `avatars`
   - Make it **Public**: Checked
   - Click Save.
4. The migration script has already created the RLS policies for `storage.objects` for the `avatars` bucket.

---

## 6. Testing & Verifying Features

After setting your credentials in `.env` and starting the development server:

```bash
npm run dev
```

1. **Register a User**:
   - Go to `/register`
   - Enter a username, email, and password
   - Check your inbox for the Supabase verification email
2. **Verify Email**:
   - Click the link in the email, or copy the confirmation URL
3. **Login with Username**:
   - Go to `/login`
   - Enter your **username** and password &rarr; resolves securely to your account
4. **Create Data & Test Isolation**:
   - Add subjects, tasks, and timetable items
   - Complete a Focus timer session and check that the minutes update on the task
   - Run the Recovery Engine to see overdue tasks analyzed against timetable free slots
   - Open an incognito window, register a second user, and confirm complete data isolation (RLS prevents user B from viewing user A's tasks or subjects)
5. **Settings & Profile**:
   - Upload an avatar image in `/settings` &rarr; verifies Supabase Storage
   - Update daily study target & toggle theme
