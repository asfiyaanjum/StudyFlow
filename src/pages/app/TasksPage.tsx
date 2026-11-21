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
        success('Task Created', `"${title}" was added to your schedule.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleToggle = async (taskId: string) => {
    try {
      const updated = await api.tasks.toggleTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (updated.is_completed) {
        success('Completed', `Finished "${updated.title}"!`);
      }
    } catch (e: any) {
      toastError('Error', e.message);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.tasks.deleteTask(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        success('Deleted', 'Task has been removed.');
      } catch (e: any) {
        toastError('Error', e.message);
      }
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Subject Filter
    if (selectedSubjectId !== 'all' && task.subject_id !== selectedSubjectId) {
      return false;
    }

    // Priority Filter
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }

    // Tab Filter
    if (activeTab === 'today') {
      return isDateToday(task.due_date);
    }
    if (activeTab === 'upcoming') {
      return !task.is_completed && !isDatePast(task.due_date) && !isDateToday(task.due_date);
    }
    if (activeTab === 'completed') {
      return task.is_completed;
    }
    if (activeTab === 'overdue') {
      return !task.is_completed && isDatePast(task.due_date);
    }

    return true;
  });

  const overdueCount = tasks.filter((t) => !t.is_completed && isDatePast(t.due_date)).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize coursework, problem sets, exam prep, and reading assignments.
          </p>
        </div>

        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          New Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-sm font-medium">
        {[
          { id: 'all', label: 'All Tasks', count: tasks.length },
          { id: 'today', label: 'Today', count: tasks.filter((t) => isDateToday(t.due_date)).length },
          {
            id: 'upcoming',
            label: 'Upcoming',
            count: tasks.filter((t) => !t.is_completed && !isDatePast(t.due_date) && !isDateToday(t.due_date)).length,
          },
          {
            id: 'overdue',
            label: 'Overdue',
            count: overdueCount,
            color: overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : undefined,
          },
          { id: 'completed', label: 'Completed', count: tasks.filter((t) => t.is_completed).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FilterTab)}
            className={`px-3 py-2 border-b-2 font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            } ${tab.color || ''}`}
          >
            <span>{tab.label}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Secondary Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />

        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.code || sub.name}
            </option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Tasks List */}
      <Card className="p-0 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No tasks match your criteria
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your filters or click "New Task" to create your next assignment.
            </p>
            <Button size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
              Create Task
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTasks.map((task) => {
              const isOverdue = !task.is_completed && isDatePast(task.due_date);

              return (
                <div
                  key={task.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggle(task.id)}
                      className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                        task.is_completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'
                      }`}
                    >
                      {task.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`text-sm font-semibold text-slate-900 dark:text-white truncate ${
                            task.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.subject && (
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                            style={{ backgroundColor: task.subject.color }}
                          >
                            {task.subject.code || task.subject.name}
                          </span>
                        )}
                        <PriorityBadge priority={task.priority} />
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                            Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Est: {task.estimated_duration_minutes}m
                          {task.actual_duration_minutes ? ` · Logged: ${task.actual_duration_minutes}m` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link to={`/app/focus?taskId=${task.id}`}>
                      <Button size="sm" variant="ghost" title="Start Pomodoro for this task">
                        <Play className="w-4 h-4 text-brand-600" />
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(task)} title="Edit Task">
                      <Edit2 className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(task.id)}
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Academic Task' : 'Create Academic Task'}
        description="Add concrete deadlines, assign to subjects, and estimate duration."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            label="Task Title"
            placeholder="e.g. Implement Graph Traversal or Physics Problem Set 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key requirements, chapter pages, or submission instructions..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

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
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="urgent">Urgent (Exam / Crucial Deadline)</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <Input
              label="Due Time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              required
            />
            <Input
              label="Est. Duration (Minutes)"
              type="number"
              min={15}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
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
