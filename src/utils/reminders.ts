export interface ReminderPreset {
  minutes: number;
  label: string;
}

export const REMINDER_PRESETS: ReminderPreset[] = [
  { minutes: 1440, label: '1 day before' },
  { minutes: 180, label: '3 hours before' },
  { minutes: 60, label: '1 hour before' },
  { minutes: 30, label: '30 minutes before' },
  { minutes: 15, label: '15 minutes before' },
];

export const PRESET_MINUTES = REMINDER_PRESETS.map((p) => p.minutes);

/**
 * Formats a reminder offset in minutes into a friendly string:
 * "1 day before", "3 hours before", "30 minutes before".
 */
export function describeOffset(minutes: number): string {
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} day${days === 1 ? '' : 's'} before`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? '' : 's'} before`;
  }
  return `${minutes} minute${minutes === 1 ? '' : 's'} before`;
}

/**
 * Suggest optimal reminder offsets based on the remaining time until deadline.
 */
export function suggestReminders(
  deadline: number,
  now: number = Date.now(),
  defaults: number[] = PRESET_MINUTES
): number[] {
  const minsLeft = (deadline - now) / 60_000;
  const eligible = [...defaults].filter((m) => m < minsLeft).sort((a, b) => b - a);
  if (eligible.length <= 2) return eligible;
  
  // Pick the earliest alert plus the one closest to 1 hour
  const [first, ...rest] = eligible;
  const second = rest.reduce((best, m) =>
    Math.abs(m - 60) < Math.abs(best - 60) ? m : best,
    rest[0]
  );
  return [first, second].sort((a, b) => b - a);
}
