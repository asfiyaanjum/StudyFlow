import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  subtitle,
  action,
  className = '',
  size = 'md',
}) => {
  const paddingMap = {
    sm: 'py-8 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8',
  };

  const iconContainerMap = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
  };

  const iconSizeMap = {
    sm: 18,
    md: 22,
    lg: 26,
  };

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-paper-canvas/50 dark:bg-slate-900/40 text-center ${paddingMap[size]} ${className}`}
    >
      <div
        className={`mb-3.5 flex items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40 shadow-subtle ${iconContainerMap[size]}`}
      >
        <Icon size={iconSizeMap[size]} strokeWidth={1.75} />
      </div>
      <h3 className="font-editorial text-base sm:text-lg font-medium text-slate-900 dark:text-white">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
