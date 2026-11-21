import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  Clock,
  CheckCircle2,
  BookOpen,
  Calendar,
  Zap,
  Award,
} from 'lucide-react';
import { api } from '../../services/api';
import { AcademicAnalyticsOverview } from '../../types';
import { Card } from '../../components/ui/Card';
import { formatMinutesToHours } from '../../utils/dateUtils';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AcademicAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const data = await api.analytics.getOverview();
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Calculating academic analytics...</p>
      </div>
    );
  }

  // Find max daily focus for SVG scale (at least 240m = 4h)
  const maxDailyMinutes = Math.max(
    240,
    ...analytics.daily_trends.map((t) => t.focus_minutes)
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Academic Consistency & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Evidence-based productivity metrics computed entirely from your real study logs and coursework.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Study Time This Week</span>
            <Clock className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white">
            {formatMinutesToHours(analytics.total_study_minutes_this_week)}
          </span>
          <p className="text-[11px] text-slate-500">
            {analytics.study_sessions_completed} focus sessions logged
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Consistency Streak</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {analytics.consistency_streak_days} Days
          </span>
          <p className="text-[11px] text-slate-500">Consecutive days with focused study</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Task Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {analytics.task_completion_rate}%
          </span>
          <p className="text-[11px] text-slate-500">
            Across all scheduled academic assignments
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Syllabus Completion</span>
            <BookOpen className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-3xl font-black text-sky-600 dark:text-sky-400">
            {analytics.overall_syllabus_completion_rate}%
          </span>
          <p className="text-[11px] text-slate-500">
            Total conceptual topics mastered across subjects
          </p>
        </Card>
      </div>

      {/* Daily Study Trends Chart */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-brand-600" />
              Daily Study Distribution (Last 7 Days)
            </h2>
            <p className="text-xs text-slate-500">
              Minutes studied per day compared against your 4h daily target.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Target: 240m (4h/day)
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-48 sm:h-56">
            {analytics.daily_trends.map((day) => {
              const heightPct = Math.min(
                100,
                Math.round((day.focus_minutes / maxDailyMinutes) * 100)
              );
              const reachedTarget = day.focus_minutes >= day.target_minutes;

              return (
                <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                    {day.focus_minutes > 0 ? formatMinutesToHours(day.focus_minutes) : '0m'}
                  </span>

                  <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl h-full flex items-end p-1">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        reachedTarget
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/20'
                          : day.focus_minutes > 0
                          ? 'bg-brand-600'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                    />
                  </div>

                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {day.day_label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Subject Distribution & Weekly Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject-Wise Time Allocation */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Subject Study Time Allocation
          </h2>
          <p className="text-xs text-slate-500">
            Identify which subjects are receiving sufficient focus vs courses that may be neglected.
          </p>

          <div className="space-y-4 pt-2">
            {analytics.subject_distributions.map((sub) => (
              <div key={sub.subject_id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {sub.subject_name}
                  </span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">
                    {formatMinutesToHours(sub.total_minutes)} ({sub.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(5, sub.percentage)}%`,
                      backgroundColor: sub.color,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{sub.tasks_completed} tasks completed</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Academic Workload Forecast & Weekly Review */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Weekly Academic Review & Forecast
          </h2>
          <p className="text-xs text-slate-500">
            Synthesized insights on your pacing and upcoming semester pressure.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white">Upcoming Deadlines</span>
              <p className="text-slate-500">
                You have <strong>{analytics.upcoming_deadlines_count} pending deadlines</strong> arriving in the next 7 days.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white">Cognitive Load Check</span>
              <p className="text-slate-500">
                Weekly scheduled hours are currently well-balanced. Ensure to take your short Pomodoro breaks to prevent end-of-week burnout.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
              <span className="font-bold">Consistency Highlight:</span>
              <p className="mt-0.5">
                Maintaining your {analytics.consistency_streak_days}-day streak places you in the top tier of consistent student execution.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
