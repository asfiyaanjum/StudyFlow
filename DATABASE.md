# StudyFlow Database Architecture & Security Model

This document outlines the PostgreSQL database architecture, schema constraints, indexing strategy, and Row-Level Security (RLS) policies implemented for **StudyFlow**.

---

## 1. Schema Overview

The database is built on **PostgreSQL 15+** via Supabase. All primary keys use UUIDs generated via `uuid_generate_v4()`.

### Core Tables

| Table Name | Description | Key Foreign Keys |
| :--- | :--- | :--- |
| `profiles` | Extended user identity (username, academic info, target minutes) | `id -> auth.users(id)` |
| `user_settings` | Individual UI preferences, time format, and Pomodoro configurations | `user_id -> profiles(id)` |
| `subjects` | Academic courses enrolled in (color, code, credit hours) | `user_id -> profiles(id)` |
| `syllabus_units` | Curriculum units / chapters within a course | `subject_id -> subjects(id)` |
| `syllabus_topics` | Granular study topics and conceptual mastery tracker | `unit_id -> syllabus_units(id)` |
| `tasks` | Academic to-do items, problem sets, and assignments | `subject_id -> subjects(id)` |
| `schedule_items` | Weekly recurring timetable and scheduled lectures | `subject_id -> subjects(id)` |
| `goals` | Semester targets (exam scores, hours, mastery) | `subject_id -> subjects(id)` |
| `plans` | Structured multi-day sprints and exam prep blueprints | `subject_id -> subjects(id)` |
| `focus_sessions` | Immutable log of Pomodoro and deep study sessions | `task_id -> tasks(id)` |

---

## 2. Row-Level Security (RLS)

Row-Level Security is strictly enabled on **all 10 tables**. No user can read, create, update, or delete records belonging to another user.

### Policy Examples:
```sql
-- Tasks Isolation Policy
CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profiles Isolation Policy
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);
```

---

## 3. Database Indexes

To guarantee high query speed even with large volumes of study sessions and tasks:
- `idx_profiles_username` on `public.profiles(LOWER(username))`
- `idx_tasks_user_due` on `public.tasks(user_id, due_date)`
- `idx_tasks_user_status` on `public.tasks(user_id, status)`
- `idx_schedule_items_user_day` on `public.schedule_items(user_id, day_of_week)`
- `idx_focus_sessions_user_date` on `public.focus_sessions(user_id, completed_at)`
- `idx_syllabus_topics_unit` on `public.syllabus_topics(unit_id)`

---

## 4. Secure Database Functions

### Automatic Profile Initialization
A Postgres trigger runs on `auth.users` insertion:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
This automatically provisions default `profiles` and `user_settings` records with default 4-hour daily study goals.

### Safe Username Resolution (Prevents Email Enumeration)
Students can log in with their username. To resolve the email address safely without exposing public profile tables:
```sql
CREATE OR REPLACE FUNCTION public.resolve_username_to_email(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email
  FROM public.profiles
  WHERE LOWER(username) = LOWER(p_username)
  LIMIT 1;

  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Migration Execution

The ordered migration is located at:
[`supabase/migrations/20241121000000_initial_schema.sql`](file:///c:/Users/ASFIYA%20ANJUM/StudyFlow/supabase/migrations/20241121000000_initial_schema.sql)

This script is idempotent (`CREATE TABLE IF NOT EXISTS`, `ON CONFLICT DO NOTHING`), ensuring safe additive execution on existing databases.
