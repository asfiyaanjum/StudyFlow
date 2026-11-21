import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  FileText,
  Trash2,
  Edit2,
  TrendingUp,
  Award,
} from 'lucide-react';
import { api } from '../../services/api';
import { Goal, Plan, Subject, GoalType, PlanType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const GoalsPlansPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab switch
  const [activeView, setActiveView] = useState<'goals' | 'plans'>('goals');

  // Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('exam_score');
  const [goalSubjectId, setGoalSubjectId] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [progressPct, setProgressPct] = useState(0);

  // Plan Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planType, setPlanType] = useState<PlanType>('weekly');
  const [planSubjectId, setPlanSubjectId] = useState('');
  const [planStartDate, setPlanStartDate] = useState('');
  const [planEndDate, setPlanEndDate] = useState('');
  const [planContent, setPlanContent] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [g, p, s] = await Promise.all([
        api.goals.getGoals(),
        api.plans.getPlans(),
        api.subjects.getSubjects(),
      ]);
      setGoals(g);
      setPlans(p);
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

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) {
      toastError('Validation', 'Goal title is required.');
      return;
    }

    try {
      const created = await api.goals.createGoal({
        user_id: 'user',
        title: goalTitle,
        description: goalDesc,
        goal_type: goalType,
        subject_id: goalSubjectId || null,
        target_date: targetDate || new Date().toISOString().split('T')[0],
        progress_percentage: Number(progressPct),
        status: 'active',
      });

      setGoals((prev) => [...prev, created]);
      success('Goal Created', `"${goalTitle}" is now being tracked.`);
      setIsGoalModalOpen(false);
      setGoalTitle('');
      setGoalDesc('');
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, newPct: number) => {
    try {
      const updated = await api.goals.updateGoal(goalId, {
        progress_percentage: newPct,
        status: newPct >= 100 ? 'completed' : 'active',
      });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      if (newPct >= 100) {
        success('Goal Achieved! 🏆', `Congratulations on completing this academic goal!`);
      }
    } catch (e: any) {
      toastError('Error', e.message);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await api.goals.deleteGoal(id);
        setGoals((prev) => prev.filter((g) => g.id !== id));
        success('Deleted', 'Goal removed.');
      } catch (e: any) {
        toastError('Error', e.message);
      }
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) {
      toastError('Validation', 'Plan title is required.');
      return;
    }

    try {
      const created = await api.plans.createPlan({
        user_id: 'user',
        title: planTitle,
        description: planDesc,
        plan_type: planType,
        subject_id: planSubjectId || null,
        start_date: planStartDate || new Date().toISOString().split('T')[0],
        end_date: planEndDate || new Date().toISOString().split('T')[0],
        content: planContent,
        is_active: true,
      });

      setPlans((prev) => [created, ...prev]);
      success('Plan Created', `"${planTitle}" created.`);
      setIsPlanModalOpen(false);
      setPlanTitle('');
      setPlanContent('');
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (window.confirm('Delete this plan?')) {
      try {
        await api.plans.deletePlan(id);
        setPlans((prev) => prev.filter((p) => p.id !== id));
        success('Deleted', 'Plan removed.');
      } catch (e: any) {
        toastError('Error', e.message);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Goals & Blueprint Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set ambitious semester targets, grade goals, and structured study blueprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeView === 'goals' ? (
            <Button onClick={() => setIsGoalModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              New Goal
            </Button>
          ) : (
            <Button onClick={() => setIsPlanModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              New Study Plan
            </Button>
          )}
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveView('goals')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeView === 'goals'
              ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          Academic Goals ({goals.length})
        </button>
        <button
          onClick={() => setActiveView('plans')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeView === 'plans'
              ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Study Plans ({plans.length})
        </button>
      </div>

      {/* GOALS VIEW */}
      {activeView === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const isDone = goal.progress_percentage >= 100;

            return (
              <Card
                key={goal.id}
                className={`p-6 flex flex-col justify-between space-y-4 ${
                  isDone ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {goal.goal_type.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {goal.title}
                    </h3>
                    {goal.subject && (
                      <span
                        className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                        style={{ backgroundColor: goal.subject.color }}
                      >
                        {goal.subject.code || goal.subject.name}
                      </span>
                    )}
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Progress bar & slider */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-slate-500">Target: {goal.target_date}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {goal.progress_percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-500' : 'bg-brand-600'
                      }`}
                      style={{ width: `${goal.progress_percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={goal.progress_percentage}
                      onChange={(e) => handleUpdateGoalProgress(goal.id, Number(e.target.value))}
                      className="w-full accent-brand-600 h-1 cursor-pointer"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* PLANS VIEW */}
      {activeView === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300">
                      {plan.plan_type.replace('_', ' ')}
                    </span>
                    {plan.subject && (
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                        style={{ backgroundColor: plan.subject.color }}
                      >
                        {plan.subject.code || plan.subject.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                    {plan.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {plan.start_date} to {plan.end_date}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {plan.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {plan.description}
                </p>
              )}

              {plan.content && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {plan.content}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Create Academic Goal"
        description="Set measurable academic milestones."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 pt-2">
          <Input
            label="Goal Title"
            placeholder="e.g. Score 90%+ on Midterm Exam"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Goal Type
              </label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as GoalType)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
              >
                <option value="exam_score">Exam Score Target</option>
                <option value="subject_mastery">Subject Mastery</option>
                <option value="study_hours">Study Hours Target</option>
                <option value="habit">Habit Consistency</option>
                <option value="project">Project Milestone</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Subject
              </label>
              <select
                value={goalSubjectId}
                onChange={(e) => setGoalSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
              >
                <option value="">General / All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code || s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
            <Input
              label="Initial Progress %"
              type="number"
              min={0}
              max={100}
              value={progressPct}
              onChange={(e) => setProgressPct(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={goalDesc}
              onChange={(e) => setGoalDesc(e.target.value)}
              placeholder="Why this goal matters and target criteria..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Goal</Button>
          </div>
        </form>
      </Modal>

      {/* Create Plan Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Create Study Plan / Sprint"
        description="Outline a structured weekly or examination revision plan."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 pt-2">
          <Input
            label="Plan Title"
            placeholder="e.g. Two-Week Midterm Revision Sprint"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Plan Type
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as PlanType)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
              >
                <option value="weekly">Weekly Sprint</option>
                <option value="exam_prep">Exam Prep Blueprint</option>
                <option value="subject_mastery">Subject Deep Dive</option>
                <option value="daily">Daily Schedule Plan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Subject
              </label>
              <select
                value={planSubjectId}
                onChange={(e) => setPlanSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
              >
                <option value="">General</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code || s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={planStartDate}
              onChange={(e) => setPlanStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={planEndDate}
              onChange={(e) => setPlanEndDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
              Checklist / Markdown Content
            </label>
            <textarea
              rows={4}
              value={planContent}
              onChange={(e) => setPlanContent(e.target.value)}
              placeholder="- [ ] Review chapters 1-4&#10;- [ ] Solve practice problems&#10;- [ ] Take timed mock test"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Plan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
