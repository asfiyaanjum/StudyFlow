import { describe, it, expect } from 'vitest';
import {
  parsePlanMilestones,
  serializePlanMilestones,
  toggleMilestone,
  addMilestone,
  removeMilestone,
  calculateMilestoneProgress,
  Milestone,
} from './milestones';

describe('milestones persistence utils', () => {
  it('parses empty, undefined, or null content safely', () => {
    expect(parsePlanMilestones(null)).toEqual({ notes: '', milestones: [] });
    expect(parsePlanMilestones(undefined)).toEqual({ notes: '', milestones: [] });
    expect(parsePlanMilestones('')).toEqual({ notes: '', milestones: [] });
    expect(parsePlanMilestones('   ')).toEqual({ notes: '', milestones: [] });
  });

  it('treats legacy plain markdown text as notes without losing data', () => {
    const legacyContent = '## Weekly Revision\n- Review Chapter 3\n- Practice calculus';
    const result = parsePlanMilestones(legacyContent);
    expect(result.notes).toBe(legacyContent);
    expect(result.milestones).toEqual([]);
  });

  it('parses valid JSON content containing notes and structured milestones', () => {
    const jsonContent = JSON.stringify({
      notes: 'Final exam revision plan',
      milestones: [
        { id: 'm1', title: 'Unit 1 summary', completed: true },
        { id: 'm2', title: 'Unit 2 summary', completed: false, dueDate: '2026-11-28' },
      ],
    });

    const result = parsePlanMilestones(jsonContent);
    expect(result.notes).toBe('Final exam revision plan');
    expect(result.milestones).toHaveLength(2);
    expect(result.milestones[0].completed).toBe(true);
    expect(result.milestones[1].completed).toBe(false);
  });

  it('gracefully handles malformed JSON without crashing', () => {
    const malformed = '{ invalid json content';
    const result = parsePlanMilestones(malformed);
    expect(result.notes).toBe(malformed);
    expect(result.milestones).toEqual([]);
  });

  it('serializes milestones and notes into valid string', () => {
    const milestones: Milestone[] = [
      { id: 'm1', title: 'Read notes', completed: false },
      { id: 'm2', title: 'Solve problems', completed: true },
    ];
    const notes = 'Important guidelines';

    const serialized = serializePlanMilestones(milestones, notes);
    expect(typeof serialized).toBe('string');
    
    // Parse back and verify round-trip integrity
    const deserialized = parsePlanMilestones(serialized);
    expect(deserialized.notes).toBe(notes);
    expect(deserialized.milestones).toHaveLength(2);
    expect(deserialized.milestones[0].title).toBe('Read notes');
    expect(deserialized.milestones[1].completed).toBe(true);
  });

  it('falls back to raw text if no milestones exist to preserve backward compatibility', () => {
    const notes = 'Simple text note';
    expect(serializePlanMilestones([], notes)).toBe(notes);
  });

  it('toggles milestone completion state correctly', () => {
    const initial: Milestone[] = [
      { id: '1', title: 'First', completed: false },
      { id: '2', title: 'Second', completed: true },
    ];

    const toggled = toggleMilestone(initial, '1');
    expect(toggled[0].completed).toBe(true);
    expect(toggled[1].completed).toBe(true);

    const toggledAgain = toggleMilestone(toggled, '1');
    expect(toggledAgain[0].completed).toBe(false);
  });

  it('adds and removes milestones', () => {
    let list: Milestone[] = [];
    list = addMilestone(list, 'New Task 1');
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('New Task 1');
    expect(list[0].completed).toBe(false);

    list = addMilestone(list, 'New Task 2');
    expect(list).toHaveLength(2);

    list = removeMilestone(list, list[0].id);
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('New Task 2');
  });

  it('calculates milestone progress percentage accurately', () => {
    expect(calculateMilestoneProgress([])).toBe(0);

    const milestones: Milestone[] = [
      { id: '1', title: 'A', completed: true },
      { id: '2', title: 'B', completed: false },
      { id: '3', title: 'C', completed: true },
      { id: '4', title: 'D', completed: false },
    ];
    expect(calculateMilestoneProgress(milestones)).toBe(50);

    milestones[1].completed = true;
    milestones[3].completed = true;
    expect(calculateMilestoneProgress(milestones)).toBe(100);
  });
});
