import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  UserProfile,
  UserSettings,
  Subject,
  SyllabusUnit,
  SyllabusTopic,
  Task,
  ScheduleItem,
  Goal,
  Plan,
  FocusSession,
  AcademicAnalyticsOverview,
  DailyStudyTrend,
  SubjectStudyDistribution,
} from '../types';
import { isDateToday } from '../utils/dateUtils';

/**
 * Helper to ensure user is authenticated before performing operations
 */
const requireAuthUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Authentication required. Please sign in to continue.');
  }
  return user;
};

/**
 * StudyFlow Production API Service Layer
 * All operations execute directly against Supabase PostgreSQL with Row-Level Security
 */
export const api = {
  // --------------------------------------------------------------------------
  // 1. AUTHENTICATION & PROFILE
  // --------------------------------------------------------------------------
  auth: {
    async getCurrentUser(): Promise<UserProfile | null> {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        if (!profile) {
          // Fallback user profile derived from auth user metadata
          const derivedUsername =
            user.user_metadata?.username || user.email?.split('@')[0] || 'student';
          return {
            id: user.id,
            username: derivedUsername,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || derivedUsername,
            daily_study_target_minutes: 180,
            created_at: user.created_at,
            updated_at: user.created_at,
          };
        }

        return profile as UserProfile;
      } catch (err) {
        console.error('Failed to get current user:', err);
        return null;
      }
    },

    async signIn(
      identifier: string,
      password: string
    ): Promise<{ user: UserProfile | null; error: string | null; isUnconfirmedEmail?: boolean }> {
      try {
        let email = identifier.trim();

        // If identifier does not have '@', safely resolve the username to email via RPC with password auth
        if (!identifier.includes('@')) {
          const { data: resolvedEmail, error: rpcError } = await supabase.rpc(
            'resolve_username_to_email',
            { p_username: identifier.trim(), p_password: password }
          );

          if (rpcError || !resolvedEmail) {
            return {
              user: null,
              error: 'Invalid username or password. Please verify your credentials.',
            };
          }
          email = resolvedEmail;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (
            error.message.toLowerCase().includes('email not confirmed') ||
            error.message.toLowerCase().includes('not confirmed')
          ) {
            return {
              user: null,
              error:
                'Your email address has not been confirmed yet. Please verify your email before logging in.',
              isUnconfirmedEmail: true,
            };
          }
          return { user: null, error: error.message };
        }

        if (!data.user) {
          return { user: null, error: 'Failed to retrieve authentication session.' };
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const userProfile: UserProfile = profile || {
          id: data.user.id,
          username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'student',
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || '',
          daily_study_target_minutes: 180,
          created_at: data.user.created_at,
          updated_at: data.user.created_at,
        };

        return { user: userProfile, error: null };
      } catch (err: any) {
        return { user: null, error: err.message || 'An unexpected authentication error occurred.' };
      }
    },

    async signUp(
      username: string,
      email: string,
      password: string,
      fullName?: string
    ): Promise<{ user: UserProfile | null; error: string | null; emailConfirmationRequired: boolean }> {
      try {
        const cleanUsername = username.toLowerCase().trim();
        const cleanEmail = email.toLowerCase().trim();

        // 1. Check username availability via secure RPC
        const { data: isAvailable, error: checkError } = await supabase.rpc(
          'is_username_available',
          { p_username: cleanUsername }
        );

        if (checkError) {
          console.warn('Username check warning:', checkError);
        } else if (isAvailable === false) {
          return {
            user: null,
            error: 'Username is already taken. Please choose another username.',
            emailConfirmationRequired: false,
          };
        }

        // 2. Perform Supabase signup
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
              full_name: fullName?.trim() || cleanUsername,
            },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) {
          return { user: null, error: error.message, emailConfirmationRequired: false };
        }

        const emailConfirmationRequired = !data.session;
        const userProfile: UserProfile = {
          id: data.user?.id || '',
          username: cleanUsername,
          email: cleanEmail,
          full_name: fullName,
          daily_study_target_minutes: 180,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return {
          user: userProfile,
          error: null,
          emailConfirmationRequired,
        };
      } catch (err: any) {
        return {
          user: null,
          error: err.message || 'Failed to complete registration.',
          emailConfirmationRequired: false,
        };
      }
    },

    async resendVerificationEmail(email: string): Promise<{ success: boolean; error: string | null }> {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        return { success: !error, error: error ? error.message : null };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },

    async signOut(): Promise<void> {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error during signOut:', err);
      }
    },

    async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        return { success: !error, error: error ? error.message : null };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },

    async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { success: !error, error: error ? error.message : null };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },

    async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
      const user = await requireAuthUser();

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
  },

  // --------------------------------------------------------------------------
  // 2. USER SETTINGS
  // --------------------------------------------------------------------------
  settings: {
    async getSettings(): Promise<UserSettings> {
      const user = await requireAuthUser();

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
      }

      if (!data) {
        // Insert initial default settings if missing
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) {
          return {
            id: 'default',
            user_id: user.id,
            theme: 'system',
            time_format: '12h',
            notification_sound: true,
            pomodoro_focus_duration: 25,
            pomodoro_short_break: 5,
            pomodoro_long_break: 15,
            pomodoro_long_break_interval: 4,
            weekly_study_goal_hours: 20,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        return newSettings as UserSettings;
      }

      return data as UserSettings;
    },

    async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
      const user = await requireAuthUser();

      const { data, error } = await supabase
        .from('user_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as UserSettings;
    },
  },

  // --------------------------------------------------------------------------
  // 3. SUBJECTS & SYLLABUS PROGRESS
  // --------------------------------------------------------------------------
  subjects: {
    async getSubjects(): Promise<Subject[]> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('subjects')
        .select('*, units:syllabus_units(*, topics:syllabus_topics(*))')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((sub: any) => {
        const units = sub.units || [];
        let topicsCount = 0;
        let completedTopicsCount = 0;

        units.forEach((u: any) => {
          const tops = u.topics || [];
          topicsCount += tops.length;
          completedTopicsCount += tops.filter((t: any) => t.is_completed).length;
        });

        const progress =
          topicsCount > 0 ? Math.round((completedTopicsCount / topicsCount) * 100) : 0;

        return {
          id: sub.id,
          user_id: sub.user_id,
          name: sub.name,
          code: sub.code,
          color: sub.color,
          credit_hours: sub.credit_hours,
          instructor: sub.instructor,
          notes: sub.notes,
          created_at: sub.created_at,
          updated_at: sub.updated_at,
          units_count: units.length,
          topics_count: topicsCount,
          completed_topics_count: completedTopicsCount,
          progress_percentage: progress,
        };
      });
    },

    async createSubject(
      subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>
    ): Promise<Subject> {
      const user = await requireAuthUser();

      const payload = {
        ...subject,
        user_id: user.id,
      };

      const { data, error } = await supabase.from('subjects').insert(payload).select().single();
      if (error) throw error;
      return data as Subject;
    },

    async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('subjects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Subject;
    },

    async deleteSubject(id: string): Promise<void> {
      await requireAuthUser();

      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },

    async getSyllabus(subjectId: string): Promise<SyllabusUnit[]> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('syllabus_units')
        .select('*, topics:syllabus_topics(*)')
        .eq('subject_id', subjectId)
        .order('unit_number', { ascending: true });

      if (error) throw error;

      return (data || []).map((unit: any) => {
        const topics = unit.topics || [];
        const completed = topics.filter((t: any) => t.is_completed).length;
        const progress = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0;
        return {
          ...unit,
          topics,
          progress_percentage: progress,
        };
      });
    },

    async createUnit(
      unit: Omit<SyllabusUnit, 'id' | 'created_at' | 'updated_at'>
    ): Promise<SyllabusUnit> {
      const user = await requireAuthUser();

      const payload = {
        ...unit,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('syllabus_units')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data as SyllabusUnit;
    },

    async createTopic(
      topic: Omit<SyllabusTopic, 'id' | 'created_at' | 'updated_at'>
    ): Promise<SyllabusTopic> {
      const user = await requireAuthUser();

      const payload = {
        ...topic,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('syllabus_topics')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data as SyllabusTopic;
    },

    async toggleTopicComplete(topicId: string, isCompleted: boolean): Promise<SyllabusTopic> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('syllabus_topics')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', topicId)
        .select()
        .single();

      if (error) throw error;
      return data as SyllabusTopic;
    },
  },

  // --------------------------------------------------------------------------
  // 4. TASKS MANAGEMENT
  // --------------------------------------------------------------------------
  tasks: {
    async getTasks(): Promise<Task[]> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('tasks')
        .select('*, subject:subjects(*)')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []) as Task[];
    },

    async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
      const user = await requireAuthUser();

      const payload = {
        ...task,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Task;
    },

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Task;
    },

    async deleteTask(id: string): Promise<void> {
      await requireAuthUser();

      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },

    async toggleTask(id: string): Promise<Task> {
      await requireAuthUser();

      const { data: currentTask, error: fetchError } = await supabase
        .from('tasks')
        .select('is_completed')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const nextComplete = !currentTask?.is_completed;

      const { data, error } = await supabase
        .from('tasks')
        .update({
          is_completed: nextComplete,
          status: nextComplete ? 'completed' : 'todo',
          completed_at: nextComplete ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Task;
    },
  },

  // --------------------------------------------------------------------------
  // 5. SCHEDULE / TIMETABLE
  // --------------------------------------------------------------------------
  schedule: {
    async getSchedule(): Promise<ScheduleItem[]> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('schedule_items')
        .select('*, subject:subjects(*)')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return (data || []) as ScheduleItem[];
    },

    async createScheduleItem(
      item: Omit<ScheduleItem, 'id' | 'created_at' | 'updated_at'>
    ): Promise<ScheduleItem> {
      const user = await requireAuthUser();

      const payload = {
        ...item,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('schedule_items')
        .insert(payload)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as ScheduleItem;
    },

    async updateScheduleItem(id: string, updates: Partial<ScheduleItem>): Promise<ScheduleItem> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('schedule_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as ScheduleItem;
    },

    async deleteScheduleItem(id: string): Promise<void> {
      await requireAuthUser();

      const { error } = await supabase.from('schedule_items').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // --------------------------------------------------------------------------
  // 6. GOALS & PLANS
  // --------------------------------------------------------------------------
  goals: {
    async getGoals(): Promise<Goal[]> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('goals')
        .select('*, subject:subjects(*)')
        .order('target_date', { ascending: true });

      if (error) throw error;
      return (data || []) as Goal[];
    },

    async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
      const user = await requireAuthUser();

      const payload = {
        ...goal,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('goals')
        .insert(payload)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Goal;
    },

    async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Goal;
    },

    async deleteGoal(id: string): Promise<void> {
      await requireAuthUser();

      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    },
  },

  plans: {
    async getPlans(): Promise<Plan[]> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('plans')
        .select('*, subject:subjects(*)')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return (data || []) as Plan[];
    },

    async createPlan(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan> {
      const user = await requireAuthUser();

      const payload = {
        ...plan,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('plans')
        .insert(payload)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Plan;
    },

    async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Plan;
    },

    async deletePlan(id: string): Promise<void> {
      await requireAuthUser();

      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // --------------------------------------------------------------------------
  // 7. FOCUS TIMER & SESSIONS
  // --------------------------------------------------------------------------
  focus: {
    async getFocusSessions(): Promise<FocusSession[]> {
      await requireAuthUser();

      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*, subject:subjects(*), task:tasks(*)')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return (data || []) as FocusSession[];
    },

    async logSession(session: Omit<FocusSession, 'id' | 'created_at'>): Promise<FocusSession> {
      const user = await requireAuthUser();

      const payload = {
        ...session,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('focus_sessions')
        .insert(payload)
        .select('*, subject:subjects(*), task:tasks(*)')
        .single();

      if (error) throw error;

      // If attached to a task, increment task actual duration in tasks table
      if (session.task_id) {
        try {
          const { data: currentTask } = await supabase
            .from('tasks')
            .select('actual_duration_minutes')
            .eq('id', session.task_id)
            .single();

          if (currentTask) {
            const nextMinutes = (currentTask.actual_duration_minutes || 0) + session.actual_minutes;
            await supabase
              .from('tasks')
              .update({ actual_duration_minutes: nextMinutes })
              .eq('id', session.task_id);
          }
        } catch (taskErr) {
          console.warn('Could not increment task actual duration:', taskErr);
        }
      }

      return data as FocusSession;
    },
  },

  // --------------------------------------------------------------------------
  // 8. STORAGE (AVATARS)
  // --------------------------------------------------------------------------
  storage: {
    async uploadAvatar(file: File): Promise<string> {
      const user = await requireAuthUser();

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data.publicUrl;
    },
  },

  // --------------------------------------------------------------------------
  // 9. ANALYTICS & CONSISTENCY
  // --------------------------------------------------------------------------
  analytics: {
    async getOverview(): Promise<AcademicAnalyticsOverview> {
      const [tasks, sessions, subjects] = await Promise.all([
        api.tasks.getTasks(),
        api.focus.getFocusSessions(),
        api.subjects.getSubjects(),
      ]);

      // Today's focus minutes
      const todaySessions = sessions.filter((s) => isDateToday(s.completed_at));
      const totalMinutesToday = todaySessions.reduce((acc, s) => acc + s.actual_minutes, 0);

      // This week's focus minutes (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weekSessions = sessions.filter((s) => new Date(s.completed_at) >= oneWeekAgo);
      const totalMinutesWeek = weekSessions.reduce((acc, s) => acc + s.actual_minutes, 0);

      // Task completion rate
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.is_completed).length;
      const taskCompletionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Overall syllabus completion
      let totalTopics = 0;
      let completedTopics = 0;
      subjects.forEach((s) => {
        totalTopics += s.topics_count || 0;
        completedTopics += s.completed_topics_count || 0;
      });
      const syllabusRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      // Daily trends for past 7 days
      const dailyTrends: DailyStudyTrend[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = dayNames[d.getDay()];

        const daysSess = sessions.filter((s) => s.completed_at.startsWith(dateStr));
        const focusMins = daysSess.reduce((acc, s) => acc + s.actual_minutes, 0);
        const dayTasksDone = tasks.filter(
          (t) => t.is_completed && t.completed_at && t.completed_at.startsWith(dateStr)
        ).length;

        dailyTrends.push({
          date: dateStr,
          day_label: dayLabel,
          focus_minutes: focusMins,
          tasks_completed: dayTasksDone,
          target_minutes: 240, // 4 hours daily target
        });
      }

      // Subject-wise distribution
      const subjectDist: SubjectStudyDistribution[] = subjects.map((sub) => {
        const subSessions = sessions.filter((s) => s.subject_id === sub.id);
        const totalSubMinutes = subSessions.reduce((acc, s) => acc + s.actual_minutes, 0);
        const subTasksDone = tasks.filter((t) => t.subject_id === sub.id && t.is_completed).length;
        const totalFocus = sessions.reduce((acc, s) => acc + s.actual_minutes, 0) || 1;
        const pct = Math.round((totalSubMinutes / totalFocus) * 100);

        return {
          subject_id: sub.id,
          subject_name: sub.name,
          color: sub.color,
          total_minutes: totalSubMinutes,
          percentage: pct,
          tasks_completed: subTasksDone,
        };
      });

      // Calculate streak days
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const hasSession = sessions.some((s) => s.completed_at.startsWith(dateStr));
        if (hasSession) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Upcoming deadlines (incomplete tasks due in next 7 days)
      const now = new Date();
      const inSevenDays = new Date();
      inSevenDays.setDate(inSevenDays.getDate() + 7);
      const upcomingDeadlines = tasks.filter((t) => {
        if (t.is_completed) return false;
        const due = new Date(t.due_date);
        return due >= now && due <= inSevenDays;
      }).length;

      return {
        total_study_minutes_today: totalMinutesToday,
        total_study_minutes_this_week: totalMinutesWeek,
        study_sessions_completed: sessions.length,
        task_completion_rate: taskCompletionRate,
        overall_syllabus_completion_rate: syllabusRate,
        consistency_streak_days: streak,
        daily_trends: dailyTrends,
        subject_distributions: subjectDist,
        upcoming_deadlines_count: upcomingDeadlines,
        overloaded_days_count: 0,
      };
    },
  },
};
