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
import { ProgressBar } from '../../components/ui/ProgressBar';
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
        <p className="text-xs text-charcoal-muted animate-pulse">Calculating semester academic analytics...</p>
      </div>
    );
  }

  // Find max daily focus for SVG scale (at least 240m = 4h)
  const maxDailyMinutes = Math.max(
    240,
    ...analytics.daily_trends.map((d) => Math.max(d.focus_minutes, d.target_minutes))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-paper-border dark:border-slate-800 pb-5">
        <h1 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white tracking-tight">
          Academic Analytics & Consistency
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-0.5">
          Evaluate study momentum, task completion rates, and subject distributions.
        </p>
      </div>

      {/* 4 Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-paper-border dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light">Total Focus Today</span>
          <div className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
            {formatMinutesToHours(analytics.total_study_minutes_today)}
          </div>
          <p className="text-[11px] text-charcoal-muted">Target: ~4 hours daily</p>
        </Card>

        <Card className="p-5 border-paper-border dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light">This Week's Focus</span>
          <div className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
            {formatMinutesToHours(analytics.total_study_minutes_this_week)}
          </div>
          <p className="text-[11px] text-charcoal-muted">{analytics.study_sessions_completed} sessions logged</p>
        </Card>

        <Card className="p-5 border-paper-border dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light">Task Completion Rate</span>
          <div className="font-editorial text-2xl font-medium text-brand-600 dark:text-brand-400">
            {analytics.task_completion_rate}%
          </div>
          <p className="text-[11px] text-charcoal-muted">Across all semester tasks</p>
        </Card>

        <Card className="p-5 border-paper-border dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light">Consistency Streak</span>
          <div className="font-editorial text-2xl font-medium text-emerald-600 dark:text-emerald-400">
            {analytics.consistency_streak_days} Days
          </div>
          <p className="text-[11px] text-charcoal-muted">Consecutive active study days</p>
        </Card>
      </div>

      {/* Daily Study Trends Bar Chart */}
      <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-paper-border dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
              Daily Study Trends (Past 7 Days)
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">Focus minutes vs. daily target threshold.</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-charcoal-muted">
              <span className="w-3 h-3 rounded bg-brand-600" /> Focus Time
            </span>
            <span className="flex items-center gap-1.5 text-charcoal-muted">
              <span className="w-3 h-3 rounded bg-paper-border dark:bg-slate-700" /> Daily Target
            </span>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="h-60 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
          {analytics.daily_trends.map((day, idx) => {
            const barHeightPct = Math.min(100, Math.round((day.focus_minutes / maxDailyMinutes) * 100));
            const targetHeightPct = Math.min(100, Math.round((day.target_minutes / maxDailyMinutes) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-mono text-charcoal-light">
                  {day.focus_minutes > 0 ? `${day.focus_minutes}m` : '0'}
                </span>
                <div className="w-full max-w-[48px] h-44 bg-paper-canvas dark:bg-slate-800 rounded-xl relative flex items-end overflow-hidden">
                  {/* Target line mark */}
                  <div
                    className="absolute w-full border-t border-dashed border-charcoal-light/40"
                    style={{ bottom: `${targetHeightPct}%` }}
                  />
                  {/* Active Bar */}
                  <div
                    className="w-full bg-brand-600 dark:bg-brand-500 rounded-xl transition-all duration-500"
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-charcoal-primary dark:text-slate-300">
                  {day.day_label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Subject Distribution */}
      <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-subtle space-y-4">
        <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
          Study Time Allocation by Subject
        </h3>

        {analytics.subject_distributions.length === 0 ? (
          <p className="text-xs text-charcoal-muted italic py-4">No logged study sessions for enrolled subjects yet.</p>
        ) : (
          <div className="space-y-4">
            {analytics.subject_distributions.map((sub) => (
              <div key={sub.subject_id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                    <span className="font-semibold text-charcoal-primary dark:text-white">{sub.subject_name}</span>
                  </div>
                  <span className="text-charcoal-muted">
                    {formatMinutesToHours(sub.total_minutes)} ({sub.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-paper-canvas dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${sub.percentage}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
