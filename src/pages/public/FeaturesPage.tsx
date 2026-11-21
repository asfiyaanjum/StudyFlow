import React from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy,
  BookOpen,
  Calendar,
  Timer,
  BarChart3,
  Target,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={13} /> Integrated Capabilities
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-charcoal-primary dark:text-white tracking-tight">
          Every capability built for academic success
        </h1>
        <p className="text-sm sm:text-base text-charcoal-muted dark:text-slate-400 leading-relaxed">
          StudyFlow isn't just a to-do list. It is an end-to-end academic operating system designed around how students actually study, navigate exam pressure, and recover.
        </p>
      </div>

      {/* Feature 1: Recovery Engine */}
      <div id="recovery" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <LifeBuoy className="w-4 h-4 text-rose-500" />
            Signature Innovation
          </div>
          <h2 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white">
            The StudyFlow Recovery Engine
          </h2>
          <p className="text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
            Every student experiences weeks where illnesses, project deadlines, or life events derail their schedule. Conventional apps simply pile on red overdue badges. StudyFlow calculates your study capacity and generates realistic catch-up suggestions.
          </p>
          <ul className="space-y-3 text-xs sm:text-sm text-charcoal-primary dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Capacity Overload Detection:</strong> Compares scheduled lecture hours and pending tasks against maximum sustainable study thresholds.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>One-Click Rescheduling:</strong> Evaluates urgency scores and moves missed tasks into available calendar gaps.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Guilt-Free Planning:</strong> Re-establishes a realistic academic path forward without overwhelming you.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-paper-canvas dark:bg-slate-800/60 border border-paper-border dark:border-slate-700 space-y-4">
          <div className="flex justify-between items-center text-xs border-b border-paper-border dark:border-slate-700 pb-3">
            <span className="font-semibold text-charcoal-primary dark:text-white">Active Recovery Plan</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[11px] font-medium">Overload Detected</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-charcoal-primary dark:text-white">Calculus Chapter 4 Practice</span>
              <span className="text-rose-600 font-semibold">Overdue by 2d</span>
            </div>
            <p className="text-[11px] text-charcoal-muted dark:text-slate-400">
              Suggested slot: Tomorrow 2:00 PM – 3:30 PM (No conflicting lectures)
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-charcoal-primary dark:text-white">Physics Lab Writeup</span>
              <span className="text-amber-600 font-semibold">Conflict Risk</span>
            </div>
            <p className="text-[11px] text-charcoal-muted dark:text-slate-400">
              Suggested slot: Thursday 4:00 PM – 5:30 PM
            </p>
          </div>
        </div>
      </div>

      {/* Feature 2: Timetable & Syllabus Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle">
        <div className="space-y-5 order-2 lg:order-1">
          <div className="p-6 rounded-2xl bg-paper-canvas dark:bg-slate-800/60 border border-paper-border dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center text-xs border-b border-paper-border dark:border-slate-700 pb-3">
              <span className="font-semibold text-charcoal-primary dark:text-white">CS 301: Systems Programming</span>
              <span className="text-brand-600 font-bold">75% Mastered</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800">
                <span>Unit 1: Memory & Pointers</span>
                <span className="text-emerald-600 font-medium">✓ Completed</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800">
                <span>Unit 2: Processes & Threads</span>
                <span className="text-emerald-600 font-medium">✓ Completed</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800">
                <span>Unit 3: Virtual Memory & Paging</span>
                <span className="text-amber-600 font-medium">In Progress (2/4)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <BookOpen className="w-4 h-4 text-brand-600" />
            Curriculum Alignment
          </div>
          <h2 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white">
            Syllabus Unit & Topic Tracking
          </h2>
          <p className="text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
            Don't let exam prep be an eleventh-hour guessing game. StudyFlow connects your class timetable to discrete syllabus units and topics, so you know exactly what percentage of the material you have revised.
          </p>
          <ul className="space-y-3 text-xs sm:text-sm text-charcoal-primary dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Hierarchical mapping: Subjects → Units → Discrete Topics.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Credit hour weighting and estimated study durations.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Direct linking between focus timer sessions and syllabus topics.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Feature 3: Focus Timer & Deep Work */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <Timer className="w-4 h-4 text-brand-600" />
            Cognitive Productivity
          </div>
          <h2 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white">
            Immersive Focus Mode & Pomodoro
          </h2>
          <p className="text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
            Eliminate phone interruptions and fragmented attention. Run clean Pomodoro or customized deep work blocks linked directly to your current assignment.
          </p>
          <ul className="space-y-3 text-xs sm:text-sm text-charcoal-primary dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Configurable focus intervals (25m / 50m) and rest cycles.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Automatic logging to weekly study targets and consistency streaks.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Distraction-free fullscreen mode with serene visual pacing.</span>
            </li>
          </ul>
        </div>

        <div className="p-8 rounded-2xl bg-paper-canvas dark:bg-slate-800/60 border border-paper-border dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-xs uppercase font-semibold text-charcoal-light dark:text-slate-400 tracking-wider">
            FOCUS BLOCK — OPERATING SYSTEMS
          </div>
          <div className="font-editorial text-5xl sm:text-6xl font-medium text-charcoal-primary dark:text-white tabular-nums">
            24:50
          </div>
          <p className="text-xs text-charcoal-muted dark:text-slate-400">
            Topic: Virtual Memory Page Replacement Algorithms
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-medium">Session in progress</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8 space-y-4">
        <h3 className="font-editorial text-2xl sm:text-3xl font-medium text-charcoal-primary dark:text-white">
          Experience the StudyFlow difference
        </h3>
        <Link to="/register">
          <Button size="lg" rightIcon={<ArrowRight size={16} />}>
            Create Your Free Student Account
          </Button>
        </Link>
      </div>
    </div>
  );
};
