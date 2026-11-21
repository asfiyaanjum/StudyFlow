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
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { Goal, Plan, Subject, GoalType, PlanType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Checkbox } from '../../components/ui/Checkbox';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  parsePlanMilestones,
  serializePlanMilestones,
  toggleMilestone,
  addMilestone,
  removeMilestone,
  calculateMilestoneProgress,
  Milestone,
} from '../../utils/milestones';

export const GoalsPlansPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab switch
  const [activeView, setActiveView] = useState<'goals' | 'plans'>('plans');

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [planNotes, setPlanNotes] = useState('');

  // Local state for inline milestone adding on plans
  const [newMilestoneTitles, setNewMilestoneTitles] = useState<Record<string, string>>({});

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
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    const inAWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    setEndDate(inAWeek);
    setTargetDate(inAWeek);
  }, []);

  // Goal Handlers
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    try {
      const created = await api.goals.createGoal({
        user_id: 'user',
        title: goalTitle,
        description: goalDesc,
        goal_type: goalType,
        subject_id: goalSubjectId || null,
        target_date: targetDate,
        progress_percentage: Number(progressPct),
        status: 'active',
      });
      setGoals((prev) => [created, ...prev]);
      success('Goal Created', `Added goal: "${goalTitle}"`);
      setIsGoalModalOpen(false);
      setGoalTitle('');
      setGoalDesc('');
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Delete this academic goal?')) return;
    try {
      await api.goals.deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      success('Goal Deleted', 'Removed goal.');
    } catch (e) {
      console.error(e);
    }
  };

  // Plan Handlers
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) return;

    try {
      const initialMilestones: Milestone[] = [
        { id: `m-${Date.now()}-1`, title: 'Review key chapter notes', completed: false, order: 0 },
        { id: `m-${Date.now()}-2`, title: 'Complete practice problem sets', completed: false, order: 1 },
      ];
      const serializedContent = serializePlanMilestones(initialMilestones, planNotes);

      const created = await api.plans.createPlan({
        user_id: 'user',
        title: planTitle,
        description: planDesc,
        plan_type: planType,
        subject_id: planSubjectId || null,
        start_date: startDate,
        end_date: endDate,
        content: serializedContent,
        is_active: true,
      });
      setPlans((prev) => [created, ...prev]);
      success('Study Plan Created', `Created plan: "${planTitle}"`);
      setIsPlanModalOpen(false);
      setPlanTitle('');
      setPlanDesc('');
      setPlanNotes('');
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Delete this study plan?')) return;
    try {
      await api.plans.deletePlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      success('Plan Deleted', 'Removed study plan.');
    } catch (e) {
      console.error(e);
    }
  };

  // Milestone persistence toggling inside plans.content (Zero schema changes!)
  const handleTogglePlanMilestone = async (plan: Plan, milestoneId: string) => {
    const { notes, milestones } = parsePlanMilestones(plan.content);
    const updatedMilestones = toggleMilestone(milestones, milestoneId);
    const updatedContent = serializePlanMilestones(updatedMilestones, notes);

    // Optimistic UI update
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, content: updatedContent } : p))
    );

    try {
      await api.plans.updatePlan(plan.id, { content: updatedContent });
    } catch (e) {
      console.error('Failed to save milestone:', e);
      loadData(); // Revert on failure
    }
  };

  const handleAddPlanMilestone = async (plan: Plan, e: React.FormEvent) => {
    e.preventDefault();
    const titleText = (newMilestoneTitles[plan.id] || '').trim();
    if (!titleText) return;

    const { notes, milestones } = parsePlanMilestones(plan.content);
    const updatedMilestones = addMilestone(milestones, titleText);
    const updatedContent = serializePlanMilestones(updatedMilestones, notes);

    setNewMilestoneTitles((prev) => ({ ...prev, [plan.id]: '' }));
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, content: updatedContent } : p))
    );

    try {
      await api.plans.updatePlan(plan.id, { content: updatedContent });
    } catch (e) {
      console.error('Failed to add milestone:', e);
      loadData();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border dark:border-slate-800 pb-5">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white tracking-tight">
            Academic Goals & Study Plans
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-0.5">
            Set target semester milestones and execute multi-day revision plans.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeView === 'plans' ? (
            <Button onClick={() => setIsPlanModalOpen(true)} leftIcon={<Plus size={16} />}>
              Create Study Plan
            </Button>
          ) : (
            <Button onClick={() => setIsGoalModalOpen(true)} leftIcon={<Plus size={16} />}>
              Set Academic Goal
            </Button>
          )}
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-paper-border dark:border-slate-800 pb-1 text-xs">
        <button
          onClick={() => setActiveView('plans')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeView === 'plans'
              ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800'
              : 'text-charcoal-muted hover:text-charcoal-primary'
          }`}
        >
          Study Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveView('goals')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeView === 'goals'
              ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800'
              : 'text-charcoal-muted hover:text-charcoal-primary'
          }`}
        >
          Semester Goals ({goals.length})
        </button>
      </div>

      {/* PLANS VIEW */}
      {activeView === 'plans' && (
        <div className="space-y-4">
          {plans.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No study plans created"
              subtitle="Map out your weekly revision or subject mastery plans with granular sub-milestones."
              action={
                <Button size="sm" onClick={() => setIsPlanModalOpen(true)}>
                  + Create First Study Plan
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {plans.map((plan) => {
                const { notes, milestones } = parsePlanMilestones(plan.content);
                const progress = calculateMilestoneProgress(milestones);

                return (
                  <div
                    key={plan.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-paper-border dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                            {plan.plan_type.replace('_', ' ')}
                          </span>
                          {plan.subject && (
                            <span className="text-[11px] font-medium text-brand-600">
                              {plan.subject.name}
                            </span>
                          )}
                        </div>
                        <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white mt-1">
                          {plan.title}
                        </h3>
                        {plan.description && (
                          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                            {plan.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1.5 text-charcoal-light hover:text-rose-500 rounded-lg"
                        title="Delete Plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-charcoal-muted">Execution Progress</span>
                        <span className="font-semibold text-brand-600">{progress}%</span>
                      </div>
                      <ProgressBar value={progress} size="xs" variant="brand" />
                    </div>

                    {/* Interactive Sub-Milestones */}
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light block">
                        Milestones ({milestones.filter((m) => m.completed).length}/{milestones.length})
                      </span>

                      <div className="space-y-1.5">
                        {milestones.map((m) => (
                          <div
                            key={m.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                              m.completed
                                ? 'bg-paper-canvas/80 border-paper-border line-through text-charcoal-muted'
                                : 'bg-white dark:bg-slate-900 border-paper-border text-charcoal-primary'
                            }`}
                          >
                            <Checkbox
                              checked={m.completed}
                              onChange={() => handleTogglePlanMilestone(plan, m.id)}
                              label={m.title}
                            />
                            <span className="text-[10px] text-charcoal-light shrink-0">
                              {m.completed ? 'Done' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Add Sub-Milestone Form */}
                      <form
                        onSubmit={(e) => handleAddPlanMilestone(plan, e)}
                        className="flex gap-2 pt-2"
                      >
                        <input
                          type="text"
                          placeholder="Add a milestone (e.g., 'Chapter 4 summary')..."
                          value={newMilestoneTitles[plan.id] || ''}
                          onChange={(e) =>
                            setNewMilestoneTitles((prev) => ({ ...prev, [plan.id]: e.target.value }))
                          }
                          className="flex-1 rounded-xl border border-paper-border px-3 py-1.5 text-xs bg-paper-canvas dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium"
                        >
                          Add
                        </button>
                      </form>
                    </div>

                    <div className="pt-2 border-t border-paper-border text-[11px] text-charcoal-light flex justify-between">
                      <span>Timeline: {plan.start_date.split('T')[0]} to {plan.end_date.split('T')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* GOALS VIEW */}
      {activeView === 'goals' && (
        <div className="space-y-4">
          {goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No semester goals set"
              subtitle="Define target test scores, weekly study hours, or GPA milestones to stay focused."
              action={
                <Button size="sm" onClick={() => setIsGoalModalOpen(true)}>
                  + Set First Goal
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {goal.goal_type.replace('_', ' ')}
                      </span>
                      <h4 className="font-editorial text-lg font-medium text-charcoal-primary dark:text-white mt-1">
                        {goal.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 text-charcoal-light hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-charcoal-muted dark:text-slate-400">
                      {goal.description}
                    </p>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-charcoal-muted">Progress</span>
                      <span className="font-semibold text-brand-600">{goal.progress_percentage}%</span>
                    </div>
                    <ProgressBar value={goal.progress_percentage} size="xs" variant="brand" />
                  </div>

                  <div className="pt-2 border-t border-paper-border text-[11px] text-charcoal-light flex justify-between">
                    <span>Target Date: {goal.target_date.split('T')[0]}</span>
                    <span className="capitalize">{goal.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Set Academic Goal"
        description="Establish a clear semester benchmark."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Goal Title"
            required
            placeholder="e.g. Score 90%+ in Operating Systems Midterm"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Describe your strategy or benchmarks..."
            value={goalDesc}
            onChange={(e) => setGoalDesc(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Goal Type
              </label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as GoalType)}
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-charcoal-primary dark:text-white"
              >
                <option value="exam_score">Exam Score</option>
                <option value="subject_mastery">Subject Mastery</option>
                <option value="study_hours">Study Hours</option>
                <option value="habit">Habit / Routine</option>
                <option value="project">Project Deliverable</option>
              </select>
            </div>
            <Input
              label="Target Date"
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          <Input
            label="Current Progress % (0 - 100)"
            type="number"
            min={0}
            max={100}
            value={progressPct}
            onChange={(e) => setProgressPct(Number(e.target.value))}
          />
          <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-border">
            <Button variant="ghost" type="button" onClick={() => setIsGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Set Goal</Button>
          </div>
        </form>
      </Modal>

      {/* Plan Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Create Study Plan"
        description="Plan out structured revision with milestones."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <Input
            label="Plan Title"
            required
            placeholder="e.g. Midterm Week Intensive Revision"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Focus areas, textbook chapters..."
            value={planDesc}
            onChange={(e) => setPlanDesc(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Plan Type
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as PlanType)}
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-charcoal-primary dark:text-white"
              >
                <option value="weekly">Weekly Plan</option>
                <option value="daily">Daily Intensive</option>
                <option value="exam_prep">Exam Preparation</option>
                <option value="subject_mastery">Subject Mastery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Subject Link
              </label>
              <select
                value={planSubjectId}
                onChange={(e) => setPlanSubjectId(e.target.value)}
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-charcoal-primary dark:text-white"
              >
                <option value="">No Subject Linked</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-border">
            <Button variant="ghost" type="button" onClick={() => setIsPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Plan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
