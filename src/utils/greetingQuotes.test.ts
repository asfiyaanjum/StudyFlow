import { describe, it, expect } from 'vitest';
import { getPeriod, pickQuote, GREETINGS, QUOTES, Period } from './greetingQuotes';

describe('greetingQuotes utils', () => {
  it('correctly maps hour of day to academic period', () => {
    const morningDate = new Date(2026, 10, 21, 8, 30);
    const afternoonDate = new Date(2026, 10, 21, 14, 0);
    const eveningDate = new Date(2026, 10, 21, 19, 0);
    const nightDate = new Date(2026, 10, 21, 23, 30);
    const earlyMorningDate = new Date(2026, 10, 21, 2, 0);

    expect(getPeriod(morningDate)).toBe('morning');
    expect(getPeriod(afternoonDate)).toBe('afternoon');
    expect(getPeriod(eveningDate)).toBe('evening');
    expect(getPeriod(nightDate)).toBe('night');
    expect(getPeriod(earlyMorningDate)).toBe('night');
  });

  it('provides complete greeting configs for all periods', () => {
    const periods: Period[] = ['morning', 'afternoon', 'evening', 'night'];
    periods.forEach((p) => {
      expect(GREETINGS[p]).toBeDefined();
      expect(GREETINGS[p].text).toBeTruthy();
      expect(GREETINGS[p].emoji).toBeTruthy();
      expect(QUOTES[p].length).toBeGreaterThanOrEqual(10);
    });
  });

  it('deterministically returns identical quotes for same user and day', () => {
    const date1 = new Date(2026, 10, 21, 9, 0);
    const date2 = new Date(2026, 10, 21, 10, 30); // Same morning

    const quote1 = pickQuote('morning', 'user-123', date1);
    const quote2 = pickQuote('morning', 'user-123', date2);
    expect(quote1).toBe(quote2);
  });

  it('returns valid quote from the designated period list', () => {
    const quote = pickQuote('morning', 'student-alice');
    expect(QUOTES.morning).toContain(quote);
  });
});
