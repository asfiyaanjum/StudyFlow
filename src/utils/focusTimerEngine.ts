/**
 * Focus Timer & Break Calculation Engine
 * Calculates automatic break distribution, timeline segments,
 * and maintains pure study vs break elapsed metrics.
 */

export interface FocusSegment {
  id: string;
  type: 'focus' | 'break';
  durationSeconds: number;
  label: string;
}

export interface FocusTimelineSchedule {
  totalFocusMinutes: number;
  totalBreakMinutes: number;
  breakCount: number;
  breakDurationMinutes: number;
  segments: FocusSegment[];
}

/**
 * Calculates the number of automatic breaks based on focus duration in minutes:
 * 15 - 45 min: 0 breaks
 * 50 - 90 min: 1 break
 * 100 - 125 min: 2 breaks
 * 150 min: 3 breaks
 * 200 min: 4 breaks
 * Custom durations: floor(minutes / 50)
 */
export function calculateAutomaticBreakCount(focusMinutes: number): number {
  if (focusMinutes < 50) return 0;
  if (focusMinutes <= 90) return 1;
  if (focusMinutes <= 125) return 2;
  if (focusMinutes < 150) return 2;
  if (focusMinutes < 200) return 3;
  if (focusMinutes === 200) return 4;
  return Math.floor(focusMinutes / 50);
}

/**
 * Builds the timeline schedule of alternating focus and break segments.
 * Focus duration is divided evenly into (breakCount + 1) focus segments.
 * The last segment is always a focus segment.
 *
 * Example: 50 min focus with 1 break of 5 min:
 * - Focus 25 min (1500s)
 * - Break 5 min (300s)
 * - Focus 25 min (1500s)
 */
export function generateFocusTimeline(
  totalFocusMinutes: number,
  customBreakCount?: number,
  breakDurationMinutes: number = 5
): FocusTimelineSchedule {
  const safeFocusMinutes = Math.max(1, Math.round(totalFocusMinutes));
  const safeBreakDuration = Math.max(1, Math.round(breakDurationMinutes));
  const breakCount =
    typeof customBreakCount === 'number'
      ? Math.max(0, customBreakCount)
      : calculateAutomaticBreakCount(safeFocusMinutes);

  const numFocusSegments = breakCount + 1;
  const totalFocusSeconds = safeFocusMinutes * 60;
  const baseFocusSegmentSeconds = Math.floor(totalFocusSeconds / numFocusSegments);
  const remainderSeconds = totalFocusSeconds % numFocusSegments;

  const segments: FocusSegment[] = [];

  for (let i = 0; i < numFocusSegments; i++) {
    // Add remainder seconds to the first few focus segments so total matches exactly
    const segmentFocusSecs = baseFocusSegmentSeconds + (i < remainderSeconds ? 1 : 0);
    const focusIndex = i + 1;

    segments.push({
      id: `focus-${focusIndex}`,
      type: 'focus',
      durationSeconds: segmentFocusSecs,
      label: numFocusSegments > 1 ? `Focus Interval ${focusIndex}` : 'Focus Session',
    });

    // Insert break segment if not the final segment and breaks are scheduled
    if (i < breakCount && safeBreakDuration > 0) {
      segments.push({
        id: `break-${focusIndex}`,
        type: 'break',
        durationSeconds: safeBreakDuration * 60,
        label: breakCount > 1 ? `Break ${focusIndex}` : 'Scheduled Break',
      });
    }
  }

  const totalBreakMinutes = breakCount * safeBreakDuration;

  return {
    totalFocusMinutes: safeFocusMinutes,
    totalBreakMinutes,
    breakCount,
    breakDurationMinutes: safeBreakDuration,
    segments,
  };
}

/**
 * Active session snapshot for localStorage persistence and recovery
 */
export interface PersistedFocusSession {
  sessionId: string;
  totalFocusMinutes: number;
  breakDurationMinutes: number;
  breakCount: number;
  subjectId: string | null;
  taskId: string | null;
  status: 'running' | 'paused' | 'break';
  currentSegmentIndex: number;
  segmentSecondsRemaining: number;
  actualFocusSecondsCompleted: number;
  breaksTaken: number;
  breaksSkipped: number;
  lastUpdatedTimestamp: number;
  startedAtTimestamp: number;
  pausedAtTimestamp: number | null;
}

export const STORAGE_KEY_FOCUS_SESSION = 'studyflow_active_focus_session';

export function saveActiveFocusSession(session: PersistedFocusSession): void {
  try {
    localStorage.setItem(STORAGE_KEY_FOCUS_SESSION, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save focus session to localStorage:', err);
  }
}

export function loadActiveFocusSession(): PersistedFocusSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOCUS_SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedFocusSession;
  } catch (err) {
    console.warn('Failed to load focus session from localStorage:', err);
    return null;
  }
}

export function clearActiveFocusSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_FOCUS_SESSION);
  } catch (err) {
    console.warn('Failed to clear focus session from localStorage:', err);
  }
}
