import { describe, it, expect } from 'vitest';
import {
  formatMinutesToHours,
  getGreeting,
  parseTimeToMinutes,
  minutesToTimeString,
  formatTime12h,
  isDatePast,
} from './dateUtils';

describe('Date & Time Utilities', () => {
  it('formats minutes into human readable hours and minutes', () => {
    expect(formatMinutesToHours(30)).toBe('30m');
    expect(formatMinutesToHours(60)).toBe('1h');
    expect(formatMinutesToHours(90)).toBe('1h 30m');
    expect(formatMinutesToHours(240)).toBe('4h');
  });

  it('correctly calculates time of day greeting', () => {
    const morning = new Date('2026-11-21T09:00:00');
    expect(getGreeting(morning)).toBe('Good morning');

    const afternoon = new Date('2026-11-21T14:00:00');
    expect(getGreeting(afternoon)).toBe('Good afternoon');

    const evening = new Date('2026-11-21T19:00:00');
    expect(getGreeting(evening)).toBe('Good evening');
  });

  it('converts HH:mm to minutes and back to time strings', () => {
    expect(parseTimeToMinutes('09:30')).toBe(570);
    expect(minutesToTimeString(570)).toBe('09:30');

    expect(parseTimeToMinutes('15:45')).toBe(945);
    expect(minutesToTimeString(945)).toBe('15:45');
  });

  it('formats 24h string to 12h AM/PM string', () => {
    expect(formatTime12h('09:30')).toBe('9:30 AM');
    expect(formatTime12h('12:00')).toBe('12:00 PM');
    expect(formatTime12h('14:45')).toBe('2:45 PM');
    expect(formatTime12h('00:15')).toBe('12:15 AM');
  });

  it('identifies past dates correctly', () => {
    const pastDate = '2020-01-01';
    expect(isDatePast(pastDate)).toBe(true);

    const futureDate = '2099-12-31';
    expect(isDatePast(futureDate)).toBe(false);
  });
});

