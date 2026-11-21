// StudyFlow Core Type Definitions

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  college_university?: string;
  major_course?: string;
  academic_year?: string;
  daily_study_target_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  time_format: '12h' | '24h';
  notification_sound: boolean;
  pomodoro_focus_duration: number; // minutes
  pomodoro_short_break: number;    // minutes
  pomodoro_long_break: number;     // minutes
  pomodoro_long_break_interval: number; // sessions before long break
  weekly_study_goal_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  color: string; // Hex code or tailwind color
  credit_hours?: number;
  instructor?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  units_count?: number;
  topics_count?: number;
  completed_topics_count?: number;
  progress_percentage?: number;
}

export interface SyllabusUnit {
  id: string;
  subject_id: string;
  user_id: string;
  title: string;
  unit_number: number;
  description?: string;
  created_at: string;
  updated_at: string;
  // Computed
  topics?: SyllabusTopic[];
  progress_percentage?: number;
}

export interface SyllabusTopic {
  id: string;
  unit_id: string;
  user_id: string;
  title: string;
  description?: string;
  estimated_minutes?: number;
  is_completed: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  subject_id?: string | null;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  due_date: string; // ISO date YYYY-MM-DD or full timestamp
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  is_completed: boolean;
  completed_at?: string | null;
  rescheduled_from?: string | null;
  rescheduled_count?: number;
  created_at: string;
  updated_at: string;
  // Expanded relation
  subject?: Subject;
}

export type ActivityType = 
  | 'lecture' 
  | 'self_study' 
  | 'assignment' 
  | 'revision' 
  | 'exam' 
  | 'break' 
  | 'personal';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday...

export interface ScheduleItem {
  id: string;
  user_id: string;
  subject_id?: string | null;
  title: string;
  day_of_week: DayOfWeek; // For recurring weekly entries
  start_time: string; // "09:00" format (HH:mm)
  end_time: string;   // "10:30" format (HH:mm)
  activity_type: ActivityType;
  location?: string;
  is_recurring: boolean;
  specific_date?: string | null; // For single-day schedule events
  notes?: string;
  created_at: string;
  updated_at: string;
  // Expanded
  subject?: Subject;
}

export type GoalType = 'exam_score' | 'subject_mastery' | 'study_hours' | 'habit' | 'project';
export type GoalStatus = 'active' | 'completed' | 'abandoned';

export interface Goal {
  id: string;
  user_id: string;
  subject_id?: string | null;
  title: string;
  description?: string;
  goal_type: GoalType;
  target_date: string;
  progress_percentage: number;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export type PlanType = 'daily' | 'weekly' | 'subject_mastery' | 'exam_prep';

export interface Plan {
  id: string;
  user_id: string;
  subject_id?: string | null;
  title: string;
  description?: string;
  plan_type: PlanType;
  start_date: string;
  end_date: string;
  content: string; // Markdown or JSON notes
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

export interface FocusSession {
  id: string;
  user_id: string;
  subject_id?: string | null;
  task_id?: string | null;
  duration_minutes: number;
  actual_minutes: number;
  mode: TimerMode;
  notes?: string;
  completed_at: string;
  created_at: string;
  subject?: Subject;
  task?: Task;
}

// Recovery Engine Types
export interface OverloadedDayWarning {
  date: string; // YYYY-MM-DD
  day_name: string;
  total_scheduled_minutes: number;
  total_task_minutes: number;
  available_capacity_minutes: number; // e.g. 480 mins max study
  overload_by_minutes: number;
  high_priority_conflicts: number;
}

export interface RescheduleSuggestion {
  id: string;
  task_id: string;
  task_title: string;
  priority: Priority;
  estimated_duration_minutes: number;
  original_due_date: string;
  suggested_new_date: string;
  suggested_time_slot?: {
    start: string;
    end: string;
  };
  reason: string;
  urgency_score: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface RecoveryPlan {
  analyzed_at: string;
  overdue_tasks_count: number;
  incomplete_tasks_count: number;
  suggestions: RescheduleSuggestion[];
  overloaded_days: OverloadedDayWarning[];
  recommendation_summary: string;
}

// Consistency & Analytics
export interface DailyStudyTrend {
  date: string;
  day_label: string;
  focus_minutes: number;
  tasks_completed: number;
  target_minutes: number;
}

export interface SubjectStudyDistribution {
  subject_id: string;
  subject_name: string;
  color: string;
  total_minutes: number;
  percentage: number;
  tasks_completed: number;
}

export interface AcademicAnalyticsOverview {
  total_study_minutes_today: number;
  total_study_minutes_this_week: number;
  study_sessions_completed: number;
  task_completion_rate: number; // 0 - 100%
  overall_syllabus_completion_rate: number;
  consistency_streak_days: number;
  daily_trends: DailyStudyTrend[];
  subject_distributions: SubjectStudyDistribution[];
  upcoming_deadlines_count: number;
  overloaded_days_count: number;
}
