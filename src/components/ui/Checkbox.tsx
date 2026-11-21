import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: number;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: string;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  size = 18,
  disabled = false,
  label,
  description,
  className = '',
  id,
}) => {
  const checkboxId = id || (typeof label === 'string' ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <div
      className={`inline-flex items-start gap-2.5 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={handleClick}
    >
      <button
        type="button"
        role="checkbox"
        id={checkboxId}
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        className={`focus-ring flex shrink-0 items-center justify-center rounded-md border transition-all duration-150 ${
          checked
            ? 'border-brand-600 bg-brand-600 dark:border-brand-500 dark:bg-brand-500 text-white shadow-xs'
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-500'
        }`}
        style={{ width: size, height: size }}
      >
        {checked && (
          <Check
            size={Math.max(10, size - 6)}
            strokeWidth={3}
            className="animate-in zoom-in-50 duration-150"
          />
        )}
      </button>

      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`text-sm font-medium leading-none ${
                checked
                  ? 'text-slate-500 dark:text-slate-400 line-through'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
