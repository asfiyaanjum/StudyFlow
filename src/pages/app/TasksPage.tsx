import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Task, Subject, Priority, TaskStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { Checkbox } from '../../components/ui/Checkbox';
import { Countdown } from '../../components/tasks/Countdown';
import { ReminderPicker } from '../../components/tasks/ReminderPicker';
import { EmptyState } from '../../components/ui/EmptyState';
import { isDateToday, isDatePast } from '../../utils/dateUtils';

type FilterTab = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';

export const TasksPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('17:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [reminders, setReminders] = useState<number[]>([1440, 60]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [t, s] = await Promise.all([api.tasks.getTasks(), api.subjects.getSubjects()]);
      setTasks(t);
      setSubjects(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setSubjectId(subjects[0]?.id || '');
    setPriority('medium');
    const today = new Date().toISOString().split('T')[0];
    setDueDate(today);
    setDueTime('17:00');
    setDurationMinutes(60);
    setReminders([1440, 60]);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setSubjectId(task.subject_id || '');
    setPriority(task.priority);
    const dateObj = new Date(task.due_date);
    setDueDate(dateObj.toISOString().split('T')[0]);
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const mm = String(dateObj.getMinutes()).padStart(2, '0');
    setDueTime(`${hh}:${mm}`);
    setDurationMinutes(task.estimated_duration_minutes || 60);
    setReminders([1440, 60]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Validation Error', 'Task title is required.');
      return;
    }

    try {
      const fullDueDate = `${dueDate}T${dueTime || '17:00'}:00Z`;

      if (editingTask) {
        const updated = await api.tasks.updateTask(editingTask.id, {
          title,
          description,
          subject_id: subjectId || null,
          priority,
          due_date: fullDueDate,
          estimated_duration_minutes: Number(durationMinutes),
        });
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        success('Task Updated', `"${title}" has been updated.`);
      } else {
        const created = await api.tasks.createTask({
          user_id: 'user',
          title,
          description,
          subject_id: subjectId || null,
          priority,
          status: 'todo',
          due_date: fullDueDate,
          estimated_duration_minutes: Number(durationMinutes),
          actual_duration_minutes: 0,
          is_completed: false,
        });
        setTasks((prev) => [created, ...prev]);
        success('Task Created', `"${title}" has been scheduled.`);
      }
      setIsModalOpen(false);
    } catch (e: any) {
      toastError('Error', e.message || 'Failed to save task.');
    }
  };

  const handleToggle = async (taskId: string) => {
    try {
      const updated = await api.tasks.toggleTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (updated.is_completed) {
        success('Task Completed', `Completed "${updated.title}"!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.tasks.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      success('Task Deleted', 'Task removed successfully.');
    } catch (e) {
      console.error(e);
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    // 1. Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchSubject = task.subject?.name.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSubject) return false;
    }

    // 2. Subject filter
    if (selectedSubjectId !== 'all' && task.subject_id !== selectedSubjectId) {
      return false;
    }

    // 3. Priority filter
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }

    // 4. Tab filter
    const isPast = isDatePast(task.due_date);
    const isToday = isDateToday(task.due_date);

    switch (activeTab) {
      case 'today':
        return !task.is_completed && isToday;
      case 'upcoming':
        return !task.is_completed && !isPast && !isToday;
      case 'completed':
        return task.is_completed;
      case 'overdue':
        return !task.is_completed && isPast && !isToday;
      case 'all':
      default:
        return true;
    }
  });

  const tabCounts = {
    all: tasks.length,
    today: tasks.filter((t) => !t.is_completed && isDateToday(t.due_date)).length,
    upcoming: tasks.filter((t) => !t.is_completed && !isDatePast(t.due_date) && !isDateToday(t.due_date)).length,
    overdue: tasks.filter((t) => !t.is_completed && isDatePast(t.due_date) && !isDateToday(t.due_date)).length,
    completed: tasks.filter((t) => t.is_completed).length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border dark:border-slate-800 pb-5">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white tracking-tight">
            Academic Tasks
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-0.5">
            Prioritize coursework, track live countdowns, and schedule reminders.
          </p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus size={16} />}>
          Create Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-paper-border dark:border-slate-800 text-xs">
        {(['all', 'today', 'upcoming', 'overdue', 'completed'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl font-medium capitalize transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === tab
                ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800'
                : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal-primary hover:bg-paper-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                tab === 'overdue' && tabCounts.overdue > 0
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-paper-200 dark:bg-slate-800 text-charcoal-muted dark:text-slate-400'
              }`}
            >
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Select Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <Input
            placeholder="Search tasks or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
        <div>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code || 'No Code'})
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={searchQuery ? 'No matching tasks' : 'No tasks in this view'}
          subtitle={
            searchQuery
              ? 'Try modifying your search or clearing the subject/priority filters.'
              : 'You have no tasks matching this criteria right now.'
          }
          action={
            <Button size="sm" onClick={openCreateModal}>
              + Create New Task
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-xs hover:border-brand-200 dark:hover:border-slate-700 transition-colors gap-3 ${
                task.is_completed ? 'opacity-70 bg-paper-canvas/60 dark:bg-slate-900/60' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="pt-0.5">
                  <Checkbox
                    checked={task.is_completed}
                    onChange={() => handleToggle(task.id)}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <p
                    className={`text-sm font-medium ${
                      task.is_completed
                        ? 'line-through text-charcoal-muted dark:text-slate-500'
                        : 'text-charcoal-primary dark:text-white'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-charcoal-muted dark:text-slate-400 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-charcoal-light dark:text-slate-400 pt-0.5">
                    {task.subject && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full font-medium text-[10px]"
                        style={{
                          backgroundColor: `${task.subject.color}15`,
                          color: task.subject.color,
                        }}
                      >
                        {task.subject.code || task.subject.name}
                      </span>
                    )}
                    <span>•</span>
                    <span>{task.estimated_duration_minutes}m est.</span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-paper-border dark:border-slate-800">
                <PriorityBadge priority={task.priority} size="sm" />
                <Countdown task={task} />

                <div className="flex items-center gap-1 ml-2">
                  <Link to={`/app/focus?taskId=${task.id}`}>
                    <button
                      type="button"
                      className="p-1.5 text-charcoal-light hover:text-brand-600 rounded-lg hover:bg-paper-100 dark:hover:bg-slate-800 transition-colors"
                      title="Start Focus Timer for this task"
                    >
                      <Play size={14} />
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-charcoal-light hover:text-charcoal-primary rounded-lg hover:bg-paper-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 text-charcoal-light hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Creation / Editing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Academic Task' : 'Schedule New Task'}
        description="Add course deadlines, study blocks, and reminders."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title"
            required
            placeholder="e.g. Read Operating Systems Chapter 4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase">
              Description / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Add key objectives or textbook problem numbers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Subject
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
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Due Date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Input
              label="Due Time"
              type="time"
              required
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
            <Input
              label="Est. Duration (Mins)"
              type="number"
              min={10}
              step={5}
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>

          {/* Reminder Picker */}
          <div className="pt-2 border-t border-paper-border dark:border-slate-800">
            <ReminderPicker value={reminders} onChange={setReminders} />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-border dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
