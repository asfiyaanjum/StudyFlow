import {
  UserProfile,
  UserSettings,
  Subject,
  SyllabusUnit,
  SyllabusTopic,
  Task,
  ScheduleItem,
  Goal,
  Plan,
  FocusSession,
} from '../types';

const STORAGE_KEYS = {
  USER: 'studyflow_user_profile',
  SETTINGS: 'studyflow_user_settings',
  SUBJECTS: 'studyflow_subjects',
  UNITS: 'studyflow_syllabus_units',
  TOPICS: 'studyflow_syllabus_topics',
  TASKS: 'studyflow_tasks',
  SCHEDULE: 'studyflow_schedule',
  GOALS: 'studyflow_goals',
  PLANS: 'studyflow_plans',
  SESSIONS: 'studyflow_focus_sessions',
};

// Seed initial realistic data for college student
const SEED_USER: UserProfile = {
  id: 'user_seed_001',
  username: 'alex_chen',
  email: 'alex.chen@university.edu',
  full_name: 'Alex Chen',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  college_university: 'Stanford University / Computer Science',
  major_course: 'B.S. in Computer Science',
  academic_year: 'Junior Year (Year 3)',
  daily_study_target_minutes: 240, // 4 hours
  created_at: new Date('2024-09-01T08:00:00Z').toISOString(),
  updated_at: new Date().toISOString(),
};

const SEED_SETTINGS: UserSettings = {
  id: 'settings_001',
  user_id: 'user_seed_001',
  theme: 'system',
  time_format: '12h',
  notification_sound: true,
  pomodoro_focus_duration: 25,
  pomodoro_short_break: 5,
  pomodoro_long_break: 15,
  pomodoro_long_break_interval: 4,
  weekly_study_goal_hours: 25,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const SEED_SUBJECTS: Subject[] = [
  {
    id: 'sub-cs106b',
    user_id: 'user_seed_001',
    name: 'CS106B: Data Structures & Algorithms',
    code: 'CS 106B',
    color: '#6366f1', // Indigo
    credit_hours: 4,
    instructor: 'Prof. Julie Zelenski',
    notes: 'Midterm scheduled for week 6. Focus on recursion, trees, and graphs.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sub-math51',
    user_id: 'user_seed_001',
    name: 'MATH 51: Linear Algebra & Multivariable',
    code: 'MATH 51',
    color: '#0284c7', // Sky Blue
    credit_hours: 5,
    instructor: 'Dr. Michael Saunders',
    notes: 'Weekly problem sets due Mondays at 5 PM.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sub-cs107',
    user_id: 'user_seed_001',
    name: 'CS107: Computer Organization & Systems',
    code: 'CS 107',
    color: '#10b981', // Emerald
    credit_hours: 4,
    instructor: 'Prof. Nick Troccoli',
    notes: 'C programming, pointers, memory allocation, and assembly x86-64.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sub-phys41',
    user_id: 'user_seed_001',
    name: 'PHYSICS 41: Mechanics',
    code: 'PHYS 41',
    color: '#f59e0b', // Amber
    credit_hours: 4,
    instructor: 'Prof. Peter Graham',
    notes: 'Lab sections on Thursdays.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_UNITS: SyllabusUnit[] = [
  {
    id: 'unit-cs1',
    subject_id: 'sub-cs106b',
    user_id: 'user_seed_001',
    title: 'Unit 1: ADTs & C++ Standard Template Library',
    unit_number: 1,
    description: 'Vectors, Grids, Stacks, Queues, Maps, and Sets.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'unit-cs2',
    subject_id: 'sub-cs106b',
    user_id: 'user_seed_001',
    title: 'Unit 2: Recursion & Backtracking',
    unit_number: 2,
    description: 'Recursive problem decomposition, recursive backtracking, pruning.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'unit-cs3',
    subject_id: 'sub-cs106b',
    user_id: 'user_seed_001',
    title: 'Unit 3: Trees, Heaps & Graphs',
    unit_number: 3,
    description: 'Binary Search Trees, Huffman coding, Dijkstra and A* graph algorithms.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'unit-math1',
    subject_id: 'sub-math51',
    user_id: 'user_seed_001',
    title: 'Unit 1: Vectors, Matrices & Systems of Equations',
    unit_number: 1,
    description: 'Matrix multiplication, row reduction, span and linear independence.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'unit-math2',
    subject_id: 'sub-math51',
    user_id: 'user_seed_001',
    title: 'Unit 2: Vector Spaces, Subspaces & Basis',
    unit_number: 2,
    description: 'Kernel, image, dimension theorem, orthogonality and Gram-Schmidt.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_TOPICS: SyllabusTopic[] = [
  // CS106B Unit 1
  {
    id: 'top-1',
    unit_id: 'unit-cs1',
    user_id: 'user_seed_001',
    title: 'Vectors and Grids in C++',
    estimated_minutes: 60,
    is_completed: true,
    completed_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'top-2',
    unit_id: 'unit-cs1',
    user_id: 'user_seed_001',
    title: 'Stacks and Queues: Applications and Pitfalls',
    estimated_minutes: 50,
    is_completed: true,
    completed_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'top-3',
    unit_id: 'unit-cs1',
    user_id: 'user_seed_001',
    title: 'Hash Maps and Sets Complexity Analysis',
    estimated_minutes: 75,
    is_completed: true,
    completed_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // CS106B Unit 2
  {
    id: 'top-4',
    unit_id: 'unit-cs2',
    user_id: 'user_seed_001',
    title: 'Thinking Recursively: Base Cases and Leap of Faith',
    estimated_minutes: 90,
    is_completed: true,
    completed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'top-5',
    unit_id: 'unit-cs2',
    user_id: 'user_seed_001',
    title: 'Backtracking: Mazes, Subsets and Permutations',
    estimated_minutes: 120,
    is_completed: false,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // CS106B Unit 3
  {
    id: 'top-6',
    unit_id: 'unit-cs3',
    user_id: 'user_seed_001',
    title: 'Binary Search Tree Traversals & Balancing',
    estimated_minutes: 90,
    is_completed: false,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'top-7',
    unit_id: 'unit-cs3',
    user_id: 'unit-cs3',
    title: 'Dijkstra Shortest Path Implementation',
    estimated_minutes: 100,
    is_completed: false,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Math Unit 1
  {
    id: 'top-math-1',
    unit_id: 'unit-math1',
    user_id: 'user_seed_001',
    title: 'Gaussian Elimination and Matrix Inverses',
    estimated_minutes: 80,
    is_completed: true,
    completed_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'top-math-2',
    unit_id: 'unit-math1',
    user_id: 'user_seed_001',
    title: 'Linear Combinations and Matrix Equations Ax = b',
    estimated_minutes: 70,
    is_completed: true,
    completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'top-math-3',
    unit_id: 'unit-math2',
    user_id: 'user_seed_001',
    title: 'Nullspace and Column Space computation',
    estimated_minutes: 90,
    is_completed: false,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Helper to get formatted ISO date strings relative to today
const getRelativeDate = (offsetDays: number, timeStr = '17:00:00'): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${timeStr}Z`;
};

const SEED_TASKS: Task[] = [
  {
    id: 'task-1',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs106b',
    title: 'Implement Backtracking Solver for Maze Generator',
    description: 'Complete the recursive backtracking problem set and test with edge cases.',
    priority: 'urgent',
    status: 'todo',
    due_date: getRelativeDate(-1), // Overdue! Perfect for Recovery Engine
    estimated_duration_minutes: 120,
    actual_duration_minutes: 40,
    is_completed: false,
    rescheduled_count: 1,
    created_at: getRelativeDate(-4),
    updated_at: getRelativeDate(-1),
  },
  {
    id: 'task-2',
    user_id: 'user_seed_001',
    subject_id: 'sub-math51',
    title: 'Linear Algebra Problem Set 4: Subspaces & Rank',
    description: 'Questions 1 through 8 from chapter 4. Verify proofs for theorem 4.2.',
    priority: 'high',
    status: 'in_progress',
    due_date: getRelativeDate(0, '22:00:00'), // Due Today
    estimated_duration_minutes: 90,
    actual_duration_minutes: 30,
    is_completed: false,
    created_at: getRelativeDate(-3),
    updated_at: getRelativeDate(0),
  },
  {
    id: 'task-3',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs107',
    title: 'Buffer Overflow Lab & Pointer Arithmetic',
    description: 'Disassemble binary in GDB, examine stack frames and complete exploit levels 1-3.',
    priority: 'high',
    status: 'todo',
    due_date: getRelativeDate(1, '23:59:59'), // Tomorrow
    estimated_duration_minutes: 150,
    actual_duration_minutes: 0,
    is_completed: false,
    created_at: getRelativeDate(-2),
    updated_at: getRelativeDate(-2),
  },
  {
    id: 'task-4',
    user_id: 'user_seed_001',
    subject_id: 'sub-phys41',
    title: 'Mechanics Lab Report: Rotational Inertia',
    description: 'Graph torque vs angular acceleration, compute uncertainty analysis.',
    priority: 'medium',
    status: 'todo',
    due_date: getRelativeDate(3, '18:00:00'),
    estimated_duration_minutes: 75,
    actual_duration_minutes: 0,
    is_completed: false,
    created_at: getRelativeDate(-1),
    updated_at: getRelativeDate(-1),
  },
  {
    id: 'task-5',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs106b',
    title: 'Read Chapter 14: Balanced Binary Trees',
    description: 'Review AVL and Red-Black tree rotations ahead of lecture.',
    priority: 'low',
    status: 'completed',
    due_date: getRelativeDate(-2),
    estimated_duration_minutes: 45,
    actual_duration_minutes: 50,
    is_completed: true,
    completed_at: getRelativeDate(-2),
    created_at: getRelativeDate(-5),
    updated_at: getRelativeDate(-2),
  },
  {
    id: 'task-6',
    user_id: 'user_seed_001',
    subject_id: 'sub-math51',
    title: 'Quiz 3 Preparation: Orthogonality & Projections',
    description: 'Practice 15 sample questions from midterm prep packet.',
    priority: 'medium',
    status: 'completed',
    due_date: getRelativeDate(-3),
    estimated_duration_minutes: 60,
    actual_duration_minutes: 60,
    is_completed: true,
    completed_at: getRelativeDate(-3),
    created_at: getRelativeDate(-6),
    updated_at: getRelativeDate(-3),
  },
];

const SEED_SCHEDULE: ScheduleItem[] = [
  // Monday
  {
    id: 'sch-mon-1',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs106b',
    title: 'CS 106B Lecture: Graph Traversal',
    day_of_week: 1, // Monday
    start_time: '09:30',
    end_time: '10:50',
    activity_type: 'lecture',
    location: 'NVIDIA Auditorium',
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sch-mon-2',
    user_id: 'user_seed_001',
    subject_id: 'sub-math51',
    title: 'MATH 51 Lecture: Eigenvalues',
    day_of_week: 1,
    start_time: '11:30',
    end_time: '12:50',
    activity_type: 'lecture',
    location: 'Hewlett 200',
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sch-mon-3',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs106b',
    title: 'CS 106B Section / Discussion',
    day_of_week: 1,
    start_time: '14:00',
    end_time: '15:00',
    activity_type: 'lecture',
    location: 'Gates B02',
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Tuesday
  {
    id: 'sch-tue-1',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs107',
    title: 'CS 107 Lecture: Assembly Language',
    day_of_week: 2, // Tuesday
    start_time: '10:00',
    end_time: '11:20',
    activity_type: 'lecture',
    location: 'Skilling Auditorium',
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sch-tue-2',
    user_id: 'user_seed_001',
    subject_id: 'sub-phys41',
    title: 'PHYSICS 41 Lecture: Momentum',
    day_of_week: 2,
    start_time: '13:30',
    end_time: '14:50',
    activity_type: 'lecture',
    location: 'Hewlett 201',
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Wednesday
  {
    id: 'sch-wed-1',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs106b',
    title: 'CS 106B Lecture: Shortest Paths',
    day_of_week: 3, // Wednesday
    start_time: '09:30',
    end_time: '10:50',
    activity_type: 'lecture',
    location: 'NVIDIA Auditorium',
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sch-wed-2',
    user_id: 'user_seed_001',
    subject_id: 'sub-math51',
    title: 'MATH 51 Lecture: Diagonalization',
    day_of_week: 3,
    start_time: '11:30',
    end_time: '12:50',
    activity_type: 'lecture',
    location: 'Hewlett 200',
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Thursday
  {
    id: 'sch-thu-1',
    user_id: 'user_seed_001',
    subject_id: 'sub-phys41',
    title: 'PHYSICS 41 Laboratory Session',
    day_of_week: 4, // Thursday
    start_time: '14:00',
    end_time: '17:00',
    activity_type: 'lecture',
    location: 'Varian Physics Lab 105',
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Friday
  {
    id: 'sch-fri-1',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs106b',
    title: 'CS 106B Weekly Review & Office Hours',
    day_of_week: 5, // Friday
    start_time: '10:00',
    end_time: '11:30',
    activity_type: 'revision',
    location: 'Huang Basement',
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_GOALS: Goal[] = [
  {
    id: 'goal-1',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs106b',
    title: 'Achieve A in CS106B Midterm & Projects',
    description: 'Score at least 92% across all 7 programming assignments and ace the midterm exam.',
    goal_type: 'exam_score',
    target_date: getRelativeDate(25).split('T')[0],
    progress_percentage: 68,
    status: 'active',
    created_at: getRelativeDate(-30),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'goal-2',
    user_id: 'user_seed_001',
    subject_id: 'sub-math51',
    title: 'Master Subspaces and Complete All Problem Sets',
    description: 'Ensure 100% on-time submission rate on Gradescope for all Math 51 homeworks.',
    goal_type: 'subject_mastery',
    target_date: getRelativeDate(40).split('T')[0],
    progress_percentage: 50,
    status: 'active',
    created_at: getRelativeDate(-20),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'goal-3',
    user_id: 'user_seed_001',
    subject_id: null,
    title: 'Maintain 20 Hours of Focused Study Weekly',
    description: 'Complete at least four 50-minute Pomodoros every day except Sunday.',
    goal_type: 'study_hours',
    target_date: getRelativeDate(60).split('T')[0],
    progress_percentage: 82,
    status: 'active',
    created_at: getRelativeDate(-15),
    updated_at: new Date().toISOString(),
  },
];

const SEED_PLANS: Plan[] = [
  {
    id: 'plan-1',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs106b',
    title: 'Week 5 CS106B Sprint: Backtracking & Recursion',
    description: 'Intense 7-day focus to finish maze solver and start binary trees.',
    plan_type: 'weekly',
    start_date: getRelativeDate(-3).split('T')[0],
    end_date: getRelativeDate(4).split('T')[0],
    content: `### Sprint Goals:
- [x] Complete recursive warm-up exercises
- [ ] Implement backtrack algorithm for maze generator
- [ ] Benchmark execution time with large mazes
- [ ] Read binary search tree traversal section in book`,
    is_active: true,
    created_at: getRelativeDate(-3),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-2',
    user_id: 'user_seed_001',
    subject_id: 'sub-math51',
    title: 'Midterm 1 Preparation Blueprint',
    description: 'Two-week structured revision for Linear Algebra.',
    plan_type: 'exam_prep',
    start_date: getRelativeDate(10).split('T')[0],
    end_date: getRelativeDate(24).split('T')[0],
    content: `### Revision Checklist:
1. Review lecture slides 1 to 12
2. Redo problems marked challenging on homework 1-3
3. Take 2023 practice midterm under timed conditions
4. Attend TA review session`,
    is_active: true,
    created_at: getRelativeDate(-5),
    updated_at: new Date().toISOString(),
  },
];

const SEED_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'sess-1',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs106b',
    task_id: 'task-1',
    duration_minutes: 50,
    actual_minutes: 50,
    mode: 'pomodoro',
    notes: 'Drafted recursive helper function for maze path finding.',
    completed_at: getRelativeDate(-1, '14:30:00'),
    created_at: getRelativeDate(-1, '14:30:00'),
  },
  {
    id: 'sess-2',
    user_id: 'user_seed_001',
    subject_id: 'sub-math51',
    task_id: 'task-2',
    duration_minutes: 45,
    actual_minutes: 45,
    mode: 'pomodoro',
    notes: 'Solved problem set 4 questions 1-3.',
    completed_at: getRelativeDate(-1, '16:00:00'),
    created_at: getRelativeDate(-1, '16:00:00'),
  },
  {
    id: 'sess-3',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs106b',
    task_id: 'task-5',
    duration_minutes: 30,
    actual_minutes: 30,
    mode: 'pomodoro',
    notes: 'Finished reading chapter on balanced trees.',
    completed_at: getRelativeDate(-2, '11:00:00'),
    created_at: getRelativeDate(-2, '11:00:00'),
  },
  {
    id: 'sess-4',
    user_id: 'user_seed_001',
    subject_id: 'sub-phys41',
    task_id: null,
    duration_minutes: 60,
    actual_minutes: 60,
    mode: 'custom',
    notes: 'Reviewed mechanics formulas and moment of inertia derivations.',
    completed_at: getRelativeDate(-2, '17:00:00'),
    created_at: getRelativeDate(-2, '17:00:00'),
  },
  {
    id: 'sess-5',
    user_id: 'user_seed_001',
    subject_id: 'sub-cs107',
    task_id: 'task-3',
    duration_minutes: 40,
    actual_minutes: 40,
    mode: 'pomodoro',
    notes: 'GDB debugging stack frames.',
    completed_at: getRelativeDate(0, '10:30:00'), // Today
    created_at: getRelativeDate(0, '10:30:00'),
  },
];

/**
 * LocalStorage Mock Persistence Manager
 * Ensures 100% functionality even before database keys are linked
 */
export class MockStorage {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        this.setItem(key, defaultValue);
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to localStorage key ${key}:`, e);
    }
  }

  // Profile & Settings
  public static getUser(): UserProfile {
    return this.getItem(STORAGE_KEYS.USER, SEED_USER);
  }

  public static updateUser(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUser();
    const updated = { ...current, ...profile, updated_at: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.USER, updated);
    return updated;
  }

  public static getSettings(): UserSettings {
    return this.getItem(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
  }

  public static updateSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // Subjects
  public static getSubjects(): Subject[] {
    const subjects = this.getItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    const units = this.getSyllabusUnits();
    const topics = this.getSyllabusTopics();

    // Attach computed stats
    return subjects.map((sub) => {
      const subUnits = units.filter((u) => u.subject_id === sub.id);
      const subUnitIds = new Set(subUnits.map((u) => u.id));
      const subTopics = topics.filter((t) => subUnitIds.has(t.unit_id));
      const completedTopics = subTopics.filter((t) => t.is_completed);

      const progress =
        subTopics.length > 0 ? Math.round((completedTopics.length / subTopics.length) * 100) : 0;

      return {
        ...sub,
        units_count: subUnits.length,
        topics_count: subTopics.length,
        completed_topics_count: completedTopics.length,
        progress_percentage: progress,
      };
    });
  }

  public static addSubject(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>): Subject {
    const subjects = this.getItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    const newSubject: Subject = {
      ...subject,
      id: `sub_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    subjects.push(newSubject);
    this.setItem(STORAGE_KEYS.SUBJECTS, subjects);
    return newSubject;
  }

  public static updateSubject(id: string, updates: Partial<Subject>): Subject | null {
    const subjects = this.getItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    const index = subjects.findIndex((s) => s.id === id);
    if (index === -1) return null;
    subjects[index] = { ...subjects[index], ...updates, updated_at: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.SUBJECTS, subjects);
    return subjects[index];
  }

  public static deleteSubject(id: string): boolean {
    const subjects = this.getItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    const filtered = subjects.filter((s) => s.id !== id);
    this.setItem(STORAGE_KEYS.SUBJECTS, filtered);
    return true;
  }

  // Syllabus Units & Topics
  public static getSyllabusUnits(subjectId?: string): SyllabusUnit[] {
    const units = this.getItem(STORAGE_KEYS.UNITS, SEED_UNITS);
    const topics = this.getSyllabusTopics();

    const result = units.map((unit) => {
      const unitTopics = topics.filter((t) => t.unit_id === unit.id);
      const completed = unitTopics.filter((t) => t.is_completed).length;
      const progress =
        unitTopics.length > 0 ? Math.round((completed / unitTopics.length) * 100) : 0;
      return {
        ...unit,
        topics: unitTopics,
        progress_percentage: progress,
      };
    });

    if (subjectId) {
      return result.filter((u) => u.subject_id === subjectId);
    }
    return result;
  }

  public static addSyllabusUnit(unit: Omit<SyllabusUnit, 'id' | 'created_at' | 'updated_at'>): SyllabusUnit {
    const units = this.getItem(STORAGE_KEYS.UNITS, SEED_UNITS);
    const newUnit: SyllabusUnit = {
      ...unit,
      id: `unit_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    units.push(newUnit);
    this.setItem(STORAGE_KEYS.UNITS, units);
    return newUnit;
  }

  public static getSyllabusTopics(): SyllabusTopic[] {
    return this.getItem(STORAGE_KEYS.TOPICS, SEED_TOPICS);
  }

  public static addSyllabusTopic(topic: Omit<SyllabusTopic, 'id' | 'created_at' | 'updated_at'>): SyllabusTopic {
    const topics = this.getItem(STORAGE_KEYS.TOPICS, SEED_TOPICS);
    const newTopic: SyllabusTopic = {
      ...topic,
      id: `top_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    topics.push(newTopic);
    this.setItem(STORAGE_KEYS.TOPICS, topics);
    return newTopic;
  }

  public static toggleTopicComplete(topicId: string): SyllabusTopic | null {
    const topics = this.getItem(STORAGE_KEYS.TOPICS, SEED_TOPICS);
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return null;
    topic.is_completed = !topic.is_completed;
    topic.completed_at = topic.is_completed ? new Date().toISOString() : null;
    topic.updated_at = new Date().toISOString();
    this.setItem(STORAGE_KEYS.TOPICS, topics);
    return topic;
  }

  // Tasks
  public static getTasks(): Task[] {
    const tasks = this.getItem(STORAGE_KEYS.TASKS, SEED_TASKS);
    const subjects = this.getItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    return tasks.map((task) => ({
      ...task,
      subject: subjects.find((s) => s.id === task.subject_id),
    }));
  }

  public static addTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task {
    const tasks = this.getItem(STORAGE_KEYS.TASKS, SEED_TASKS);
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    this.setItem(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  }

  public static updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getItem(STORAGE_KEYS.TASKS, SEED_TASKS);
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...updates, updated_at: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  }

  public static deleteTask(id: string): boolean {
    const tasks = this.getItem(STORAGE_KEYS.TASKS, SEED_TASKS);
    const filtered = tasks.filter((t) => t.id !== id);
    this.setItem(STORAGE_KEYS.TASKS, filtered);
    return true;
  }

  public static toggleTaskComplete(id: string): Task | null {
    const tasks = this.getItem(STORAGE_KEYS.TASKS, SEED_TASKS);
    const task = tasks.find((t) => t.id === id);
    if (!task) return null;
    task.is_completed = !task.is_completed;
    task.status = task.is_completed ? 'completed' : 'todo';
    task.completed_at = task.is_completed ? new Date().toISOString() : null;
    task.updated_at = new Date().toISOString();
    this.setItem(STORAGE_KEYS.TASKS, tasks);
    return task;
  }

  // Schedule Items
  public static getSchedule(): ScheduleItem[] {
    const schedule = this.getItem(STORAGE_KEYS.SCHEDULE, SEED_SCHEDULE);
    const subjects = this.getItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    return schedule.map((item) => ({
      ...item,
      subject: subjects.find((s) => s.id === item.subject_id),
    }));
  }

  public static addScheduleItem(item: Omit<ScheduleItem, 'id' | 'created_at' | 'updated_at'>): ScheduleItem {
    const schedule = this.getItem(STORAGE_KEYS.SCHEDULE, SEED_SCHEDULE);
    const newItem: ScheduleItem = {
      ...item,
      id: `sch_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    schedule.push(newItem);
    this.setItem(STORAGE_KEYS.SCHEDULE, schedule);
    return newItem;
  }

  public static updateScheduleItem(id: string, updates: Partial<ScheduleItem>): ScheduleItem | null {
    const schedule = this.getItem(STORAGE_KEYS.SCHEDULE, SEED_SCHEDULE);
    const index = schedule.findIndex((s) => s.id === id);
    if (index === -1) return null;
    schedule[index] = { ...schedule[index], ...updates, updated_at: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.SCHEDULE, schedule);
    return schedule[index];
  }

  public static deleteScheduleItem(id: string): boolean {
    const schedule = this.getItem(STORAGE_KEYS.SCHEDULE, SEED_SCHEDULE);
    const filtered = schedule.filter((s) => s.id !== id);
    this.setItem(STORAGE_KEYS.SCHEDULE, filtered);
    return true;
  }

  // Goals
  public static getGoals(): Goal[] {
    const goals = this.getItem(STORAGE_KEYS.GOALS, SEED_GOALS);
    const subjects = this.getItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    return goals.map((g) => ({
      ...g,
      subject: subjects.find((s) => s.id === g.subject_id),
    }));
  }

  public static addGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Goal {
    const goals = this.getItem(STORAGE_KEYS.GOALS, SEED_GOALS);
    const newGoal: Goal = {
      ...goal,
      id: `goal_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    goals.push(newGoal);
    this.setItem(STORAGE_KEYS.GOALS, goals);
    return newGoal;
  }

  public static updateGoal(id: string, updates: Partial<Goal>): Goal | null {
    const goals = this.getItem(STORAGE_KEYS.GOALS, SEED_GOALS);
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    goals[index] = { ...goals[index], ...updates, updated_at: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.GOALS, goals);
    return goals[index];
  }

  public static deleteGoal(id: string): boolean {
    const goals = this.getItem(STORAGE_KEYS.GOALS, SEED_GOALS);
    const filtered = goals.filter((g) => g.id !== id);
    this.setItem(STORAGE_KEYS.GOALS, filtered);
    return true;
  }

  // Plans
  public static getPlans(): Plan[] {
    const plans = this.getItem(STORAGE_KEYS.PLANS, SEED_PLANS);
    const subjects = this.getItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    return plans.map((p) => ({
      ...p,
      subject: subjects.find((s) => s.id === p.subject_id),
    }));
  }

  public static addPlan(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Plan {
    const plans = this.getItem(STORAGE_KEYS.PLANS, SEED_PLANS);
    const newPlan: Plan = {
      ...plan,
      id: `plan_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    plans.push(newPlan);
    this.setItem(STORAGE_KEYS.PLANS, plans);
    return newPlan;
  }

  public static updatePlan(id: string, updates: Partial<Plan>): Plan | null {
    const plans = this.getItem(STORAGE_KEYS.PLANS, SEED_PLANS);
    const index = plans.findIndex((p) => p.id === id);
    if (index === -1) return null;
    plans[index] = { ...plans[index], ...updates, updated_at: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.PLANS, plans);
    return plans[index];
  }

  public static deletePlan(id: string): boolean {
    const plans = this.getItem(STORAGE_KEYS.PLANS, SEED_PLANS);
    const filtered = plans.filter((p) => p.id !== id);
    this.setItem(STORAGE_KEYS.PLANS, filtered);
    return true;
  }

  // Focus Sessions
  public static getFocusSessions(): FocusSession[] {
    const sessions = this.getItem(STORAGE_KEYS.SESSIONS, SEED_FOCUS_SESSIONS);
    const subjects = this.getItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    const tasks = this.getItem(STORAGE_KEYS.TASKS, SEED_TASKS);
    return sessions.map((s) => ({
      ...s,
      subject: subjects.find((sub) => sub.id === s.subject_id),
      task: tasks.find((t) => t.id === s.task_id),
    }));
  }

  public static logFocusSession(session: Omit<FocusSession, 'id' | 'created_at'>): FocusSession {
    const sessions = this.getItem(STORAGE_KEYS.SESSIONS, SEED_FOCUS_SESSIONS);
    const newSession: FocusSession = {
      ...session,
      id: `sess_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    sessions.unshift(newSession);
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);

    // If attached to a task, increment task actual duration
    if (session.task_id) {
      const task = this.getTasks().find((t) => t.id === session.task_id);
      if (task) {
        this.updateTask(task.id, {
          actual_duration_minutes: (task.actual_duration_minutes || 0) + session.actual_minutes,
        });
      }
    }

    return newSession;
  }
}
