import { describe, it, expect } from 'vitest';
import { describeOffset, suggestReminders, REMINDER_PRESETS } from './reminders';

describe('reminders utils', () => {
  it('describes offsets in human readable form', () => {
    expect(describeOffset(1440)).toBe('1 day before');
    expect(describeOffset(2880)).toBe('2 days before');
    expect(describeOffset(60)).toBe('1 hour before');
    expect(describeOffset(180)).toBe('3 hours before');
    expect(describeOffset(30)).toBe('30 minutes before');
    expect(describeOffset(15)).toBe('15 minutes before');
  });

  it('has valid presets', () => {
    expect(REMINDER_PRESETS.length).toBe(5);
    expect(REMINDER_PRESETS[0].minutes).toBe(1440);
  });

  it('suggests reminders that fit within remaining time', () => {
    const now = Date.now();
    const fourHoursAhead = now + 4 * 60 * 60 * 1000;
    const suggestions = suggestReminders(fourHoursAhead, now);

    // 1 day (1440 mins) does not fit, but 3 hours and 1 hour should fit
    expect(suggestions).not.toContain(1440);
    expect(suggestions.length).toBeGreaterThan(0);
    suggestions.forEach((m) => {
      expect(m).toBeLessThan(4 * 60);
    });
  });
});
