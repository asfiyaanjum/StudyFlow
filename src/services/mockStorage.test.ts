import { describe, it, expect, beforeEach } from 'vitest';
import { MockStorage } from './mockStorage';

describe('StudyFlow Mock Persistence Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves seed subjects with computed progress', () => {
    const subjects = MockStorage.getSubjects();
    expect(subjects.length).toBeGreaterThanOrEqual(1);

    const cs106b = subjects.find((s) => s.code === 'CS 106B');
    expect(cs106b).toBeDefined();
    expect(cs106b?.units_count).toBeGreaterThanOrEqual(1);
  });

  it('performs full CRUD lifecycle on tasks', () => {
    // 1. Create task
    const newTask = MockStorage.addTask({
      user_id: 'test-user',
      title: 'Practice Dijkstra Algorithm',
      description: 'Implement on graph matrix',
      priority: 'high',
      status: 'todo',
      due_date: '2026-11-25T18:00:00Z',
      estimated_duration_minutes: 75,
      actual_duration_minutes: 0,
      is_completed: false,
    });

    expect(newTask.id).toBeDefined();
    expect(newTask.title).toBe('Practice Dijkstra Algorithm');

    // 2. Read task in list
    const tasks = MockStorage.getTasks();
    const found = tasks.find((t) => t.id === newTask.id);
    expect(found).toBeDefined();

    // 3. Toggle Complete
    const toggled = MockStorage.toggleTaskComplete(newTask.id);
    expect(toggled?.is_completed).toBe(true);
    expect(toggled?.status).toBe('completed');
    expect(toggled?.completed_at).toBeDefined();

    // 4. Update task
    const updated = MockStorage.updateTask(newTask.id, {
      title: 'Practice Dijkstra and A* Algorithm',
    });
    expect(updated?.title).toBe('Practice Dijkstra and A* Algorithm');

    // 5. Delete task
    const deleted = MockStorage.deleteTask(newTask.id);
    expect(deleted).toBe(true);
    const afterDelete = MockStorage.getTasks().find((t) => t.id === newTask.id);
    expect(afterDelete).toBeUndefined();
  });

  it('logs focus sessions and updates linked task duration', () => {
    const task = MockStorage.addTask({
      user_id: 'test-user',
      title: 'Read CS107 Chapter 3',
      priority: 'medium',
      status: 'todo',
      due_date: '2026-11-25T18:00:00Z',
      estimated_duration_minutes: 60,
      actual_duration_minutes: 0,
      is_completed: false,
    });

    const session = MockStorage.logFocusSession({
      user_id: 'test-user',
      task_id: task.id,
      duration_minutes: 25,
      actual_minutes: 25,
      mode: 'pomodoro',
      notes: 'Read pages 45 to 60',
      completed_at: new Date().toISOString(),
    });

    expect(session.id).toBeDefined();

    // Verify task duration updated automatically
    const updatedTask = MockStorage.getTasks().find((t) => t.id === task.id);
    expect(updatedTask?.actual_duration_minutes).toBe(25);
  });

  it('toggles syllabus topic completion and recalculates unit percentage', () => {
    const topics = MockStorage.getSyllabusTopics();
    const firstTopic = topics[0];
    const initialStatus = firstTopic.is_completed;

    const toggled = MockStorage.toggleTopicComplete(firstTopic.id);
    expect(toggled?.is_completed).toBe(!initialStatus);

    const units = MockStorage.getSyllabusUnits();
    const parentUnit = units.find((u) => u.id === firstTopic.unit_id);
    expect(parentUnit).toBeDefined();
    expect(parentUnit?.progress_percentage).toBeGreaterThanOrEqual(0);
  });
});

