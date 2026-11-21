import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, CheckCircle2, ArrowLeft, Sun, Moon, GraduationCap } from 'lucide-react';
import { Countdown } from '../../components/tasks/Countdown';
import { DEFAULT_AVATARS, DefaultAvatarArt } from '../../components/avatar/DefaultAvatarArt';
import { Avatar } from '../../components/avatar/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Checkbox } from '../../components/ui/Checkbox';
import { EmptyState } from '../../components/ui/EmptyState';
import { ReminderPicker } from '../../components/tasks/ReminderPicker';
import { useGreetingQuote } from '../../utils/greetingQuotes';
import { useTheme } from '../../context/ThemeContext';
import {
  parsePlanMilestones,
  serializePlanMilestones,
  toggleMilestone,
  addMilestone,
  calculateMilestoneProgress,
  Milestone,
} from '../../utils/milestones';

export const DesignSystemPage: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { greeting, emoji, quote, period } = useGreetingQuote('student-demo');
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(true);
  const [progressVal, setProgressVal] = useState(68);
  const [reminders, setReminders] = useState<number[]>([1440, 60]);

  // Demo Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 'm1', title: 'Review Chapter 4 notes & theorems', completed: true },
    { id: 'm2', title: 'Complete exercise set 4.2 (problems 1–15)', completed: true },
    { id: 'm3', title: 'Draft weekly summary sheet', completed: false },
    { id: 'm4', title: 'Take 20-minute practice quiz', completed: false },
  ]);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  const now = Date.now();
  const sampleDeadlines = {
    normal: now + 3 * 24 * 60 * 60 * 1000, // 3 days
    soon: now + 14 * 60 * 60 * 1000, // 14 hours
    warning: now + 3 * 60 * 60 * 1000, // 3 hours
    urgent: now + 42 * 60 * 1000, // 42 minutes
    overdue: now - 35 * 60 * 1000, // overdue by 35m
  };

  const handleToggle = (id: string) => {
    setMilestones((prev) => toggleMilestone(prev, id));
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;
    setMilestones((prev) => addMilestone(prev, newMilestoneText));
    setNewMilestoneText('');
  };

  const milestoneProgress = calculateMilestoneProgress(milestones);
  const serializedJson = serializePlanMilestones(milestones, 'Final revision guidelines');
  const parsedData = parsePlanMilestones(serializedJson);

  return (
    <div className="min-h-screen bg-paper-canvas dark:bg-surface-dark text-charcoal-primary dark:text-slate-100 transition-colors">
      {/* Top Dedicated Non-Overlapping Sticky Navigation Bar */}
      <nav className="sticky top-0 z-30 w-full border-b border-paper-border dark:border-slate-800 bg-paper-canvas/90 dark:bg-surface-dark/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-charcoal-muted hover:text-charcoal-primary dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to StudyFlow</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-[11px] font-semibold text-brand-700 dark:text-brand-300">
              <Sparkles size={12} /> Phase 1 Design System
            </span>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-paper-border dark:border-slate-800 text-charcoal-muted hover:text-charcoal-primary dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="p-4 sm:p-8 lg:p-12 space-y-8 sm:space-y-12 max-w-6xl mx-auto">
        {/* Editorial Header */}
        <header className="border-b border-paper-border dark:border-slate-800 pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <GraduationCap size={14} /> Academic Productivity SaaS
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-charcoal-primary dark:text-white">
            StudyFlow Design System
          </h1>
          <p className="mt-2 text-charcoal-muted dark:text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Warm ivory canvas, charcoal ink, muted indigo accents, and editorial typography designed for calm student productivity.
          </p>

          {/* Dynamic Time-Based Greeting & Quote */}
          <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider text-charcoal-light dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <span>{emoji}</span> {period.toUpperCase()} GREETING
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-medium text-charcoal-primary dark:text-white">
                {greeting}, Alex
              </h2>
              <p className="text-xs sm:text-sm italic font-editorial text-brand-800 dark:text-brand-300 mt-1">
                "{quote}"
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700 text-xs text-charcoal-muted dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Ticker Active</span>
            </div>
          </div>
        </header>

        {/* Grid: Reusable Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Curated Vector Character Avatars */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-paper-border dark:border-slate-800 pb-3">
              <h3 className="font-editorial text-lg sm:text-xl font-medium text-charcoal-primary dark:text-white">
                Curated Vector Avatars
              </h3>
              <span className="text-xs font-mono text-charcoal-light dark:text-slate-400">6 Default Styles</span>
            </div>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Crisp geometric vector character art mapped to student personality palettes.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 pt-2">
              {DEFAULT_AVATARS.map((avatar) => (
                <div key={avatar.id} className="flex flex-col items-center gap-1.5 text-center">
                  <DefaultAvatarArt id={avatar.id} size={44} />
                  <span className="text-xs font-medium text-charcoal-primary dark:text-slate-200">{avatar.label}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-paper-border dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar username="Alex Rivera" size="md" />
                <div className="text-xs">
                  <p className="font-semibold text-charcoal-primary dark:text-white">Alex Rivera</p>
                  <p className="text-charcoal-muted dark:text-slate-400">Deterministic Fallback</p>
                </div>
              </div>
              <div className="flex -space-x-2">
                <Avatar src="default:sage" size="sm" />
                <Avatar src="default:rose" size="sm" />
                <Avatar src="default:sky" size="sm" />
                <Avatar src="default:lilac" size="sm" />
              </div>
            </div>
          </section>

          {/* Live Countdown & Urgency Indicators */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-paper-border dark:border-slate-800 pb-3">
              <h3 className="font-editorial text-lg sm:text-xl font-medium text-charcoal-primary dark:text-white">
                Live Deadline Countdown
              </h3>
              <span className="text-xs font-mono text-charcoal-light dark:text-slate-400">1s Shared Ticker</span>
            </div>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Smooth color-coded badges dynamically transitioning through 5 urgency stages.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700">
                <span className="text-charcoal-primary dark:text-slate-200 font-medium truncate pr-2">Research Paper Draft</span>
                <Countdown deadline={sampleDeadlines.normal} />
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700">
                <span className="text-charcoal-primary dark:text-slate-200 font-medium truncate pr-2">Calculus Problem Set 3</span>
                <Countdown deadline={sampleDeadlines.soon} />
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700">
                <span className="text-charcoal-primary dark:text-slate-200 font-medium truncate pr-2">Physics Lab Report</span>
                <Countdown deadline={sampleDeadlines.warning} />
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700">
                <span className="text-charcoal-primary dark:text-slate-200 font-medium truncate pr-2">Chemistry Quiz Submission</span>
                <Countdown deadline={sampleDeadlines.urgent} />
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700">
                <span className="text-charcoal-primary dark:text-slate-200 font-medium truncate pr-2">Literature Summary</span>
                <Countdown deadline={sampleDeadlines.overdue} />
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700">
                <span className="text-charcoal-primary dark:text-slate-200 font-medium truncate pr-2">Weekly Reflection</span>
                <Countdown task={{ is_completed: true }} />
              </div>
            </div>
          </section>

          {/* Form Controls & Checkboxes with StudyFlow Indigo */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-paper-border dark:border-slate-800 pb-3">
              <h3 className="font-editorial text-lg sm:text-xl font-medium text-charcoal-primary dark:text-white">
                Interactive Checkboxes & Progress
              </h3>
              <span className="text-xs font-mono text-charcoal-light dark:text-slate-400">StudyFlow Indigo</span>
            </div>

            <div className="space-y-4 pt-1">
              <div className="space-y-3">
                <Checkbox
                  checked={checkbox1}
                  onChange={setCheckbox1}
                  label="Attend Advanced Algorithms Lecture (10:00 AM)"
                  description="Hall B-102 with Prof. Reynolds"
                />
                <Checkbox
                  checked={checkbox2}
                  onChange={setCheckbox2}
                  label="Submit Linear Algebra Assignment 2"
                  description="Uploaded to University Portal"
                />
              </div>

              <div className="pt-4 border-t border-paper-border dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-charcoal-primary dark:text-slate-200">Daily Study Target</span>
                  <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{progressVal}% Complete</span>
                </div>
                <ProgressBar value={progressVal} variant="brand" size="md" />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProgressVal((p) => Math.max(0, p - 15))}
                    className="px-2.5 py-1 text-xs rounded-lg border border-paper-border dark:border-slate-700 bg-paper-canvas dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-charcoal-primary dark:text-slate-200"
                  >
                    -15%
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgressVal((p) => Math.min(100, p + 15))}
                    className="px-2.5 py-1 text-xs rounded-lg border border-paper-border dark:border-slate-700 bg-paper-canvas dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-charcoal-primary dark:text-slate-200"
                  >
                    +15%
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Task Reminder Presets */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-paper-border dark:border-slate-800 pb-3">
              <h3 className="font-editorial text-lg sm:text-xl font-medium text-charcoal-primary dark:text-white">
                Reminder Presets & Custom Alerts
              </h3>
              <span className="text-xs font-mono text-charcoal-light dark:text-slate-400">Intelligent Offsets</span>
            </div>
            <ReminderPicker value={reminders} onChange={setReminders} />
          </section>
        </div>

        {/* Plan & Goal Sub-Milestones Interactive Persistence Demo */}
        <section className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-1">
                <CheckCircle2 size={14} /> Requirement 2: Milestone Persistence Verified
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-medium text-charcoal-primary dark:text-white">
                Interactive Sub-Milestone Execution
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                Zero-schema-change JSON serialization safely stored inside existing <code className="bg-paper-canvas dark:bg-slate-800 px-1 py-0.5 rounded text-charcoal-primary dark:text-slate-200">plans.content: TEXT</code> column.
              </p>
            </div>
            <div className="w-full sm:w-48">
              <ProgressBar value={milestoneProgress} showPercentage label="Goal Completion" variant="success" size="md" />
            </div>
          </div>

          {/* Milestone List */}
          <div className="space-y-2.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  m.completed
                    ? 'bg-paper-canvas/80 dark:bg-slate-800/50 border-paper-border dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-xs'
                }`}
              >
                <Checkbox
                  checked={m.completed}
                  onChange={() => handleToggle(m.id)}
                  label={m.title}
                />
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.completed ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  {m.completed ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          {/* Add New Milestone */}
          <form onSubmit={handleAddMilestone} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Add a new sub-milestone (e.g., 'Review lecture recording for Unit 2')..."
              value={newMilestoneText}
              onChange={(e) => setNewMilestoneText(e.target.value)}
              className="flex-1 rounded-xl border border-paper-border dark:border-slate-700 px-3.5 py-2 text-xs bg-paper-canvas dark:bg-slate-800 text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-medium transition-colors"
            >
              Add Milestone
            </button>
          </form>

          {/* Live Serialization Preview Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2 overflow-x-auto">
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
              <span>DATABASE PAYLOAD PREVIEW (`plans.content`)</span>
              <span className="text-emerald-400">100% Backward Compatible</span>
            </div>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(parsedData, null, 2)}</pre>
          </div>
        </section>

        {/* Editorial Empty State Component */}
        <section className="space-y-4">
          <h3 className="font-editorial text-lg sm:text-xl font-medium text-charcoal-primary dark:text-white">
            Aesthetic Editorial Empty State
          </h3>
          <EmptyState
            icon={BookOpen}
            title="No tasks scheduled for today"
            subtitle="Your study schedule is clear. Plan a deep focus session or take a well-deserved rest."
            action={
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-subtle transition-colors"
              >
                + Create First Task
              </button>
            }
          />
        </section>
      </div>
    </div>
  );
};
