import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Trash2,
  AlertTriangle,
  BookOpen,
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

const ACTIVITY_LABELS: Record<ActivityType, { label: string; color: string }> = {
  lecture: { label: 'Lecture / Class', color: 'bg-indigo-500 text-white' },
  self_study: { label: 'Self Study Block', color: 'bg-emerald-500 text-white' },
  assignment: { label: 'Assignment Work', color: 'bg-amber-500 text-white' },
  revision: { label: 'Review & Revision', color: 'bg-purple-500 text-white' },
  exam: { label: 'Examination / Test', color: 'bg-rose-500 text-white' },
  break: { label: 'Break / Meal', color: 'bg-teal-500 text-white' },
  personal: { label: 'Personal Activity', color: 'bg-slate-500 text-white' },
};

export const TimetablePage: React.FC = () => {
  const { success, warning, error: toastError } = useToast();

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Active viewing day (1 = Monday by default)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [activityType, setActivityType] = useState<ActivityType>('lecture');
  const [location, setLocation] = useState('');

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
    // Default to today's day of week
    const currentDay = new Date().getDay() as DayOfWeek;
    setSelectedDay(currentDay);
  }, []);

  const openCreateModal = () => {
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setDayOfWeek(selectedDay);
    setStartTime('09:00');
    setEndTime('10:30');
    setActivityType('lecture');
    setLocation('');
    setIsModalOpen(true);
  };

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
      const created = await api.schedule.createScheduleItem({
        user_id: 'user',
        title,
        subject_id: subjectId || null,
        day_of_week: Number(dayOfWeek) as DayOfWeek,
        start_time: startTime,
        end_time: endTime,
        activity_type: activityType,
        location,
        is_recurring: true,
      });

      setSchedule((prev) => [...prev, created]);
      success('Class Scheduled', `Added "${title}" to your timetable.`);
      setIsModalOpen(false);
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

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

  // Day filter & sort
  const dayItems = schedule
    .filter((item) => item.day_of_week === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Current time indicator logic
  const now = new Date();
  const isCurrentDayActive = now.getDay() === selectedDay;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border dark:border-slate-800 pb-5">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white tracking-tight">
            Academic Timetable
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-0.5">
            Organize lectures, lab sections, and dedicated self-study blocks.
          </p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus size={16} />}>
          Add Class / Slot
        </Button>
      </div>

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
            <Button size="sm" onClick={openCreateModal}>
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
                {/* Active Indicator Pulse Bar */}
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

                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-paper-border dark:border-slate-800 mt-2 sm:mt-0">
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

      {/* Schedule Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Timetable Slot"
        description="Schedule a class lecture, recitation, or study period."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title / Course Name"
            required
            placeholder="e.g. CS 301 Lecture"
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
              placeholder="Hall B-102 or Zoom"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-border dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
