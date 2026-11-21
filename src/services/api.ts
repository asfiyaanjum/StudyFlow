import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MockStorage } from './mockStorage';
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
 * StudyFlow Unified Service Layer
 * Seamlessly interfaces with Supabase with complete local persistence fallback
 */
export const api = {
  // --------------------------------------------------------------------------
  // AUTHENTICATION & PROFILE
  // --------------------------------------------------------------------------
  auth: {
    async getCurrentUser(): Promise<UserProfile | null> {
      if (!isSupabaseConfigured()) {
        return MockStorage.getUser();
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Fallback default profile
        return {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'student',
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          daily_study_target_minutes: 180,
          created_at: user.created_at,
          updated_at: user.created_at,
        };
      }

      return profile as UserProfile;
    },

    async signIn(identifier: string, password: string):Promise<{ user: UserProfile | null; error: string | null }> {
      if (!isSupabaseConfigured()) {
        const user = MockStorage.getUser();
        if (
          (identifier.toLowerCase() === user.username.toLowerCase() ||
           identifier.toLowerCase() === user.email.toLowerCase()) &&
          password.length >= 6
        ) {
          return { user, error: null };
        }
        if (password.length < 6) {
          return { user: null, error: 'Password must be at least 6 characters.' };
        }
        // Generic error to prevent enumeration
        return { user: null, error: 'Invalid username/email or password.' };
      }

      let email = identifier;

      // If user provided a username rather than an email, resolve it securely
      if (!identifier.includes('@')) {
        const { data: resolvedEmail, error: rpcError } = await supabase.rpc(
          'resolve_username_to_email',
          { p_username: identifier }
        );

        if (rpcError || !resolvedEmail) {
          return { user: null, error: 'Invalid username or password.' };
        }
        email = resolvedEmail;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        user: profile as UserProfile,
        error: null,
      };
    },

    async signUp(
      username: string,
      email: string,
      password: string,
      fullName?: string
    ): Promise<{ user: UserProfile | null; error: string | null; emailConfirmationRequired: boolean }> {
      if (!isSupabaseConfigured()) {
        const newUser: UserProfile = {
          id: `user_${Date.now()}`,
          username: username.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          full_name: fullName || username,
          daily_study_target_minutes: 180,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        MockStorage.updateUser(newUser);
        return { user: newUser, error: null, emailConfirmationRequired: false };
      }

      // Check username availability
      const { data: isAvailable } = await supabase.rpc('is_username_available', {
        p_username: username,
      });

      if (isAvailable === false) {
        return { user: null, error: 'Username is already taken.', emailConfirmationRequired: false };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase().trim(),
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message, emailConfirmationRequired: false };
      }

      const emailConfirmationRequired = !data.session;
      const userProfile: UserProfile = {
        id: data.user?.id || '',
        username,
        email,
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
    },

    async signOut(): Promise<void> {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    },

    async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
      if (!isSupabaseConfigured()) {
        return { success: true, error: null };
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { success: !error, error: error ? error.message : null };
    },

    async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
      if (!isSupabaseConfigured()) {
        return { success: true, error: null };
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { success: !error, error: error ? error.message : null };
    },

    async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
      if (!isSupabaseConfigured()) {
        return MockStorage.updateUser(updates);
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
  // USER SETTINGS
  // --------------------------------------------------------------------------
  settings: {
    async getSettings(): Promise<UserSettings> {
      if (!isSupabaseConfigured()) {
        return MockStorage.getSettings();
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return MockStorage.getSettings();

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return MockStorage.getSettings();
      }
      return data as UserSettings;
    },

    async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
      if (!isSupabaseConfigured()) {
        return MockStorage.updateSettings(settings);
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return MockStorage.updateSettings(settings);

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
  // SUBJECTS & SYLLABUS
  // --------------------------------------------------------------------------
  subjects: {
    async getSubjects(): Promise<Subject[]> {
      if (!isSupabaseConfigured()) {
        return MockStorage.getSubjects();
      }
      const { data, error } = await supabase
        .from('subjects')
        .select('*, units:syllabus_units(id, topics:syllabus_topics(id, is_completed))')
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

    async createSubject(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>): Promise<Subject> {
      if (!isSupabaseConfigured()) {
        return MockStorage.addSubject(subject);
      }
      const { data, error } = await supabase.from('subjects').insert(subject).select().single();
      if (error) throw error;
      return data as Subject;
    },

    async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
      if (!isSupabaseConfigured()) {
        const res = MockStorage.updateSubject(id, updates);
        if (!res) throw new Error('Subject not found');
        return res;
      }
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
      if (!isSupabaseConfigured()) {
        MockStorage.deleteSubject(id);
        return;
      }
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },

    async getSyllabus(subjectId: string): Promise<SyllabusUnit[]> {
      if (!isSupabaseConfigured()) {
        return MockStorage.getSyllabusUnits(subjectId);
      }
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

    async createUnit(unit: Omit<SyllabusUnit, 'id' | 'created_at' | 'updated_at'>): Promise<SyllabusUnit> {
      if (!isSupabaseConfigured()) {
        return MockStorage.addSyllabusUnit(unit);
      }
      const { data, error } = await supabase.from('syllabus_units').insert(unit).select().single();
      if (error) throw error;
      return data as SyllabusUnit;
    },

    async createTopic(topic: Omit<SyllabusTopic, 'id' | 'created_at' | 'updated_at'>): Promise<SyllabusTopic> {
      if (!isSupabaseConfigured()) {
        return MockStorage.addSyllabusTopic(topic);
      }
      const { data, error } = await supabase.from('syllabus_topics').insert(topic).select().single();
      if (error) throw error;
      return data as SyllabusTopic;
    },

    async toggleTopicComplete(topicId: string, isCompleted: boolean): Promise<SyllabusTopic> {
      if (!isSupabaseConfigured()) {
        const updated = MockStorage.toggleTopicComplete(topicId);
        if (!updated) throw new Error('Topic not found');
        return updated;
      }
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
  // TASKS MANAGEMENT
  // --------------------------------------------------------------------------
  tasks: {
    async getTasks(): Promise<Task[]> {
      if (!isSupabaseConfigured()) {
        return MockStorage.getTasks();
      }
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subject:subjects(*)')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data || []) as Task[];
    },

    async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
      if (!isSupabaseConfigured()) {
        return MockStorage.addTask(task);
      }
      const { data, error } = await supabase.from('tasks').insert(task).select('*, subject:subjects(*)').single();
      if (error) throw error;
      return data as Task;
    },

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
      if (!isSupabaseConfigured()) {
        const res = MockStorage.updateTask(id, updates);
        if (!res) throw new Error('Task not found');
        return res;
      }
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
      if (!isSupabaseConfigured()) {
        MockStorage.deleteTask(id);
        return;
      }
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },

    async toggleTask(id: string): Promise<Task> {
      if (!isSupabaseConfigured()) {
        const res = MockStorage.toggleTaskComplete(id);
        if (!res) throw new Error('Task not found');
        return res;
      }
      const { data: currentTask } = await supabase.from('tasks').select('is_completed').eq('id', id).single();
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
  // SCHEDULE / TIMETABLE
  // --------------------------------------------------------------------------
  schedule: {
    async getSchedule(): Promise<ScheduleItem[]> {
      if (!isSupabaseConfigured()) {
        return MockStorage.getSchedule();
      }
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*, subject:subjects(*)')
        .order('start_time', { ascending: true });
      if (error) throw error;
      return (data || []) as ScheduleItem[];
    },

    async createScheduleItem(item: Omit<ScheduleItem, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduleItem> {
      if (!isSupabaseConfigured()) {
        return MockStorage.addScheduleItem(item);
      }
      const { data, error } = await supabase
        .from('schedule_items')
        .insert(item)
        .select('*, subject:subjects(*)')
        .single();
      if (error) throw error;
      return data as ScheduleItem;
    },

    async updateScheduleItem(id: string, updates: Partial<ScheduleItem>): Promise<ScheduleItem> {
      if (!isSupabaseConfigured()) {
        const res = MockStorage.updateScheduleItem(id, updates);
        if (!res) throw new Error('Schedule item not found');
        return res;
      }
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
      if (!isSupabaseConfigured()) {
        MockStorage.deleteScheduleItem(id);
        return;
      }
      const { error } = await supabase.from('schedule_items').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // --------------------------------------------------------------------------
  // GOALS & PLANS
  // --------------------------------------------------------------------------
  goals: {
    async getGoals(): Promise<Goal[]> {
      if (!isSupabaseConfigured()) {
        return MockStorage.getGoals();
      }
      const { data, error } = await supabase
        .from('goals')
        .select('*, subject:subjects(*)')
        .order('target_date', { ascending: true });
      if (error) throw error;
      return (data || []) as Goal[];
    },

    async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
      if (!isSupabaseConfigured()) {
        return MockStorage.addGoal(goal);
      }
      const { data, error } = await supabase.from('goals').insert(goal).select('*, subject:subjects(*)').single();
      if (error) throw error;
      return data as Goal;
    },

    async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
      if (!isSupabaseConfigured()) {
        const res = MockStorage.updateGoal(id, updates);
        if (!res) throw new Error('Goal not found');
        return res;
      }
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
      if (!isSupabaseConfigured()) {
        MockStorage.deleteGoal(id);
        return;
      }
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    },
  },

  plans: {
    async getPlans(): Promise<Plan[]> {
      if (!isSupabaseConfigured()) {
        return MockStorage.getPlans();
      }
      const { data, error } = await supabase
        .from('plans')
        .select('*, subject:subjects(*)')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return (data || []) as Plan[];
    },

    async createPlan(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan> {
      if (!isSupabaseConfigured()) {
        return MockStorage.addPlan(plan);
      }
      const { data, error } = await supabase.from('plans').insert(plan).select('*, subject:subjects(*)').single();
      if (error) throw error;
      return data as Plan;
    },

    async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan> {
      if (!isSupabaseConfigured()) {
        const res = MockStorage.updatePlan(id, updates);
        if (!res) throw new Error('Plan not found');
        return res;
      }
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
      if (!isSupabaseConfigured()) {
        MockStorage.deletePlan(id);
        return;
      }
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // --------------------------------------------------------------------------
  // FOCUS TIMER & SESSIONS
  // --------------------------------------------------------------------------
  focus: {
    async getFocusSessions(): Promise<FocusSession[]> {
      if (!isSupabaseConfigured()) {
        return MockStorage.getFocusSessions();
      }
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*, subject:subjects(*), task:tasks(*)')
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return (data || []) as FocusSession[];
    },

    async logSession(session: Omit<FocusSession, 'id' | 'created_at'>): Promise<FocusSession> {
      if (!isSupabaseConfigured()) {
        return MockStorage.logFocusSession(session);
      }
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert(session)
        .select('*, subject:subjects(*), task:tasks(*)')
        .single();
      if (error) throw error;
      return data as FocusSession;
    },
  },

  // --------------------------------------------------------------------------
  // ANALYTICS & CONSISTENCY
  // --------------------------------------------------------------------------
  analytics: {
    async getOverview(): Promise<AcademicAnalyticsOverview> {
      const tasks = await api.tasks.getTasks();
      const sessions = await api.focus.getFocusSessions();
      const subjects = await api.subjects.getSubjects();

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
      const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

      // Calculate streak days (consecutive days with > 0 minutes study)
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const hasSession = sessions.some((s) => s.completed_at.startsWith(dateStr));
        if (hasSession) {
          streak++;
        } else if (i > 0) {
          break; // broke streak
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

