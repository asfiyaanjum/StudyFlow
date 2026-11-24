import { describe, it, expect } from 'vitest';
import {
  calculateAutomaticBreakCount,
  generateFocusTimeline,
} from './focusTimerEngine';

describe('Focus Timer Engine - Automatic Breaks and Timeline', () => {
  it('correctly maps default automatic break counts according to specs', () => {
    // 15 - 45 min -> 0 breaks
    expect(calculateAutomaticBreakCount(15)).toBe(0);
    expect(calculateAutomaticBreakCount(25)).toBe(0);
    expect(calculateAutomaticBreakCount(45)).toBe(0);

    // 50 - 90 min -> 1 break
    expect(calculateAutomaticBreakCount(50)).toBe(1);
    expect(calculateAutomaticBreakCount(60)).toBe(1);
    expect(calculateAutomaticBreakCount(75)).toBe(1);
    expect(calculateAutomaticBreakCount(90)).toBe(1);

    // 100 - 125 min -> 2 breaks
    expect(calculateAutomaticBreakCount(100)).toBe(2);
    expect(calculateAutomaticBreakCount(125)).toBe(2);

    // 150 min -> 3 breaks
    expect(calculateAutomaticBreakCount(150)).toBe(3);

    // 200 min -> 4 breaks
    expect(calculateAutomaticBreakCount(200)).toBe(4);

    // Custom large duration rule: floor(minutes / 50)
    expect(calculateAutomaticBreakCount(250)).toBe(5);
  });

  it('generates 25m session with 0 breaks as a single focus segment', () => {
    const timeline = generateFocusTimeline(25);
    expect(timeline.totalFocusMinutes).toBe(25);
    expect(timeline.breakCount).toBe(0);
    expect(timeline.segments).toHaveLength(1);
    expect(timeline.segments[0].type).toBe('focus');
    expect(timeline.segments[0].durationSeconds).toBe(25 * 60);
  });

  it('generates 50m session with 1 break of 5m distributed evenly', () => {
    const timeline = generateFocusTimeline(50, undefined, 5);
    expect(timeline.totalFocusMinutes).toBe(50);
    expect(timeline.breakCount).toBe(1);
    expect(timeline.totalBreakMinutes).toBe(5);
    expect(timeline.segments).toHaveLength(3);

    // Segment 1: Focus 25m (1500s)
    expect(timeline.segments[0].type).toBe('focus');
    expect(timeline.segments[0].durationSeconds).toBe(25 * 60);

    // Segment 2: Break 5m (300s)
    expect(timeline.segments[1].type).toBe('break');
    expect(timeline.segments[1].durationSeconds).toBe(5 * 60);

    // Segment 3: Focus 25m (1500s)
    expect(timeline.segments[2].type).toBe('focus');
    expect(timeline.segments[2].durationSeconds).toBe(25 * 60);
  });

  it('generates 100m session with 2 breaks: 3 focus segments and 2 breaks', () => {
    const timeline = generateFocusTimeline(100, 2, 5);
    expect(timeline.breakCount).toBe(2);
    expect(timeline.segments).toHaveLength(5);

    const focusSegments = timeline.segments.filter((s) => s.type === 'focus');
    const breakSegments = timeline.segments.filter((s) => s.type === 'break');

    expect(focusSegments).toHaveLength(3);
    expect(breakSegments).toHaveLength(2);

    // Total focus seconds must sum up exactly to 100 * 60 = 6000s
    const totalFocusSecs = focusSegments.reduce((acc, s) => acc + s.durationSeconds, 0);
    expect(totalFocusSecs).toBe(100 * 60);

    // Last segment is always focus
    expect(timeline.segments[timeline.segments.length - 1].type).toBe('focus');
  });
});
