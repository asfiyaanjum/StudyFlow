import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Target,
  Sun,
  Columns,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../services/api';
import { ScheduleItem, Subject, ActivityType, DayOfWeek } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatTime12h, parseTimeToMinutes, getDaysOfWeekLabels } from '../../utils/dateUtils';

export type TimetableType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'planner';

const ACTIVITY_LABELS: Record<ActivityType, { label: string; color: string; badgeBg: string }> = {
  lecture: { label: 'Lecture / Class', color: 'bg-indigo-500 text-white', badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
  self_study: { label: 'Self Study Block', color: 'bg-emerald-500 text-white', badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  assignment: { label: 'Assignment Work', color: 'bg-amber-500 text-white', badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  revision: { label: 'Review & Revision', color: 'bg-purple-500 text-white', badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  exam: { label: 'Examination / Test', color: 'bg-rose-500 text-white', badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
  break: { label: 'Break / Meal', color: 'bg-teal-500 text-white', badgeBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' },
  personal: { label: 'Personal Activity', color: 'bg-slate-500 text-white', badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

interface TimetableTypeOption {
  type: TimetableType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge: string;
}

const TIMETABLE_TYPE_OPTIONS: TimetableTypeOption[] = [
  {
    type: 'daily',
    title: 'Daily Timetable',
    description: 'Plan an hour-by-hour schedule for focused daily routines and study blocks.',
    icon: Clock,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Hour-by-Hour',
  },
  {
    type: 'weekly',
    title: 'Weekly Timetable',
    description: 'Organize recurring lecture periods, lab hours, and weekly study commitments.',
    icon: CalendarIcon,
    color: 'from-indigo-500 to-purple-600',
    badge: 'Recurring 7-Day',
  },
  {
    type: 'monthly',
    title: 'Monthly Timetable',
    description: 'Map out key assignment deadlines, exam dates, and monthly academic milestones.',
    icon: CalendarDays,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Full Month Grid',
  },
  {
    type: 'yearly',
    title: 'Yearly Timetable',
    description: 'High-level semester roadmaps, academic terms, and major examination periods.',
    icon: CalendarRange,
    color: 'from-amber-500 to-orange-600',
    badge: '12-Month Roadmap',
  },
  {
    type: 'planner',
    title: 'Study Planner',
    description: 'Structured subject study tracker organizing specific study goals, topics, and completed sessions.',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-600',
    badge: 'Academic Goal Tracker',
  },
];

export const TimetablePage: React.FC = () => {
  const { success, warning, error: toastError } = useToast();

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Viewing Mode
  const [activeView, setActiveView] = useState<TimetableType>('weekly');

  // Date Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(new Date().getDay() as DayOfWeek);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Completed study session IDs (for planner view toggling)
  const [completedSessionIds, setCompletedSessionIds] = useState<Set<string>>(new Set());

  // Step 1: Type Selection Modal
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);

  // Step 2: Timetable Item Modal (Create or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [creationTimetableType, setCreationTimetableType] = useState<TimetableType>('weekly');

  // Form Fields (Preserving all original inputs)
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [activityType, setActivityType] = useState<ActivityType>('lecture');
  const [location, setLocation] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [specificDate, setSpecificDate] = useState('');
  const [notes, setNotes] = useState('');

  const days = getDaysOfWeekLabels(); // ['Sunday', 'Monday', 'Tuesday', ...]

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, sub] = await Promise.all([api.schedule.getSchedule(), api.subjects.getSubjects()]);
      setSchedule(s);
      setSubjects(sub);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const currentDay = new Date().getDay() as DayOfWeek;
    setSelectedDay(currentDay);
  }, []);

  // Step 1: Trigger creation flow -> show Type Selection screen
  const handleOpenCreationFlow = () => {
    setIsTypeSelectionOpen(true);
  };

  // Step 2: User picked a timetable type -> continue with creation modal pre-configured
  const handleSelectTimetableType = (type: TimetableType) => {
    setCreationTimetableType(type);
    setIsTypeSelectionOpen(false);

    // Setup prefilled defaults based on chosen type
    setEditingItem(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setDayOfWeek(selectedDay);
    setStartTime('09:00');
    setEndTime('10:30');
    setLocation('');
    setNotes('');

    const todayStr = new Date().toISOString().split('T')[0];

    switch (type) {
      case 'daily':
        setIsRecurring(false);
        setSpecificDate(todayStr);
        setActivityType('self_study');
        break;
      case 'weekly':
        setIsRecurring(true);
        setSpecificDate('');
        setActivityType('lecture');
        break;
      case 'monthly':
        setIsRecurring(false);
        setSpecificDate(selectedCalendarDate || todayStr);
        setActivityType('assignment');
        break;
      case 'yearly':
        setIsRecurring(false);
        setSpecificDate(todayStr);
        setActivityType('exam');
        break;
      case 'planner':
        setIsRecurring(true);
        setSpecificDate('');
        setActivityType('self_study');
        setNotes('Core focus: Revision & Practice Problem Sets');
        break;
    }

    setIsModalOpen(true);
  };

  // Open edit modal for existing item
  const openEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSubjectId(item.subject_id || '');
    setDayOfWeek(item.day_of_week);
    setStartTime(item.start_time);
    setEndTime(item.end_time);
    setActivityType(item.activity_type);
    setLocation(item.location || '');
    setIsRecurring(item.is_recurring ?? true);
    setSpecificDate(item.specific_date || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  // Handle Form Submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Validation Error', 'Schedule item title is required.');
      return;
    }

    if (parseTimeToMinutes(startTime) >= parseTimeToMinutes(endTime)) {
      toastError('Validation Error', 'Start time must be before end time.');
      return;
    }

    try {
      if (editingItem) {
        const updated = await api.schedule.updateScheduleItem(editingItem.id, {
          title,
          subject_id: subjectId || null,
          day_of_week: Number(dayOfWeek) as DayOfWeek,
          start_time: startTime,
          end_time: endTime,
          activity_type: activityType,
          location,
          is_recurring: isRecurring,
          specific_date: specificDate || null,
          notes,
        });

        setSchedule((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        success('Schedule Updated', `Updated "${title}".`);
      } else {
        const created = await api.schedule.createScheduleItem({
          user_id: 'user',
          title,
          subject_id: subjectId || null,
          day_of_week: Number(dayOfWeek) as DayOfWeek,
          start_time: startTime,
          end_time: endTime,
          activity_type: activityType,
          location,
          is_recurring: isRecurring,
          specific_date: specificDate || null,
          notes,
        });

        setSchedule((prev) => [...prev, created]);
        success('Class Scheduled', `Added "${title}" to your timetable.`);
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  // Handle Delete Entry
  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try {
      await api.schedule.deleteScheduleItem(itemId);
      setSchedule((prev) => prev.filter((i) => i.id !== itemId));
      success('Entry Removed', 'Timetable slot deleted.');
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle study session completion in Study Planner view
  const handleToggleStudySession = (itemId: string) => {
    setCompletedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
        success('Session Logged', 'Study block marked complete! Keep up the momentum.');
      }
      return next;
    });
  };

  // Navigation Handlers
  const handleNavigatePeriod = (direction: -1 | 1) => {
    const nextDate = new Date(currentDate);
    if (activeView === 'daily') {
      nextDate.setDate(nextDate.getDate() + direction);
      setSelectedDay(nextDate.getDay() as DayOfWeek);
    } else if (activeView === 'weekly') {
      nextDate.setDate(nextDate.getDate() + direction * 7);
      setSelectedDay(nextDate.getDay() as DayOfWeek);
    } else if (activeView === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + direction);
    } else if (activeView === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + direction);
    }
    setCurrentDate(nextDate);
  };

  const handleResetToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now.getDay() as DayOfWeek);
    setSelectedCalendarDate(now.toISOString().split('T')[0]);
  };

  // Current time indicator logic
  const now = new Date();
  const isCurrentDayActive = now.getDay() === selectedDay;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Filter day items
  const dayItems = useMemo(() => {
    return schedule
      .filter((item) => item.day_of_week === selectedDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [schedule, selectedDay]);

  // Calendar days generation for Monthly view
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarCells: { dayNumber: number; dateString: string; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, dayNum).toISOString().split('T')[0];
      calendarCells.push({ dayNumber: dayNum, dateString: prevDate, isCurrentMonth: false });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(dayNum).padStart(2, '0');
      const dateString = `${year}-${mm}-${dd}`;
      calendarCells.push({ dayNumber: dayNum, dateString, isCurrentMonth: true });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remaining = 35 - calendarCells.length;
    if (remaining > 0) {
      for (let dayNum = 1; dayNum <= remaining; dayNum++) {
        const d = new Date(year, month + 1, dayNum);
        calendarCells.push({ dayNumber: dayNum, dateString: d.toISOString().split('T')[0], isCurrentMonth: false });
      }
    }

    return { year, month, calendarCells };
  }, [currentDate]);

  // Selected date items in monthly view
  const selectedDateScheduleItems = useMemo(() => {
    const targetDateObj = new Date(selectedCalendarDate);
    const targetDayOfWeek = targetDateObj.getDay() as DayOfWeek;

    return schedule.filter((item) => {
      if (item.specific_date) {
        return item.specific_date === selectedCalendarDate;
      }
      return item.is_recurring && item.day_of_week === targetDayOfWeek;
    });
  }, [schedule, selectedCalendarDate]);

  // Study planner items
  const studyPlannerItems = useMemo(() => {
    return schedule.filter(
      (item) => item.activity_type === 'self_study' || item.activity_type === 'revision' || item.activity_type === 'assignment'
    );
  }, [schedule]);

  // Date formatted header title
  const formattedPeriodLabel = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    if (activeView === 'daily') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (activeView === 'weekly') {
      return `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    if (activeView === 'monthly') {
      return currentDate.toLocaleDateString('en-US', options);
    }
    if (activeView === 'yearly') {
      return `Academic Year ${currentDate.getFullYear()}`;
    }
    return 'Semester Study Plan';
  }, [currentDate, activeView]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border dark:border-slate-800 pb-5">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white tracking-tight">
            Academic Timetable & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-0.5">
            Organize lectures, lab sections, monthly exams, and dedicated self-study blocks.
          </p>
        </div>
        <Button onClick={handleOpenCreationFlow} leftIcon={<Plus size={16} />}>
          Create Timetable
        </Button>
      </div>

      {/* Main View Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-paper-border dark:border-slate-800 shadow-xs">
        {/* 5 View Mode Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setActiveView('daily')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeView === 'daily'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal-primary hover:bg-paper-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock size={13} />
            <span>Daily</span>
          </button>

          <button
            onClick={() => setActiveView('weekly')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeView === 'weekly'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal-primary hover:bg-paper-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarIcon size={13} />
            <span>Weekly</span>
          </button>

          <button
            onClick={() => setActiveView('monthly')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeView === 'monthly'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal-primary hover:bg-paper-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarDays size={13} />
            <span>Monthly</span>
          </button>

          <button
            onClick={() => setActiveView('yearly')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeView === 'yearly'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal-primary hover:bg-paper-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarRange size={13} />
            <span>Yearly</span>
          </button>

          <button
            onClick={() => setActiveView('planner')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeView === 'planner'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60'
            }`}
          >
            <BookOpen size={13} />
            <span>Study Planner</span>
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-full font-bold">
              {studyPlannerItems.length}
            </span>
          </button>
        </div>

        {/* Date Navigation & Today Action */}
        <div className="flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-paper-border dark:border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleNavigatePeriod(-1)}
              className="p-1.5 rounded-lg border border-paper-border dark:border-slate-800 hover:bg-paper-100 dark:hover:bg-slate-800 text-charcoal-primary dark:text-white"
              title="Previous Period"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-editorial text-sm font-medium px-2 text-charcoal-primary dark:text-white min-w-32 text-center">
              {formattedPeriodLabel}
            </span>
            <button
              onClick={() => handleNavigatePeriod(1)}
              className="p-1.5 rounded-lg border border-paper-border dark:border-slate-800 hover:bg-paper-100 dark:hover:bg-slate-800 text-charcoal-primary dark:text-white"
              title="Next Period"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <Button size="sm" variant="outline" onClick={handleResetToToday} leftIcon={<RotateCcw size={12} />}>
            Today
          </Button>
        </div>
      </div>

      {/* VIEW 1: DAILY VIEW */}
      {activeView === 'daily' && (
        <div className="space-y-4">
          {/* Day Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-paper-border dark:border-slate-800 text-xs">
            {days.map((dayLabel, idx) => {
              const isToday = now.getDay() === idx;
              const isSelected = selectedDay === idx;
              const itemCount = schedule.filter((s) => s.day_of_week === idx).length;

              return (
                <button
                  key={dayLabel}
                  onClick={() => setSelectedDay(idx as DayOfWeek)}
                  className={`px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-brand-600 text-white font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 text-charcoal-muted dark:text-slate-400 hover:text-charcoal-primary'
                  }`}
                >
                  <span>{dayLabel}</span>
                  {isToday && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-700'
                      }`}
                    >
                      Today
                    </span>
                  )}
                  {itemCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-paper-200 dark:bg-slate-800 text-charcoal-muted'
                      }`}
                    >
                      {itemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Schedule Content */}
          {dayItems.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title={`No classes on ${days[selectedDay]}`}
              subtitle="Your schedule is completely open for this day. Enjoy your free time or schedule a self-study block."
              action={
                <Button size="sm" onClick={handleOpenCreationFlow}>
                  + Add Class or Study Slot
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {dayItems.map((item) => {
                const startMins = parseTimeToMinutes(item.start_time);
                const endMins = parseTimeToMinutes(item.end_time);
                const isCurrentlyHappening = isCurrentDayActive && currentMinutes >= startMins && currentMinutes <= endMins;
                const activityConfig = ACTIVITY_LABELS[item.activity_type] || ACTIVITY_LABELS.lecture;

                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                      isCurrentlyHappening
                        ? 'border-brand-500 shadow-card ring-2 ring-brand-500/20'
                        : 'border-paper-border dark:border-slate-800 shadow-xs hover:border-brand-200'
                    }`}
                  >
                    {isCurrentlyHappening && (
                      <div className="absolute -left-1 top-4 bottom-4 w-1.5 rounded-full bg-brand-600 animate-pulse" />
                    )}

                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-20 text-center shrink-0 pt-0.5">
                        <span className="font-mono text-xs font-semibold text-charcoal-primary dark:text-white block">
                          {formatTime12h(item.start_time)}
                        </span>
                        <span className="font-mono text-[10px] text-charcoal-light dark:text-slate-400 block">
                          {formatTime12h(item.end_time)}
                        </span>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${activityConfig.color}`}>
                            {activityConfig.label}
                          </span>
                          {isCurrentlyHappening && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                              Happening Now
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-semibold text-charcoal-primary dark:text-white">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-charcoal-muted dark:text-slate-400">
                          {item.subject && (
                            <span className="font-medium text-brand-700 dark:text-brand-300">
                              {item.subject.name}
                            </span>
                          )}
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {item.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Side-by-side Edit and Delete Buttons */}
                    <div className="flex items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-paper-border dark:border-slate-800 mt-2 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-charcoal-light hover:text-charcoal-primary dark:hover:text-white rounded-lg hover:bg-paper-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Entry"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-charcoal-light hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: WEEKLY VIEW (7-Day Overview) */}
      {activeView === 'weekly' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {days.map((dayLabel, idx) => {
              const isToday = now.getDay() === idx;
              const itemsForDay = schedule
                .filter((s) => s.day_of_week === idx)
                .sort((a, b) => a.start_time.localeCompare(b.start_time));

              return (
                <div
                  key={dayLabel}
                  className={`rounded-2xl border p-3.5 flex flex-col min-h-64 transition-all ${
                    isToday
                      ? 'bg-brand-50/30 dark:bg-brand-950/20 border-brand-300 dark:border-brand-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-paper-border dark:border-slate-800 mb-2.5">
                    <span className="font-semibold text-xs text-charcoal-primary dark:text-white">
                      {dayLabel}
                    </span>
                    {isToday && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-brand-600 text-white">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    {itemsForDay.length === 0 ? (
                      <p className="text-[11px] text-charcoal-light dark:text-slate-500 italic py-4 text-center">
                        Free Day
                      </p>
                    ) : (
                      itemsForDay.map((item) => {
                        const activityConfig = ACTIVITY_LABELS[item.activity_type] || ACTIVITY_LABELS.lecture;
                        return (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl border border-paper-border dark:border-slate-800 bg-paper-canvas/50 dark:bg-slate-800/50 hover:border-brand-300 space-y-1.5 group transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-charcoal-light dark:text-slate-400">
                                {formatTime12h(item.start_time)}
                              </span>
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(item)}
                                  className="p-1 hover:text-charcoal-primary dark:hover:text-white text-charcoal-light"
                                  title="Edit"
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1 hover:text-rose-500 text-charcoal-light"
                                  title="Delete"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-charcoal-primary dark:text-white line-clamp-1">
                              {item.title}
                            </p>
                            <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded ${activityConfig.badgeBg}`}>
                              {activityConfig.label.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: MONTHLY VIEW (Full Month Calendar Grid) */}
      {activeView === 'monthly' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Calendar Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-paper-border dark:border-slate-800 shadow-xs space-y-3">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-charcoal-light dark:text-slate-400 pb-2 border-b border-paper-border dark:border-slate-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthData.calendarCells.map((cell, idx) => {
                const cellDateObj = new Date(cell.dateString);
                const cellDayOfWeek = cellDateObj.getDay() as DayOfWeek;

                // Match items for this cell
                const cellItems = schedule.filter((s) => {
                  if (s.specific_date) return s.specific_date === cell.dateString;
                  return s.is_recurring && s.day_of_week === cellDayOfWeek;
                });

                const isSelected = selectedCalendarDate === cell.dateString;
                const isToday = new Date().toISOString().split('T')[0] === cell.dateString;

                return (
                  <button
                    key={`${cell.dateString}-${idx}`}
                    type="button"
                    onClick={() => setSelectedCalendarDate(cell.dateString)}
                    className={`min-h-16 p-1.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                        : isToday
                        ? 'border-brand-300 dark:border-brand-800 bg-white dark:bg-slate-900'
                        : cell.isCurrentMonth
                        ? 'border-paper-border dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-paper-border/80'
                        : 'border-transparent opacity-40 bg-paper-canvas/30 dark:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]'
                            : isSelected
                            ? 'text-brand-600 font-bold'
                            : 'text-charcoal-primary dark:text-white'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {cellItems.length > 0 && (
                        <span className="text-[9px] px-1 py-0.2 rounded-full bg-paper-200 dark:bg-slate-800 text-charcoal-muted font-bold">
                          {cellItems.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 pt-1">
                      {cellItems.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="text-[9px] truncate px-1 py-0.2 rounded bg-paper-canvas dark:bg-slate-800 text-charcoal-primary dark:text-slate-200 font-medium"
                        >
                          {item.title}
                        </div>
                      ))}
                      {cellItems.length > 2 && (
                        <span className="text-[8px] text-charcoal-light block pl-1">
                          +{cellItems.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Date Schedule Detail */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-paper-border dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
                    {new Date(selectedCalendarDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h3>
                  <span className="text-xs text-charcoal-muted dark:text-slate-400">
                    {selectedDateScheduleItems.length} activities scheduled
                  </span>
                </div>
                <Button size="sm" onClick={() => handleSelectTimetableType('monthly')} leftIcon={<Plus size={13} />}>
                  Add Date Slot
                </Button>
              </div>

              {selectedDateScheduleItems.length === 0 ? (
                <p className="text-xs text-charcoal-muted dark:text-slate-400 py-6 text-center italic">
                  No classes or study sessions scheduled on this date.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {selectedDateScheduleItems.map((item) => {
                    const activityConfig = ACTIVITY_LABELS[item.activity_type] || ACTIVITY_LABELS.lecture;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-paper-border dark:border-slate-800 bg-paper-canvas/40 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${activityConfig.badgeBg}`}>
                            {activityConfig.label}
                          </span>
                          <h4 className="text-xs font-semibold text-charcoal-primary dark:text-white truncate">
                            {item.title}
                          </h4>
                          <span className="font-mono text-[10px] text-charcoal-light dark:text-slate-400 block">
                            {formatTime12h(item.start_time)} - {formatTime12h(item.end_time)}
                          </span>
                        </div>

                        {/* Edit & Delete side by side */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-charcoal-light hover:text-charcoal-primary rounded-lg hover:bg-paper-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Slot"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-charcoal-light hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Slot"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: YEARLY VIEW (12-Month Academic Overview) */}
      {activeView === 'yearly' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
                Yearly Academic Roadmap ({currentDate.getFullYear()})
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                Overview of all 12 academic months, examination periods, and recurring class densities.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200">
                Total Classes: {schedule.length}
              </span>
              <Button size="sm" onClick={() => handleSelectTimetableType('yearly')} leftIcon={<Plus size={13} />}>
                Add Year Milestone
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, monthIdx) => {
              const monthDate = new Date(currentDate.getFullYear(), monthIdx, 1);
              const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });
              const daysCount = new Date(currentDate.getFullYear(), monthIdx + 1, 0).getDate();

              return (
                <div
                  key={monthName}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-xs space-y-3 hover:border-brand-300 transition-colors cursor-pointer"
                  onClick={() => {
                    const newD = new Date(currentDate.getFullYear(), monthIdx, 1);
                    setCurrentDate(newD);
                    setActiveView('monthly');
                  }}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-paper-border dark:border-slate-800">
                    <span className="font-editorial text-base font-medium text-charcoal-primary dark:text-white">
                      {monthName}
                    </span>
                    <span className="text-[10px] text-charcoal-light dark:text-slate-400">
                      {daysCount} Days
                    </span>
                  </div>

                  {/* Mini-Month Preview Dots Grid */}
                  <div className="grid grid-cols-7 gap-1 text-[8px] text-center font-mono text-charcoal-light">
                    {Array.from({ length: 28 }, (_, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          i % 5 === 0
                            ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 font-bold'
                            : 'bg-paper-canvas dark:bg-slate-800'
                        }`}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-paper-border text-[11px] text-brand-600 dark:text-brand-400 font-medium flex items-center justify-between">
                    <span>Jump to Month</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 5: STUDY PLANNER VIEW (Structured Subject Study Tracker) */}
      {activeView === 'planner' && (
        <div className="space-y-6">
          {/* Planner Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-light block">
                Scheduled Study Blocks
              </span>
              <p className="font-editorial text-2xl font-bold text-charcoal-primary dark:text-white mt-1">
                {studyPlannerItems.length} Sessions
              </p>
              <span className="text-xs text-charcoal-muted dark:text-slate-400">
                Active revision and self-study slots
              </span>
            </Card>

            <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-light block">
                Completed Study Sessions
              </span>
              <p className="font-editorial text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {completedSessionIds.size} / {studyPlannerItems.length} Done
              </p>
              <span className="text-xs text-charcoal-muted dark:text-slate-400">
                Marked complete in this study cycle
              </span>
            </Card>

            <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-light block">
                Study Execution Rate
              </span>
              <p className="font-editorial text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {studyPlannerItems.length > 0
                  ? Math.round((completedSessionIds.size / studyPlannerItems.length) * 100)
                  : 0}
                %
              </p>
              <span className="text-xs text-charcoal-muted dark:text-slate-400">
                Target 80%+ weekly discipline
              </span>
            </Card>
          </div>

          {/* Planner List */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-border dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
                  Academic Study Planner
                </h3>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                  Organize what to study, when to study, and track completed revision milestones.
                </p>
              </div>
              <Button onClick={() => handleSelectTimetableType('planner')} leftIcon={<Plus size={14} />}>
                Add Study Plan Slot
              </Button>
            </div>

            {studyPlannerItems.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No study blocks in planner"
                subtitle="Add dedicated self-study blocks, exam revision periods, or assignment sessions."
                action={
                  <Button size="sm" onClick={() => handleSelectTimetableType('planner')}>
                    + Plan First Study Session
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {studyPlannerItems.map((item) => {
                  const isDone = completedSessionIds.has(item.id);
                  const activityConfig = ACTIVITY_LABELS[item.activity_type] || ACTIVITY_LABELS.self_study;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isDone
                          ? 'bg-paper-canvas/60 dark:bg-slate-800/40 border-paper-border dark:border-slate-800 opacity-75'
                          : 'bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-xs hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* Checkbox to log completed session */}
                        <button
                          type="button"
                          onClick={() => handleToggleStudySession(item.id)}
                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-paper-border dark:border-slate-700 hover:border-brand-500'
                          }`}
                          title={isDone ? 'Mark as incomplete' : 'Mark session as completed'}
                        >
                          {isDone && <CheckCircle2 size={13} />}
                        </button>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${activityConfig.badgeBg}`}>
                              {activityConfig.label}
                            </span>
                            <span className="text-[10px] text-charcoal-light dark:text-slate-400 font-mono">
                              Every {days[item.day_of_week]} • {formatTime12h(item.start_time)} - {formatTime12h(item.end_time)}
                            </span>
                          </div>

                          <h4
                            className={`text-sm sm:text-base font-semibold ${
                              isDone
                                ? 'line-through text-charcoal-muted dark:text-slate-500'
                                : 'text-charcoal-primary dark:text-white'
                            }`}
                          >
                            {item.title}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-charcoal-muted dark:text-slate-400">
                            {item.subject && (
                              <span className="font-medium text-brand-600 dark:text-brand-400">
                                {item.subject.name}
                              </span>
                            )}
                            {item.notes && (
                              <span className="italic truncate max-w-sm">
                                &quot;{item.notes}&quot;
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Side-by-side Edit & Delete Buttons */}
                      <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-paper-border dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-charcoal-light hover:text-charcoal-primary dark:hover:text-white rounded-lg hover:bg-paper-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Study Slot"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-charcoal-light hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Study Slot"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: TIMETABLE TYPE SELECTION MODAL */}
      <Modal
        isOpen={isTypeSelectionOpen}
        onClose={() => setIsTypeSelectionOpen(false)}
        title="What type of timetable would you like to create?"
        description="Choose a scheduling structure to match your semester routine and academic goals."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {TIMETABLE_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleSelectTimetableType(opt.type)}
                className="p-4 rounded-2xl border border-paper-border dark:border-slate-800 bg-paper-canvas/40 dark:bg-slate-800/40 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-white dark:hover:bg-slate-900 transition-all text-left flex flex-col justify-between group shadow-xs hover:shadow-subtle"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-paper-200 dark:bg-slate-800 text-charcoal-muted">
                      {opt.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-charcoal-primary dark:text-white group-hover:text-brand-600 transition-colors">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-charcoal-muted dark:text-slate-400 line-clamp-2">
                    {opt.description}
                  </p>
                </div>

                <div className="pt-3 text-[11px] font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Select & Continue</span>
                  <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* STEP 2: CREATION / EDITING MODAL (Preserving All Original Input Fields) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Timetable Entry' : `Schedule ${creationTimetableType.charAt(0).toUpperCase() + creationTimetableType.slice(1)} Slot`}
        description={editingItem ? 'Update scheduled timings, location, and activity.' : 'Schedule a class lecture, recitation, or study period.'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title / Course Name"
            required
            placeholder="e.g. CS 301 Lecture or Physics Deep Work"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Subject Link
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">No Subject Linked</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value) as DayOfWeek)}
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {days.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="End Time"
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Activity Type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="lecture">Lecture / Class</option>
                <option value="self_study">Self Study Block</option>
                <option value="assignment">Assignment Work</option>
                <option value="revision">Review & Revision</option>
                <option value="exam">Examination / Test</option>
                <option value="break">Break / Meal</option>
                <option value="personal">Personal Activity</option>
              </select>
            </div>

            <Input
              label="Location / Room"
              placeholder="Hall B-102, Zoom, or Library"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Contextual Date / Goal Notes depending on type */}
          {(creationTimetableType === 'monthly' || creationTimetableType === 'yearly' || specificDate) && (
            <Input
              label="Specific Date (Optional)"
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              helperText="For single-day academic exams or milestones"
            />
          )}

          <Input
            label="Study Goals / Session Notes (Optional)"
            placeholder="e.g. Chapter 4 problem set or Lecture slides review"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-border dark:border-slate-800">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingItem ? 'Save Changes' : 'Add Slot'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
