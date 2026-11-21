import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  LifeBuoy,
  Target,
  Timer,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Task, ScheduleItem, Subject, FocusSession } from '../../types';
import { formatMinutesToHours, isDateToday, formatTime12h } from '../../utils/dateUtils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PriorityBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Checkbox } from '../../components/ui/Checkbox';
import { Countdown } from '../../components/tasks/Countdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { RecoveryEngine } from '../../utils/recoveryEngine';
import { useGreetingQuote } from '../../utils/greetingQuotes';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  const { greeting, emoji, quote, period } = useGreetingQuote(user?.id || 'student');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [t, s, sub, sess] = await Promise.all([
        api.tasks.getTasks(),
        api.schedule.getSchedule(),
        api.subjects.getSubjects(),
        api.focus.getFocusSessions(),
      ]);
      setTasks(t);
      setSchedule(s);
      setSubjects(sub);
      setSessions(sess);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      const updated = await api.tasks.toggleTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (updated.is_completed) {
        success('Task Completed', `Great job finishing "${updated.title}"!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations from real data
  const today = new Date();
  const todayDayOfWeek = today.getDay();
  const todayDateStr = today.toISOString().split('T')[0];

  const todaySchedule = schedule
    .filter((item) => (item.is_recurring ? item.day_of_week === todayDayOfWeek : item.specific_date === todayDateStr))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const todayTasks = tasks.filter((t) => t.due_date.startsWith(todayDateStr) || isDateToday(t.due_date));
  const pendingTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);
  const overdueTasks = tasks.filter((t) => !t.is_completed && new Date(t.due_date) < today);

  const todaySessions = sessions.filter((s) => isDateToday(s.completed_at));
  const focusMinutesToday = todaySessions.reduce((acc, s) => acc + s.actual_minutes, 0);
  const targetMinutes = user?.daily_study_target_minutes || 240;
  const targetProgress = Math.min(100, Math.round((focusMinutesToday / targetMinutes) * 100));

  // Overall syllabus completion
  const totalTopics = subjects.reduce((acc, s) => acc + (s.topics_count || 0), 0);
  const completedTopics = subjects.reduce((acc, s) => acc + (s.completed_topics_count || 0), 0);
  const syllabusProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Recovery analysis
  const recoveryPlan = RecoveryEngine.analyze(tasks, schedule, today);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Editorial Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-border dark:border-slate-800 pb-6">
        <div>
          <div className="text-xs uppercase font-semibold tracking-wider text-charcoal-light dark:text-slate-400 flex items-center gap-1.5 mb-1">
            <span>{emoji}</span> {period.toUpperCase()} FOCUS
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-charcoal-primary dark:text-white tracking-tight">
            {greeting}, {user?.full_name?.split(' ')[0] || user?.username || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
            <span>
              {today.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="italic font-editorial text-brand-700 dark:text-brand-300">"{quote}"</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/app/focus">
            <Button size="sm" variant="secondary" leftIcon={<Timer className="w-4 h-4 text-brand-600" />}>
              Focus Timer
            </Button>
          </Link>
          <Link to="/app/tasks">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Focus Progress */}
        <Card className="p-5 border-paper-border dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light dark:text-slate-400">
              Daily Focus Target
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Clock size={15} />
            </div>
          </div>
          <div>
            <div className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
              {formatMinutesToHours(focusMinutesToday)}
              <span className="text-xs text-charcoal-muted dark:text-slate-400 ml-1.5 font-sans">
                / {formatMinutesToHours(targetMinutes)}
              </span>
            </div>
            <p className="text-[11px] text-charcoal-light dark:text-slate-400 mt-0.5">
              {targetProgress}% of daily goal
            </p>
          </div>
          <ProgressBar value={targetProgress} variant="brand" size="xs" />
        </Card>

        {/* Metric 2: Tasks Due Today */}
        <Card className="p-5 border-paper-border dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light dark:text-slate-400">
              Tasks Due Today
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div>
            <div className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
              {todayTasks.length}
            </div>
            <p className="text-[11px] text-charcoal-light dark:text-slate-400 mt-0.5">
              {todayTasks.filter((t) => t.is_completed).length} completed • {todayTasks.filter((t) => !t.is_completed).length} remaining
            </p>
          </div>
          <div className="flex gap-1.5 text-xs">
            <Link to="/app/tasks" className="text-brand-600 hover:underline text-[11px] font-medium">
              Manage Tasks →
            </Link>
          </div>
        </Card>

        {/* Metric 3: Syllabus Mastery */}
        <Card className="p-5 border-paper-border dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light dark:text-slate-400">
              Syllabus Mastery
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen size={15} />
            </div>
          </div>
          <div>
            <div className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
              {syllabusProgress}%
            </div>
            <p className="text-[11px] text-charcoal-light dark:text-slate-400 mt-0.5">
              {completedTopics} of {totalTopics} syllabus topics mastered
            </p>
          </div>
          <ProgressBar value={syllabusProgress} variant="success" size="xs" />
        </Card>

        {/* Metric 4: Recovery Engine Alert / Health */}
        <Card className="p-5 border-paper-border dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light dark:text-slate-400">
              Recovery Health
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <LifeBuoy size={15} />
            </div>
          </div>
          <div>
            <div className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white flex items-center gap-2">
              {overdueTasks.length > 0 ? (
                <span className="text-rose-600">{overdueTasks.length} Overdue</span>
              ) : (
                <span className="text-emerald-600 font-medium">Optimal</span>
              )}
            </div>
            <p className="text-[11px] text-charcoal-light dark:text-slate-400 mt-0.5">
              {recoveryPlan.overloaded_days.length > 0
                ? `${recoveryPlan.overloaded_days.length} overloaded day detected`
                : 'No schedule conflicts detected'}
            </p>
          </div>
          <div>
            <Link to="/app/recovery" className="text-brand-600 hover:underline text-[11px] font-medium">
              View Recovery Plan →
            </Link>
          </div>
        </Card>
      </div>

      {/* Main Grid: Today's Timetable + Priority Tasks Due Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Tasks Due Soon */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
              Priority Tasks & Live Deadlines
            </h3>
            <Link to="/app/tasks" className="text-xs text-brand-600 hover:underline font-medium">
              View All Tasks ({pendingTasks.length})
            </Link>
          </div>

          {pendingTasks.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All caught up!"
              subtitle="No pending tasks on your plate right now. Enjoy your rest or plan ahead."
              action={
                <Link to="/app/tasks">
                  <Button size="sm">+ Create Task</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-xs hover:border-brand-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox
                      checked={task.is_completed}
                      onChange={() => handleToggleTask(task.id)}
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-charcoal-primary dark:text-white truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-charcoal-muted dark:text-slate-400">
                        {task.subject && (
                          <span
                            className="inline-flex items-center px-1.5 py-0.2 rounded font-medium text-[10px]"
                            style={{
                              backgroundColor: `${task.subject.color}15`,
                              color: task.subject.color,
                            }}
                          >
                            {task.subject.code || task.subject.name}
                          </span>
                        )}
                        <span>{task.estimated_duration_minutes}m est.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={task.priority} size="sm" />
                    <Countdown task={task} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Today's Schedule */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
              Today's Schedule
            </h3>
            <Link to="/app/timetable" className="text-xs text-brand-600 hover:underline font-medium">
              Full Timetable
            </Link>
          </div>

          <Card className="p-4 border-paper-border dark:border-slate-800 space-y-3">
            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center text-xs text-charcoal-muted dark:text-slate-400 space-y-2">
                <Calendar size={20} className="mx-auto text-charcoal-light" />
                <p>No classes or study sessions scheduled today.</p>
                <Link to="/app/timetable" className="text-brand-600 hover:underline font-medium block">
                  + Add to Timetable
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-paper-canvas dark:bg-slate-800/60 border border-paper-border dark:border-slate-700/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-charcoal-primary dark:text-white truncate pr-2">
                        {item.title}
                      </span>
                      <span className="text-[11px] font-mono text-brand-700 dark:text-brand-300 shrink-0">
                        {formatTime12h(item.start_time)} – {formatTime12h(item.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-charcoal-muted dark:text-slate-400">
                      {item.subject && (
                        <span className="font-medium text-charcoal-primary dark:text-slate-300">
                          {item.subject.name}
                        </span>
                      )}
                      {item.location && <span>📍 {item.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Focus Mode Card */}
          <Card className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                <Timer size={14} /> Ready to dive in?
              </span>
              <span className="text-[10px] text-brand-600 font-mono">Pomodoro</span>
            </div>
            <p className="text-xs text-charcoal-muted dark:text-slate-300 leading-relaxed">
              Launch a 25-minute deep focus block linked to your top priority task.
            </p>
            <Link to="/app/focus" className="block pt-1">
              <Button size="sm" className="w-full" leftIcon={<Play size={12} fill="currentColor" />}>
                Start Focus Session
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
