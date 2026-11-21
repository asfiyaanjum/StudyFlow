import { describe, it, expect } from 'vitest';
import {
  getDeadline,
  getUrgency,
  compactDuration,
  formatCountdown,
  formatFriendly,
  countdownSnapshot,
} from './countdown';

describe('countdown utils', () => {
  it('calculates deadline timestamp correctly', () => {
    const timestamp = getDeadline('2026-11-25', '14:30');
    const date = new Date(timestamp);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10); // November (0-indexed)
    expect(date.getDate()).toBe(25);
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
  });

  it('defaults to 23:59:59 when time is not provided', () => {
    const timestamp = getDeadline('2026-11-25');
    const date = new Date(timestamp);
    expect(date.getHours()).toBe(23);
    expect(date.getMinutes()).toBe(59);
  });

  it('determines correct urgency levels', () => {
    const MIN = 60_000;
    const HOUR = 60 * MIN;
    const DAY = 24 * HOUR;

    expect(getUrgency(-1000)).toBe('overdue');
    expect(getUrgency(30 * MIN)).toBe('urgent');
    expect(getUrgency(3 * HOUR)).toBe('warning');
    expect(getUrgency(12 * HOUR)).toBe('soon');
    expect(getUrgency(2 * DAY)).toBe('normal');
  });

  it('formats compact duration cleanly', () => {
    const MIN = 60_000;
    const HOUR = 60 * MIN;
    const DAY = 24 * HOUR;

    expect(compactDuration(45 * 1000)).toBe('45s');
    expect(compactDuration(15 * MIN)).toBe('15m');
    expect(compactDuration(2 * HOUR + 30 * MIN)).toBe('2h 30m');
    expect(compactDuration(3 * DAY + 4 * HOUR)).toBe('3d 4h');
  });

  it('formats countdown labels accurately', () => {
    const MIN = 60_000;
    expect(formatCountdown(10 * MIN)).toBe('10m left');
    expect(formatCountdown(-10 * MIN)).toBe('Overdue by 10m');
    expect(formatCountdown(-5000)).toBe('Just overdue');
  });

  it('produces stable snapshot string', () => {
    const future = Date.now() + 1000 * 60 * 60; // 1 hour ahead
    const snapshot = countdownSnapshot(future);
    expect(snapshot).toContain('|');
    const [urgency, label] = snapshot.split('|');
    expect(['normal', 'soon', 'warning', 'urgent', 'overdue']).toContain(urgency);
    expect(label).toBeTruthy();
  });
});
