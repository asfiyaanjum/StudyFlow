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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Task, ScheduleItem, Subject, FocusSession } from '../../types';
import { getGreeting, formatMinutesToHours, isDateToday, formatTime12h } from '../../utils/dateUtils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PriorityBadge } from '../../components/ui/Badge';
import { RecoveryEngine } from '../../utils/recoveryEngine';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Recovery analysis
  const recoveryPlan = RecoveryEngine.analyze(tasks, schedule, today);

  const motivationalQuotes = [
    '“Consistency isn’t about being perfect. It’s about not stopping when you fall behind.”',
    '“Small focus blocks executed daily outperform desperate all-nighters every time.”',
    '“Mastery is built topic by topic, proof by proof, unit by unit.”',
  ];
  const quote = motivationalQuotes[today.getDate() % motivationalQuotes.length];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || user?.username || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>
              {today.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="italic text-slate-600 dark:text-slate-300">{quote}</span>
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
              Add Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Recovery Engine Alert Banner (if overdue tasks or overloaded days) */}
      {overdueTasks.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-brand-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                StudyFlow Recovery Engine Active
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  {overdueTasks.length} Overdue
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {recoveryPlan.recommendation_summary}
              </p>
            </div>
          </div>
          <Link to="/app/recovery">
            <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Review Recovery Plan
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Study Progress */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Daily Study Goal</span>
            <Clock className="w-4 h-4 text-brand-500" />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatMinutesToHours(focusMinutesToday)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Target: {formatMinutesToHours(targetMinutes)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${targetProgress}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {targetProgress >= 100 ? 'Daily goal reached! Keep it up.' : `${targetProgress}% of target completed`}
          </p>
        </Card>

        {/* Pending & Completed Tasks */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Tasks Overview</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {pendingTasks.length} Pending
              </span>
              <span className="text-xs text-emerald-600 font-bold">
                {completedTasks.length} Done
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {tasks.length > 0
              ? `${Math.round((completedTasks.length / tasks.length) * 100)}% overall completion rate`
              : 'No tasks scheduled yet'}
          </p>
        </Card>

        {/* Active Subjects */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Enrolled Subjects</span>
            <BookOpen className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {subjects.length} Subjects
            </span>
            <div className="flex items-center gap-1.5 mt-2.5">
              {subjects.slice(0, 5).map((sub) => (
                <span
                  key={sub.id}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sub.color }}
                  title={sub.name}
                />
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {subjects.reduce((sum, s) => sum + (s.completed_topics_count || 0), 0)} syllabus topics completed
          </p>
        </Card>

        {/* Study Consistency */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Academic Streak</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">5 Days</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {sessions.length} total focus sessions logged
            </p>
          </div>
          <p className="text-[11px] text-slate-500">Consistent daily study beats cramming</p>
        </Card>
      </div>

      {/* Main Content Split: Today's Schedule & Today's Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 & 2: Priority Tasks & Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
              Today's Academic Tasks
            </h2>
            <Link to="/app/tasks" className="text-xs font-semibold text-brand-600 hover:text-brand-500">
              View All Tasks ({tasks.length}) →
            </Link>
          </div>

          <Card className="p-0 overflow-hidden">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No tasks due today!
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You're clear for today. You can pick an upcoming topic from your syllabus or add a new task.
                </p>
                <Link to="/app/tasks">
                  <Button size="sm" variant="outline">
                    Schedule a Task
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          task.is_completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'
                        }`}
                      >
                        {task.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div className="min-w-0 space-y-1">
                        <p
                          className={`text-sm font-medium text-slate-900 dark:text-white truncate ${
                            task.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {task.subject && (
                            <span
                              className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                              style={{ backgroundColor: task.subject.color }}
                            >
                              {task.subject.code || task.subject.name}
                            </span>
                          )}
                          <PriorityBadge priority={task.priority} />
                          <span className="text-slate-400">
                            ⏱ {task.estimated_duration_minutes}m est.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Link to={`/app/focus?taskId=${task.id}`}>
                        <Button size="sm" variant="ghost" title="Start Focus Session on this Task">
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Overdue Items Quick Alert */}
          {overdueTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Overdue Tasks Requiring Attention ({overdueTasks.length})
              </h3>
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
                      <p className="text-rose-500">Original due: {new Date(task.due_date).toLocaleDateString()}</p>
                    </div>
                    <Link to="/app/recovery">
                      <Button size="sm" variant="outline" className="text-xs py-1">
                        Reschedule
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Today's Timetable Schedule */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Today's Schedule
            </h2>
            <Link to="/app/timetable" className="text-xs font-semibold text-brand-600 hover:text-brand-500">
              Timetable →
            </Link>
          </div>

          <Card className="p-4 space-y-3">
            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No classes or sessions scheduled today
                </p>
                <p className="text-[11px] text-slate-400">
                  A great opportunity for deep self-study or revision.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.activity_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>
                        {formatTime12h(item.start_time)} – {formatTime12h(item.end_time)}
                      </span>
                      {item.location && <span>📍 {item.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Study Session Starter */}
          <Card className="p-5 bg-gradient-to-br from-brand-600 to-indigo-700 text-white space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Quick Focus Session
            </h3>
            <p className="text-xs text-brand-100 leading-relaxed">
              Ready to dive into deep work? Start a 25-minute Pomodoro block right now.
            </p>
            <Link to="/app/focus" className="block pt-1">
              <Button size="sm" className="w-full bg-white text-brand-700 hover:bg-brand-50 font-bold">
                Launch Focus Room
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
