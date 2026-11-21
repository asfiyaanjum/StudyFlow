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
} from 'lucide-react';
import { api } from '../../services/api';
import { Task, ScheduleItem, RecoveryPlan, RescheduleSuggestion } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PriorityBadge } from '../../components/ui/Badge';
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

      success(
        'Task Rescheduled Successfully',
        `"${suggestion.task_title}" moved to ${suggestion.suggested_new_date}.`
      );
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    setPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        suggestions: prev.suggestions.map((s) =>
          s.id === suggestionId ? { ...s, status: 'rejected' } : s
        ),
      };
    });
    info('Suggestion Dismissed', 'Task due date remained unchanged.');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Signature Deterministic Academic Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            StudyFlow Recovery Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detects missed coursework, models timetable capacity, and proposes explainable rescheduling.
          </p>
        </div>

        <Button
          onClick={runAnalysis}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Re-Analyze Workload
        </Button>
      </div>

      {/* Safety Guarantee Pill */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
        <span>
          <strong>Explicit Student Consent:</strong> StudyFlow never silently changes your deadlines. Every proposed replacement slot must be reviewed and accepted by you.
        </span>
      </div>

      {/* Recommendation Summary Card */}
      {plan && (
        <Card className="p-6 bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-purple-500/10 border-brand-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Academic Health Diagnosis
                </h2>
                <p className="text-xs text-slate-500">
                  Evaluated at {new Date(plan.analyzed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                {plan.overdue_tasks_count} Overdue
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                {plan.overloaded_days.length} Overloaded Days
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {plan.recommendation_summary}
          </p>
        </Card>
      )}

      {/* Overloaded Days Warnings */}
      {plan && plan.overloaded_days.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Overloaded Days Warning (&gt; 8 Hours Study + Classes)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.overloaded_days.map((day) => (
              <Card
                key={day.date}
                className="p-5 border-l-4 border-l-rose-500 bg-rose-50/30 dark:bg-rose-950/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {day.day_name} ({day.date})
                  </span>
                  <span className="text-xs font-extrabold text-rose-600">
                    +{formatMinutesToHours(day.overload_by_minutes)} Overload
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Scheduled classes take {formatMinutesToHours(day.total_scheduled_minutes)}, combined with {formatMinutesToHours(day.total_task_minutes)} of pending tasks.
                </p>
                <p className="text-[11px] text-slate-500">
                  Recommendation: Move 1 or 2 lighter tasks to a day with fewer lecture hours.
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Reschedule Slots */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-600" />
          Proposed Catch-Up Slots ({plan?.suggestions.filter((s) => s.status === 'pending').length || 0} Pending)
        </h3>

        {plan && plan.suggestions.length === 0 ? (
          <Card className="py-16 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-base font-bold text-slate-900 dark:text-white">
              No Overdue Tasks or Recovery Needed!
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your study schedule is currently in perfect equilibrium. Keep executing your daily focus sessions.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {plan?.suggestions.map((suggestion) => {
              const isAccepted = suggestion.status === 'accepted';
              const isRejected = suggestion.status === 'rejected';

              return (
                <Card
                  key={suggestion.id}
                  className={`p-5 transition-all ${
                    isAccepted
                      ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : isRejected
                      ? 'opacity-50'
                      : 'border-brand-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge priority={suggestion.priority} />
                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {suggestion.task_title}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span className="text-rose-500 font-medium">
                          Original Due: {new Date(suggestion.original_due_date).toLocaleDateString()}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Proposed: {suggestion.suggested_new_date}
                          {suggestion.suggested_time_slot
                            ? ` (${formatTime12h(suggestion.suggested_time_slot.start)} - ${formatTime12h(
                                suggestion.suggested_time_slot.end
                              )})`
                            : ''}
                        </span>
                        <span className="text-slate-400">
                          ⏱ {suggestion.estimated_duration_minutes}m est.
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        💡 <strong>Explainable Logic:</strong> {suggestion.reason}
                      </p>
                    </div>

                    {/* Decision Buttons */}
                    <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                      {isAccepted ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                          <CheckCircle2 className="w-4 h-4" />
                          Approved & Rescheduled
                        </span>
                      ) : isRejected ? (
                        <span className="text-xs text-slate-400 font-medium px-3 py-1.5">
                          Dismissed
                        </span>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectSuggestion(suggestion.id)}
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleAcceptSuggestion(suggestion)}
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            Approve Reschedule
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
