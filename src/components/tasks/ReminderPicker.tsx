import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { REMINDER_PRESETS, PRESET_MINUTES, describeOffset } from '../../utils/reminders';

export interface ReminderPickerProps {
  value: number[];
  onChange: (next: number[]) => void;
  className?: string;
}

const TIME_UNITS = [
  { label: 'minutes', factor: 1 },
  { label: 'hours', factor: 60 },
  { label: 'days', factor: 1440 },
];

export const ReminderPicker: React.FC<ReminderPickerProps> = ({
  value = [],
  onChange,
  className = '',
}) => {
  const [customAmount, setCustomAmount] = useState<number>(2);
  const [customUnit, setCustomUnit] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const togglePreset = (minutes: number) => {
    if (value.includes(minutes)) {
      onChange(value.filter((m) => m !== minutes));
    } else {
      onChange([...value, minutes].sort((a, b) => b - a));
    }
  };

  const removeReminder = (minutes: number) => {
    onChange(value.filter((m) => m !== minutes));
  };

  const addCustomReminder = () => {
    const minutes = Math.round(customAmount * TIME_UNITS[customUnit].factor);
    if (!Number.isFinite(minutes) || minutes < 1) {
      setError('Enter a time of at least 1 minute.');
      return;
    }
    if (minutes > 60 * 24 * 60) {
      setError('Choose a reminder within 60 days.');
      return;
    }
    setError(null);
    if (!value.includes(minutes)) {
      onChange([...value, minutes].sort((a, b) => b - a));
    }
  };

  const customReminders = value.filter((m) => !PRESET_MINUTES.includes(m));

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
          Reminders & Alerts
        </label>
        {value.length > 0 && (
          <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
            {value.length} active
          </span>
        )}
      </div>

      {/* Preset Checkbox Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {REMINDER_PRESETS.map((preset) => {
          const isSelected = value.includes(preset.minutes);
          return (
            <label
              key={preset.minutes}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30 text-brand-900 dark:text-brand-200 font-medium'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => togglePreset(preset.minutes)}
                className="w-4 h-4 rounded border-slate-300 accent-brand-600 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
              <span>{preset.label}</span>
            </label>
          );
        })}
      </div>

      {/* Custom Reminders Pill Tags */}
      {customReminders.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {customReminders.map((mins) => (
            <span
              key={mins}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
            >
              <span>{describeOffset(mins)}</span>
              <button
                type="button"
                onClick={() => removeReminder(mins)}
                className="p-0.5 rounded-full hover:bg-brand-200/60 dark:hover:bg-brand-800/60 transition-colors"
                aria-label={`Remove reminder ${describeOffset(mins)}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom Reminder Input */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          Add custom reminder:
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={customAmount}
            onChange={(e) => setCustomAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <select
            value={customUnit}
            onChange={(e) => setCustomUnit(parseInt(e.target.value, 10))}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {TIME_UNITS.map((unit, index) => (
              <option key={unit.label} value={index}>
                {unit.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addCustomReminder}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
        </div>
        {error && (
          <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
};
