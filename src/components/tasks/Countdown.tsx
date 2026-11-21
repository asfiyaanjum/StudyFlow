import React, { memo } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { getDeadline, useCountdown, Urgency } from '../../utils/countdown';

export interface CountdownProps {
  /** Task object with due date/time and completion status */
  task?: {
    due_date?: string;
    dueDate?: string;
    due_time?: string | null;
    dueTime?: string | null;
    is_completed?: boolean;
    status?: string;
  };
  /** Explicit deadline timestamp in milliseconds (optional alternative to task) */
  deadline?: number;
  /** Friendly date formatting e.g. "Tomorrow" */
  friendly?: boolean;
  /** Custom extra CSS classes */
  className?: string;
  /** Show leading icon */
  showIcon?: boolean;
}

const URGENCY_DOT: Record<Urgency, string> = {
  normal: 'bg-slate-400 dark:bg-slate-500',
  soon: 'bg-amber-400 dark:bg-amber-500',
  warning: 'bg-orange-500 dark:bg-orange-400',
  urgent: 'bg-rose-500 dark:bg-rose-500 animate-pulse',
  overdue: 'bg-rose-600 dark:bg-rose-400',
};

const URGENCY_STYLE: Record<Urgency, string> = {
  normal: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60',
  soon: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
  warning: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60',
  urgent: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 font-semibold',
  overdue: 'text-rose-800 dark:text-rose-200 bg-rose-100 dark:bg-rose-900/60 border-rose-300 dark:border-rose-700 font-semibold',
};

export const Countdown: React.FC<CountdownProps> = memo(function Countdown({
  task,
  deadline: explicitDeadline,
  friendly = false,
  className = '',
  showIcon = true,
}) {
  const isCompleted = task ? (task.is_completed || task.status === 'completed') : false;

  const targetDeadline = explicitDeadline ?? (task ? getDeadline(
    (task.due_date || task.dueDate) ?? '',
    task.due_time || task.dueTime
  ) : Date.now());

  const { label, urgency } = useCountdown(targetDeadline, !isCompleted, friendly);

  if (isCompleted) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 ${className}`}
      >
        <Check size={12} strokeWidth={2.5} className="shrink-0" />
        <span>Completed</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors tabular-nums ${URGENCY_STYLE[urgency]} ${className}`}
    >
      {showIcon && (
        urgency === 'overdue' ? (
          <AlertCircle size={12} className="shrink-0 text-rose-600 dark:text-rose-400" />
        ) : urgency === 'urgent' ? (
          <Clock size={12} className="shrink-0 text-rose-500 animate-pulse" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${URGENCY_DOT[urgency]}`} />
        )
      )}
      <span>{label}</span>
    </span>
  );
});
