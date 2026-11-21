import { describe, it, expect, vi } from 'vitest';
import { api } from './api';
import { supabase } from './supabaseClient';

vi.mock('./supabaseClient', () => {
  const mockUser = { id: 'test-user-id', email: 'student@studyflow.app' };

  return {
    isSupabaseConfigured: () => true,
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockImplementation((table: string) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockImplementation((payload) => ({
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: `new-${table}-id`, ...payload },
            error: null,
          }),
        })),
        update: vi.fn().mockImplementation((payload) => ({
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: `updated-${table}-id`, ...payload },
            error: null,
          }),
        })),
        delete: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => {
          if (table === 'schedule_items') {
            return Promise.resolve({
              data: [
                {
                  id: 'sch-1',
                  user_id: 'test-user-id',
                  title: 'CS 106B Lecture',
                  day_of_week: 1,
                  start_time: '09:00',
                  end_time: '10:30',
                  activity_type: 'lecture',
                },
              ],
              error: null,
            });
          }
          if (table === 'goals') {
            return Promise.resolve({
              data: [
                {
                  id: 'goal-1',
                  user_id: 'test-user-id',
                  title: 'Score 90% in Midterms',
                  goal_type: 'exam_score',
                  target_date: '2026-12-01',
                  progress_percentage: 75,
                },
              ],
              error: null,
            });
          }
          if (table === 'plans') {
            return Promise.resolve({
              data: [
                {
                  id: 'plan-1',
                  user_id: 'test-user-id',
                  title: 'Midterm Sprint',
                  plan_type: 'weekly',
                  start_date: '2026-11-20',
                  end_date: '2026-11-27',
                },
              ],
              error: null,
            });
          }
          return Promise.resolve({ data: [], error: null });
        }),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'settings-1',
            user_id: 'test-user-id',
            theme: 'dark',
            time_format: '12h',
            pomodoro_focus_duration: 25,
          },
          error: null,
        }),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            id: 'settings-1',
            user_id: 'test-user-id',
            theme: 'dark',
            time_format: '12h',
            pomodoro_focus_duration: 25,
          },
          error: null,
        }),
      })),
    },
  };
});

describe('StudyFlow API Service Layer - Planner, Goals & Settings', () => {
  it('manages timetable schedule items in Supabase', async () => {
    const schedule = await api.schedule.getSchedule();
    expect(schedule.length).toBe(1);
    expect(schedule[0].title).toBe('CS 106B Lecture');

    const created = await api.schedule.createScheduleItem({
      title: 'Physics Lab',
      day_of_week: 3,
      start_time: '14:00',
      end_time: '16:00',
      activity_type: 'lecture',
      is_recurring: true,
    } as any);

    expect(created.id).toBeDefined();
    expect(supabase.from).toHaveBeenCalledWith('schedule_items');
  });

  it('persists academic goals in Supabase', async () => {
    const goals = await api.goals.getGoals();
    expect(goals.length).toBe(1);
    expect(goals[0].progress_percentage).toBe(75);

    const updated = await api.goals.updateGoal('goal-1', { progress_percentage: 90 });
    expect(updated.progress_percentage).toBe(90);
  });

  it('persists study plans and sprints in Supabase', async () => {
    const plans = await api.plans.getPlans();
    expect(plans.length).toBe(1);
    expect(plans[0].title).toBe('Midterm Sprint');
  });

  it('manages user settings in Supabase', async () => {
    const settings = await api.settings.getSettings();
    expect(settings).toBeDefined();
    expect(settings.pomodoro_focus_duration).toBe(25);

    const updated = await api.settings.updateSettings({ pomodoro_focus_duration: 30 });
    expect(updated.pomodoro_focus_duration).toBe(30);
  });
});
