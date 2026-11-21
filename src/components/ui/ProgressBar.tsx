import React from 'react';

export interface ProgressBarProps {
  /** Current progress percentage from 0 to 100 */
  value: number;
  /** Custom class for outer wrapper */
  className?: string;
  /** Custom class for background track */
  trackClassName?: string;
  /** Custom class for active progress bar fill */
  barClassName?: string;
  /** Optional label displayed above or next to progress */
  label?: string;
  /** Whether to display numerical percentage */
  showPercentage?: boolean;
  /** Size preset */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Accent color variant */
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'indigo';
}

const HEIGHTS = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const VARIANTS = {
  brand: 'bg-brand-600 dark:bg-brand-500',
  success: 'bg-emerald-500 dark:bg-emerald-400',
  warning: 'bg-amber-500 dark:bg-amber-400',
  danger: 'bg-rose-500 dark:bg-rose-400',
  indigo: 'bg-indigo-600 dark:bg-indigo-400',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  trackClassName = '',
  barClassName = '',
  label,
  showPercentage = false,
  size = 'sm',
  variant = 'brand',
}) => {
  const percentage = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">
          {label && <span>{label}</span>}
          {showPercentage && <span className="tabular-nums ml-auto font-semibold">{percentage}%</span>}
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${HEIGHTS[size]} ${trackClassName}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${VARIANTS[variant]} ${barClassName}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
