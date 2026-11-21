import { useSyncExternalStore } from 'react';
import { subscribeTick, noopSubscribe } from './countdown';

export type Period = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * 05:00 - 11:59 morning
 * 12:00 - 16:59 afternoon
 * 17:00 - 20:59 evening
 * 21:00 - 04:59 night
 */
export function getPeriod(date: Date = new Date()): Period {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export const GREETINGS: Record<Period, { text: string; emoji: string }> = {
  morning: { text: 'Good morning', emoji: '👋' },
  afternoon: { text: 'Good afternoon', emoji: '☀️' },
  evening: { text: 'Good evening', emoji: '🌆' },
  night: { text: 'Good night', emoji: '🌙' },
};

/** Curated, non-cliché academic productivity and focus quotes */
export const QUOTES: Record<Period, string[]> = {
  morning: [
    'Small deliberate steps every morning compound into mastery.',
    'Start with the one task that unlocks the rest of your day.',
    'A calm morning routine makes for clear, decisive thinking.',
    'You don’t need perfection to begin; you just need to begin.',
    'Focus on the input today; the results will follow steadily.',
    'One uninterrupted hour of deep work beats four scattered ones.',
    'Discipline is choosing between what you want now and what you want most.',
    'Make today’s first study block an easy, uninterrupted win.',
    'Patience, persistence, and perspiration make an unbeatable combination.',
    'The morning is a clean canvas—paint it with intentional effort.',
  ],
  afternoon: [
    'Focus completely on the task directly in front of you.',
    'Momentum is built in the middle of the day. Keep the rhythm.',
    'Pick one assignment or topic and give it your full concentration.',
    'Progress over perfection, every single afternoon.',
    'A deliberate 5-minute break now will protect your energy for tonight.',
    'Finish the open loops before opening new ones.',
    'Consistency is quiet, unglamorous, and extraordinarily powerful.',
    'Look at how much you have already tackled today. Carry that momentum.',
    'Keep your system simple: one task, then the next.',
    'Action produces clarity and motivation—not the other way around.',
  ],
  evening: [
    'Close the day strong. Tomorrow starts with how you wrap up tonight.',
    'Wrap up the essentials, review what you learned, and let the rest rest.',
    'A small, organized study session tonight lightens tomorrow’s load.',
    'Reflect on what worked today and carry those insights into tomorrow.',
    'Tie up loose ends and set out tomorrow’s priority items.',
    'Academic greatness is crafted in ordinary, consistent evenings.',
    'Prepare your workspace for tomorrow while today’s thoughts are fresh.',
    'One final focused revision, then allow yourself to recharge fully.',
    'Every day you show up is a milestone toward your degree and ambition.',
    'Finish the day with the satisfaction of genuine effort.',
  ],
  night: [
    'Rest and sleep are essential parts of memory consolidation.',
    'Quality sleep is the highest-leverage study habit you have.',
    'Tomorrow’s sharper focus starts with tonight’s proper recovery.',
    'It is okay to close the books. The tasks will be ready for you tomorrow.',
    'Let today’s work be enough. Be proud of the discipline you showed.',
    'A rested mind grasps difficult concepts far quicker than an exhausted one.',
    'Step away from the screens and give your mind space to absorb.',
    'Good sleep is where new neural connections are solidified.',
    'Wind down mindfully. You showed up, you worked, now recover.',
    'Quiet hours are for mental recharge. Sleep well and reset.',
  ],
};

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministically pick a quote for a specific user, period, and day.
 * Ensures the quote remains perfectly stable throughout the period without re-render flicker.
 */
export function pickQuote(period: Period, userId: string = 'student', now: Date = new Date()): string {
  const d = new Date(now);
  // Between midnight and 5:00 AM, group with the previous evening's session
  if (period === 'night' && d.getHours() < 5) {
    d.setDate(d.getDate() - 1);
  }
  const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const list = QUOTES[period];
  const index = hashString(`${userId}|${dateKey}|${period}`) % list.length;
  return list[index];
}

/**
 * Hook to retrieve current period, greeting, and deterministic quote.
 */
export function useGreetingQuote(userId: string = 'student') {
  const period = useSyncExternalStore(
    subscribeTick,
    () => getPeriod(new Date()),
    () => 'morning' as Period
  );

  const greetingConfig = GREETINGS[period];
  const quote = pickQuote(period, userId);

  return {
    period,
    greeting: greetingConfig.text,
    emoji: greetingConfig.emoji,
    quote,
  };
}
