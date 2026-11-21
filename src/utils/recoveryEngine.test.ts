import { describe, it, expect } from 'vitest';
import { RecoveryEngine } from './recoveryEngine';
import { Task, ScheduleItem } from '../types';

describe('StudyFlow Recovery Engine', () => {
  const mockSchedule: ScheduleItem[] = [
    {
      id: 'sch-1',
      user_id: 'user-1',
      title: 'Data Structures Lecture',
      day_of_week: 1, // Monday
      start_time: '09:00',
      end_time: '11:00',
      activity_type: 'lecture',
      is_recurring: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'sch-2',
      user_id: 'user-1',
      title: 'Physics Lab',
      day_of_week: 1, // Monday
      start_time: '13:00',
      end_time: '16:00',
      activity_type: 'lecture',
      is_recurring: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it('identifies overdue tasks accurately', () => {
    const fixedNow = new Date('2026-11-21T10:00:00Z');
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        user_id: 'user-1',
        title: 'Overdue Algorithms Problem Set',
        priority: 'urgent',
        status: 'todo',
        due_date: '2026-11-19T23:59:59Z', // 2 days ago
        estimated_duration_minutes: 120,
        is_completed: false,
        created_at: '2026-11-15T00:00:00Z',
        updated_at: '2026-11-15T00:00:00Z',
      },
      {
        id: 'task-2',
        user_id: 'user-1',
        title: 'Future Operating Systems Reading',
        priority: 'medium',
        status: 'todo',
        due_date: '2026-11-25T23:59:59Z', // future
        estimated_duration_minutes: 60,
        is_completed: false,
        created_at: '2026-11-15T00:00:00Z',
        updated_at: '2026-11-15T00:00:00Z',
      },
      {
        id: 'task-3',
        user_id: 'user-1',
        title: 'Completed Calculus Homework',
        priority: 'high',
        status: 'completed',
        due_date: '2026-11-18T23:59:59Z', // past but completed
        estimated_duration_minutes: 90,
        is_completed: true,
        created_at: '2026-11-15T00:00:00Z',
        updated_at: '2026-11-15T00:00:00Z',
      },
    ];

    const plan = RecoveryEngine.analyze(mockTasks, mockSchedule, fixedNow);

    expect(plan.overdue_tasks_count).toBe(1);
    expect(plan.incomplete_tasks_count).toBe(2);
    expect(plan.suggestions.length).toBe(1);
    expect(plan.suggestions[0].task_id).toBe('task-1');
    expect(plan.suggestions[0].priority).toBe('urgent');
    expect(plan.suggestions[0].status).toBe('pending');
  });

  it('detects overloaded study days when tasks and classes exceed 8 hours', () => {
    const fixedNow = new Date('2026-11-23T08:00:00Z'); // Let's say Monday Nov 23
    const todayStr = '2026-11-23';

    // Monday already has 2h + 3h = 5h (300 mins) lectures in mockSchedule
    // Add 4h (240 mins) of tasks = 540 mins > 480 mins max
    const heavyTasks: Task[] = [
      {
        id: 'heavy-task-1',
        user_id: 'user-1',
        title: 'Massive Software Engineering Project',
        priority: 'high',
        status: 'todo',
        due_date: `${todayStr}T23:59:59Z`,
        estimated_duration_minutes: 240,
        is_completed: false,
        created_at: '2026-11-20T00:00:00Z',
        updated_at: '2026-11-20T00:00:00Z',
      },
    ];

    const plan = RecoveryEngine.analyze(heavyTasks, mockSchedule, fixedNow);

    expect(plan.overloaded_days.length).toBeGreaterThanOrEqual(1);
    const overloadedMonday = plan.overloaded_days.find((d) => d.date === todayStr);
    expect(overloadedMonday).toBeDefined();
    expect(overloadedMonday?.total_scheduled_minutes).toBe(300);
    expect(overloadedMonday?.total_task_minutes).toBe(240);
    expect(overloadedMonday?.overload_by_minutes).toBe(60);
  });

  it('never mutates task or schedule state silently without student approval', () => {
    const fixedNow = new Date('2026-11-21T10:00:00Z');
    const mockTasks: Task[] = [
      {
        id: 'task-immutable',
        user_id: 'user-1',
        title: 'Draft Essay',
        priority: 'high',
        status: 'todo',
        due_date: '2026-11-19T10:00:00Z',
        estimated_duration_minutes: 60,
        is_completed: false,
        created_at: '2026-11-15T00:00:00Z',
        updated_at: '2026-11-15T00:00:00Z',
      },
    ];

    const plan = RecoveryEngine.analyze(mockTasks, mockSchedule, fixedNow);

    // Initial task object must be unchanged
    expect(mockTasks[0].due_date).toBe('2026-11-19T10:00:00Z');
    expect(plan.suggestions[0].status).toBe('pending');
    expect(plan.suggestions[0].suggested_new_date).not.toBe('2026-11-19');
  });
});
