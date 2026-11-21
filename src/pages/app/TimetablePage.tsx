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

  const loadData = async () => {
    try {
      setLoading(true);
      const [sch, subs] = await Promise.all([api.schedule.getSchedule(), api.subjects.getSubjects()]);
      setSchedule(sch);
      setSubjects(subs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = (presetDay?: DayOfWeek) => {
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setDayOfWeek(presetDay !== undefined ? presetDay : selectedDay);
    setStartTime('09:00');
    setEndTime('10:30');
    setActivityType('lecture');
    setLocation('');
    setIsModalOpen(true);
  };

  // Conflict detection
  const checkConflict = (day: DayOfWeek, start: string, end: string): ScheduleItem | undefined => {
    const startM = parseTimeToMinutes(start);
    const endM = parseTimeToMinutes(end);

    return schedule.find((item) => {
      if (item.day_of_week !== day) return false;
      const iStart = parseTimeToMinutes(item.start_time);
      const iEnd = parseTimeToMinutes(item.end_time);
      return startM < iEnd && endM > iStart;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseTimeToMinutes(startTime) >= parseTimeToMinutes(endTime)) {
      toastError('Invalid Time Range', 'End time must be after start time.');
      return;
    }

    const conflict = checkConflict(dayOfWeek, startTime, endTime);
    if (conflict) {
      warning(
        'Schedule Conflict Detected',
        `Warning: This overlaps with "${conflict.title}" (${formatTime12h(
          conflict.start_time
        )} - ${formatTime12h(conflict.end_time)}). Adding anyway.`
      );
    }

    try {
      const created = await api.schedule.createScheduleItem({
        user_id: 'user',
        title,
        subject_id: subjectId || null,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        activity_type: activityType,
        location,
        is_recurring: true,
      });

      setSchedule((prev) => [...prev, created]);
      success('Schedule Item Added', `Added "${title}" to your timetable.`);
      setIsModalOpen(false);
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this entry from your timetable?')) {
      try {
        await api.schedule.deleteScheduleItem(id);
        setSchedule((prev) => prev.filter((s) => s.id !== id));
        success('Deleted', 'Entry removed from timetable.');
      } catch (err: any) {
        toastError('Error', err.message);
      }
    }
  };

  const dayLabels = getDaysOfWeekLabels();
  // Filter items for selected day sorted by start time
  const dayItems = schedule
    .filter((item) => item.day_of_week === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Map your weekly lectures, lab sections, review sessions, and dedicated focus windows.
          </p>
        </div>

        <Button onClick={() => openAddModal()} leftIcon={<Plus className="w-4 h-4" />}>
          Add Schedule Entry
        </Button>
      </div>

      {/* Day Selector Tabs */}
      <div className="grid grid-cols-7 gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl">
        {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
          const isSelected = selectedDay === dayIndex;
          const count = schedule.filter((s) => s.day_of_week === dayIndex).length;
          const label = dayLabels[dayIndex];

          return (
            <button
              key={dayIndex}
              onClick={() => setSelectedDay(dayIndex as DayOfWeek)}
              className={`py-3 px-2 rounded-xl text-center transition-all ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-brand-600 dark:text-brand-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="text-xs sm:text-sm font-semibold truncate">
                {label.slice(0, 3)}
              </div>
              <div className="text-[10px] mt-0.5 opacity-70">
                {count} {count === 1 ? 'event' : 'events'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {dayLabels[selectedDay]} Schedule
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openAddModal(selectedDay)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add to {dayLabels[selectedDay]}
          </Button>
        </div>

        {dayItems.length === 0 ? (
          <Card className="py-16 text-center space-y-3">
            <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No classes or events scheduled on {dayLabels[selectedDay]}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This day is wide open for focused coursework, recovery study, or personal rest.
            </p>
            <Button size="sm" onClick={() => openAddModal(selectedDay)}>
              Schedule an Event
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {dayItems.map((item) => {
              const badge = ACTIVITY_LABELS[item.activity_type] || ACTIVITY_LABELS.lecture;
              const durationMinutes =
                parseTimeToMinutes(item.end_time) - parseTimeToMinutes(item.start_time);

              return (
                <Card
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4"
                  style={{ borderLeftColor: item.subject?.color || '#6366f1' }}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.color}`}>
                        {badge.label}
                      </span>
                      {item.subject && (
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                          style={{ backgroundColor: item.subject.color }}
                        >
                          {item.subject.code || item.subject.name}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        {formatTime12h(item.start_time)} – {formatTime12h(item.end_time)} ({durationMinutes} mins)
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Schedule Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Timetable Event"
        description="Schedule a class lecture, laboratory, review session, or study block."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            label="Event / Class Title"
            placeholder="e.g. CS 106B Lecture or Physics Lab"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">No Subject (General)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code ? `${sub.code} — ` : ''}
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Activity Type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="lecture">Lecture / Class</option>
                <option value="self_study">Self Study</option>
                <option value="assignment">Assignment</option>
                <option value="revision">Revision / Review</option>
                <option value="exam">Examination / Test</option>
                <option value="break">Break / Meal</option>
                <option value="personal">Personal Activity</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value) as DayOfWeek)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {dayLabels.map((lbl, idx) => (
                  <option key={idx} value={idx}>
                    {lbl}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <Input
            label="Location / Room / Link"
            placeholder="e.g. NVIDIA Auditorium or Zoom Link"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add to Timetable</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
