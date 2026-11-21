import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { api } from '../../services/api';
import { Task, ScheduleItem, RecoveryPlan, RescheduleSuggestion } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PriorityBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RecoveryEngine } from '../../utils/recoveryEngine';
import { formatTime12h, formatMinutesToHours } from '../../utils/dateUtils';

export const RecoveryEnginePage: React.FC = () => {
  const { success, info } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [plan, setPlan] = useState<RecoveryPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const runAnalysis = async () => {
    try {
      setLoading(true);
      const [t, s] = await Promise.all([api.tasks.getTasks(), api.schedule.getSchedule()]);
      setTasks(t);
      setSchedule(s);
      const analysis = RecoveryEngine.analyze(t, s, new Date());
      setPlan(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const handleAcceptSuggestion = async (suggestion: RescheduleSuggestion) => {
    try {
      const newDueDateTime = `${suggestion.suggested_new_date}T${
        suggestion.suggested_time_slot?.end || '17:00'
      }:00Z`;

      await api.tasks.updateTask(suggestion.task_id, {
        due_date: newDueDateTime,
        rescheduled_from: suggestion.original_due_date,
      });

      // Update local suggestion status
      setPlan((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          suggestions: prev.suggestions.map((s) =>
            s.id === suggestion.id ? { ...s, status: 'accepted' } : s
          ),
        };
      });

      success('Task Rescheduled', `Moved "${suggestion.task_title}" to ${suggestion.suggested_new_date}.`);
      await runAnalysis();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <LifeBuoy size={12} className="text-rose-500" />
            <span>Autonomous Academic Balance</span>
          </div>
          <h1 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white tracking-tight">
            StudyFlow Recovery Engine
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-0.5">
            Automatic capacity analysis, overload warnings, and guilt-free rescheduling.
          </p>
        </div>
        <Button
          onClick={runAnalysis}
          variant="outline"
          leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          Re-Analyze Calendar
        </Button>
      </div>

      {/* Summary Card */}
      {plan && (
        <Card className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-border dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light dark:text-slate-400">
                Cognitive Workload Summary
              </span>
              <h2 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white mt-0.5">
                {plan.recommendation_summary}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700 font-medium">
                {plan.overdue_tasks_count} Overdue Tasks
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700 font-medium">
                {plan.overloaded_days.length} Overloaded Days
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
            <div className="p-3.5 rounded-xl bg-paper-canvas dark:bg-slate-800/60 border border-paper-border dark:border-slate-700/60">
              <span className="text-charcoal-light dark:text-slate-400 block mb-1">Status</span>
              <span className="font-bold text-sm text-charcoal-primary dark:text-white">
                {plan.suggestions.length > 0 ? 'Recovery Plan Generated' : 'Schedule In Equilibrium'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-paper-canvas dark:bg-slate-800/60 border border-paper-border dark:border-slate-700/60">
              <span className="text-charcoal-light dark:text-slate-400 block mb-1">Recommended Adjustments</span>
              <span className="font-bold text-sm text-brand-600 dark:text-brand-400">
                {plan.suggestions.length} Tasks Ready to Relocate
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-paper-canvas dark:bg-slate-800/60 border border-paper-border dark:border-slate-700/60">
              <span className="text-charcoal-light dark:text-slate-400 block mb-1">Max Daily Capacity</span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                480 mins (8h) Sustainable Max
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Overloaded Days Section */}
      <div className="space-y-4">
        <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
          Overload Capacity Warnings
        </h3>

        {plan?.overloaded_days.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>All upcoming days are within your sustainable study limits. No burnout bottlenecks detected.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan?.overloaded_days.map((warning, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-500" />
                    <span className="font-semibold text-sm text-charcoal-primary dark:text-white">
                      {warning.day_name} ({warning.date})
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                    +{warning.overload_by_minutes}m Overload
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-charcoal-muted dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Scheduled Classes:</span>
                    <span className="font-medium text-charcoal-primary dark:text-white">
                      {formatMinutesToHours(warning.total_scheduled_minutes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Planned Task Time:</span>
                    <span className="font-medium text-charcoal-primary dark:text-white">
                      {formatMinutesToHours(warning.total_task_minutes)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-paper-border dark:border-slate-800 font-semibold text-rose-600">
                    <span>Total Required:</span>
                    <span>
                      {formatMinutesToHours(warning.total_scheduled_minutes + warning.total_task_minutes)} (Limit: 8h)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Suggestions */}
      <div className="space-y-4">
        <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
          Intelligent Reschedule Suggestions
        </h3>

        {plan?.suggestions.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No rescheduling needed"
            subtitle="Your current tasks fit comfortably into your schedule without conflicting lectures or capacity overloads."
          />
        ) : (
          <div className="space-y-3">
            {plan?.suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-xs space-y-3 hover:border-brand-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <PriorityBadge priority={suggestion.priority} size="sm" />
                    <span className="font-semibold text-sm text-charcoal-primary dark:text-white">
                      {suggestion.task_title}
                    </span>
                  </div>
                  <span className="text-xs text-charcoal-light">
                    Duration: ~{suggestion.estimated_duration_minutes}m
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-charcoal-muted dark:text-slate-300">
                      <strong>Current Due:</strong> {suggestion.original_due_date.split('T')[0]}
                    </p>
                    <p className="text-brand-700 dark:text-brand-300 font-medium">
                      <strong>Suggested New Slot:</strong> {suggestion.suggested_new_date}
                      {suggestion.suggested_time_slot && (
                        <span> ({formatTime12h(suggestion.suggested_time_slot.start)} – {formatTime12h(suggestion.suggested_time_slot.end)})</span>
                      )}
                    </p>
                    <p className="text-[11px] text-charcoal-light dark:text-slate-400 italic">
                      Reason: {suggestion.reason}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    rightIcon={<ArrowRight size={13} />}
                  >
                    Accept Slot
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
