import { useSyncExternalStore } from 'react';

export type Urgency = 'normal' | 'soon' | 'warning' | 'urgent' | 'overdue';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/**
 * Shared 1-second interval ticker for live countdowns across the entire application.
 * Only runs while at least one component is subscribed.
 */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

export function subscribeTick(cb: () => void): () => void {
  listeners.add(cb);
  if (timer === undefined) {
    timer = setInterval(() => {
      listeners.forEach((listener) => listener());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export const noopSubscribe = () => () => {};

/**
 * Calculate the exact deadline epoch timestamp in milliseconds.
 * Gracefully parses both ISO strings ('2024-11-25T14:30:00Z') and date strings ('2024-11-25')
 * with optional time ('14:30' or '23:59').
 */
export function getDeadline(dueDate: string, dueTime?: string | null): number {
  if (!dueDate) return Date.now();
  
  if (dueDate.includes('T')) {
    const parsed = new Date(dueDate).getTime();
    if (!Number.isNaN(parsed)) return parsed;
  }

  const timePart = dueTime ? (dueTime.length === 5 ? `${dueTime}:00` : dueTime) : '23:59:59';
  const parsed = new Date(`${dueDate}T${timePart}`).getTime();
  return Number.isNaN(parsed) ? new Date(dueDate).getTime() : parsed;
}

/**
 * Categorize remaining time into an urgency level.
 */
export function getUrgency(msLeft: number): Urgency {
  if (msLeft < 0) return 'overdue';
  if (msLeft < HOUR) return 'urgent';
  if (msLeft < 6 * HOUR) return 'warning';
  if (msLeft < DAY) return 'soon';
  return 'normal';
}

/**
 * Compact string formatting for remaining duration.
 */
export function compactDuration(ms: number): string {
  const absMs = Math.abs(ms);
  const h = Math.floor(absMs / HOUR);
  const m = Math.floor((absMs % HOUR) / MIN);
  
  if (absMs >= DAY) {
    const d = Math.floor(absMs / DAY);
    return `${d}d ${h % 24}h`;
  }
  if (absMs >= 12 * HOUR) return `${h}h`;
  if (absMs >= HOUR) return m === 0 ? `${h}h` : `${h}h ${m}m`;
  if (absMs >= MIN) return `${m}m`;
  return `${Math.max(0, Math.floor(absMs / 1000))}s`;
}

/**
 * Human-readable countdown label: "4h 32m left", "45s left", "Overdue by 15m".
 */
export function formatCountdown(msLeft: number): string {
  if (msLeft < 0) {
    const over = Math.abs(msLeft);
    return over < MIN ? 'Just overdue' : `Overdue by ${compactDuration(over)}`;
  }
  return `${compactDuration(msLeft)} left`;
}

/**
 * Friendly deadline label used in lists ("Tomorrow", "Today", "4h left").
 */
export function formatFriendly(deadline: number, now: number = Date.now()): string {
  const msLeft = deadline - now;
  if (msLeft >= DAY) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (new Date(deadline).toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
  }
  return formatCountdown(msLeft);
}

/**
 * Stable snapshot string in the format "urgency|label" for useSyncExternalStore.
 */
export function countdownSnapshot(deadline: number, friendly = false): string {
  const now = Date.now();
  const msLeft = deadline - now;
  const urgency = getUrgency(msLeft);
  const label = friendly ? formatFriendly(deadline, now) : formatCountdown(msLeft);
  return `${urgency}|${label}`;
}

/**
 * React hook that subscribes to the shared 1-second ticker and returns live countdown data.
 */
export function useCountdown(
  deadline: number,
  enabled = true,
  friendly = false
): { label: string; urgency: Urgency; msLeft: number } {
  const snap = useSyncExternalStore(
    enabled ? subscribeTick : noopSubscribe,
    () => (enabled ? countdownSnapshot(deadline, friendly) : 'normal|'),
    () => 'normal|'
  );

  const separatorIndex = snap.indexOf('|');
  const urgency = (separatorIndex !== -1 ? snap.slice(0, separatorIndex) : 'normal') as Urgency;
  const label = separatorIndex !== -1 ? snap.slice(separatorIndex + 1) : '';
  const msLeft = deadline - Date.now();

  return { urgency, label, msLeft };
}

/**
 * Hook that updates once every minute.
 */
export function useMinuteTick(): number {
  return useSyncExternalStore(
    subscribeTick,
    () => Math.floor(Date.now() / 60_000),
    () => 0
  );
}
