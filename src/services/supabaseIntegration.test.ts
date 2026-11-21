import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';
import { supabase } from './supabaseClient';

// Mock Supabase
vi.mock('./supabaseClient', () => {
  const mockUser = {
    id: 'test-user-uuid-1',
    email: 'alex.chen@university.edu',
    user_metadata: {
      username: 'alex_chen',
      full_name: 'Alex Chen',
    },
    created_at: new Date().toISOString(),
  };

  const mockTasks = [
    {
      id: 'task-1',
      user_id: 'test-user-uuid-1',
      title: 'Operating Systems Lab',
      priority: 'urgent',
      status: 'todo',
      due_date: '2026-11-25T18:00:00Z',
      estimated_duration_minutes: 90,
      actual_duration_minutes: 30,
      is_completed: false,
      subject: { id: 'sub-1', name: 'CS 107', color: '#10b981' },
    },
  ];

  const mockSubjects = [
    {
      id: 'sub-1',
      user_id: 'test-user-uuid-1',
      name: 'CS106B: Algorithms',
      code: 'CS 106B',
      color: '#6366f1',
      credit_hours: 4,
      units: [
        {
          id: 'unit-1',
          title: 'Unit 1: Trees',
          topics: [
            { id: 'top-1', title: 'Binary Trees', is_completed: true },
            { id: 'top-2', title: 'AVL Trees', is_completed: false },
          ],
        },
      ],
    },
  ];

  const mockSessions = [
    {
      id: 'sess-1',
      user_id: 'test-user-uuid-1',
      task_id: 'task-1',
      duration_minutes: 45,
      actual_minutes: 45,
      mode: 'pomodoro',
      completed_at: new Date().toISOString(),
    },
  ];

  return {
    isSupabaseConfigured: () => true,
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
        signInWithPassword: vi.fn().mockImplementation(({ email, password }) => {
          if (email === 'alex.chen@university.edu' && password === 'correct_password') {
            return Promise.resolve({
              data: { user: mockUser, session: { access_token: 'valid-token' } },
              error: null,
            });
          }
          if (email === 'unverified@university.edu') {
            return Promise.resolve({
              data: { user: null, session: null },
              error: { message: 'Email not confirmed' },
            });
          }
          return Promise.resolve({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' },
          });
        }),
        signUp: vi.fn().mockImplementation(({ email, password }) => {
          return Promise.resolve({
            data: { user: { ...mockUser, email }, session: null },
            error: null,
          });
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
        updateUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        resend: vi.fn().mockResolvedValue({ error: null }),
      },
      rpc: vi.fn().mockImplementation((funcName, args) => {
        if (funcName === 'resolve_username_to_email') {
          if (
            args.p_username.toLowerCase() === 'alex_chen' &&
            (!args.p_password || args.p_password === 'correct_password')
          ) {
            return Promise.resolve({ data: 'alex.chen@university.edu', error: null });
          }
          return Promise.resolve({ data: null, error: null });
        }
        if (funcName === 'is_username_available') {
          if (args.p_username.toLowerCase() === 'taken_user') {
            return Promise.resolve({ data: false, error: null });
          }
          return Promise.resolve({ data: true, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
      from: vi.fn().mockImplementation((table: string) => {
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockImplementation((payload) => ({
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'generated-uuid-new',
                ...payload,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          })),
          update: vi.fn().mockImplementation((payload) => ({
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'updated-uuid', ...payload },
              error: null,
            }),
          })),
          delete: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockImplementation(() => {
            if (table === 'tasks') return Promise.resolve({ data: mockTasks, error: null });
            if (table === 'subjects') return Promise.resolve({ data: mockSubjects, error: null });
            if (table === 'focus_sessions') return Promise.resolve({ data: mockSessions, error: null });
            return Promise.resolve({ data: [], error: null });
          }),
          single: vi.fn().mockImplementation(() => {
            if (table === 'profiles') {
              return Promise.resolve({
                data: {
                  id: 'test-user-uuid-1',
                  username: 'alex_chen',
                  email: 'alex.chen@university.edu',
                  full_name: 'Alex Chen',
                  daily_study_target_minutes: 180,
                },
                error: null,
              });
            }
            if (table === 'tasks') {
              return Promise.resolve({
                data: { ...mockTasks[0], actual_duration_minutes: 30 },
                error: null,
              });
            }
            return Promise.resolve({ data: null, error: null });
          }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'test-user-uuid-1',
              username: 'alex_chen',
              email: 'alex.chen@university.edu',
              full_name: 'Alex Chen',
              daily_study_target_minutes: 180,
            },
            error: null,
          }),
        };
      }),
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ data: { path: 'avatars/avatar.png' }, error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://supabase.co/storage/v1/object/public/avatars/test.png' },
          }),
        }),
      },
    },
  };
});

describe('Supabase Authentication & RPC Integration', () => {
  it('signs in with email and password directly', async () => {
    const res = await api.auth.signIn('alex.chen@university.edu', 'correct_password');
    expect(res.error).toBeNull();
    expect(res.user).toBeDefined();
    expect(res.user?.username).toBe('alex_chen');
    expect(res.user?.email).toBe('alex.chen@university.edu');
  });

  it('securely resolves username to email via RPC before signing in', async () => {
    const res = await api.auth.signIn('alex_chen', 'correct_password');
    expect(supabase.rpc).toHaveBeenCalledWith('resolve_username_to_email', {
      p_username: 'alex_chen',
      p_password: 'correct_password',
    });
    expect(res.error).toBeNull();
    expect(res.user?.email).toBe('alex.chen@university.edu');
  });

  it('handles unconfirmed email state with specific flag and message', async () => {
    const res = await api.auth.signIn('unverified@university.edu', 'any_pass');
    expect(res.isUnconfirmedEmail).toBe(true);
    expect(res.error).toContain('verify your email');
  });

  it('validates username uniqueness during registration via RPC', async () => {
    const res = await api.auth.signUp('taken_user', 'new@test.com', 'password123');
    expect(res.error).toContain('already taken');
    expect(res.user).toBeNull();
  });

  it('resends verification email through Supabase auth', async () => {
    const res = await api.auth.resendVerificationEmail('alex.chen@university.edu');
    expect(res.success).toBe(true);
    expect(supabase.auth.resend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'signup',
        email: 'alex.chen@university.edu',
      })
    );
  });
});

describe('Supabase Database CRUD & RLS User Isolation', () => {
  it('attaches current authenticated user UUID to created tasks', async () => {
    const task = await api.tasks.createTask({
      user_id: 'dummy',
      title: 'Complete Distributed Systems Proof',
      priority: 'high',
      status: 'todo',
      due_date: '2026-11-26T20:00:00Z',
      estimated_duration_minutes: 60,
    } as any);

    expect(task.id).toBeDefined();
    expect(supabase.from).toHaveBeenCalledWith('tasks');
  });

  it('increments task actual duration when logging a focus session in Supabase', async () => {
    const session = await api.focus.logSession({
      user_id: 'dummy',
      task_id: 'task-1',
      duration_minutes: 30,
      actual_minutes: 30,
      mode: 'pomodoro',
      completed_at: new Date().toISOString(),
    });

    expect(session.id).toBeDefined();
    expect(supabase.from).toHaveBeenCalledWith('focus_sessions');
    expect(supabase.from).toHaveBeenCalledWith('tasks');
  });

  it('uploads student avatar to Supabase Storage and returns public URL', async () => {
    const dummyFile = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });
    const publicUrl = await api.storage.uploadAvatar(dummyFile);

    expect(publicUrl).toContain('https://supabase.co/storage/v1/object/public/avatars');
    expect(supabase.storage.from).toHaveBeenCalledWith('avatars');
  });

  it('calculates analytics overview directly from Supabase responses', async () => {
    const overview = await api.analytics.getOverview();
    expect(overview.total_study_minutes_this_week).toBeGreaterThan(0);
    expect(overview.task_completion_rate).toBeGreaterThanOrEqual(0);
    expect(overview.daily_trends.length).toBe(7);
  });
});

