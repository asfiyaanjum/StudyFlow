-- ==============================================================================
-- STUDYFLOW DATABASE PERMISSIONS & ACCESS FIX
-- Migration: 20241122000000_grant_authenticated_permissions.sql
-- 
-- Fixes: "permission denied for table subjects" (and other tables)
-- Root cause: In PostgreSQL/Supabase, the "authenticated" role requires table-level
-- SQL privileges (SELECT, INSERT, UPDATE, DELETE) before Row-Level Security (RLS)
-- is evaluated. Without explicit GRANTs, PostgreSQL rejects queries with error 42501.
-- ==============================================================================

-- 1. Ensure Schema Usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant table-level CRUD permissions on all 10 StudyFlow tables to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.profiles,
  public.user_settings,
  public.subjects,
  public.syllabus_units,
  public.syllabus_topics,
  public.tasks,
  public.schedule_items,
  public.goals,
  public.plans,
  public.focus_sessions
TO authenticated;

-- Ensure service_role maintains full administration access
GRANT ALL ON TABLE
  public.profiles,
  public.user_settings,
  public.subjects,
  public.syllabus_units,
  public.syllabus_topics,
  public.tasks,
  public.schedule_items,
  public.goals,
  public.plans,
  public.focus_sessions
TO service_role;

-- 3. Grant sequence usage for any auto-incrementing / serial identifiers
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 4. Set default privileges for any future tables or sequences created in the public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL ON SEQUENCES TO service_role;

-- 5. Re-affirm Row-Level Security (RLS) is ENABLED on all 10 tables
-- (RLS guarantees users can only access and modify their own data via auth.uid())
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Verify and re-apply standard RLS ownership policies for completeness
-- 6.1 Profiles (id = auth.uid())
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id);

-- 6.2 User Settings (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6.3 Subjects (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can manage own subjects" ON public.subjects;
CREATE POLICY "Users can manage own subjects"
  ON public.subjects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6.4 Syllabus Units (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can manage own syllabus units" ON public.syllabus_units;
CREATE POLICY "Users can manage own syllabus units"
  ON public.syllabus_units FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6.5 Syllabus Topics (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can manage own syllabus topics" ON public.syllabus_topics;
CREATE POLICY "Users can manage own syllabus topics"
  ON public.syllabus_topics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6.6 Tasks (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6.7 Schedule Items (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can manage own schedule" ON public.schedule_items;
CREATE POLICY "Users can manage own schedule"
  ON public.schedule_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6.8 Goals (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can manage own goals" ON public.goals;
CREATE POLICY "Users can manage own goals"
  ON public.goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6.9 Plans (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can manage own plans" ON public.plans;
CREATE POLICY "Users can manage own plans"
  ON public.plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6.10 Focus Sessions (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can manage own focus sessions" ON public.focus_sessions;
CREATE POLICY "Users can manage own focus sessions"
  ON public.focus_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
