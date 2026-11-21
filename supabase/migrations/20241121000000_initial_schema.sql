-- ==============================================================================
-- STUDYFLOW PRODUCTION DATABASE SCHEMA & ROW-LEVEL SECURITY (RLS)
-- PHASE 2: COMPLETE SUPABASE INTEGRATION FOR NEW EMPTY SUPABASE PROJECT
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLES DEFINITIONS
-- ==============================================================================

-- 2.1 Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  college_university TEXT,
  major_course TEXT,
  academic_year TEXT,
  daily_study_target_minutes INTEGER DEFAULT 180 CHECK (daily_study_target_minutes > 0),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_]+$')
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(LOWER(email));

-- 2.2 User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  notification_sound BOOLEAN DEFAULT true,
  pomodoro_focus_duration INTEGER DEFAULT 25 CHECK (pomodoro_focus_duration > 0),
  pomodoro_short_break INTEGER DEFAULT 5 CHECK (pomodoro_short_break > 0),
  pomodoro_long_break INTEGER DEFAULT 15 CHECK (pomodoro_long_break > 0),
  pomodoro_long_break_interval INTEGER DEFAULT 4 CHECK (pomodoro_long_break_interval > 0),
  weekly_study_goal_hours INTEGER DEFAULT 20 CHECK (weekly_study_goal_hours >= 0),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON public.user_settings(user_id);

-- 2.3 Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  color TEXT DEFAULT '#6366f1' NOT NULL,
  credit_hours NUMERIC(4,1) DEFAULT 3.0,
  instructor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT unique_user_subject_name UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_subjects_user ON public.subjects(user_id);

-- 2.4 Syllabus Units
CREATE TABLE IF NOT EXISTS public.syllabus_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  unit_number INTEGER DEFAULT 1 NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_syllabus_units_subject ON public.syllabus_units(subject_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_units_user ON public.syllabus_units(user_id);

-- 2.5 Syllabus Topics
CREATE TABLE IF NOT EXISTS public.syllabus_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES public.syllabus_units(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_minutes INTEGER DEFAULT 45,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_syllabus_topics_unit ON public.syllabus_topics(unit_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_topics_user ON public.syllabus_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_topics_completed ON public.syllabus_topics(user_id, is_completed);

-- 2.6 Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ NOT NULL,
  estimated_duration_minutes INTEGER DEFAULT 60 NOT NULL CHECK (estimated_duration_minutes > 0),
  actual_duration_minutes INTEGER DEFAULT 0 CHECK (actual_duration_minutes >= 0),
  is_completed BOOLEAN DEFAULT false NOT NULL,
  completed_at TIMESTAMPTZ,
  rescheduled_from TIMESTAMPTZ,
  rescheduled_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON public.tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_subject ON public.tasks(subject_id);

-- 2.7 Timetable / Schedule Items Table
CREATE TABLE IF NOT EXISTS public.schedule_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  activity_type TEXT DEFAULT 'lecture' CHECK (
    activity_type IN ('lecture', 'self_study', 'assignment', 'revision', 'exam', 'break', 'personal')
  ),
  location TEXT,
  is_recurring BOOLEAN DEFAULT true NOT NULL,
  specific_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_schedule_items_user_day ON public.schedule_items(user_id, day_of_week);

-- 2.8 Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT DEFAULT 'subject_mastery' CHECK (
    goal_type IN ('exam_score', 'subject_mastery', 'study_hours', 'habit', 'project')
  ),
  target_date DATE NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);

-- 2.9 Study Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  plan_type TEXT DEFAULT 'weekly' CHECK (
    plan_type IN ('daily', 'weekly', 'subject_mastery', 'exam_prep')
  ),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  content TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_plans_user ON public.plans(user_id);

-- 2.10 Focus Sessions Table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  actual_minutes INTEGER NOT NULL CHECK (actual_minutes >= 0),
  mode TEXT DEFAULT 'pomodoro' CHECK (
    mode IN ('pomodoro', 'short_break', 'long_break', 'custom')
  ),
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON public.focus_sessions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_subject ON public.focus_sessions(subject_id);

-- ==============================================================================
-- 3. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

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

-- 3.1 Profiles Policies
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

-- 3.2 User Settings Policies
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3.3 Subjects Policies
DROP POLICY IF EXISTS "Users can manage own subjects" ON public.subjects;
CREATE POLICY "Users can manage own subjects"
  ON public.subjects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3.4 Syllabus Units Policies
DROP POLICY IF EXISTS "Users can manage own syllabus units" ON public.syllabus_units;
CREATE POLICY "Users can manage own syllabus units"
  ON public.syllabus_units FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3.5 Syllabus Topics Policies
DROP POLICY IF EXISTS "Users can manage own syllabus topics" ON public.syllabus_topics;
CREATE POLICY "Users can manage own syllabus topics"
  ON public.syllabus_topics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3.6 Tasks Policies
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3.7 Schedule Items Policies
DROP POLICY IF EXISTS "Users can manage own schedule" ON public.schedule_items;
CREATE POLICY "Users can manage own schedule"
  ON public.schedule_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3.8 Goals Policies
DROP POLICY IF EXISTS "Users can manage own goals" ON public.goals;
CREATE POLICY "Users can manage own goals"
  ON public.goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3.9 Plans Policies
DROP POLICY IF EXISTS "Users can manage own plans" ON public.plans;
CREATE POLICY "Users can manage own plans"
  ON public.plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3.10 Focus Sessions Policies
DROP POLICY IF EXISTS "Users can manage own focus sessions" ON public.focus_sessions;
CREATE POLICY "Users can manage own focus sessions"
  ON public.focus_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 4. DATABASE FUNCTIONS AND TRIGGERS
-- ==============================================================================

-- 4.1 Automated user profile & settings initialization on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_base_username TEXT;
  v_username TEXT;
BEGIN
  -- Extract username from user_metadata or derive from email prefix
  v_base_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Sanitize username: keep only alphanumeric and underscore
  v_base_username := REGEXP_REPLACE(v_base_username, '[^a-zA-Z0-9_]', '_', 'g');
  IF char_length(v_base_username) < 3 THEN
    v_base_username := v_base_username || '_stu';
  END IF;
  v_base_username := SUBSTRING(v_base_username, 1, 24);

  v_username := v_base_username;

  -- Ensure uniqueness against existing profiles
  IF EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(v_username)) THEN
    v_username := v_base_username || '_' || SUBSTRING(NEW.id::text, 1, 4);
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    username,
    email,
    full_name,
    daily_study_target_minutes
  )
  VALUES (
    NEW.id,
    v_username,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', v_username),
    180
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

  -- Insert default settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Trigger attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.2 Secure RPC: Resolve username to email for login with password authentication
-- SECURITY NOTE: Does NOT return the email to arbitrary anonymous callers.
-- Requires p_password to match auth.users.encrypted_password via crypt().
-- Prevents anonymous email enumeration/harvesting while supporting username sign-in.
CREATE OR REPLACE FUNCTION public.resolve_username_to_email(
  p_username TEXT,
  p_password TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_encrypted_password TEXT;
BEGIN
  -- Strict input validation
  IF p_username IS NULL OR TRIM(p_username) = '' THEN
    RETURN NULL;
  END IF;

  -- Locate matching profile ID (case-insensitive)
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE LOWER(username) = LOWER(TRIM(p_username))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Retrieve email and encrypted password hash from auth.users
  SELECT email, encrypted_password INTO v_email, v_encrypted_password
  FROM auth.users
  WHERE id = v_user_id;

  -- Password authentication verification:
  -- Only return email if caller provides the valid password matching the hash
  IF p_password IS NOT NULL AND v_encrypted_password IS NOT NULL THEN
    BEGIN
      IF extensions.crypt(p_password, v_encrypted_password) = v_encrypted_password THEN
        RETURN v_email;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      BEGIN
        IF public.crypt(p_password, v_encrypted_password) = v_encrypted_password THEN
          RETURN v_email;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
      END;
    END;
  END IF;

  -- Default: never leak email to unauthenticated callers
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION public.resolve_username_to_email(TEXT, TEXT) TO anon, authenticated, service_role;

-- 4.3 Secure RPC: Check username availability for real-time registration validation
-- Only returns boolean (true if free, false if taken). Never reveals user metadata or email.
CREATE OR REPLACE FUNCTION public.is_username_available(p_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_username IS NULL OR TRIM(p_username) = '' OR char_length(TRIM(p_username)) < 3 THEN
    RETURN FALSE;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(TRIM(p_username))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_username_available(TEXT) TO anon, authenticated, service_role;

-- ==============================================================================
-- 5. STORAGE BUCKET CONFIGURATION (AVATARS)
-- ==============================================================================

-- 5.1 Create avatars bucket safely if storage schema is installed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'storage' AND table_name = 'buckets'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
  ELSE
    RAISE NOTICE 'Notice: storage.buckets table does not exist; skipping automated bucket initialization.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Storage bucket initialization warning: %. Verify avatars bucket in Supabase dashboard.', SQLERRM;
END $$;

-- 5.2 Storage Policies for avatars bucket
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'storage' AND table_name = 'objects'
  ) THEN
    DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
    CREATE POLICY "Avatar images are publicly accessible"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');

    DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
    CREATE POLICY "Users can upload own avatar"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid() IS NOT NULL
      );

    DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
    CREATE POLICY "Users can update own avatar"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
    CREATE POLICY "Users can delete own avatar"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
  ELSE
    RAISE NOTICE 'Notice: storage.objects table does not exist; skipping storage policy setup.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Storage policy initialization warning: %. Check Supabase Storage permissions.', SQLERRM;
END $$;
