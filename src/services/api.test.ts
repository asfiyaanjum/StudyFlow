import { describe, it, expect } from 'vitest';
import { api } from './api';

describe('StudyFlow API Service Layer', () => {
  it('loads tasks and associates subjects', async () => {
    const tasks = await api.tasks.getTasks();
    expect(tasks).toBeDefined();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);

    const firstTask = tasks[0];
    if (firstTask.subject_id) {
      expect(firstTask.subject).toBeDefined();
    }
  });

  it('calculates comprehensive analytics overview from real data', async () => {
    const overview = await api.analytics.getOverview();
    expect(overview).toBeDefined();
    expect(typeof overview.total_study_minutes_today).toBe('number');
    expect(typeof overview.total_study_minutes_this_week).toBe('number');
    expect(overview.daily_trends.length).toBe(7);
    expect(overview.task_completion_rate).toBeGreaterThanOrEqual(0);
    expect(overview.task_completion_rate).toBeLessThanOrEqual(100);
  });

  it('supports full subject syllabus operations', async () => {
    const subjects = await api.subjects.getSubjects();
    expect(subjects.length).toBeGreaterThan(0);

    const firstSub = subjects[0];
    const units = await api.subjects.getSyllabus(firstSub.id);
    expect(Array.isArray(units)).toBe(true);
  });
});

